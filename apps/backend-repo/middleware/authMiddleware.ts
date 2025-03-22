import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebaseConfig';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    try {
      // Verify the token
      console.log('Attempting to verify token...');
      const decodedToken = await auth.verifyIdToken(token);
      
      // Attach the user to the request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      
      console.log(`Authenticated user: ${req.user.email} (${req.user.uid})`);
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      
      // For development purposes only - allow bypassing authentication
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        console.warn('⚠️ WARNING: Authentication bypassed in development mode');
        
        // Try to extract some user info from token for convenience
        try {
          const parts = token.split('.');
          if (parts.length === 3 && parts[1]) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            req.user = {
              uid: payload.user_id || payload.sub || 'dev-user',
              email: payload.email || 'dev@example.com'
            };
          } else {
            req.user = {
              uid: 'dev-user',
              email: 'dev@example.com'
            };
          }
          
          console.log(`Dev mode: Using user ${req.user.email} (${req.user.uid})`);
          next();
          return;
        } catch (error) {
          console.error('Error parsing token in dev mode:', error);
          req.user = {
            uid: 'dev-user',
            email: 'dev@example.com'
          };
          next();
          return;
        }
      }
      
      return res.status(401).json({ error: 'Authentication failed - invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication system error' });
  }
}; 