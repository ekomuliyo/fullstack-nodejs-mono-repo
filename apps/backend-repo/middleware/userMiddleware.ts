import { Request, Response, NextFunction } from 'express';
import { createUserIfNotExists } from '../repository/userCollection';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Middleware to ensure a user document exists in Firestore for the authenticated user
 * This should run after the authMiddleware
 */
export const ensureUserExists = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.uid) {
      // User not authenticated, proceed to next middleware
      return next();
    }

    console.log(`Ensuring user exists for ${req.user.uid}...`);
    const user = await createUserIfNotExists(req.user.uid, req.user.email);
    console.log(`User document ensured: ${user.id}`);
    
    // Continue with the request
    next();
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    // Don't interrupt the request, just log the error
    next();
  }
}; 