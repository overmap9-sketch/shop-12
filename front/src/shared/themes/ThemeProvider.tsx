import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, DEFAULT_THEME, Theme } from './types';

// Import all theme CSS files
import './default.css';
import './dark.css';
import './ocean.css';

interface ThemeContextType {
  currentTheme: string;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Get theme from localStorage or use default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });

  const setTheme = (themeId: string) => {
    // Validate theme exists
    const themeExists = themes.some(theme => theme.id === themeId);
    if (!themeExists) {
      console.warn(`Theme "${themeId}" not found. Using default theme.`);
      themeId = DEFAULT_THEME;
    }

    setCurrentTheme(themeId);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeId);
    }
  };

  useEffect(() => {
    // Apply theme to HTML element
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
