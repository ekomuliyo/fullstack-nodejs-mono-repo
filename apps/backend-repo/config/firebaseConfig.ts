import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing Firebase Admin SDK...');
console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
console.log(`Database URL: ${process.env.FIREBASE_DATABASE_URL}`);

// Check if service account file exists
const serviceAccountPath = path.resolve(__dirname, './credentials/serviceAccountKey.json');
const serviceAccountExists = fs.existsSync(serviceAccountPath);

if (!serviceAccountExists) {
  console.error(`⚠️ Service account file not found at: ${serviceAccountPath}`);
  console.error('Please download the service account key from Firebase Console and place it at the correct location.');
}

// Initialize Firebase if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    if (serviceAccountExists) {
      console.log('Initializing Firebase with service account...');
      
      // Get the service account from file
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully with service account');
    } else {
      // Fallback initialization
      console.log('Attempting fallback initialization with project ID only...');
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      console.log(`⚠️ Firebase initialized with limited credentials (project ID only)`);
    }
    
    // Test Firestore connection
    console.log('Testing Firestore connection...');
    admin.firestore().collection('_connection_test').doc('test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Connection successful'
    })
    .then(() => {
      console.log('✅ Successfully connected to Firestore');
    })
    .catch(error => {
      console.error('❌ Failed to connect to Firestore:', error);
    });
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;