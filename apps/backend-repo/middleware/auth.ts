import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebaseConfig';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Type extension for Express Request to include Firebase user data
 * This ensures proper typing for authenticated requests throughout the application
 */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

/**
 * Authentication middleware for verifying Firebase Auth tokens
 * 
 * This middleware:
 * 1. Extracts the Bearer token from the Authorization header
 * 2. Verifies the token with Firebase Auth
 * 3. Attaches the decoded user information to the request object
 * 4. Allows the request to proceed if valid, returns 401 if invalid
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'No token provided or invalid token format'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token format'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }
}; 