import express from 'express';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js'; // Make sure isAdmin is imported

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate, isAdmin);

// GET admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const publishedProperties = await Property.countDocuments({ isPublished: true });
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Recent activities
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      status: 'success',
      data: {
        stats: {
          totalProperties,
          publishedProperties,
          totalUsers,
          totalAdmins
        },
        recentProperties,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
});

// GET all properties (admin view)
router.get('/properties', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (page - 1) * limit;
    const total = await Property.countDocuments(filter);
    
    const properties = await Property.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    res.json({
      status: 'success',
      data: properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch properties'
    });
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// PATCH update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
});

// PATCH toggle property featured status
router.patch('/properties/:id/featured', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    property.isFeatured = !property.isFeatured;
    await property.save();
    
    res.json({
      status: 'success',
      data: property
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update property'
    });
  }
});

// PATCH toggle property published status
router.patch('/properties/:id/publish', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    property.isPublished = !property.isPublished;
    await property.save();
    
    res.json({
      status: 'success',
      data: property
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update property'
    });
  }
});

export default router;