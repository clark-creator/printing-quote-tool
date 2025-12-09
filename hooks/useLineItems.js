import { useState, useMemo, useCallback } from 'react';
import { calculateLineItemProduction, calculateInkCosts, calculateRepackagingCost } from '../utils/costCalculations';
import { 
  getBasePrice, 
  getGlossCost, 
  getDoubleSidedCost, 
  getPackagingCost, 
  calculateDeviceCosts,
  SERVICE_TYPES 
} from '../utils/pricing';

/**
 * Creates a new empty line item
 * @param {number} deviceIndex - Default device index
 * @returns {Object} New line item
 */
export function createLineItem(deviceIndex = 0) {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    deviceIndex,
    quantity: 1000,
    quantityInput: '1000',
    // Service type: 'print-only', 'print-and-devices', or 'devices-only'
    serviceType: SERVICE_TYPES.PRINT_ONLY,
    // Printing options (only apply when serviceType includes printing)
    sides: 'single',
    glossFinish: 'none',
    packaging: 'loose'
  };
}

/**
 * Custom hook for managing line items state and calculations
 * @param {Array} deviceTypes - Available device types
 * @returns {Object} Line items state and handlers
 */
export function useLineItems(deviceTypes) {
  const [lineItems, setLineItems] = useState([createLineItem(0)]);

  /**
   * Add a new line item
   */
  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, createLineItem(0)]);
  }, []);

  /**
   * Remove a line item by ID
   * @param {string} id - Line item ID to remove
   */
  const removeLineItem = useCallback((id) => {
    setLineItems(prev => {
      if (prev.length === 1) return prev; // Keep at least one item
      return prev.filter(item => item.id !== id);
    });
  }, []);

  /**
   * Update a specific field on a line item
   * @param {string} id - Line item ID
   * @param {string} field - Field name to update
   * @param {any} value - New value
   */
  const updateLineItem = useCallback((id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Handle quantity input sync
      if (field === 'quantity') {
        updated.quantityInput = value.toString();
      }
      if (field === 'quantityInput') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
          updated.quantity = Math.min(500000, numValue);
        }
      }
      
      // Handle gloss/sides interaction
      if (field === 'sides' && value === 'single' && item.glossFinish === 'both-sides') {
        updated.glossFinish = 'single-side';
      }
      
      // When switching to devices-only, reset printing options
      if (field === 'serviceType' && value === SERVICE_TYPES.DEVICES_ONLY) {
        updated.sides = 'single';
        updated.glossFinish = 'none';
        updated.packaging = 'loose';
      }
      
      return updated;
    }));
  }, []);

  /**
   * Set all line items (used when loading quotes)
   * @param {Array} items - Array of line items
   */
  const setAllLineItems = useCallback((items) => {
    setLineItems(items.map(item => ({
      id: item.id || createLineItem().id,
      deviceIndex: item.deviceIndex || 0,
      quantity: item.quantity || 1000,
      quantityInput: (item.quantity || 1000).toString(),
      // Handle legacy quotes that don't have serviceType
      serviceType: item.serviceType || (item.supplyingDevices ? SERVICE_TYPES.PRINT_AND_DEVICES : SERVICE_TYPES.PRINT_ONLY),
      sides: item.sides || 'single',
      glossFinish: item.glossFinish || 'none',
      packaging: item.packaging || 'loose'
    })));
  }, []);

  /**
   * Reset to single default line item
   */
  const resetLineItems = useCallback(() => {
    setLineItems([createLineItem(0)]);
  }, []);

  // Calculate total quantity across all line items
  const totalQuantity = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [lineItems]);

  // Calculate print-only quantity (for pricing tier and design calculations)
  const printQuantity = useMemo(() => {
    return lineItems
      .filter(item => item.serviceType !== SERVICE_TYPES.DEVICES_ONLY)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [lineItems]);

  // Calculate per-line-item production and cost values
  const lineItemCalculations = useMemo(() => {
    return lineItems.map(item => {
      const device = deviceTypes[item.deviceIndex] || { 
        capacity: 80, 
        unitCost: 0, 
        name: 'Unknown',
        pricingTiers: []
      };
      
      const includesPrinting = item.serviceType !== SERVICE_TYPES.DEVICES_ONLY;
      const includesDevices = item.serviceType !== SERVICE_TYPES.PRINT_ONLY;
      
      const hasGloss = includesPrinting && item.glossFinish !== 'none';
      const isDoubleSided = includesPrinting && item.sides === 'double';
      const numSides = isDoubleSided ? 2 : 1;
      
      // Production calculations (only for printing)
      let production = {
        batchesNeeded: 0,
        minutesPerBatch: 0,
        totalPrintMinutes: 0,
        productionHours: 0
      };
      
      if (includesPrinting) {
        production = calculateLineItemProduction({
          quantity: item.quantity,
          deviceCapacity: device.capacity,
          hasGloss,
          isDoubleSided
        });
      }
      
      // Ink costs (for cost floor - only for printing)
      let inkCosts = {
        cmykCostPerUnit: 0,
        cmykInkCost: 0,
        glossCostPerUnit: 0,
        glossInkCost: 0,
        totalInkCost: 0
      };
      
      if (includesPrinting) {
        inkCosts = calculateInkCosts({
          quantity: item.quantity,
          numSides,
          glossFinish: item.glossFinish
        });
      }
      
      // Repackaging cost (for cost floor - only for printing)
      let repackaging = { repackagingCostPerUnit: 0, repackagingCost: 0 };
      if (includesPrinting) {
        repackaging = calculateRepackagingCost(item.packaging, item.quantity);
      }
      
      // Device costs (for devices-only and print+devices)
      const deviceCosts = calculateDeviceCosts(
        item.serviceType,
        item.quantity,
        device.unitCost,
        device.pricingTiers
      );
      
      return {
        ...item,
        deviceName: device.name,
        deviceCapacity: device.capacity,
        deviceUnitCost: device.unitCost,
        devicePricingTiers: device.pricingTiers,
        includesPrinting,
        includesDevices,
        hasGloss,
        isDoubleSided,
        numSides,
        // Production
        ...production,
        // Ink (cost floor)
        cmykCostPerUnit: inkCosts.cmykCostPerUnit,
        cmykInkCost: inkCosts.cmykInkCost,
        glossCostPerUnit: inkCosts.glossCostPerUnit,
        glossInkCost: inkCosts.glossInkCost,
        totalInkCost: inkCosts.totalInkCost,
        // Repackaging (cost floor)
        repackagingCostPerUnit: repackaging.repackagingCostPerUnit,
        repackagingCost: repackaging.repackagingCost,
        // Devices
        deviceSellingPrice: deviceCosts.deviceSellingPrice,
        deviceRevenue: deviceCosts.deviceRevenue,
        deviceCostFloor: deviceCosts.deviceCostFloor,
        deviceProfit: deviceCosts.deviceProfit
      };
    });
  }, [lineItems, deviceTypes]);

  // Calculate pricing per line item (using print quantity for tier)
  const lineItemPricing = useMemo(() => {
    const basePrice = getBasePrice(printQuantity);
    
    return lineItemCalculations.map(item => {
      // Printing costs (only if includes printing)
      let basePrintingCost = 0;
      let glossCost = 0;
      let doubleSidedCost = 0;
      let packagingCost = 0;
      
      if (item.includesPrinting) {
        basePrintingCost = basePrice * item.quantity;
        glossCost = getGlossCost(item.glossFinish, item.quantity);
        doubleSidedCost = getDoubleSidedCost(item.sides, item.quantity);
        packagingCost = getPackagingCost(item.packaging, item.quantity);
      }
      
      // Total for this line item
      const printingSubtotal = basePrintingCost + glossCost + doubleSidedCost + packagingCost;
      const lineItemSubtotal = printingSubtotal + item.deviceRevenue;
      
      return {
        ...item,
        basePrintingCost,
        glossCost,
        doubleSidedCost,
        packagingCost,
        printingSubtotal,
        lineItemSubtotal
      };
    });
  }, [lineItemCalculations, printQuantity]);

  // Aggregate totals across all line items
  const lineItemTotals = useMemo(() => {
    return lineItemPricing.reduce((totals, item) => ({
      // Printing costs
      basePrintingCost: totals.basePrintingCost + item.basePrintingCost,
      glossCost: totals.glossCost + item.glossCost,
      doubleSidedCost: totals.doubleSidedCost + item.doubleSidedCost,
      packagingCost: totals.packagingCost + item.packagingCost,
      printingSubtotal: totals.printingSubtotal + item.printingSubtotal,
      
      // Device revenue
      deviceRevenue: totals.deviceRevenue + item.deviceRevenue,
      
      // Cost floor items
      cmykInkCost: totals.cmykInkCost + item.cmykInkCost,
      glossInkCost: totals.glossInkCost + item.glossInkCost,
      totalInkCost: totals.totalInkCost + item.totalInkCost,
      repackagingCost: totals.repackagingCost + item.repackagingCost,
      deviceCostFloor: totals.deviceCostFloor + item.deviceCostFloor,
      
      // Production (only for print items)
      totalBatches: totals.totalBatches + item.batchesNeeded,
      totalProductionHours: totals.totalProductionHours + item.productionHours,
      totalPrintMinutes: totals.totalPrintMinutes + item.totalPrintMinutes
    }), {
      basePrintingCost: 0,
      glossCost: 0,
      doubleSidedCost: 0,
      packagingCost: 0,
      printingSubtotal: 0,
      deviceRevenue: 0,
      cmykInkCost: 0,
      glossInkCost: 0,
      totalInkCost: 0,
      repackagingCost: 0,
      deviceCostFloor: 0,
      totalBatches: 0,
      totalProductionHours: 0,
      totalPrintMinutes: 0
    });
  }, [lineItemPricing]);

  // Calculate average minutes per batch (for production day calculation)
  const avgMinutesPerBatch = useMemo(() => {
    if (lineItemTotals.totalBatches === 0) return 35;
    return lineItemPricing
      .filter(item => item.includesPrinting)
      .reduce((sum, item) => {
        return sum + (item.minutesPerBatch * item.batchesNeeded);
      }, 0) / lineItemTotals.totalBatches;
  }, [lineItemPricing, lineItemTotals.totalBatches]);

  // Check if order has any printing
  const hasPrinting = useMemo(() => {
    return lineItems.some(item => item.serviceType !== SERVICE_TYPES.DEVICES_ONLY);
  }, [lineItems]);

  // Check if order has any devices
  const hasDevices = useMemo(() => {
    return lineItems.some(item => item.serviceType !== SERVICE_TYPES.PRINT_ONLY);
  }, [lineItems]);

  return {
    // State
    lineItems,
    
    // Actions
    addLineItem,
    removeLineItem,
    updateLineItem,
    setAllLineItems,
    resetLineItems,
    
    // Calculated values
    totalQuantity,
    printQuantity,
    lineItemCalculations,
    lineItemPricing,
    lineItemTotals,
    avgMinutesPerBatch,
    hasPrinting,
    hasDevices
  };
}
