import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import Property from '../models/Property.js';

const router = express.Router();

// GET user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile'
    });
  }
});

// UPDATE user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
});

// GET saved properties
router.get('/saved-properties', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProperties');
    
    res.json({
      status: 'success',
      data: user.savedProperties || []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch saved properties'
    });
  }
});

// SAVE property
router.post('/save-property/:propertyId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.propertyId;
    
    if (!user.savedProperties.includes(propertyId)) {
      user.savedProperties.push(propertyId);
      await user.save();
    }
    
    res.json({
      status: 'success',
      message: 'Property saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to save property'
    });
  }
});

// UNSAVE property
router.delete('/unsave-property/:propertyId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.propertyId;
    
    user.savedProperties = user.savedProperties.filter(
      id => id.toString() !== propertyId
    );
    
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Property removed from saved list'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsave property'
    });
  }
});

// GET user's listed properties (if they're an agent/admin)
router.get('/my-properties', authenticate, async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your properties'
    });
  }
});

export default router;