import { Request, Response, NextFunction } from 'express';
import Audio from '../models/Audio.model.js';
import User from '../models/User.model.js';
import Comment from '../models/Comment.model.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Create a new audio
// @route   POST /api/audio
// @access  Private
export const createAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { title, description, audioUrl, coverImage, duration, category, tags, isPublic, shareText } = req.body;

    const audio = await Audio.create({
      title,
      description,
      audioUrl,
      coverImage,
      duration,
      category,
      tags,
      creator: userId,
      isPublic,
      shareText: shareText || ''
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
    const { category, search, page = 1, limit = 20, sort = 'newest' } = req.query;
    
    const query: any = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 排序逻辑
    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { likes: -1, createdAt: -1 };
    } else if (sort === 'trending') {
      sortOption = { listens: -1, createdAt: -1 };
    }
    
    const audios = await Audio.find(query)
      .populate('creator', 'username avatar nickname')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Audio.countDocuments(query);

    // 获取每个音频的评论数
    const audioIds = audios.map(a => a._id);
    const commentCounts = await Comment.aggregate([
      { $match: { audio: { $in: audioIds } } },
      { $group: { _id: '$audio', count: { $sum: 1 } } }
    ]);
    const commentCountMap = new Map(commentCounts.map(c => [c._id.toString(), c.count]));

    const currentUserId = req.user?.id;

    const audiosWithCounts = audios.map(audio => {
      const audioObj = audio.toObject();
      return {
        ...audioObj,
        commentCount: commentCountMap.get(audio._id.toString()) || 0,
        likesCount: audio.likes.length,
        isLikedByCurrentUser: currentUserId
          ? audio.likes.some(likeId => likeId.toString() === currentUserId)
          : false
      };
    });

    res.json({
      success: true,
      data: {
        audios: audiosWithCounts,
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
      .populate('creator', 'username avatar bio nickname')
      .populate('likes', 'username avatar');

    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    // Increment listen count
    audio.listens += 1;
    await audio.save();

    // Get comment count
    const commentCount = await Comment.countDocuments({ audio: id });

    const currentUserId = req.user?.id;
    const audioObj = audio.toObject();

    res.json({
      success: true,
      data: { 
        audio: {
          ...audioObj,
          commentCount,
          likesCount: audio.likes.length,
          isLikedByCurrentUser: currentUserId
            ? audio.likes.some((likeId: any) => likeId.toString() === currentUserId || likeId._id?.toString() === currentUserId)
            : false
        }
      }
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
    const { title, description, coverImage, category, tags, isPublic, shareText } = req.body;

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
    if (shareText !== undefined) audio.shareText = shareText;

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
