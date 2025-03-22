'use client';

import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../config/firebase';
import { setUser } from '../store/authSlice';
import { setAuthToken } from '../apis/userApi';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        console.log('Auth state changed: User is signed in', user.uid);
        try {
          // Get the ID token with a fresh one (force refresh)
          const token = await user.getIdToken(true);
          
          // Set the token in the Redux store
          dispatch(setUser({ user, token }));
          
          // Set the token for API calls
          setAuthToken(token);
          
          console.log('Token set for authenticated user');
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      } else {
        // User is signed out
        console.log('Auth state changed: User is signed out');
        dispatch(setUser({ user: null, token: null }));
        setAuthToken('');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
} 