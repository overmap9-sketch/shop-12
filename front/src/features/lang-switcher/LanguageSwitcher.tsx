import React from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages } from '../../shared/config/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
        aria-label={t('languages.switchLanguage')}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

// Dropdown version for better UX
export function LanguageSwitcherDropdown({ className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === i18n.language) || availableLanguages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2 text-sm hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-ring transition-theme"
        aria-label={t('languages.switchLanguage')}
        aria-expanded={isOpen}
      >
        <span>{currentLanguage.nativeName}</span>
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
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt transition-theme ${
                    lang.code === i18n.language ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.nativeName}</span>
                    <span className="text-foreground-muted">{lang.name}</span>
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
