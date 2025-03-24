import express, { Request, Response } from 'express';
import { 
  updateUserRating, 
  updateUserActivity, 
  createUserDocument,
  getHighPotentialUsers,
  calculatePotentialScore,
  getUserData,
  updatePotentialScore
} from '../utils/userUtils';
import { authenticateToken } from '../middleware/auth';
import { db } from '../config/firebaseConfig';

const router = express.Router();

// IMPORTANT: Order matters in Express routes!
// Place more specific routes before generic ones

// Get high potential users with pagination
router.get('/high-potential', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters
    const limit = parseInt(req.query.limit as string) || 10;
    const lastDocId = req.query.lastDocId as string | undefined;
    
    let startAfterDoc = null;
    
    // Get the last document if lastDocId is provided
    if (lastDocId) {
      const lastDocRef = db.collection('USERS').doc(lastDocId);
      const lastDocSnapshot = await lastDocRef.get();
      
      if (!lastDocSnapshot.exists) {
        return res.status(400).json({ error: 'Invalid pagination token' });
      }
      
      startAfterDoc = lastDocSnapshot;
    }
    
    // Get high potential users with pagination
    const result = await getHighPotentialUsers(limit, startAfterDoc);
    
    // Format the response
    const response = {
      users: result.users.map(user => ({
        ...user,
        // Include formatted potential score for reference
        potentialScoreDetails: {
          rating: user.totalAverageWeightRatings || 0,
          rents: user.numberOfRents || 0,
          recentlyActive: user.recentlyActive ? new Date(user.recentlyActive).toISOString() : null,
          score: user.potentialScore || calculatePotentialScore(user)
        }
      })),
      pagination: {
        hasMore: result.lastDoc !== null,
        nextPageToken: result.lastDoc ? result.lastDoc.id : null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching high potential users:', error);
    res.status(500).json({ error: 'Failed to fetch high potential users' });
  }
});

// Recalculate potential score for a user
router.post('/:userId/recalculate-score', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate that the authenticated user is updating their own profile
    // or is an admin (add admin check if you have that feature)
    if (req.user?.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await updatePotentialScore(userId);
    
    // Get updated user data
    const userData = await getUserData(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Potential score recalculated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error recalculating potential score:', error);
    res.status(500).json({ error: 'Failed to recalculate potential score' });
  }
});

// Get user data by ID - auto-creates user if not found
router.get('/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Fetching user data for ID: ${userId}`);
    let userData = await getUserData(userId);
    
    // If user doesn't exist, create a new user
    if (!userData) {
      console.log(`User not found: ${userId}. Creating new user...`);
      
      // Get email from authentication token if available
      const email = req.user?.email || '';
      const name = req.user?.name || 'New User';
      
      try {
        // Create new user with data from auth token
        const newUser = await createUserDocument(userId, { 
          email, 
          name,
          // Add any other fields you want to initialize
        });
        
        console.log(`Created new user: ${userId}`);
        return res.status(201).json(newUser);
      } catch (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    }

    // Add potential score calculation for reference
    const userWithScore = {
      ...userData,
      potentialScoreDetails: {
        rating: userData.totalAverageWeightRatings || 0,
        rents: userData.numberOfRents || 0,
        recentlyActive: userData.recentlyActive ? new Date(userData.recentlyActive).toISOString() : null,
        score: userData.potentialScore || calculatePotentialScore(userData)
      }
    };

    console.log(`User data found for ID: ${userId}`);
    res.json(userWithScore);
  } catch (error) {
    console.error('Error fetching/creating user:', error);
    res.status(500).json({ error: 'Failed to process user data request' });
  }
});

// Create a new user document (registration)
router.post('/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { name, email } = req.body;

    // Validate that the authenticated user is creating their own profile
    if (req.user?.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userData = {
      name: name || 'New User',
      email: email
    };

    const newUser = await createUserDocument(userId, userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user rating
router.post('/:userId/rating', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { rating } = req.body;
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    const updatedUser = await updateUserRating(userId, rating);
    res.json({ 
      message: 'Rating updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// Update user activity
router.post('/:userId/activity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updatedUser = await updateUserActivity(userId);
    res.json({ 
      message: 'Activity updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

export default router; 