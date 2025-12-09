/**
 * Pricing utilities for the quote calculator
 * Contains pricing tiers, fee calculations, and add-on costs
 * 
 * Updated: Device pricing tiers for dealer/supply mode
 */

// ===========================================
// PRINTING PRICING TIERS
// ===========================================

// Printing pricing tiers based on total quantity
// Updated December 2024 with new tiered pricing strategy
export const PRICING_TIERS = [
  { minQty: 10000, price: 0.60 },  // 10,000-24,999: $0.60/device
  { minQty: 5000, price: 0.60 },   // 5,000-9,999: $0.60/device
  { minQty: 3000, price: 0.65 },   // 3,000-4,999: $0.65/device
  { minQty: 1000, price: 0.70 },   // 1,000-2,999: $0.70/device
  { minQty: 500, price: 0.75 },    // 500-999: $0.75/device + setup fee
  { minQty: 100, price: 0.80 },    // 100-499: $0.80/device + setup fee
  { minQty: 0, price: 0.80 }       // Below minimum (fallback)
];

// ===========================================
// DEVICE PRICING TIERS (for device supply)
// ===========================================

// Default device pricing tiers - selling prices based on quantity
// These are the prices we CHARGE customers, not our cost
export const DEFAULT_DEVICE_PRICING_TIERS = {
  '1mg Disposable': [
    { minQty: 10000, price: 2.50 },
    { minQty: 5000, price: 2.75 },
    { minQty: 3000, price: 3.00 },
    { minQty: 1000, price: 3.25 },
    { minQty: 100, price: 3.75 },
    { minQty: 0, price: 3.75 }
  ],
  '2mg Disposable': [
    { minQty: 10000, price: 2.70 },
    { minQty: 5000, price: 2.95 },
    { minQty: 3000, price: 3.20 },
    { minQty: 1000, price: 3.45 },
    { minQty: 100, price: 3.95 },
    { minQty: 0, price: 3.95 }
  ],
  'MK Lighter': [
    { minQty: 10000, price: 0.80 },
    { minQty: 5000, price: 0.85 },
    { minQty: 3000, price: 0.95 },
    { minQty: 1000, price: 1.00 },
    { minQty: 100, price: 1.20 },
    { minQty: 0, price: 1.20 }
  ]
};

// Default pricing tiers for new devices (percentage markup based)
export const DEFAULT_NEW_DEVICE_TIERS = [
  { minQty: 10000, markupPercent: 22 },
  { minQty: 5000, markupPercent: 25 },
  { minQty: 3000, markupPercent: 30 },
  { minQty: 1000, markupPercent: 35 },
  { minQty: 100, markupPercent: 40 },
  { minQty: 0, markupPercent: 40 }
];

// ===========================================
// SERVICE TYPES
// ===========================================

export const SERVICE_TYPES = {
  PRINT_ONLY: 'print-only',
  PRINT_AND_DEVICES: 'print-and-devices',
  DEVICES_ONLY: 'devices-only'
};

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.PRINT_ONLY]: 'Print Only (client supplies devices)',
  [SERVICE_TYPES.PRINT_AND_DEVICES]: 'Print + Devices (we supply & print)',
  [SERVICE_TYPES.DEVICES_ONLY]: 'Devices Only (no printing)'
};

// ===========================================
// ADD-ON COSTS
// ===========================================

// Add-on costs per unit (only apply to printing)
export const ADDONS = {
  gloss: {
    none: 0,
    'single-side': 0.07,
    'both-sides': 0.12
  },
  doubleSided: 0.35,
  packaging: {
    loose: 0,
    'sticker-mania': 0.11,
    client: 0.16
  }
};

// Fixed fees
export const FEES = {
  setupFee: 150,           // For orders < 1000 units
  setupFeeThreshold: 1000,
  extraDesignFee: 35,
  sampleRunFee: 65,
  sampleRunFreeThreshold: 5000,
  designsPerThousand: 1    // 1 included design per 1000 units
};

// Turnaround multipliers
export const TURNAROUND = {
  normal: 0,
  rush: 0.12,      // +12%
  weekend: 0.20    // +20%
};

// Minimum order
export const MINIMUM_ORDER_QUANTITY = 100;

// ===========================================
// PRINTING PRICE FUNCTIONS
// ===========================================

/**
 * Get base printing price per unit based on total quantity
 * @param {number} totalQuantity - Total units across all PRINTING line items
 * @returns {number} Price per unit
 */
