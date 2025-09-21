import { configureStore } from '@reduxjs/toolkit';
import { themeSlice } from '../features/theme-switcher/themeSlice';

export const simpleStore = configureStore({
  reducer: {
    theme: themeSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof simpleStore.getState>;
export type AppDispatch = typeof simpleStore.dispatch;
