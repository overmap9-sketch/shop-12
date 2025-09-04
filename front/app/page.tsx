"use client";
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/app/store';
import { ThemeProvider } from '../src/shared/themes/ThemeProvider';
import App from '../src/App';
import '../src/shared/config/i18n';

export default function Page() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
