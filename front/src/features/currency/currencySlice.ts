import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Currency, CurrencyState, ExchangeRates } from './types';
import { Storage, STORAGE_KEYS } from '../../shared/lib/storage';

// Default supported currencies
const defaultCurrencies: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.0,
    locale: 'en-US',
    isActive: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.85, // Example rate
    locale: 'de-DE',
    isActive: true,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.73, // Example rate
    locale: 'en-GB',
    isActive: true,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    rate: 1.25, // Example rate
    locale: 'en-CA',
    isActive: true,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    rate: 1.35, // Example rate
    locale: 'en-AU',
    isActive: true,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    rate: 110.0, // Example rate
    locale: 'ja-JP',
    isActive: true,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    rate: 0.92, // Example rate
    locale: 'de-CH',
    isActive: true,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    rate: 6.45, // Example rate
    locale: 'zh-CN',
    isActive: true,
  },
];

const initialState: CurrencyState = {
  currencies: defaultCurrencies,
  selectedCurrency: defaultCurrencies[0], // USD by default
  loading: false,
  error: null,
  lastUpdated: null,
};

// Mock delay for API simulation
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Async thunks
export const initializeCurrency = createAsyncThunk(
  'currency/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      
      // Load saved currency preference
      const savedCurrencyCode = Storage.get<string>(STORAGE_KEYS.CURRENCY, 'USD');
      const savedCurrency = defaultCurrencies.find(c => c.code === savedCurrencyCode) || defaultCurrencies[0];
      
      return {
        currencies: defaultCurrencies,
        selectedCurrency: savedCurrency,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize currency');
    }
  }
);

export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchExchangeRates',
  async (_, { rejectWithValue, getState }) => {
    try {
      await delay(1000); // Simulate API call
      
      // In a real app, you would fetch from an API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      
      // Mock exchange rates
      const mockRates: ExchangeRates = {
        USD: 1.0,
        EUR: 0.85 + (Math.random() - 0.5) * 0.02, // Add some variation
        GBP: 0.73 + (Math.random() - 0.5) * 0.02,
        CAD: 1.25 + (Math.random() - 0.5) * 0.05,
        AUD: 1.35 + (Math.random() - 0.5) * 0.05,
        JPY: 110.0 + (Math.random() - 0.5) * 5,
        CHF: 0.92 + (Math.random() - 0.5) * 0.02,
        CNY: 6.45 + (Math.random() - 0.5) * 0.2,
      };
      
      return {
        rates: mockRates,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch exchange rates');
    }
  }
);

export const changeCurrency = createAsyncThunk(
  'currency/changeCurrency',
  async (currencyCode: string, { rejectWithValue, getState }) => {
    try {
      await delay();
      
      const state = getState() as { currency: CurrencyState };
      const currency = state.currency.currencies.find(c => c.code === currencyCode);
      
      if (!currency) {
        throw new Error('Currency not supported');
      }
      
      // Save to localStorage
      Storage.set(STORAGE_KEYS.CURRENCY, currencyCode);
      
      return currency;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to change currency');
    }
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCurrencyRates: (state, action: PayloadAction<ExchangeRates>) => {
      state.currencies = state.currencies.map(currency => ({
        ...currency,
        rate: action.payload[currency.code] || currency.rate,
      }));
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize currency
      .addCase(initializeCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = action.payload.currencies;
        state.selectedCurrency = action.payload.selectedCurrency;
      })
      .addCase(initializeCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch exchange rates
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = state.currencies.map(currency => ({
          ...currency,
          rate: action.payload.rates[currency.code] || currency.rate,
        }));
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change currency
      .addCase(changeCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCurrency = action.payload;
      })
      .addCase(changeCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateCurrencyRates } = currencySlice.actions;

// Selectors
export const selectCurrencies = (state: { currency: CurrencyState }) => state.currency.currencies;
export const selectSelectedCurrency = (state: { currency: CurrencyState }) => state.currency.selectedCurrency;
export const selectCurrencyLoading = (state: { currency: CurrencyState }) => state.currency.loading;
export const selectCurrencyError = (state: { currency: CurrencyState }) => state.currency.error;
export const selectLastUpdated = (state: { currency: CurrencyState }) => state.currency.lastUpdated;

export { currencySlice };
