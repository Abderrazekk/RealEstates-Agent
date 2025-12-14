import express from 'express';
import Meeting from '../models/Meeting.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { 
  sendMeetingAcceptanceEmail, 
  sendMeetingRejectionEmail,
  sendMeetingRequestNotification 
} from '../utils/emailService.js';

const router = express.Router();

// Create a new meeting request (Authenticated users only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { propertyId, userPhone, meetingDate, notes } = req.body;

    // Validate required fields
    if (!propertyId || !userPhone || !meetingDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    // Get logged-in user details
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found',
      });
    }

    // Parse meeting date
    const parsedDate = new Date(meetingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format',
      });
    }

    // Check if meeting date is in the future
    if (parsedDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Meeting date must be in the future',
      });
    }

    // Check if user already has a meeting at this time
    const existingMeeting = await Meeting.findOne({
      user: user._id,
      meetingDate: {
        $gte: new Date(parsedDate.getTime() - 60 * 60 * 1000), // 1 hour before
        $lte: new Date(parsedDate.getTime() + 60 * 60 * 1000), // 1 hour after
      },
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingMeeting) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have a meeting scheduled around this time',
      });
    }

    // Create meeting - USE USER'S ACCOUNT EMAIL
    const meeting = new Meeting({
      property: propertyId,
      propertyTitle: property.title,
      user: user._id,
      userName: user.name, // From user account
      userEmail: user.email, // From user account - THIS IS THE KEY
      userPhone: userPhone,
      meetingDate: parsedDate,
      notes: notes || '',
      status: 'pending',
    });

    await meeting.save();

    // Send notification to all admin users
    try {
      const admins = await User.find({ role: 'admin' });
      
      // Send to all admins
      for (const admin of admins) {
        await sendMeetingRequestNotification(admin.email, {
          userName: user.name,
          userEmail: user.email,
          userPhone: userPhone,
          propertyTitle: property.title,
          meetingDate: parsedDate,
          notes: notes || '',
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      status: 'success',
      data: meeting,
      message: 'Meeting request submitted successfully. You will receive notifications at your registered email.',
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule meeting',
      error: error.message,
    });
  }
});

// Get user's meetings (Authenticated users only)
router.get('/my-meetings', authenticate, async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      user: req.user._id 
    })
      .populate('property', 'title location images price status')
      .sort({ meetingDate: -1 });

    res.json({
      status: 'success',
      data: meetings,
    });
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch meetings',
    });
  }
});

// Get all meetings (Admin only) - WITH PROPER FILTERING
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      status = 'all', 
      page = 1, 
      limit = 10, 
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Meeting.countDocuments(filter);
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const meetings = await Meeting.find(filter)
      .populate('property', 'title location images address')
      .populate('user', 'name email profilePicture phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      status: 'success',
      data: meetings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin meetings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch meetings',
    });
  }
});

// Get meeting statistics (Admin only)
router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const stats = {
      total: await Meeting.countDocuments(),
      pending: await Meeting.countDocuments({ status: 'pending' }),
      accepted: await Meeting.countDocuments({ status: 'accepted' }),
      rejected: await Meeting.countDocuments({ status: 'rejected' }),
      cancelled: await Meeting.countDocuments({ status: 'cancelled' }),
      today: await Meeting.countDocuments({
        createdAt: { $gte: today }
      }),
      upcoming: await Meeting.countDocuments({
        status: 'accepted',
        meetingDate: { $gte: new Date() }
      }),
      tomorrow: await Meeting.countDocuments({
        status: 'accepted',
        meetingDate: { 
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
    };
    
    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch meeting statistics',
    });
  }
});

