import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  uploadAvatar
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { updateProfileValidation } from '../middleware/validation.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Public routes
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);
router.post('/avatar', authenticate, uploadMiddleware.single('avatar'), uploadAvatar);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

export default router;
