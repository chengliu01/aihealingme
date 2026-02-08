import { Request, Response, NextFunction } from 'express';
import Comment from '../models/Comment.model.js';
import Audio from '../models/Audio.model.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Add comment to audio
// @route   POST /api/audio/:id/comments
// @access  Private
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: audioId } = req.params;
    const userId = req.user?.id;
    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      throw new ApiError(400, 'Comment content is required');
    }

    const audio = await Audio.findById(audioId);
    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: userId,
      audio: audioId,
      parentComment: parentComment || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar nickname');

    res.status(201).json({
      success: true,
      data: { comment: populatedComment },
      message: 'Comment added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an audio
// @route   GET /api/audio/:id/comments
// @access  Public
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: audioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      throw new ApiError(404, 'Audio not found');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({ audio: audioId, parentComment: null })
      .populate('author', 'username avatar nickname')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ audio: audioId, parentComment: null });

    // 获取所有回复（子评论）
    const parentIds = comments.map(c => c._id);
    const replies = await Comment.find({ audio: audioId, parentComment: { $in: parentIds } })
      .populate('author', 'username avatar nickname')
      .sort({ createdAt: 1 });

    // 按 parentComment 分组
    const repliesMap = new Map<string, any[]>();
    replies.forEach(reply => {
      const parentId = reply.parentComment!.toString();
      if (!repliesMap.has(parentId)) repliesMap.set(parentId, []);
      const replyObj = reply.toObject();
      repliesMap.get(parentId)!.push({
        ...replyObj,
        isLikedByCurrentUser: currentUserId
          ? reply.likes.some(likeId => likeId.toString() === currentUserId)
          : false,
        likesCount: reply.likes.length
      });
    });

    // 转换为前端需要的格式，标注当前用户是否已点赞
    const formattedComments = comments.map(comment => {
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        isLikedByCurrentUser: currentUserId
          ? comment.likes.some(likeId => likeId.toString() === currentUserId)
          : false,
        likesCount: comment.likes.length,
        replies: repliesMap.get(comment._id.toString()) || []
      };
    });

    res.json({
      success: true,
      data: {
        comments: formattedComments,
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

// @desc    Delete a comment
// @route   DELETE /api/audio/:audioId/comments/:commentId
// @access  Private
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ApiError(403, 'You are not authorized to delete this comment');
    }

    // 同时删除该评论的所有回复
    await Comment.deleteMany({ parentComment: commentId });
    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/audio/:audioId/comments/:commentId/like
// @access  Private
export const toggleLikeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    const hasLiked = comment.likes.some(likeId => likeId.toString() === userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter(likeId => likeId.toString() !== userId);
    } else {
      comment.likes.push(userId as any);
    }

    await comment.save();

    res.json({
      success: true,
      data: { liked: !hasLiked, likesCount: comment.likes.length },
      message: hasLiked ? 'Comment unliked' : 'Comment liked'
    });
  } catch (error) {
    next(error);
  }
};
