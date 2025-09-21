"use client";
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';
import { ThemeProvider } from '../src/shared/themes/ThemeProvider';
import '../src/shared/config/i18n';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
