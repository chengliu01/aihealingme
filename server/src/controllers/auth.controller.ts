import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper: format user response
const formatUserResponse = (user: IUser) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  nickname: user.nickname,
  lifeStage: user.lifeStage,
  healingPreference: user.healingPreference,
  motto: user.motto,
  onboardingCompleted: user.onboardingCompleted,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(400, 'User with this email or username already exists');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      onboardingCompleted: false,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete onboarding questionnaire
// @route   POST /api/auth/onboarding
// @access  Private
export const completeOnboarding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { nickname, lifeStage, healingPreference, motto } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update onboarding fields
    if (nickname) user.nickname = nickname;
    if (lifeStage) user.lifeStage = lifeStage;
    if (healingPreference) user.healingPreference = healingPreference;
    if (motto !== undefined) user.motto = motto;
    user.onboardingCompleted = true;

    await user.save();

    res.json({
      success: true,
      data: { user: formatUserResponse(user) },
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    const user = await User.findById(userId)
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

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
