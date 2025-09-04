import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_THEME } from '../../shared/themes/types';

interface ThemeState {
  currentTheme: string;
}

const initialState: ThemeState = {
  currentTheme: typeof window !== 'undefined' 
    ? localStorage.getItem('theme') || DEFAULT_THEME 
    : DEFAULT_THEME,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = action.payload;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
    initializeTheme: (state) => {
      // Initialize theme on app startup
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', state.currentTheme);
      }
    },
  },
});

export const { setTheme, initializeTheme } = themeSlice.actions;

// Selectors
export const selectCurrentTheme = (state: { theme: ThemeState }) => state.theme.currentTheme;

export { themeSlice };
