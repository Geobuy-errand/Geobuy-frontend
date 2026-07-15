import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  providerProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload || {};
      state.user = payload.user || null;
      state.providerProfile = payload.providerProfile || null;
      state.isAuthenticated = !!payload.user;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload || false;
    },
    setError: (state, action) => {
      state.error = action.payload || null;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.providerProfile = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.user && action.payload) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setUser, 
  setLoading, 
  setError, 
  logout, 
  updateUser,
  clearError 
} = authSlice.actions;

export default authSlice.reducer;