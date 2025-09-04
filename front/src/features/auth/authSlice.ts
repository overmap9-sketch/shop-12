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

// Mock delay for API simulation
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    phone: '+1234567890',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'default',
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
    },
    addresses: [],
    isEmailVerified: true,
    isPhoneVerified: false,
    dateCreated: '2024-01-01T00:00:00Z',
    dateModified: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+1234567891',
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'default',
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    },
    addresses: [],
    isEmailVerified: true,
    isPhoneVerified: true,
    dateCreated: '2024-01-01T00:00:00Z',
    dateModified: '2024-01-01T00:00:00Z',
  },
];

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      await delay();
      
      const user = mockUsers.find(u => u.email === request.email && u.password === request.password);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const { password, ...userWithoutPassword } = user;
      const token = 'mock_jwt_token_' + Date.now();

      const authResponse: AuthResponse = {
        user: userWithoutPassword as User,
        token,
        refreshToken: 'mock_refresh_token',
        expiresIn: 3600,
      };

      return authResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      await delay();
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === request.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        phone: request.phone,
        preferences: {
          language: 'en',
          currency: 'USD',
          theme: 'default',
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: request.acceptMarketing || false,
        },
        addresses: [],
        isEmailVerified: false,
        isPhoneVerified: false,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };

      const token = 'mock_jwt_token_' + Date.now();

      const authResponse: AuthResponse = {
        user: newUser,
        token,
        refreshToken: 'mock_refresh_token',
        expiresIn: 3600,
      };

      // In a real app, this would be saved to the backend
      mockUsers.push({ ...newUser, password: request.password } as any);

      return authResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
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
