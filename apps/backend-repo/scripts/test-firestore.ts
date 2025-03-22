// apps/backend-repo/scripts/test-firestore.ts

import { db } from '../config/firebaseConfig';

async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to write a test document
    const testRef = db.collection('_connection_test').doc('test-' + Date.now());
    await testRef.set({
      timestamp: new Date(),
      message: 'Connection test'
    });
    
    console.log('✅ Successfully wrote to Firestore');
    
    // Try to read the document
    const doc = await testRef.get();
    console.log('✅ Successfully read from Firestore', doc.data());
    
    // Delete the test document
    await testRef.delete();
    console.log('✅ Successfully deleted test document');
    
    console.log('✅ ALL TESTS PASSED - Firestore connection is working!');
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
  }
}

testFirestoreConnection();