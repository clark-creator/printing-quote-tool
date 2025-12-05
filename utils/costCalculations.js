/**
 * Cost floor calculations for the quote calculator
 * Contains production time, ink costs, labor, and all cost floor components
 */

// Cost constants
export const COSTS = {
  // Pre-production
  fileSetupPerDesign: 10,      // $10 per design
  machineSetupPerDay: 23,      // $23 per production day
  samplePrintingCost: 23,      // $23 if no sample fee charged
  
  // Production
  cmykInkPerSide: 0.03,        // $0.03 per side per unit
  glossInkPerSide: 0.01,       // $0.01 per side per unit
  laborPerHour: 23,            // $23 per hour
  
  // Post-production
  repackagingPerUnit: 0.06,    // $0.06 per unit (if not loose)
  shippingStagingMinutes: 40,  // 40 minutes per order
  shippingStagingHourlyRate: 20 // $20 per hour
};

// Production time constants
export const PRODUCTION = {
  minutesPerBatchNoGloss: 35,
  minutesPerBatchWithGloss: 45,
  hoursPerWorkday: 6
};

/**
 * Calculate production metrics for a single line item
 * @param {Object} params
 * @param {number} params.quantity - Units for this line item
 * @param {number} params.deviceCapacity - Units per batch for this device
 * @param {boolean} params.hasGloss - Whether gloss finish is applied
 * @param {boolean} params.isDoubleSided - Whether printing both sides
 * @returns {Object} Production metrics
 */
export function calculateLineItemProduction({ quantity, deviceCapacity, hasGloss, isDoubleSided }) {
  const batchesNeeded = Math.ceil(quantity / deviceCapacity);
  const minutesPerBatch = hasGloss ? PRODUCTION.minutesPerBatchWithGloss : PRODUCTION.minutesPerBatchNoGloss;
  const sidesMultiplier = isDoubleSided ? 2 : 1;
  const totalPrintMinutes = batchesNeeded * minutesPerBatch * sidesMultiplier;
  const productionHours = totalPrintMinutes / 60;
  
  return {
    batchesNeeded,
    minutesPerBatch,
    totalPrintMinutes,
    productionHours
  };
}

/**
 * Calculate optimized printer count based on job size
 * @param {number} totalProductionHours - Total hours across all line items
 * @param {number} maxPrinters - Maximum printers available
 * @returns {number} Optimized printer count
 */
export function getOptimizedPrinterCount(totalProductionHours, maxPrinters) {
  if (totalProductionHours < 2) return 1;
  if (totalProductionHours < 12) return Math.min(2, maxPrinters);
  return maxPrinters;
}

/**
 * Calculate production days
 * @param {number} totalBatches - Total batches across all line items
 * @param {number} avgMinutesPerBatch - Average minutes per batch
 * @param {number} numPrinters - Number of active printers
 * @returns {Object} { productionDays, batchesPerPrinterPerDay }
 */
export function calculateProductionDays(totalBatches, avgMinutesPerBatch, numPrinters) {
  const batchesPerPrinterPerDay = Math.floor((PRODUCTION.hoursPerWorkday * 60) / avgMinutesPerBatch);
  const totalBatchesPerDay = batchesPerPrinterPerDay * numPrinters;
  const productionDays = Math.ceil(totalBatches / totalBatchesPerDay);
  
  return {
    productionDays,
    batchesPerPrinterPerDay,
    totalBatchesPerDay
  };
}

/**
 * Calculate ink costs for a line item (for cost floor)
 * @param {Object} params
 * @param {number} params.quantity - Units for this line item
 * @param {number} params.numSides - Number of sides printed (1 or 2)
 * @param {string} params.glossFinish - 'none', 'single-side', or 'both-sides'
 * @returns {Object} Ink cost breakdown
 */
export function calculateInkCosts({ quantity, numSides, glossFinish }) {
  // CMYK ink cost
  const cmykCostPerUnit = COSTS.cmykInkPerSide * numSides;
  const cmykInkCost = cmykCostPerUnit * quantity;
  
  // Gloss ink cost
  let glossSides = 0;
  if (glossFinish === 'single-side') glossSides = 1;
  else if (glossFinish === 'both-sides') glossSides = 2;
  
  const glossCostPerUnit = COSTS.glossInkPerSide * glossSides;
  const glossInkCost = glossCostPerUnit * quantity;
  
  return {
    cmykCostPerUnit,
    cmykInkCost,
    glossSides,
    glossCostPerUnit,
    glossInkCost,
    totalInkCost: cmykInkCost + glossInkCost
  };
}

/**
 * Calculate repackaging cost for a line item
 * @param {string} packaging - 'loose', 'sticker-mania', or 'client'
 * @param {number} quantity - Units for this line item
 * @returns {Object} { repackagingCostPerUnit, repackagingCost }
 */
export function calculateRepackagingCost(packaging, quantity) {
  const repackagingCostPerUnit = packaging === 'loose' ? 0 : COSTS.repackagingPerUnit;
  const repackagingCost = repackagingCostPerUnit * quantity;
  
  return {
    repackagingCostPerUnit,
    repackagingCost
  };
}

