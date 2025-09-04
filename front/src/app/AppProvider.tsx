import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { ThemeProvider } from '../shared/themes/ThemeProvider';
import { initializeMockData } from '../shared/lib/mockData';
import '../shared/config/i18n';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Initialize mock data on app startup
    initializeMockData();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
