// apps/backend-repo/scripts/create-test-user.ts

import { db } from '../config/firebaseConfig';

async function createTestUser() {
  try {
    const userId = 'test-user-' + Date.now();
    
    await db.collection('USERS').doc(userId).set({
      name: 'Test User',
      email: 'test@example.com',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preferences: {
        theme: 'light',
        notifications: true
      }
    });
    
    console.log(`✅ Test user created with ID: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

createTestUser();