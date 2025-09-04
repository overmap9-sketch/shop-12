import React, { useEffect } from 'react';

// Import theme CSS files
import './default.css';
import './dark.css';
import './ocean.css';

interface SimpleThemeProviderProps {
  children: React.ReactNode;
}

export function SimpleThemeProvider({ children }: SimpleThemeProviderProps) {
  useEffect(() => {
    // Set default theme
    document.documentElement.setAttribute('data-theme', 'default');
  }, []);

  return <>{children}</>;
}
