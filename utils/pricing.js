/**
 * Pricing utilities for the quote calculator
 * Contains pricing tiers, fee calculations, and add-on costs
 */

// Pricing tiers based on total quantity
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

// Add-on costs per unit
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

/**
 * Get base price per unit based on total quantity
 * @param {number} totalQuantity - Total units across all line items
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

/**
 * Calculate setup fee based on quantity
 * @param {number} totalQuantity 
 * @returns {number} Setup fee amount
 */
export function getSetupFee(totalQuantity) {
  return totalQuantity < FEES.setupFeeThreshold ? FEES.setupFee : 0;
}

/**
 * Calculate included designs and extra design costs
 * @param {number} totalQuantity - Total units across all line items
 * @param {number} numDesigns - Number of designs requested
 * @param {number} designWaivers - Number of extra designs to waive fee for
 * @returns {Object} { includedDesigns, extraDesigns, chargeableDesigns, extraDesignCost }
 */
export function calculateDesignCosts(totalQuantity, numDesigns, designWaivers = 0) {
  const includedDesigns = Math.floor(totalQuantity / 1000) * FEES.designsPerThousand;
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
 * @param {boolean} sampleRun - Whether sample run is requested
 * @param {boolean} waiveSampleFee - Whether to waive the fee
 * @param {number} totalQuantity - Total units
 * @returns {number} Sample fee amount
 */
export function getSampleFee(sampleRun, waiveSampleFee, totalQuantity) {
  if (!sampleRun) return 0;
  if (waiveSampleFee) return 0;
  if (totalQuantity >= FEES.sampleRunFreeThreshold) return 0;
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
 * Calculate device supply cost with markup
 * @param {boolean} supplyingDevices - Whether we're supplying devices
 * @param {number} deviceCost - Raw cost per device
 * @param {number} deviceMarkup - Markup percentage
 * @param {number} quantity - Quantity for this line item
 * @returns {Object} { deviceUnitPrice, deviceSupplyCost }
 */
export function calculateDeviceSupplyCost(supplyingDevices, deviceCost, deviceMarkup, quantity) {
  if (!supplyingDevices) {
    return { deviceUnitPrice: 0, deviceSupplyCost: 0 };
  }
  
  // Round to 2 decimal places for consistency between display and calculation
  const deviceUnitPrice = Math.round(deviceCost * (1 + deviceMarkup / 100) * 100) / 100;
  const deviceSupplyCost = deviceUnitPrice * quantity;
  
  return { deviceUnitPrice, deviceSupplyCost };
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
