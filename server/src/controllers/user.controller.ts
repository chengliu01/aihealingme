import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model.js';
import Audio from '../models/Audio.model.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const isOwnProfile = currentUserId === id;
    
    const user = await User.findById(id)
      .populate('followers', 'username avatar nickname')
      .populate('following', 'username avatar nickname');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // 获取该用户的公开音频
    const publicAudios = await Audio.find({ creator: id, isPublic: true })
      .populate('creator', 'username avatar nickname')
      .sort({ createdAt: -1 });

    if (isOwnProfile) {
      // 自己的主页：返回全部信息
      const allAudios = await Audio.find({ creator: id })
        .populate('creator', 'username avatar nickname')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: { 
          user,
          audios: allAudios,
          isOwnProfile: true
        }
      });
    } else {
      // 他人的主页：只返回公开信息
      res.json({
        success: true,
        data: { 
          user: {
            _id: user._id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            bio: user.bio,
            motto: user.motto,
            lifeStage: user.lifeStage,
            healingPreference: user.healingPreference,
            followers: user.followers,
            following: user.following,
            createdAt: user.createdAt,
          },
          audios: publicAudios,
          isOwnProfile: false
        }
      });
    }
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
    const { username, bio, avatar, nickname, lifeStage, healingPreference, motto } = req.body;

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
    if (nickname !== undefined) user.nickname = nickname;
    if (lifeStage !== undefined) user.lifeStage = lifeStage;
    if (healingPreference !== undefined) user.healingPreference = healingPreference;
    if (motto !== undefined) user.motto = motto;

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

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // 构建头像 URL
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      data: { 
        user,
        avatarUrl 
      },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};
