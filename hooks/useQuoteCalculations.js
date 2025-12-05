import { useMemo } from 'react';
import {
  getBasePrice,
  getSetupFee,
  calculateDesignCosts,
  getSampleFee,
  getTurnaroundFee,
  calculateShippingCost,
  calculateSalesTax
} from '../utils/pricing';
import {
  getOptimizedPrinterCount,
  calculateProductionDays,
  calculatePreProductionCosts,
  calculateProductionCosts,
  calculatePostProductionCosts,
  calculateTotalCostFloor,
  calculateProfitMetrics,
  calculateShippingStagingCost
} from '../utils/costCalculations';

/**
 * Custom hook that calculates all quote values
 * @param {Object} params - All parameters needed for calculations
 * @returns {Object} All calculated values
 */
export function useQuoteCalculations({
  // From useLineItems
  totalQuantity,
  lineItemTotals,
  lineItemPricing,
  avgMinutesPerBatch,
  
  // Order settings
  numDesigns,
  designWaivers,
  turnaround,
  sampleRun,
  waiveSampleFee,
  
  // Shipping & tax
  shippingType,
  shopifyQuote,
  shippingMarkup,
  salesTaxRate,
  
  // Printers
  numPrinters
}) {
  // Base price based on total quantity
  const basePrice = useMemo(() => getBasePrice(totalQuantity), [totalQuantity]);
  
  // Setup fee
  const setupFee = useMemo(() => getSetupFee(totalQuantity), [totalQuantity]);
  
  // Design costs
  const designCosts = useMemo(() => 
    calculateDesignCosts(totalQuantity, numDesigns, designWaivers),
    [totalQuantity, numDesigns, designWaivers]
  );
  
  // Production time calculations
  const productionMetrics = useMemo(() => {
    const optimizedPrinters = getOptimizedPrinterCount(lineItemTotals.totalProductionHours, numPrinters);
    const { productionDays, batchesPerPrinterPerDay, totalBatchesPerDay } = calculateProductionDays(
      lineItemTotals.totalBatches,
      avgMinutesPerBatch,
      optimizedPrinters
    );
    const effectiveProductionHours = lineItemTotals.totalProductionHours / optimizedPrinters;
    
    return {
      optimizedPrinters,
      productionDays,
      batchesPerPrinterPerDay,
      totalBatchesPerDay,
      effectiveProductionHours,
      totalBatches: lineItemTotals.totalBatches,
      totalProductionHours: lineItemTotals.totalProductionHours
    };
  }, [lineItemTotals, avgMinutesPerBatch, numPrinters]);
  
  // Quote calculation
  const quoteBreakdown = useMemo(() => {
    // Base quote from line items
    const lineItemsSubtotal = lineItemTotals.basePrintingCost + 
      lineItemTotals.glossCost + 
      lineItemTotals.doubleSidedCost + 
      lineItemTotals.packagingCost + 
      lineItemTotals.deviceSupplyCost;
    
    // Order-level charges
    const extraDesignCost = designCosts.extraDesignCost;
    
    // Subtotal before turnaround
    const subtotalBeforeTurnaround = lineItemsSubtotal + setupFee + extraDesignCost;
    
    // Turnaround fee
    const turnaroundFee = getTurnaroundFee(turnaround, subtotalBeforeTurnaround);
    
    // Sample fee
    const sampleFee = getSampleFee(sampleRun, waiveSampleFee, totalQuantity);
    
    // Subtotal
    const subtotal = subtotalBeforeTurnaround + turnaroundFee + sampleFee;
    
    // Tax and shipping
    const salesTax = calculateSalesTax(subtotal, salesTaxRate);
    const shippingCost = calculateShippingCost(shippingType, shopifyQuote, shippingMarkup);
    
    // Total
    const totalQuote = subtotal + salesTax + shippingCost;
    
    return {
      // Line item totals
      basePrintingCost: lineItemTotals.basePrintingCost,
      glossCost: lineItemTotals.glossCost,
      doubleSidedCost: lineItemTotals.doubleSidedCost,
      packagingCost: lineItemTotals.packagingCost,
      deviceSupplyCost: lineItemTotals.deviceSupplyCost,
      lineItemsSubtotal,
      
      // Order-level charges
      setupFee,
      extraDesignCost,
      chargeableDesigns: designCosts.chargeableDesigns,
      turnaroundFee,
      sampleFee,
      
      // Totals
      subtotalBeforeTurnaround,
      subtotal,
      salesTax,
      shippingCost,
      totalQuote
    };
  }, [
    lineItemTotals,
    setupFee,
    designCosts,
    turnaround,
    sampleRun,
    waiveSampleFee,
    totalQuantity,
    salesTaxRate,
    shippingType,
    shopifyQuote,
    shippingMarkup
  ]);
  
  // Cost floor calculation
  const costFloorBreakdown = useMemo(() => {
    // Pre-production
    const preProduction = calculatePreProductionCosts({
      numDesigns,
      productionDays: productionMetrics.productionDays,
      sampleRun,
      waiveSampleFee
    });
    
    // Production (ink + labor)
    const production = calculateProductionCosts({
      totalInkCost: lineItemTotals.totalInkCost,
      effectiveProductionHours: productionMetrics.effectiveProductionHours
    });
    
    // Post-production
    const postProduction = calculatePostProductionCosts(lineItemTotals.repackagingCost);
    
    // Shipping staging details (for transparent display)
    const shippingStaging = calculateShippingStagingCost();
    
    // Total cost floor
    const costFloor = calculateTotalCostFloor({
      preProductionCost: preProduction.total,
      productionCost: production.total,
      postProductionCost: postProduction.total,
      deviceCostFloor: lineItemTotals.deviceCostFloor
    });
    
    return {
      preProduction,
      production,
      postProduction,
      shippingStaging,
      deviceCostFloor: lineItemTotals.deviceCostFloor,
      total: costFloor.total,
      
      // Individual cost floor items from line items
      cmykInkCost: lineItemTotals.cmykInkCost,
      glossInkCost: lineItemTotals.glossInkCost,
      totalInkCost: lineItemTotals.totalInkCost,
      repackagingCost: lineItemTotals.repackagingCost
    };
  }, [
    numDesigns,
    productionMetrics,
    sampleRun,
    waiveSampleFee,
    lineItemTotals
  ]);
  
  // Profit analysis
  const profitAnalysis = useMemo(() => 
    calculateProfitMetrics(quoteBreakdown.totalQuote, costFloorBreakdown.total, totalQuantity),
    [quoteBreakdown.totalQuote, costFloorBreakdown.total, totalQuantity]
  );
  
  return {
    // Pricing
    basePrice,
    setupFee,
    designCosts,
    
    // Production
    productionMetrics,
    
    // Quote
    quoteBreakdown,
    
    // Cost floor
    costFloorBreakdown,
    
    // Profit
    profitAnalysis
  };
}

