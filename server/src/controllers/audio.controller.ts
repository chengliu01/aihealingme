import { Request, Response, NextFunction } from 'express';
import Audio from '../models/Audio.model.js';
import User from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Create a new audio
// @route   POST /api/audio
// @access  Private
export const createAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { title, description, audioUrl, coverImage, duration, category, tags, isPublic } = req.body;

    const audio = await Audio.create({
      title,
      description,
      audioUrl,
      coverImage,
      duration,
      category,
      tags,
      creator: userId,
      isPublic
    });

    // Add to user's created audios
    await User.findByIdAndUpdate(userId, {
      $push: { createdAudios: audio._id }
    });

    const populatedAudio = await Audio.findById(audio._id).populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      data: { audio: populatedAudio },
      message: 'Audio created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all audios
// @route   GET /api/audio
// @access  Public
export const getAllAudios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const query: any = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const audios = await Audio.find(query)
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Audio.countDocuments(query);

    res.json({
      success: true,
      data: {
        audios,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audio by ID
// @route   GET /api/audio/:id
// @access  Public
export const getAudioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const audio = await Audio.findById(id)
      .populate('creator', 'username avatar bio')
      .populate('likes', 'username avatar');

    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    // Increment listen count
    audio.listens += 1;
    await audio.save();

    res.json({
      success: true,
      data: { audio }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update audio
// @route   PUT /api/audio/:id
// @access  Private
export const updateAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, description, coverImage, category, tags, isPublic } = req.body;

    const audio = await Audio.findById(id);
    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    // Check if user is the creator
    if (audio.creator.toString() !== userId) {
      throw new ApiError(403, 'You are not authorized to update this audio');
    }

    if (title) audio.title = title;
    if (description) audio.description = description;
    if (coverImage !== undefined) audio.coverImage = coverImage;
    if (category) audio.category = category;
    if (tags) audio.tags = tags;
    if (isPublic !== undefined) audio.isPublic = isPublic;

    await audio.save();

    res.json({
      success: true,
      data: { audio },
      message: 'Audio updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete audio
// @route   DELETE /api/audio/:id
// @access  Private
export const deleteAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const audio = await Audio.findById(id);
    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    // Check if user is the creator
    if (audio.creator.toString() !== userId) {
      throw new ApiError(403, 'You are not authorized to delete this audio');
    }

    await audio.deleteOne();

    // Remove from user's created audios
    await User.findByIdAndUpdate(userId, {
      $pull: { createdAudios: audio._id }
    });

    res.json({
      success: true,
      message: 'Audio deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike audio
// @route   POST /api/audio/:id/like
// @access  Private
export const toggleLikeAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const audio = await Audio.findById(id);
    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const hasLiked = audio.likes.some(likeId => likeId.toString() === userId);
    
    if (hasLiked) {
      // Unlike
      audio.likes = audio.likes.filter(likeId => likeId.toString() !== userId);
      user.favoriteAudios = user.favoriteAudios.filter(audioId => audioId.toString() !== id);
    } else {
      // Like
      audio.likes.push(user._id);
      user.favoriteAudios.push(audio._id);
    }

    await audio.save();
    await user.save();

    res.json({
      success: true,
      data: { liked: !hasLiked },
      message: hasLiked ? 'Audio unliked' : 'Audio liked'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended audios
// @route   GET /api/audio/recommended
// @access  Public
export const getRecommendedAudios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    // Simple recommendation: most liked and recent audios
    const audios = await Audio.find({ isPublic: true })
      .populate('creator', 'username avatar')
      .sort({ likes: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: { audios }
    });
  } catch (error) {
    next(error);
  }
};
