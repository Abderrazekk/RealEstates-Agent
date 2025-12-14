import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check for token in headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const propertyId = req.params.id || req.body.propertyId;
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    if (req.user.role === 'admin' || property.createdBy.toString() === req.user._id.toString()) {
      next();
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You are not the owner of this property.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};