export function getBasePrice(totalQuantity) {
  for (const tier of PRICING_TIERS) {
    if (totalQuantity >= tier.minQty) {
      return tier.price;
    }
  }
  return PRICING_TIERS[PRICING_TIERS.length - 1].price;
}

/**
 * Get the current pricing tier name for display
 * @param {number} totalQuantity 
 * @returns {string} Tier description
 */
export function getPricingTierName(totalQuantity) {
  if (totalQuantity >= 10000) return '10,000-24,999 units';
  if (totalQuantity >= 5000) return '5,000-9,999 units';
  if (totalQuantity >= 3000) return '3,000-4,999 units';
  if (totalQuantity >= 1000) return '1,000-2,999 units';
  if (totalQuantity >= 500) return '500-999 units';
  if (totalQuantity >= 100) return '100-499 units';
  return 'Below minimum (100 units)';
}

// ===========================================
// DEVICE PRICE FUNCTIONS
// ===========================================

/**
 * Get device selling price based on quantity and device pricing tiers
 * @param {number} quantity - Quantity for THIS line item
 * @param {Array} pricingTiers - Array of {minQty, price} objects
 * @returns {number} Selling price per device
 */
export function getDeviceSellingPrice(quantity, pricingTiers) {
  if (!pricingTiers || !Array.isArray(pricingTiers) || pricingTiers.length === 0) {
    return 0;
  }
  
  // Sort tiers by minQty descending to find the right tier
  const sortedTiers = [...pricingTiers].sort((a, b) => b.minQty - a.minQty);
  
  for (const tier of sortedTiers) {
    if (quantity >= tier.minQty) {
      return tier.price;
    }
  }
  
  // Fallback to last tier (lowest quantity)
  return sortedTiers[sortedTiers.length - 1].price;
}

/**
 * Generate pricing tiers for a new device based on cost and markup percentages
 * @param {number} baseCost - Your cost per device
 * @returns {Array} Array of {minQty, price} objects
 */
export function generateDevicePricingTiers(baseCost) {
  return DEFAULT_NEW_DEVICE_TIERS.map(tier => ({
    minQty: tier.minQty,
    price: Math.round(baseCost * (1 + tier.markupPercent / 100) * 100) / 100
  }));
}

/**
 * Calculate device costs for a line item
 * @param {string} serviceType - 'print-only', 'print-and-devices', or 'devices-only'
 * @param {number} quantity - Quantity for this line item
 * @param {number} deviceCost - Your cost per device
 * @param {Array} pricingTiers - Device pricing tiers
 * @returns {Object} { deviceSellingPrice, deviceRevenue, deviceCostFloor, deviceProfit }
 */
export function calculateDeviceCosts(serviceType, quantity, deviceCost, pricingTiers) {
  // If print-only, no device costs
  if (serviceType === SERVICE_TYPES.PRINT_ONLY) {
    return {
      deviceSellingPrice: 0,
      deviceRevenue: 0,
      deviceCostFloor: 0,
      deviceProfit: 0
    };
  }
  
  const deviceSellingPrice = getDeviceSellingPrice(quantity, pricingTiers);
  const deviceRevenue = deviceSellingPrice * quantity;
  const deviceCostFloor = deviceCost * quantity;
  const deviceProfit = deviceRevenue - deviceCostFloor;
  
  return {
    deviceSellingPrice,
    deviceRevenue,
    deviceCostFloor,
    deviceProfit
  };
}

// ===========================================
// FEE CALCULATION FUNCTIONS
// ===========================================

/**
 * Calculate setup fee based on quantity
 * Only applies to orders with printing
 * @param {number} printQuantity - Total units that require printing
 * @returns {number} Setup fee amount
 */
export function getSetupFee(printQuantity) {
  if (printQuantity === 0) return 0; // No printing, no setup fee
  return printQuantity < FEES.setupFeeThreshold ? FEES.setupFee : 0;
}

/**
 * Calculate included designs and extra design costs
 * Only applies to orders with printing
 * @param {number} printQuantity - Total units that require printing
 * @param {number} numDesigns - Number of designs requested
 * @param {number} designWaivers - Number of extra designs to waive fee for
 * @returns {Object} { includedDesigns, extraDesigns, chargeableDesigns, extraDesignCost }
 */
