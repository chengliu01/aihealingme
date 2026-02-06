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

export default router;
