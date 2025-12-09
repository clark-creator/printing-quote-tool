import { useMemo } from 'react';
import {
  getBasePrice,
  getSetupFee,
  calculateDesignCosts,
  getSampleFee,
  getTurnaroundFee,
  calculateShippingCost,
  calculateSalesTax,
  SERVICE_TYPES
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
  printQuantity,
  lineItemTotals,
  lineItemPricing,
  avgMinutesPerBatch,
  hasPrinting,
  hasDevices,
  
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
  // Base price based on print quantity (not total quantity)
  const basePrice = useMemo(() => getBasePrice(printQuantity), [printQuantity]);
  
  // Setup fee (only for orders with printing)
  const setupFee = useMemo(() => getSetupFee(printQuantity), [printQuantity]);
  
  // Design costs (only for orders with printing)
  const designCosts = useMemo(() => 
    calculateDesignCosts(printQuantity, numDesigns, designWaivers),
    [printQuantity, numDesigns, designWaivers]
  );
  
  // Production time calculations (only for printing items)
  const productionMetrics = useMemo(() => {
    // If no printing, return zeroes
    if (!hasPrinting || lineItemTotals.totalBatches === 0) {
      return {
        optimizedPrinters: 0,
        productionDays: 0,
        batchesPerPrinterPerDay: 0,
        totalBatchesPerDay: 0,
        effectiveProductionHours: 0,
        totalBatches: 0,
        totalProductionHours: 0
      };
    }
    
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
  }, [hasPrinting, lineItemTotals, avgMinutesPerBatch, numPrinters]);
  
  // Quote calculation
  const quoteBreakdown = useMemo(() => {
    // Printing subtotal from line items
    const printingSubtotal = lineItemTotals.printingSubtotal;
    
    // Device revenue from line items
    const deviceRevenue = lineItemTotals.deviceRevenue;
    
    // Order-level charges (only for printing)
    const extraDesignCost = designCosts.extraDesignCost;
    
    // Subtotal before turnaround
    const subtotalBeforeTurnaround = printingSubtotal + deviceRevenue + setupFee + extraDesignCost;
    
    // Turnaround fee (applies to whole order)
    const turnaroundFee = getTurnaroundFee(turnaround, subtotalBeforeTurnaround);
    
    // Sample fee (only for printing orders)
    const sampleFee = getSampleFee(sampleRun, waiveSampleFee, printQuantity);
    
    // Subtotal
    const subtotal = subtotalBeforeTurnaround + turnaroundFee + sampleFee;
    
    // Tax and shipping
    const salesTax = calculateSalesTax(subtotal, salesTaxRate);
    const shippingCost = calculateShippingCost(shippingType, shopifyQuote, shippingMarkup);
    
    // Total
    const totalQuote = subtotal + salesTax + shippingCost;
    
    return {
      // Printing totals
      basePrintingCost: lineItemTotals.basePrintingCost,
      glossCost: lineItemTotals.glossCost,
      doubleSidedCost: lineItemTotals.doubleSidedCost,
      packagingCost: lineItemTotals.packagingCost,
      printingSubtotal,
      
      // Device revenue
      deviceRevenue,
      
      // Combined line items subtotal
      lineItemsSubtotal: printingSubtotal + deviceRevenue,
      
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
    printQuantity,
    salesTaxRate,
    shippingType,
    shopifyQuote,
    shippingMarkup
  ]);
  
  // Cost floor calculation
  const costFloorBreakdown = useMemo(() => {
    // Pre-production (only for printing)
    const preProduction = hasPrinting ? calculatePreProductionCosts({
      numDesigns,
      productionDays: productionMetrics.productionDays,
      sampleRun,
      waiveSampleFee
    }) : { total: 0, fileSetupCost: 0, machineSetupCost: 0, samplePrintingCost: 0, fileSetupPerDesign: 10, machineSetupPerDay: 23 };
    
    // Production (ink + labor - only for printing)
    const production = hasPrinting ? calculateProductionCosts({
      totalInkCost: lineItemTotals.totalInkCost,
      effectiveProductionHours: productionMetrics.effectiveProductionHours
    }) : { total: 0, inkCost: 0, laborCost: 0, laborPerHour: 23, effectiveHours: 0 };
    
    // Post-production (only for printing)
    const postProduction = hasPrinting 
      ? calculatePostProductionCosts(lineItemTotals.repackagingCost)
      : { total: 0, repackagingCost: 0, shippingStagingCost: 0 };
    
    // Shipping staging details (for transparent display)
    const shippingStaging = calculateShippingStagingCost();
    
    // Device cost floor
    const deviceCostFloor = lineItemTotals.deviceCostFloor;
    
    // Total cost floor
    const costFloor = calculateTotalCostFloor({
      preProductionCost: preProduction.total,
      productionCost: production.total,
      postProductionCost: postProduction.total,
      deviceCostFloor
    });
    
    return {
      preProduction,
      production,
      postProduction,
      shippingStaging,
      deviceCostFloor,
      total: costFloor.total,
      
      // Individual cost floor items from line items
      cmykInkCost: lineItemTotals.cmykInkCost,
      glossInkCost: lineItemTotals.glossInkCost,
      totalInkCost: lineItemTotals.totalInkCost,
      repackagingCost: lineItemTotals.repackagingCost
    };
  }, [
    hasPrinting,
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
    profitAnalysis,
    
    // Order type flags
    hasPrinting,
    hasDevices
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
  printQuantity,
  quoteBreakdown,
  costFloorBreakdown,
  profitAnalysis,
  productionMetrics,
  hasPrinting,
  hasDevices
}) {
  return {
    id: currentQuoteId || `quote-${Date.now()}`,
    clientName,
    accountManager,
    lineItems: lineItems.map((item) => ({
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
    printQuantity,
    hasPrinting,
    hasDevices,
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
  printQuantity,
  numDesigns,
  designCosts,
  turnaround,
  quoteBreakdown,
  salesTaxRate,
  hasPrinting,
  hasDevices
}) {
  return {
    clientName,
    accountManager,
    lineItems: lineItemPricing,
    basePrice,
    totalQuantity,
    printQuantity,
    numDesigns,
    includedDesigns: designCosts.includedDesigns,
    turnaround,
    setupFee: quoteBreakdown.setupFee,
    extraDesignCost: quoteBreakdown.extraDesignCost,
    chargeableDesigns: quoteBreakdown.chargeableDesigns,
    turnaroundFee: quoteBreakdown.turnaroundFee,
    sampleFee: quoteBreakdown.sampleFee,
    printingSubtotal: quoteBreakdown.printingSubtotal,
    deviceRevenue: quoteBreakdown.deviceRevenue,
    subtotal: quoteBreakdown.subtotal,
    salesTax: quoteBreakdown.salesTax,
    salesTaxRate,
    shippingCost: quoteBreakdown.shippingCost,
    totalQuote: quoteBreakdown.totalQuote,
    hasPrinting,
    hasDevices
  };
}
