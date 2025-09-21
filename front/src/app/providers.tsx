"use client";
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../core/store';
import { ThemeProvider } from '../shared/themes/ThemeProvider';
import '../shared/config/i18n';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
