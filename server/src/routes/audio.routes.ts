import { Router } from 'express';
import {
  createAudio,
  getAllAudios,
  getAudioById,
  updateAudio,
  deleteAudio,
  toggleLikeAudio,
  getRecommendedAudios
} from '../controllers/audio.controller.js';
import {
  addComment,
  getComments,
  deleteComment,
  toggleLikeComment
} from '../controllers/comment.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { createAudioValidation } from '../middleware/validation.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Public routes
router.get('/', optionalAuthenticate, getAllAudios);
router.get('/recommended', getRecommendedAudios);
router.get('/:id', optionalAuthenticate, getAudioById);

// Protected routes
router.post('/', authenticate, createAudioValidation, validate, createAudio);
router.put('/:id', authenticate, updateAudio);
router.delete('/:id', authenticate, deleteAudio);
router.post('/:id/like', authenticate, toggleLikeAudio);

// Comment routes
router.get('/:id/comments', optionalAuthenticate, getComments);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:audioId/comments/:commentId', authenticate, deleteComment);
router.post('/:audioId/comments/:commentId/like', authenticate, toggleLikeComment);

export default router;
