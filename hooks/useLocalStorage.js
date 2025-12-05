import { useState, useEffect } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * @param {string} key - localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {[any, Function]} - [value, setValue] tuple
 */
export function useLocalStorage(key, defaultValue) {
  // Initialize state with value from localStorage or default
  const [value, setValue] = useState(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        // For arrays, return default if stored is empty
        if (Array.isArray(defaultValue) && Array.isArray(parsed) && parsed.length === 0) {
          return defaultValue;
        }
        return parsed;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Sync to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Default device types for the application
 */
export const DEFAULT_DEVICE_TYPES = [
  { name: '1mg Disposable', capacity: 88, unitCost: 2.05 },
  { name: '2mg Disposable', capacity: 77, unitCost: 2.50 },
  { name: 'MK Lighter', capacity: 80, unitCost: 1.75 }
];

/**
 * Default account managers
 */
export const DEFAULT_ACCOUNT_MANAGERS = ['Ryan', 'Kyle', 'Anthony', 'Clarence'];

/**
 * localStorage keys used by the application
 */
export const STORAGE_KEYS = {
  DEVICE_TYPES: 'device-types',
  ACCOUNT_MANAGERS: 'account-managers',
  SAVED_QUOTES: 'saved-quotes'
};
