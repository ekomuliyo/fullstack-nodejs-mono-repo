import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Check if we have environment variables for credentials
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Use environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key comes as a string with "\n" character literals
          // We need to replace them with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    } else {
      // Fallback to service account file for local development
      const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export Firestore, Auth, and Storage instances
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage(); 