/**
 * Calculate shipping/staging cost (fixed per order)
 * @returns {Object} { minutes, hourlyRate, cost }
 */
export function calculateShippingStagingCost() {
  const cost = (COSTS.shippingStagingMinutes / 60) * COSTS.shippingStagingHourlyRate;
  return {
    minutes: COSTS.shippingStagingMinutes,
    hourlyRate: COSTS.shippingStagingHourlyRate,
    cost
  };
}

/**
 * Calculate pre-production costs
 * @param {Object} params
 * @param {number} params.numDesigns - Number of designs
 * @param {number} params.productionDays - Number of production days
 * @param {boolean} params.sampleRun - Whether sample run is requested
 * @param {boolean} params.waiveSampleFee - Whether sample fee is waived
 * @returns {Object} Pre-production cost breakdown
 */
export function calculatePreProductionCosts({ numDesigns, productionDays, sampleRun, waiveSampleFee }) {
  const fileSetupCost = numDesigns * COSTS.fileSetupPerDesign;
  const machineSetupCost = productionDays * COSTS.machineSetupPerDay;
  
  // Sample printing cost is incurred if we're NOT charging the customer for it
  // (we still do the work, we just don't bill for it)
  const samplePrintingCost = (sampleRun && !waiveSampleFee) ? 0 : COSTS.samplePrintingCost;
  
  const total = fileSetupCost + machineSetupCost + samplePrintingCost;
  
  return {
    fileSetupCost,
    fileSetupPerDesign: COSTS.fileSetupPerDesign,
    machineSetupCost,
    machineSetupPerDay: COSTS.machineSetupPerDay,
    samplePrintingCost,
    total
  };
}

/**
 * Calculate production costs (ink + labor)
 * @param {Object} params
 * @param {number} params.totalInkCost - Total ink cost across all line items
 * @param {number} params.effectiveProductionHours - Production hours / optimized printers
 * @returns {Object} Production cost breakdown
 */
export function calculateProductionCosts({ totalInkCost, effectiveProductionHours }) {
  const laborCost = effectiveProductionHours * COSTS.laborPerHour;
  const total = totalInkCost + laborCost;
  
  return {
    inkCost: totalInkCost,
    laborCost,
    laborPerHour: COSTS.laborPerHour,
    effectiveHours: effectiveProductionHours,
    total
  };
}

/**
 * Calculate post-production costs
 * @param {number} totalRepackagingCost - Total repackaging cost across all line items
 * @returns {Object} Post-production cost breakdown
 */
export function calculatePostProductionCosts(totalRepackagingCost) {
  const shippingStaging = calculateShippingStagingCost();
  const total = totalRepackagingCost + shippingStaging.cost;
  
  return {
    repackagingCost: totalRepackagingCost,
    shippingStagingCost: shippingStaging.cost,
    shippingStagingMinutes: shippingStaging.minutes,
    shippingStagingHourlyRate: shippingStaging.hourlyRate,
    total
  };
}

/**
 * Calculate device cost floor (raw cost without markup)
 * @param {boolean} supplyingDevices - Whether we're supplying devices
 * @param {number} deviceCost - Raw cost per device
 * @param {number} quantity - Quantity for this line item
 * @returns {number} Device cost for cost floor
 */
export function calculateDeviceCostFloor(supplyingDevices, deviceCost, quantity) {
  if (!supplyingDevices) return 0;
  return deviceCost * quantity;
}

/**
 * Calculate complete cost floor
 * @param {Object} params
 * @param {number} params.preProductionCost - Pre-production total
 * @param {number} params.productionCost - Production total
 * @param {number} params.postProductionCost - Post-production total
 * @param {number} params.deviceCostFloor - Total device costs (raw)
 * @returns {Object} Complete cost floor breakdown
 */
export function calculateTotalCostFloor({ preProductionCost, productionCost, postProductionCost, deviceCostFloor }) {
  const total = preProductionCost + productionCost + postProductionCost + deviceCostFloor;
  
  return {
    preProductionCost,
    productionCost,
    postProductionCost,
    deviceCostFloor,
    total
  };
}

/**
 * Calculate profit metrics
 * @param {number} totalQuote - Total quote amount
 * @param {number} costFloor - Total cost floor
 * @param {number} totalQuantity - Total units
 * @returns {Object} Profit analysis
 */
export function calculateProfitMetrics(totalQuote, costFloor, totalQuantity) {
  const grossProfit = totalQuote - costFloor;
  const profitMargin = totalQuote > 0 ? (grossProfit / totalQuote) * 100 : 0;
  
  const costPerUnit = totalQuantity > 0 ? costFloor / totalQuantity : 0;
  const pricePerUnit = totalQuantity > 0 ? totalQuote / totalQuantity : 0;
  const profitPerUnit = totalQuantity > 0 ? grossProfit / totalQuantity : 0;
  
  return {
    grossProfit,
    profitMargin,
    costPerUnit,
    pricePerUnit,
    profitPerUnit,
    // Margin status for color coding
    marginStatus: profitMargin >= 30 ? 'good' : profitMargin >= 15 ? 'warning' : 'danger'
  };
}
