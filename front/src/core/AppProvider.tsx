import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { ThemeProvider } from '../shared/themes/ThemeProvider';
import '../shared/config/i18n';
import { Storage, STORAGE_KEYS } from '../shared/lib/storage';
import { http } from '../shared/api/http';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    (async () => {
      try {
        const res = await http.get('/auth/me');
        if (res?.user) Storage.set(STORAGE_KEYS.USER, res.user);
      } catch {
        Storage.remove(STORAGE_KEYS.USER);
        Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      }
    })();
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
