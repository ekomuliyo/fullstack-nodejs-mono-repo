import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'shared';
import { fetchUserData, updateUserData } from '../apis/userApi';

// Define the initial state
export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateError: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  updateStatus: 'idle',
  updateError: null,
};

// Create async thunks for API calls
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await fetchUserData(userId);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }: { userId: string; userData: Partial<User> }) => {
    const response = await updateUserData(userId, userData);
    return response;
  }
);

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear user state when logging out
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.updateStatus = 'idle';
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUser states
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user data';
      })
      // Handle updateUser states
      .addCase(updateUser.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.updateStatus = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message || 'Failed to update user data';
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer; 