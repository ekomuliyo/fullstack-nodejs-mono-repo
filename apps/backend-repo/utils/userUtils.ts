import { User } from '../entities/user';
import { db } from '../config/firebaseConfig';

// Maximum values for normalization
const MAX_RATING = 5;
const MAX_RENTS = 100;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Weighting factors for potential score
const WEIGHTS = {
  rating: 0.5,
  rents: 0.3,
  recency: 0.2
};

/**
 * Updates a user's rating and recalculates their average
 */
export const updateUserRating = async (userId: string, newRating: number) => {
  const userRef = db.collection('USERS').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    // Create user if not exists with default values and this rating
    return createUserDocument(userId, {
      totalAverageWeightRatings: newRating,
      numberOfRents: 1
    });
  }

  const userData = userDoc.data() as User;
  const currentRatings = userData.totalAverageWeightRatings || 0;
  const currentCount = userData.numberOfRents || 0;
  
  // Calculate new weighted average
  const newAverage = ((currentRatings * currentCount) + newRating) / (currentCount + 1);
  
  const updatedData = {
    totalAverageWeightRatings: Number(newAverage.toFixed(1)),
    numberOfRents: currentCount + 1,
    recentlyActive: Date.now(),
    updatedAt: Date.now()
  };
  
  await userRef.update(updatedData);
  
  // Update potential score after updating the factors
  await updatePotentialScore(userId);
  
  return {
    ...userData,
    ...updatedData
  };
};

/**
 * Updates a user's recently active timestamp
 */
export const updateUserActivity = async (userId: string) => {
  const userRef = db.collection('USERS').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    // Create user if not exists with default values
    return createUserDocument(userId, {
      recentlyActive: Date.now()
    });
  }
  
  const updatedData = {
    recentlyActive: Date.now(),
    updatedAt: Date.now()
  };
  
  await userRef.update(updatedData);
  
  // Update potential score after updating activity
  await updatePotentialScore(userId);
  
  return {
    ...userDoc.data(),
    ...updatedData
  };
};

/**
 * Creates a new user document with default values
 */
export const createUserDocument = async (userId: string, userData: Partial<User>) => {
  const userRef = db.collection('USERS').doc(userId);
  const now = Date.now();
  
  // Check if user already exists
  const userDoc = await userRef.get();
  
  // Initialize all required fields with default values
  const newUser: User = {
    id: userId,
    name: userData.name || 'New User',
    email: userData.email || '',
    totalAverageWeightRatings: userData.totalAverageWeightRatings || 0,
    numberOfRents: userData.numberOfRents || 0,
    recentlyActive: userData.recentlyActive || now,
    createdAt: userDoc.exists ? (userDoc.data() as User).createdAt : now,
    updatedAt: now,
    preferences: userData.preferences || {
      theme: 'light',
      notifications: true
    }
  };
  
  if (userDoc.exists) {
    // Merge data with existing user
    const existingData = userDoc.data() as User;
    const updatedUser = {
      ...newUser,
      // Don't override these if they already exist
      name: userData.name || existingData.name || 'New User',
      email: userData.email || existingData.email || '',
      createdAt: existingData.createdAt
    };
    
    await userRef.update(updatedUser);
    
    // Update potential score
    await updatePotentialScore(userId);
    
    return updatedUser;
  } else {
    // Calculate potential score for new user
    const potentialScore = calculatePotentialScore(newUser);
    const userWithScore = {
      ...newUser,
      potentialScore
    };
    
    // Create the user document
    await userRef.set(userWithScore);
    return userWithScore;
  }
};

/**
 * Gets user data by ID
 */
export const getUserData = async (userId: string) => {
  try {
    const userRef = db.collection('USERS').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Gets users sorted by their potential score with pagination
 */
export const getHighPotentialUsers = async (
  limit: number = 10, 
  startAfterDoc: FirebaseFirestore.DocumentSnapshot | null = null
) => {
  try {
    let query = db.collection('USERS')
      .orderBy('potentialScore', 'desc')
      .limit(limit);
    
    // Apply pagination if startAfterDoc is provided
    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }
    
    const snapshot = await query.get();
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    // Return both the users and the last document for pagination
    return {
      users,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error('Error fetching high potential users:', error);
    throw error;
  }
};

/**
 * Calculates a user's potential score based on their metrics
 */
export const calculatePotentialScore = (user: User): number => {
  // Normalize each factor to a 0-1 scale
  const ratingScore = user.totalAverageWeightRatings ? user.totalAverageWeightRatings / MAX_RATING : 0;
  const rentsScore = user.numberOfRents ? Math.min(user.numberOfRents / MAX_RENTS, 1) : 0;
  
  // Calculate recency score (higher for more recent activity)
  const now = Date.now();
  const recencyScore = user.recentlyActive ? 
    Math.max(0, 1 - ((now - user.recentlyActive) / MAX_AGE_MS)) : 0;
  
  // Apply weights to each factor
  return (ratingScore * WEIGHTS.rating) + 
         (rentsScore * WEIGHTS.rents) + 
         (recencyScore * WEIGHTS.recency);
};

/**
 * Updates the potential score for a user
 */
export const updatePotentialScore = async (userId: string): Promise<void> => {
  try {
    const userRef = db.collection('USERS').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`Cannot update potential score: User ${userId} not found`);
      return;
    }
    
    const userData = userDoc.data() as User;
    const potentialScore = calculatePotentialScore(userData);
    
    await userRef.update({ potentialScore });
    console.log(`Updated potential score for user ${userId}: ${potentialScore.toFixed(2)}`);
  } catch (error) {
    console.error(`Error updating potential score for user ${userId}:`, error);
    throw error;
  }
}; 