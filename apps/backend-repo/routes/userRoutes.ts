import { Router } from 'express';
import { fetchUserData, updateUserData, createUserProfile } from '../controller/api';
import { authMiddleware } from '../middleware/authMiddleware';
import { ensureUserExists } from '../middleware/userMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply user middleware to ensure user document exists
router.use(ensureUserExists);

// Create user profile route
router.post('/:userId', createUserProfile);

// Fetch user data route
router.get('/:userId', fetchUserData);

// Update user data route
router.put('/:userId', updateUserData);

export default router; 