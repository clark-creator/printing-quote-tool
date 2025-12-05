import { useState, useMemo, useCallback } from 'react';
import { calculateLineItemProduction, calculateInkCosts, calculateRepackagingCost, calculateDeviceCostFloor } from '../utils/costCalculations';
import { getBasePrice, getGlossCost, getDoubleSidedCost, getPackagingCost, calculateDeviceSupplyCost } from '../utils/pricing';

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
    sides: 'single',
    glossFinish: 'none',
    packaging: 'loose',
    supplyingDevices: false,
    deviceCost: 0,
    deviceMarkup: 30
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
      
      // Auto-populate device cost when supplyingDevices is enabled
      if (field === 'supplyingDevices' && value && deviceTypes.length > 0) {
        updated.deviceCost = deviceTypes[item.deviceIndex]?.unitCost || 0;
      }
      
      // Update device cost when device type changes (if supplying)
      if (field === 'deviceIndex' && item.supplyingDevices && deviceTypes.length > 0) {
        updated.deviceCost = deviceTypes[value]?.unitCost || 0;
      }
      
      // Handle gloss/sides interaction
      if (field === 'sides' && value === 'single' && item.glossFinish === 'both-sides') {
        updated.glossFinish = 'single-side';
      }
      
      return updated;
    }));
  }, [deviceTypes]);

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
      sides: item.sides || 'single',
      glossFinish: item.glossFinish || 'none',
      packaging: item.packaging || 'loose',
      supplyingDevices: item.supplyingDevices || false,
      deviceCost: item.deviceCost || 0,
      deviceMarkup: item.deviceMarkup || 30
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

  // Calculate per-line-item production and cost values
  const lineItemCalculations = useMemo(() => {
    return lineItems.map(item => {
      const device = deviceTypes[item.deviceIndex] || { capacity: 80, unitCost: 0, name: 'Unknown' };
      const hasGloss = item.glossFinish !== 'none';
      const isDoubleSided = item.sides === 'double';
      const numSides = isDoubleSided ? 2 : 1;
      
      // Production calculations
      const production = calculateLineItemProduction({
        quantity: item.quantity,
        deviceCapacity: device.capacity,
        hasGloss,
        isDoubleSided
      });
      
      // Ink costs (for cost floor)
      const inkCosts = calculateInkCosts({
        quantity: item.quantity,
        numSides,
        glossFinish: item.glossFinish
      });
      
      // Repackaging cost (for cost floor)
      const repackaging = calculateRepackagingCost(item.packaging, item.quantity);
      
      // Device costs
      const { deviceUnitPrice, deviceSupplyCost } = calculateDeviceSupplyCost(
        item.supplyingDevices,
        item.deviceCost,
        item.deviceMarkup,
        item.quantity
      );
      
      const deviceCostFloor = calculateDeviceCostFloor(
        item.supplyingDevices,
        item.deviceCost,
        item.quantity
      );
      
      return {
        ...item,
        deviceName: device.name,
        deviceCapacity: device.capacity,
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
        deviceUnitPrice,
        deviceSupplyCost,
        deviceCostFloor
      };
    });
  }, [lineItems, deviceTypes]);

  // Calculate pricing per line item (using total quantity for tier)
  const lineItemPricing = useMemo(() => {
    const basePrice = getBasePrice(totalQuantity);
    
    return lineItemCalculations.map(item => {
      const basePrintingCost = basePrice * item.quantity;
      const glossCost = getGlossCost(item.glossFinish, item.quantity);
      const doubleSidedCost = getDoubleSidedCost(item.sides, item.quantity);
      const packagingCost = getPackagingCost(item.packaging, item.quantity);
      
      const lineItemSubtotal = basePrintingCost + glossCost + doubleSidedCost + packagingCost + item.deviceSupplyCost;
      
      return {
        ...item,
        basePrintingCost,
        glossCost,
        doubleSidedCost,
        packagingCost,
        lineItemSubtotal
      };
    });
  }, [lineItemCalculations, totalQuantity]);

  // Aggregate totals across all line items
  const lineItemTotals = useMemo(() => {
    return lineItemPricing.reduce((totals, item) => ({
      basePrintingCost: totals.basePrintingCost + item.basePrintingCost,
      glossCost: totals.glossCost + item.glossCost,
      doubleSidedCost: totals.doubleSidedCost + item.doubleSidedCost,
      packagingCost: totals.packagingCost + item.packagingCost,
      deviceSupplyCost: totals.deviceSupplyCost + item.deviceSupplyCost,
      // Cost floor items
      cmykInkCost: totals.cmykInkCost + item.cmykInkCost,
      glossInkCost: totals.glossInkCost + item.glossInkCost,
      totalInkCost: totals.totalInkCost + item.totalInkCost,
      repackagingCost: totals.repackagingCost + item.repackagingCost,
      deviceCostFloor: totals.deviceCostFloor + item.deviceCostFloor,
      // Production
      totalBatches: totals.totalBatches + item.batchesNeeded,
      totalProductionHours: totals.totalProductionHours + item.productionHours,
      totalPrintMinutes: totals.totalPrintMinutes + item.totalPrintMinutes
    }), {
      basePrintingCost: 0,
      glossCost: 0,
      doubleSidedCost: 0,
      packagingCost: 0,
      deviceSupplyCost: 0,
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
    return lineItemPricing.reduce((sum, item) => {
      return sum + (item.minutesPerBatch * item.batchesNeeded);
    }, 0) / lineItemTotals.totalBatches;
  }, [lineItemPricing, lineItemTotals.totalBatches]);

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
    lineItemCalculations,
    lineItemPricing,
    lineItemTotals,
    avgMinutesPerBatch
  };
}
