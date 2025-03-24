import { db } from '../config/firebaseConfig';
import { User } from '../types/user';
import * as admin from 'firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';
const USERS_COLLECTION = 'USERS';

// Remove or disable the mockUsers functionality since we're using real Firebase
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Fetch from Firestore
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

export const getAllUsers = async (limit = 10, lastDoc?: admin.firestore.DocumentSnapshot): Promise<{
  users: User[];
  lastDoc: admin.firestore.DocumentSnapshot | null;
}> => {
  try {
    let query = db.collection(USERS_COLLECTION).orderBy('createdAt', 'desc').limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const users: User[] = [];
    
    snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const userData = doc.data() as Omit<User, 'id'>;
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] as admin.firestore.DocumentSnapshot 
      : null;
    
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
  filters: {field: string, operator: admin.firestore.WhereFilterOp, value: any}[], 
  limit = 10
): Promise<User[]> => {
  try {
    let query: admin.firestore.Query<DocumentData> = db.collection(USERS_COLLECTION);

    // Apply all filters
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    // Apply limit
    query = query.limit(limit);

    const snapshot = await query.get();
    const users: User[] = [];

    snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
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

export const getHighPotentialUsers = async (limit = 10, lastDoc?: admin.firestore.DocumentSnapshot): Promise<{
  users: User[];
  lastDoc: admin.firestore.DocumentSnapshot | null;
}> => {
  try {
    // Create a calculated score based on user activity and ratings
    // We can use a combination of fields to determine high potential users
    
    let query = db.collection(USERS_COLLECTION)
      // We can order by multiple fields if potentialScore is not available
      // For example: most active users with highest ratings
      .orderBy('numberOfRents', 'desc')
      .orderBy('totalAverageWeightRatings', 'desc')
      .limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const users: User[] = [];
    
    snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const userData = doc.data() as Omit<User, 'id'>;
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    const newLastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] as admin.firestore.DocumentSnapshot 
      : null;
    
    return {
      users,
      lastDoc: newLastDoc
    };
  } catch (error) {
    console.error('Error fetching high potential users:', error);
    throw error;
  }
}; 