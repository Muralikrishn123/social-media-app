// backend/controllers/users.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ErrorResponse } from '../utils/errorHandler.js';

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if ID is provided
    if (!userId || userId === 'undefined') {
      return next(new ErrorResponse('User ID is required', 400));
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse('Invalid user ID format', 400));
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    next(error);
  }
};

// @desc    Get user connections
// @route   GET /api/users/:id/connections
// @access  Private
export const getUserConnections = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if ID is provided
    if (!userId || userId === 'undefined') {
      return next(new ErrorResponse('User ID is required', 400));
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse('Invalid user ID format', 400));
    }

    const user = await User.findById(userId)
      .select('connections')
      .populate('connections', 'name email avatar');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      count: user.connections.length,
      data: user.connections
    });
  } catch (error) {
    console.error('Error in getUserConnections:', error);
    next(error);
  }
};


export const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Make sure user is updating their own profile
    if (id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this profile', 403));
    }

    // Fields that can be updated
    const { name, email, bio, location, company, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { 
        name, 
        email, 
        bio, 
        location, 
        company, 
        avatar 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};