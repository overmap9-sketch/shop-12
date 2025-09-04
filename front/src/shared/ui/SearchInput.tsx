import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface SearchInputProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  suggestions?: string[];
  loading?: boolean;
  debounceMs?: number;
}

export function SearchInput({
  value = '',
  onSearch,
  placeholder,
  className = '',
  showSuggestions = false,
  suggestions = [],
  loading = false,
  debounceMs = 300,
}: SearchInputProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const actualPlaceholder = placeholder || t('navigation.search');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Clear debounce timer and search immediately
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      onSearch(inputValue);
      setShowSuggestionsList(false);
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    setShowSuggestionsList(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch(inputValue);
    setShowSuggestionsList(false);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestionsList(showSuggestions && suggestions.length > 0)}
          placeholder={actualPlaceholder}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-theme"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <svg
              className="h-5 w-5 text-foreground-muted animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-foreground-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onSearch('');
              setShowSuggestionsList(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground-muted hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestionsList(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-theme-lg z-20 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt transition-colors first:rounded-t-md last:rounded-b-md"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </form>
  );
}
