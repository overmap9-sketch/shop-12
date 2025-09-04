import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../shared/themes/ThemeProvider';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0];

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2 text-sm hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
        aria-label={t('themes.switchTheme')}
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        <span className="hidden sm:block">{currentThemeData.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-theme-lg z-20">
            <div className="py-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt transition-theme ${
                    theme.id === currentTheme ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      {theme.description && (
                        <div className="text-xs text-foreground-muted">{theme.description}</div>
                      )}
                    </div>
                    {theme.id === currentTheme && (
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
