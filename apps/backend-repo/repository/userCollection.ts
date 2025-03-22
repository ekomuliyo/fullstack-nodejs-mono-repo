import { db } from '../config/firebaseConfig';
import { User } from 'shared';

const USERS_COLLECTION = 'USERS';

// Remove or disable the mockUsers functionality since we're using real Firebase
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // If using mock data, return from in-memory store
    if (useMockData) {
      console.log(`[MOCK] Getting user ${userId} from in-memory store`);
      return mockUsers[userId] || await createUserIfNotExists(userId);
    }
    
    // Otherwise, fetch from Firestore
    console.log(`Getting user ${userId} from Firestore`);
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data() as Omit<User, 'id'>;
    return {
      id: userDoc.id,
      ...userData
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUserIfNotExists = async (userId: string, email?: string): Promise<User> => {
  try {
    // Check if user exists first
    const existingUser = await getUserById(userId);
    if (existingUser) {
      return existingUser;
    }
    
    // Create basic user data
    const userData: Omit<User, 'id'> = {
      email: email || `user-${userId}@example.com`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: 'New User',
      // Remove potentialScore if it's not in your User interface
      preferences: {
        theme: 'light',
        notifications: true
      }
    };
    
    // Store in Firestore
    await db.collection(USERS_COLLECTION).doc(userId).set(userData);
    
    return {
      id: userId,
      ...userData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    // First check if user exists
    const userExists = await getUserById(userId);
    if (!userExists) {
      throw new Error('User not found');
    }
    
    const updateData = {
      ...userData,
      updatedAt: Date.now()
    };
    
    await db.collection(USERS_COLLECTION).doc(userId).update(updateData);
    
    // Fetch the updated user
    const updatedUser = await getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await db.collection(USERS_COLLECTION).doc(userId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAllUsers = async (limit = 10, lastDoc?: FirebaseFirestore.DocumentSnapshot): Promise<{
  users: User[];
  lastDoc: FirebaseFirestore.DocumentSnapshot | null;
}> => {
  try {
    let query = db.collection(USERS_COLLECTION).orderBy('createdAt', 'desc').limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const users: User[] = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data() as Omit<User, 'id'>;
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      users,
      lastDoc: newLastDoc
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userId: string, userData: Omit<User, 'id'>): Promise<User> => {
  try {
    await db.collection(USERS_COLLECTION).doc(userId).set({
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return {
      id: userId,
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Query users with filters
export const queryUsers = async (
  filters: {field: string, operator: FirebaseFirestore.WhereFilterOp, value: any}[], 
  limit = 10
): Promise<User[]> => {
  try {
    let query = db.collection(USERS_COLLECTION);
    
    // Apply all filters
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });
    
    // Apply limit
    query = query.limit(limit);
    
    const snapshot = await query.get();
    const users: User[] = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data() as Omit<User, 'id'>;
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error querying users:', error);
    throw error;
  }
};

export const getHighPotentialUsers = async (limit = 10, lastDoc?: FirebaseFirestore.DocumentSnapshot): Promise<{
  users: User[];
  lastDoc: FirebaseFirestore.DocumentSnapshot | null;
}> => {
  try {
    // Create a composite score field to store in the database or compute on the fly
    // This is a more efficient approach for Firebase pagination than just using multiple orderBy clauses
    
    let query = db.collection(USERS_COLLECTION)
      // We'll query based on a pre-calculated potentialScore field
      // This should be kept updated whenever user data changes
      .orderBy('potentialScore', 'desc')
      .limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const users: User[] = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data() as Omit<User, 'id'>;
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      users,
      lastDoc: newLastDoc
    };
  } catch (error) {
    console.error('Error fetching high potential users:', error);
    throw error;
  }
}; 