export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD (USD = 1.0)
  locale: string; // For formatting (e.g., 'en-US', 'de-DE')
  isActive: boolean;
}

export interface CurrencyState {
  currencies: Currency[];
  selectedCurrency: Currency;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ExchangeRates {
  [currencyCode: string]: number;
}

export interface PriceData {
  amount: number;
  currency: string;
}

export interface FormattedPrice {
  formatted: string;
  amount: number;
  currency: Currency;
}
