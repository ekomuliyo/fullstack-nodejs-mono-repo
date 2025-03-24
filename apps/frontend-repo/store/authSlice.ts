import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setAuthToken, createUserProfile } from '../apis/userApi';

export interface AuthState {
  user: FirebaseUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Create async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setAuthToken(token);
    return { user: userCredential.user, token };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    // Step 1: Register with Firebase Authentication
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Step 2: Get the token
    const token = await userCredential.user.getIdToken();
    setAuthToken(token);
    
    // Step 3: Create a user profile in Firestore
    try {
      console.log('Creating user profile in Firestore...');
      await createUserProfile(userCredential.user.uid, { 
        email: userCredential.user.email || email,
        name: email.split('@')[0] // Default name is the part before @ in email
      });
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Continue anyway - the middleware should handle profile creation
    }
    
    return { user: userCredential.user, token };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await signOut(auth);
    setAuthToken('');
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: FirebaseUser | null; token: string | null }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.token) {
        setAuthToken(action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login states
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Handle register states
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Handle logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer; 