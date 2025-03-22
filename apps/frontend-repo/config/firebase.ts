import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase if it hasn't been initialized yet
let firebaseApp: FirebaseApp;
const apps = getApps();
if (!apps.length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  // Make sure we don't get undefined
  firebaseApp = apps[0]!;
}

// Initialize Firebase Authentication
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Connect to auth and firestore emulators only when NEXT_PUBLIC_USE_EMULATOR is 'true'
if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  // Connect to auth emulator 
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  
  // Connect to firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8081);
  
  console.log('Using Firebase Auth and Firestore emulator');
} else {
  console.log('Using real Firebase services');
}

export { firebaseApp, auth, db }; 