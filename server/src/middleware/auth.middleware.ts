import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided, authorization denied');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      throw new ApiError(401, 'Token is invalid or expired');
    }
  } catch (error) {
    next(error);
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.user = { id: decoded.id };
      } catch (error) {
        // Token invalid but continue anyway
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