/**
 * Generate quote data object for saving
 * @param {Object} params - All quote parameters
 * @returns {Object} Quote data object
 */
export function generateQuoteData({
  currentQuoteId,
  clientName,
  accountManager,
  lineItems,
  deviceTypes,
  numDesigns,
  turnaround,
  sampleRun,
  waiveSampleFee,
  shippingType,
  shopifyQuote,
  shippingMarkup,
  salesTaxRate,
  designWaivers,
  numPrinters,
  totalQuantity,
  quoteBreakdown,
  costFloorBreakdown,
  profitAnalysis,
  productionMetrics
}) {
  return {
    id: currentQuoteId || `quote-${Date.now()}`,
    clientName,
    accountManager,
    lineItems: lineItems.map((item, index) => ({
      ...item,
      deviceTypeName: deviceTypes[item.deviceIndex]?.name || ''
    })),
    numDesigns,
    turnaround,
    sampleRun,
    waiveSampleFee,
    shippingType,
    shopifyQuote,
    shippingMarkup,
    salesTaxRate,
    designWaivers,
    numPrinters,
    // Summary values
    totalQuantity,
    // Calculated values
    totalQuote: quoteBreakdown.totalQuote,
    costFloor: costFloorBreakdown.total,
    profit: profitAnalysis.grossProfit,
    profitMargin: profitAnalysis.profitMargin,
    productionDays: productionMetrics.productionDays,
    // Metadata
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
}

/**
 * Generate invoice data object
 * @param {Object} params - All invoice parameters
 * @returns {Object} Invoice data object
 */
export function generateInvoiceData({
  clientName,
  accountManager,
  lineItemPricing,
  basePrice,
  totalQuantity,
  numDesigns,
  designCosts,
  turnaround,
  quoteBreakdown,
  salesTaxRate
}) {
  return {
    clientName,
    accountManager,
    lineItems: lineItemPricing,
    basePrice,
    totalQuantity,
    numDesigns,
    includedDesigns: designCosts.includedDesigns,
    turnaround,
    setupFee: quoteBreakdown.setupFee,
    extraDesignCost: quoteBreakdown.extraDesignCost,
    chargeableDesigns: quoteBreakdown.chargeableDesigns,
    turnaroundFee: quoteBreakdown.turnaroundFee,
    sampleFee: quoteBreakdown.sampleFee,
    subtotal: quoteBreakdown.subtotal,
    salesTax: quoteBreakdown.salesTax,
    salesTaxRate,
    shippingCost: quoteBreakdown.shippingCost,
    totalQuote: quoteBreakdown.totalQuote
  };
}
