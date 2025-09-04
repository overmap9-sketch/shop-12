/**
 * LocalStorage utilities for type-safe storage operations
 */

export class Storage {
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return defaultValue || null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  static getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  static setMultiple<T>(items: Record<string, T>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  PRODUCTS: 'ecommerce_products',
  CATEGORIES: 'ecommerce_categories',
  CART: 'ecommerce_cart',
  FAVOURITES: 'ecommerce_favourites',
  ORDERS: 'ecommerce_orders',
  USER: 'ecommerce_user',
  AUTH_TOKEN: 'ecommerce_auth_token',
  THEME: 'ecommerce_theme',
  LANGUAGE: 'ecommerce_language',
  CURRENCY: 'ecommerce_currency',
  SEARCH_HISTORY: 'ecommerce_search_history',
  FILTERS: 'ecommerce_filters',
  ADDRESSES: 'ecommerce_addresses',
  SETTINGS: 'ecommerce_admin_settings',
  COUPONS: 'ecommerce_coupons',
  AUDIT_LOGS: 'ecommerce_audit_logs',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
