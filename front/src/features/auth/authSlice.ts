import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../entities';
import { Storage, STORAGE_KEYS } from '../../shared/lib/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: Storage.get<User>(STORAGE_KEYS.USER, null),
  token: Storage.get<string>(STORAGE_KEYS.AUTH_TOKEN, null),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Check if user is authenticated on app startup
initialState.isAuthenticated = !!(initialState.user && initialState.token);

// Async thunks
import { http } from '../../shared/api/http';

export const login = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      const authResponse = await http.post('/auth/login', { email: request.email, password: request.password });
      return authResponse as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      const authResponse = await http.post('/auth/register', request);
      return authResponse as AuthResponse;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await delay(200);
      // In a real app, you might need to call an API to invalidate the token
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User>, { getState, rejectWithValue }) => {
    try {
      await delay();
      
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const updatedUser: User = {
        ...currentUser,
        ...updates,
        dateModified: new Date().toISOString(),
      };

      return updatedUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      Storage.remove(STORAGE_KEYS.USER);
      Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Persist to localStorage
        Storage.set(STORAGE_KEYS.USER, action.payload.user);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Persist to localStorage
        Storage.set(STORAGE_KEYS.USER, action.payload.user);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        
        // Clear localStorage
        Storage.remove(STORAGE_KEYS.USER);
        Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        
        // Update localStorage
        Storage.set(STORAGE_KEYS.USER, action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;

export { authSlice };