// Update meeting status (Admin only) - WITH EMAIL TO USER
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }
    
    const meeting = await Meeting.findById(req.params.id)
      .populate('property', 'title agent images')
      .populate('user', 'name email phone'); // Populate user to get actual account email

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found',
      });
    }
    
    const previousStatus = meeting.status;
    
    // Update meeting
    meeting.status = status;
    meeting.adminResponse = adminResponse || '';
    meeting.respondedAt = new Date();
    meeting.updatedAt = new Date();
    
    await meeting.save();
    
    // Send appropriate email based on status
    let emailResult = null;
    
    // Determine recipient email - use populated user email if available
    const recipientEmail = meeting.user?.email || meeting.userEmail;
    
    if (status === 'accepted' && previousStatus !== 'accepted') {
      try {
        emailResult = await sendMeetingAcceptanceEmail(recipientEmail, {
          userName: meeting.userName,
          propertyTitle: meeting.propertyTitle,
          meetingDate: meeting.meetingDate,
          adminResponse: meeting.adminResponse,
          agentName: meeting.property?.agent?.name || 'Our Agent'
        });
      } catch (emailError) {
        console.error('Failed to send acceptance email:', emailError);
      }
    }
    
    if (status === 'rejected' && previousStatus !== 'rejected') {
      try {
        emailResult = await sendMeetingRejectionEmail(recipientEmail, {
          userName: meeting.userName,
          propertyTitle: meeting.propertyTitle,
          adminResponse: meeting.adminResponse
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }
    
    res.json({
      status: 'success',
      data: meeting,
      emailSent: emailResult?.success || false,
      message: status === 'accepted' 
        ? `Meeting accepted. ${emailResult?.success ? 'Email sent to user.' : 'Email failed to send.'}` 
        : status === 'rejected'
        ? `Meeting rejected. ${emailResult?.success ? 'Email sent to user.' : 'Email failed to send.'}`
        : `Meeting status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update meeting status',
    });
  }
});

// Get meetings for a specific property (Public)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      property: req.params.propertyId,
      status: 'accepted',
      meetingDate: { $gte: new Date() }
    })
      .populate('user', 'name email')
      .sort({ meetingDate: 1 })
      .limit(10);
    
    res.json({
      status: 'success',
      data: meetings,
    });
  } catch (error) {
    console.error('Error fetching property meetings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch property meetings',
    });
  }
});

// Cancel a meeting (User or Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found',
      });
    }
    
    // Check permissions
    const isOwner = meeting.user?.toString() === req.user._id.toString();
    const isUserAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isUserAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this meeting',
      });
    }
    
    // Only allow cancellation of upcoming meetings
    if (meeting.meetingDate < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel past meetings',
      });
    }
    
    // Don't allow cancellation of already cancelled or rejected meetings
    if (meeting.status === 'cancelled' || meeting.status === 'rejected') {
      return res.status(400).json({
        status: 'error',
        message: 'Meeting is already cancelled or rejected',
      });
    }
    
    meeting.status = 'cancelled';
    meeting.updatedAt = new Date();
    await meeting.save();
    
    res.json({
      status: 'success',
      message: 'Meeting cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel meeting',
    });
  }
});

// Reschedule a meeting (User only)
router.patch('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { meetingDate } = req.body;
    
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found',
      });
    }
    
    // Check if user owns the meeting
    if (meeting.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to reschedule this meeting',
      });
    }
    
    // Only allow rescheduling of pending or accepted meetings
    if (!['pending', 'accepted'].includes(meeting.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot reschedule this meeting',
      });
    }
    
    // Parse new meeting date
    const parsedDate = new Date(meetingDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format',
      });
    }
    
    // Check if new date is in the future
    if (parsedDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'New meeting date must be in the future',
      });
    }
    
    // Update meeting
    meeting.meetingDate = parsedDate;
    meeting.status = 'pending'; // Reset to pending for admin approval
    meeting.adminResponse = ''; // Clear previous admin response
    meeting.respondedAt = null;
    meeting.updatedAt = new Date();
    
    await meeting.save();
    
    // Notify admin about rescheduling
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendMeetingRequestNotification(admin.email, {
          userName: meeting.userName,
          userEmail: meeting.userEmail,
          userPhone: meeting.userPhone,
          propertyTitle: meeting.propertyTitle,
          meetingDate: parsedDate,
          notes: `Rescheduled meeting. Previous date: ${meeting.meetingDate}`,
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }
    
    res.json({
      status: 'success',
      data: meeting,
      message: 'Meeting rescheduled successfully. Waiting for admin approval.',
    });
  } catch (error) {
    console.error('Error rescheduling meeting:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reschedule meeting',
    });
  }
});

export default router;