export function calculateDesignCosts(printQuantity, numDesigns, designWaivers = 0) {
  if (printQuantity === 0) {
    return {
      includedDesigns: 0,
      extraDesigns: 0,
      waivedDesigns: 0,
      chargeableDesigns: 0,
      extraDesignCost: 0
    };
  }
  
  const includedDesigns = Math.floor(printQuantity / 1000) * FEES.designsPerThousand;
  const extraDesigns = Math.max(0, numDesigns - includedDesigns);
  const waivedDesigns = Math.min(designWaivers, extraDesigns);
  const chargeableDesigns = extraDesigns - waivedDesigns;
  const extraDesignCost = chargeableDesigns * FEES.extraDesignFee;
  
  return {
    includedDesigns,
    extraDesigns,
    waivedDesigns,
    chargeableDesigns,
    extraDesignCost
  };
}

/**
 * Calculate sample fee
 * Only applies to orders with printing
 * @param {boolean} sampleRun - Whether sample run is requested
 * @param {boolean} waiveSampleFee - Whether to waive the fee
 * @param {number} printQuantity - Total units that require printing
 * @returns {number} Sample fee amount
 */
export function getSampleFee(sampleRun, waiveSampleFee, printQuantity) {
  if (!sampleRun) return 0;
  if (printQuantity === 0) return 0; // No printing, no sample
  if (waiveSampleFee) return 0;
  if (printQuantity >= FEES.sampleRunFreeThreshold) return 0;
  return FEES.sampleRunFee;
}

/**
 * Calculate turnaround fee
 * @param {string} turnaround - 'normal', 'rush', or 'weekend'
 * @param {number} subtotal - Subtotal before turnaround fee
 * @returns {number} Turnaround fee amount
 */
export function getTurnaroundFee(turnaround, subtotal) {
  const multiplier = TURNAROUND[turnaround] || 0;
  return subtotal * multiplier;
}

// ===========================================
// PRINTING ADD-ON FUNCTIONS
// ===========================================

/**
 * Calculate gloss cost for a line item
 * @param {string} glossFinish - 'none', 'single-side', or 'both-sides'
 * @param {number} quantity - Quantity for this line item
 * @returns {number} Gloss cost
 */
export function getGlossCost(glossFinish, quantity) {
  const perUnit = ADDONS.gloss[glossFinish] || 0;
  return perUnit * quantity;
}

/**
 * Calculate double-sided cost for a line item
 * @param {string} sides - 'single' or 'double'
 * @param {number} quantity - Quantity for this line item
 * @returns {number} Double-sided cost
 */
export function getDoubleSidedCost(sides, quantity) {
  return sides === 'double' ? ADDONS.doubleSided * quantity : 0;
}

/**
 * Calculate packaging cost for a line item
 * @param {string} packaging - 'loose', 'sticker-mania', or 'client'
 * @param {number} quantity - Quantity for this line item
 * @returns {number} Packaging cost
 */
export function getPackagingCost(packaging, quantity) {
  const perUnit = ADDONS.packaging[packaging] || 0;
  return perUnit * quantity;
}

/**
 * Calculate shipping cost with markup
 * @param {string} shippingType - 'shopify' or 'pickup'
 * @param {number} shopifyQuote - Base shipping quote
 * @param {number} shippingMarkup - Markup percentage
 * @returns {number} Final shipping cost
 */
export function calculateShippingCost(shippingType, shopifyQuote, shippingMarkup) {
  if (shippingType === 'pickup') return 0;
  return shopifyQuote * (1 + shippingMarkup / 100);
}

/**
 * Calculate sales tax
 * @param {number} subtotal - Subtotal to apply tax to
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Tax amount
 */
export function calculateSalesTax(subtotal, taxRate) {
  return subtotal * (taxRate / 100);
}

// ===========================================
// LEGACY SUPPORT (for backwards compatibility)
// ===========================================

/**
 * @deprecated Use calculateDeviceCosts instead
 * Calculate device supply cost with markup (legacy method)
 */
export function calculateDeviceSupplyCost(supplyingDevices, deviceCost, deviceMarkup, quantity) {
  if (!supplyingDevices) {
    return { deviceUnitPrice: 0, deviceSupplyCost: 0 };
  }
  
  const deviceUnitPrice = Math.round(deviceCost * (1 + deviceMarkup / 100) * 100) / 100;
  const deviceSupplyCost = deviceUnitPrice * quantity;
  
  return { deviceUnitPrice, deviceSupplyCost };
}
