import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import {
  selectCurrencies,
  selectSelectedCurrency,
  selectCurrencyLoading,
  changeCurrency,
  fetchExchangeRates
} from './currencySlice';
import { Button } from '../../shared/ui/Button';
import { CurrencyUtils } from '../../shared/lib/currency';
import { CurrencyFlag } from '../../shared/ui/FlagIcons';
import { ChevronDown, RefreshCw, DollarSign } from 'lucide-react';

interface CurrencySwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
  className?: string;
}

export function CurrencySwitcher({ 
  variant = 'default', 
  showLabel = true,
  className = '' 
}: CurrencySwitcherProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const currencies = useAppSelector(selectCurrencies);
  const selectedCurrency = useAppSelector(selectSelectedCurrency);
  const loading = useAppSelector(selectCurrencyLoading);
  
  const [isOpen, setIsOpen] = useState(false);

  const activeCurrencies = CurrencyUtils.getActiveCurrencies(currencies);

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      await dispatch(changeCurrency(currencyCode)).unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change currency:', error);
    }
  };

  const handleRefreshRates = () => {
    dispatch(fetchExchangeRates());
  };

  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          disabled={loading}
          title={t('currency.currentCurrency', `Current: ${selectedCurrency.code}`)}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-1">
              {activeCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full text-left px-3 py-2 rounded-sm hover:bg-muted transition-colors flex items-center justify-between ${
                    currency.code === selectedCurrency.code ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CurrencyFlag currencyCode={currency.code} size={16} />
                    <span>{currency.code}</span>
                    <span className="text-sm text-muted-foreground">{currency.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">{currency.symbol}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <CurrencyFlag currencyCode={selectedCurrency.code} size={16} />
          <span className="font-medium">{selectedCurrency.code}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-20 p-1">
              {activeCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full text-left px-3 py-2 rounded-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                    currency.code === selectedCurrency.code ? 'bg-muted font-medium' : ''
                  }`}
                >
                  <CurrencyFlag currencyCode={currency.code} size={16} />
                  <span>{currency.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-sm text-muted-foreground">
            {t('currency.label', 'Currency')}:
          </span>
        )}
        
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center gap-2 min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            <CurrencyFlag currencyCode={selectedCurrency.code} size={16} />
            <span className="font-medium">{selectedCurrency.code}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshRates}
          disabled={loading}
          className="p-2"
          title={t('currency.refreshRates', 'Refresh exchange rates')}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-20 p-1">
            <div className="p-3 border-b border-border">
              <h3 className="font-medium text-foreground mb-1">
                {t('currency.selectCurrency', 'Select Currency')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('currency.selectDescription', 'Choose your preferred currency for prices')}
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {activeCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full text-left px-3 py-3 hover:bg-muted transition-colors flex items-center justify-between ${
                    currency.code === selectedCurrency.code ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CurrencyFlag currencyCode={currency.code} size={20} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.code}</span>
                        {currency.code === selectedCurrency.code && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            {t('currency.current', 'Current')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{currency.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{currency.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      1 USD = {currency.rate.toFixed(currency.code === 'JPY' ? 0 : 2)} {currency.code}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-3 border-t border-border">
              <button
                onClick={handleRefreshRates}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {t('currency.refreshRates', 'Refresh exchange rates')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
