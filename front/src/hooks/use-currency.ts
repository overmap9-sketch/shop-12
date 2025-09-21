import { useMemo } from 'react';
import { useAppSelector } from '../core/hooks';
import { selectSelectedCurrency } from '../features/currency/currencySlice';
import { CurrencyUtils } from '../shared/lib/currency';
import { Currency, FormattedPrice } from '../features/currency/types';

export function useCurrency() {
  const selectedCurrency = useAppSelector(selectSelectedCurrency);

  return useMemo(() => ({
    currency: selectedCurrency,
    
    // Format a price in the current currency
    formatPrice: (
      amount: number,
      options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
    ): FormattedPrice => {
      return CurrencyUtils.formatPrice(amount, selectedCurrency, options);
    },

    // Convert and format a USD price to current currency
    convertAndFormat: (
      usdAmount: number,
      options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
    ): FormattedPrice => {
      return CurrencyUtils.convertAndFormatPrice(usdAmount, selectedCurrency, options);
    },

    // Convert amount from USD to current currency
    convertFromUSD: (usdAmount: number): number => {
      return usdAmount * selectedCurrency.rate;
    },

    // Convert amount from current currency to USD
    convertToUSD: (amount: number): number => {
      return amount / selectedCurrency.rate;
    },

    // Format a price range
    formatPriceRange: (
      minAmount: number,
      maxAmount: number,
      options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
    ): string => {
      return CurrencyUtils.formatPriceRange(minAmount, maxAmount, selectedCurrency, options);
    },

    // Format discount information
    formatDiscount: (
      originalPrice: number,
      salePrice: number,
      options?: Parameters<typeof CurrencyUtils.formatPrice>[2]
    ) => {
      return CurrencyUtils.formatDiscount(originalPrice, salePrice, selectedCurrency, options);
    },

    // Get currency symbol
    getSymbol: (): string => selectedCurrency.symbol,

    // Get currency code
    getCode: (): string => selectedCurrency.code,

    // Get currency name
    getName: (): string => selectedCurrency.name,

    // Check if current currency needs special formatting
    isZeroDecimalCurrency: (): boolean => selectedCurrency.code === 'JPY',

    // Get flag props for current currency (use with CurrencyFlag component)
    getFlagProps: () => CurrencyUtils.getCurrencyFlagProps(selectedCurrency.code),

    // @deprecated Use getFlagProps() with CurrencyFlag component instead
    getFlag: (): string => CurrencyUtils.getCurrencyFlag(selectedCurrency.code),
  }), [selectedCurrency]);
}

// Specific hook for product prices (assumes prices are stored in USD)
export function useProductPrice(usdPrice: number, originalUsdPrice?: number) {
  const { convertAndFormat, formatDiscount } = useCurrency();

  return useMemo(() => {
    const price = convertAndFormat(usdPrice);
    const originalPrice = originalUsdPrice ? convertAndFormat(originalUsdPrice) : undefined;
    
    const discount = originalUsdPrice && originalUsdPrice > usdPrice 
      ? formatDiscount(convertAndFormat(originalUsdPrice).amount, price.amount)
      : undefined;

    return {
      price,
      originalPrice,
      discount,
      hasDiscount: !!discount && discount.percentage > 0,
    };
  }, [usdPrice, originalUsdPrice, convertAndFormat, formatDiscount]);
}

// Hook for cart/order totals
export function useOrderTotal(items: Array<{ price: number; quantity: number }>) {
  const { convertAndFormat } = useCurrency();

  return useMemo(() => {
    const subtotalUSD = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const subtotal = convertAndFormat(subtotalUSD);
    
    // Example calculations (in a real app, these would come from your business logic)
    const shippingUSD = subtotalUSD > 50 ? 0 : 10; // Free shipping over $50
    const shipping = convertAndFormat(shippingUSD);
    
    const taxRate = 0.08; // 8% tax
    const taxUSD = subtotalUSD * taxRate;
    const tax = convertAndFormat(taxUSD);
    
    const totalUSD = subtotalUSD + shippingUSD + taxUSD;
    const total = convertAndFormat(totalUSD);

    return {
      subtotal,
      shipping,
      tax,
      total,
      items: items.map(item => ({
        ...item,
        formattedPrice: convertAndFormat(item.price),
        formattedTotal: convertAndFormat(item.price * item.quantity),
      })),
    };
  }, [items, convertAndFormat]);
}

// Hook for currency-aware form inputs
export function useCurrencyInput() {
  const { currency, convertToUSD, convertFromUSD } = useCurrency();

  return {
    currency,
    
    // Format input value for display
    formatInputValue: (usdValue: number): string => {
      const localValue = convertFromUSD(usdValue);
      return localValue.toFixed(currency.code === 'JPY' ? 0 : 2);
    },

    // Parse input value to USD
    parseInputValue: (inputValue: string): number => {
      const localValue = parseFloat(inputValue) || 0;
      return convertToUSD(localValue);
    },

    // Get input placeholder
    getInputPlaceholder: (): string => {
      return `0${currency.code === 'JPY' ? '' : '.00'} ${currency.symbol}`;
    },
  };
}
