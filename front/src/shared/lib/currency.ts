import { Currency, FormattedPrice } from '../../features/currency/types';

export class CurrencyUtils {
  /**
   * Convert an amount from one currency to another
   */
  static convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number {
    // Convert to USD first (base currency), then to target currency
    const usdAmount = amount / fromCurrency.rate;
    return usdAmount * toCurrency.rate;
  }

  /**
   * Format a price according to currency locale and symbol
   */
  static formatPrice(
    amount: number,
    currency: Currency,
    options: {
      showSymbol?: boolean;
      showCode?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): FormattedPrice {
    const {
      showSymbol = true,
      showCode = false,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    // Handle special case for Japanese Yen (no decimal places)
    const fractionDigits = currency.code === 'JPY' ? 0 : Math.min(minimumFractionDigits, maximumFractionDigits);

    try {
      // Use Intl.NumberFormat for proper locale formatting
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: Math.max(fractionDigits, maximumFractionDigits),
      });

      let formatted = formatter.format(amount);

      // For some currencies, we might want to use custom symbols
      if (showSymbol && !showCode) {
        // Replace the default symbol if we have a custom one
        if (currency.symbol !== currency.code) {
          formatted = formatted.replace(currency.code, currency.symbol);
        }
      }

      if (showCode) {
        formatted = `${formatted} ${currency.code}`;
      }

      return {
        formatted,
        amount,
        currency,
      };
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const formattedAmount = amount.toFixed(fractionDigits);
      const formatted = showSymbol 
        ? `${currency.symbol}${formattedAmount}`
        : formattedAmount;
      
      return {
        formatted: showCode ? `${formatted} ${currency.code}` : formatted,
        amount,
        currency,
      };
    }
  }

  /**
   * Convert and format a price from USD to target currency
   */
  static convertAndFormatPrice(
    usdAmount: number,
    targetCurrency: Currency,
    options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
  ): FormattedPrice {
    const convertedAmount = usdAmount * targetCurrency.rate;
    return this.formatPrice(convertedAmount, targetCurrency, options);
  }

  /**
   * Get currency by code
   */
  static getCurrencyByCode(currencies: Currency[], code: string): Currency | undefined {
    return currencies.find(currency => currency.code === code);
  }

  /**
   * Get all active currencies
   */
  static getActiveCurrencies(currencies: Currency[]): Currency[] {
    return currencies.filter(currency => currency.isActive);
  }

  /**
   * Format a price range
   */
  static formatPriceRange(
    minAmount: number,
    maxAmount: number,
    currency: Currency,
    options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
  ): string {
    const minFormatted = this.formatPrice(minAmount, currency, options);
    const maxFormatted = this.formatPrice(maxAmount, currency, options);
    
    return `${minFormatted.formatted} - ${maxFormatted.formatted}`;
  }

  /**
   * Calculate discount percentage
   */
  static calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * Format discount amount
   */
  static formatDiscount(
    originalPrice: number,
    salePrice: number,
    currency: Currency,
    options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
  ): {
    amount: FormattedPrice;
    percentage: number;
  } {
    const discountAmount = originalPrice - salePrice;
    const percentage = this.calculateDiscountPercentage(originalPrice, salePrice);
    
    return {
      amount: this.formatPrice(discountAmount, currency, options),
      percentage,
    };
  }

  /**
   * Check if a currency is a major currency
   */
  static isMajorCurrency(currencyCode: string): boolean {
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    return majorCurrencies.includes(currencyCode);
  }

  /**
   * Get currency flag component props (for UI display)
   */
  static getCurrencyFlagProps(currencyCode: string): { currencyCode: string } {
    return { currencyCode };
  }

  /**
   * @deprecated Use getCurrencyFlagProps and CurrencyFlag component instead
   * Get currency flag emoji (for UI display)
   */
  static getCurrencyFlag(currencyCode: string): string {
    const flags: Record<string, string> = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      CAD: '🇨🇦',
      AUD: '🇦🇺',
      JPY: '🇯🇵',
      CHF: '🇨🇭',
      CNY: '🇨🇳',
    };

    return flags[currencyCode] || '💱';
  }

  /**
   * Validate currency code format
   */
  static isValidCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }

  /**
   * Get popular currencies for quick selection
   */
  static getPopularCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'JPY'];
  }

  /**
   * Format currency for display in dropdowns/selectors
   */
  static formatCurrencyForDisplay(currency: Currency): string {
    const flag = this.getCurrencyFlag(currency.code);
    return `${flag} ${currency.code} - ${currency.name}`;
  }

  /**
   * Check if currency has a local flag component available
   */
  static hasCurrencyFlag(currencyCode: string): boolean {
    const supportedFlags = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
    return supportedFlags.includes(currencyCode);
  }
}

// Hook-like function for easy price formatting in components
export function useFormattedPrice(
  amount: number,
  currency: Currency,
  options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
): FormattedPrice {
  return CurrencyUtils.formatPrice(amount, currency, options);
}

// Helper function to convert product prices
export function convertProductPrice(
  productPrice: number,
  targetCurrency: Currency
): number {
  // Assuming product prices are stored in USD
  return productPrice * targetCurrency.rate;
}
