"use client";
import { useEffect } from 'react';
import { useAppDispatch } from '../core/hooks';
import { initializeTheme } from '../features/theme-switcher/themeSlice';
import { fetchCart } from '../features/cart/cartSlice';
import { fetchFavourites } from '../features/favourites/favouritesSlice';
import { initializeCurrency } from '../features/currency/currencySlice';

export function AppInit() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initializeTheme());
    setTimeout(() => {
      dispatch(fetchCart());
      dispatch(fetchFavourites());
      dispatch(initializeCurrency());
    }, 200);
  }, [dispatch]);
  return null;
}
