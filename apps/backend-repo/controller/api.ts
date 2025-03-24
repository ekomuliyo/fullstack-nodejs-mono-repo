import { Request, Response } from 'express';
import { getUserById, updateUser, createUserIfNotExists } from '../repository/userCollection';
import { User } from '../types/user';

// Create user profile endpoint
export const createUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userData: Partial<User> = req.body;
    
    // Validate that the authenticated user is creating their own profile
    if (req.user?.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Create or get the user profile
    const user = await createUserIfNotExists(
      userId ?? '', 
      userData.email || req.user?.email || ''
    );
    
    // If additional data was provided, update the user
    if (Object.keys(userData).length > 0) {
      const { id, createdAt, ...updatableData } = userData as any;
      const updatedUser = await updateUser(userId ?? '', updatableData);
      return res.status(200).json(updatedUser);
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch user data endpoint
export const fetchUserData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate that the authenticated user is requesting their own data or has admin privileges
    if (req.user?.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const user = await getUserById(userId ?? '');
    
    if (!user) {
      // If the user doesn't exist, automatically create it
      const newUser = await createUserIfNotExists(userId ?? '', req.user?.email || '');
      return res.status(200).json(newUser);
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user data endpoint
export const updateUserData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userData: Partial<User> = req.body;
    
    // Validate that the authenticated user is updating their own data or has admin privileges
    if (req.user?.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Validate required fields
    if (!userData) {
      return res.status(400).json({ error: 'No user data provided' });
    }
    
    // Prevent updating sensitive fields
    const { id, createdAt, ...updatableData } = userData as any;
    
    // Update the user
    const updatedUser = await updateUser(userId ?? '', updatableData);
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 