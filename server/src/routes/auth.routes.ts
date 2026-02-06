import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updatePassword
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  updatePasswordValidation
} from '../middleware/validation.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/password', authenticate, updatePasswordValidation, validate, updatePassword);

export default router;
