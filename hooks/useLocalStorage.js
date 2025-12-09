import { useState, useEffect } from 'react';
import { DEFAULT_DEVICE_PRICING_TIERS } from '../utils/pricing';

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
 * Now includes pricing tiers for device sales
 * 
 * Structure:
 * - name: Device display name
 * - capacity: Units per batch (for production time calculation)
 * - unitCost: Your cost per device
 * - pricingTiers: Array of {minQty, price} for quantity-based selling prices
 */
export const DEFAULT_DEVICE_TYPES = [
  { 
    name: '1mg Disposable', 
    capacity: 88, 
    unitCost: 1.85,
    pricingTiers: DEFAULT_DEVICE_PRICING_TIERS['1mg Disposable']
  },
  { 
    name: '2mg Disposable', 
    capacity: 77, 
    unitCost: 2.05,
    pricingTiers: DEFAULT_DEVICE_PRICING_TIERS['2mg Disposable']
  },
  { 
    name: 'MK Lighter', 
    capacity: 80, 
    unitCost: 0.60,
    pricingTiers: DEFAULT_DEVICE_PRICING_TIERS['MK Lighter']
  }
];

/**
 * Default account managers
 */
export const DEFAULT_ACCOUNT_MANAGERS = ['Ryan', 'Kyle', 'Anthony', 'Clarence'];

/**
 * localStorage keys used by the application
 */
export const STORAGE_KEYS = {
  DEVICE_TYPES: 'device-types-v2', // Updated key to force refresh with new structure
  ACCOUNT_MANAGERS: 'account-managers',
  SAVED_QUOTES: 'saved-quotes'
};

/**
 * Migrate old device types to new structure
 * @param {Array} oldDevices - Old device format
 * @returns {Array} New device format with pricing tiers
 */
export function migrateDeviceTypes(oldDevices) {
  return oldDevices.map(device => {
    // If device already has pricing tiers, return as-is
    if (device.pricingTiers && Array.isArray(device.pricingTiers)) {
      return device;
    }
    
    // Check if we have default pricing for this device
    const defaultTiers = DEFAULT_DEVICE_PRICING_TIERS[device.name];
    
    if (defaultTiers) {
      return {
        ...device,
        pricingTiers: defaultTiers
      };
    }
    
    // Generate pricing tiers based on cost
    const baseCost = device.unitCost || 2.00;
    return {
      ...device,
      pricingTiers: [
        { minQty: 10000, price: Math.round(baseCost * 1.22 * 100) / 100 },
        { minQty: 5000, price: Math.round(baseCost * 1.25 * 100) / 100 },
        { minQty: 3000, price: Math.round(baseCost * 1.30 * 100) / 100 },
        { minQty: 1000, price: Math.round(baseCost * 1.35 * 100) / 100 },
        { minQty: 100, price: Math.round(baseCost * 1.40 * 100) / 100 },
        { minQty: 0, price: Math.round(baseCost * 1.40 * 100) / 100 }
      ]
    };
  });
}
