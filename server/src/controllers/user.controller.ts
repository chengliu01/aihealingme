import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('createdAudios', 'title coverImage duration likes listens')
      .populate('favoriteAudios', 'title coverImage duration')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { username, bio, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new ApiError(400, 'Username is already taken');
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: targetUserId } = req.params;

    if (userId === targetUserId) {
      throw new ApiError(400, 'You cannot follow yourself');
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if already following
    if (user.following.includes(targetUser._id)) {
      throw new ApiError(400, 'You are already following this user');
    }

    // Add to following/followers lists
    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: targetUserId } = req.params;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Remove from following/followers lists
    user.following = user.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('followers', 'username avatar bio');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { followers: user.followers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('following', 'username avatar bio');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { following: user.following }
    });
  } catch (error) {
    next(error);
  }
};
