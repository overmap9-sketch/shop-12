import { configureStore } from '@reduxjs/toolkit';
import { cartSlice } from '../features/cart/cartSlice';
import { favouritesSlice } from '../features/favourites/favouritesSlice';
import { authSlice } from '../features/auth/authSlice';
import { catalogSlice } from '../features/catalog/catalogSlice';
import { themeSlice } from '../features/theme-switcher/themeSlice';
import { currencySlice } from '../features/currency/currencySlice';

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    favourites: favouritesSlice.reducer,
    auth: authSlice.reducer,
    catalog: catalogSlice.reducer,
    theme: themeSlice.reducer,
    currency: currencySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
