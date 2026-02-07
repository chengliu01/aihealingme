import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const updatePasswordValidation: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

export const updateProfileValidation: ValidationChain[] = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot exceed 200 characters'),
  
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Nickname cannot exceed 20 characters'),

  body('lifeStage')
    .optional()
    .isIn(['student', 'career_start', 'career_mid', 'free_life'])
    .withMessage('Invalid life stage'),

  body('healingPreference')
    .optional()
    .isIn(['rational', 'warm'])
    .withMessage('Invalid healing preference'),

  body('motto')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Motto cannot exceed 100 characters'),
];

export const onboardingValidation: ValidationChain[] = [
  body('nickname')
    .trim()
    .notEmpty()
    .withMessage('Nickname is required')
    .isLength({ max: 20 })
    .withMessage('Nickname cannot exceed 20 characters'),

  body('lifeStage')
    .notEmpty()
    .withMessage('Life stage is required')
    .isIn(['student', 'career_start', 'career_mid', 'free_life'])
    .withMessage('Invalid life stage'),

  body('healingPreference')
    .notEmpty()
    .withMessage('Healing preference is required')
    .isIn(['rational', 'warm'])
    .withMessage('Invalid healing preference'),

  body('motto')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Motto cannot exceed 100 characters'),
];

export const createAudioValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('audioUrl')
    .trim()
    .notEmpty()
    .withMessage('Audio URL is required')
    .isURL()
    .withMessage('Audio URL must be valid'),
  
  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .isFloat({ min: 0 })
    .withMessage('Duration must be positive'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['meditation', 'sleep', 'focus', 'relax', 'nature', 'music', 'other'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('coverImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];
