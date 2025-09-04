"use client";
import { useEffect } from 'react';
import { useAppDispatch } from '../src/app/hooks';
import { initializeTheme } from '../src/features/theme-switcher/themeSlice';
import { fetchCart } from '../src/features/cart/cartSlice';
import { fetchFavourites } from '../src/features/favourites/favouritesSlice';
import { initializeCurrency } from '../src/features/currency/currencySlice';
import { initializeMockData } from '../src/shared/lib/mockData';

export function AppInit() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initializeTheme());
    setTimeout(() => {
      initializeMockData();
    }, 100);
    setTimeout(() => {
      dispatch(fetchCart());
      dispatch(fetchFavourites());
      dispatch(initializeCurrency());
    }, 200);
  }, [dispatch]);
  return null;
}
