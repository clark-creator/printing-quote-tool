import React from 'react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Order Settings component
 * Handles order-level settings: designs, turnaround, sample run, shipping, tax
 * Conditionally shows printing-related options based on order content
 */
export function OrderSettings() {
  const {
    // Order settings
    numDesigns,
    setNumDesigns,
    designWaivers,
    setDesignWaivers,
    turnaround,
    setTurnaround,
    sampleRun,
    setSampleRun,
    waiveSampleFee,
    setWaiveSampleFee,
    
    // Shipping & tax
    shippingType,
    setShippingType,
    shopifyQuote,
    setShopifyQuote,
    shippingMarkup,
    setShippingMarkup,
    salesTaxRate,
    setSalesTaxRate,
    
    // Calculated values
    designCosts,
    hasPrinting
  } = useQuote();

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Order Settings</h3>

      {/* Printing-specific settings - only show if order has printing */}
      {hasPrinting && (
        <>
          {/* Number of Designs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of SKUs/Designs
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={numDesigns}
              onChange={(e) => setNumDesigns(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {designCosts.includedDesigns} design{designCosts.includedDesigns !== 1 ? 's' : ''} included (1 per 1,000 units)
              {designCosts.extraDesigns > 0 && ` • ${designCosts.extraDesigns} extra @ $35 each`}
            </p>
          </div>

          {/* Design Waivers */}
          {designCosts.extraDesigns > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of extra designs to waive fee for
              </label>
              <input
                type="number"
                min="0"
                max={designCosts.extraDesigns}
                value={designWaivers}
                onChange={(e) => setDesignWaivers(Math.min(Number(e.target.value), designCosts.extraDesigns))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Sample Run */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sample"
                checked={sampleRun}
                onChange={(e) => setSampleRun(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="sample" className="text-sm font-medium text-gray-700">
                Pre-production sample run ($65)
              </label>
            </div>
            {sampleRun && (
              <div className="ml-7 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="waive-sample"
                  checked={waiveSampleFee}
                  onChange={(e) => setWaiveSampleFee(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="waive-sample" className="text-sm text-gray-600">
                  Waive sample fee
                </label>
              </div>
            )}
          </div>
        </>
      )}

      {/* No printing notice */}
      {!hasPrinting && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Devices Only Order:</strong> Design and sample options are not applicable.
          </p>
        </div>
      )}

      {/* Turnaround - always show */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Turnaround
        </label>
        <select
          value={turnaround}
          onChange={(e) => setTurnaround(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="normal">Normal</option>
          <option value="rush">48-72 hour rush (+12%)</option>
          <option value="weekend">Weekend/overnight (+20%)</option>
        </select>
      </div>

      {/* Shipping Section - always show */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Shipping</label>
        
        {/* Shopify Option */}
        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="shopify"
            checked={shippingType === 'shopify'}
            onChange={() => setShippingType('shopify')}
            className="w-4 h-4"
          />
          <label htmlFor="shopify" className="text-sm text-gray-700">
            Shopify calculated shipping
          </label>
        </div>
        
        {shippingType === 'shopify' && (
          <div className="ml-7 space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Base Shopify quote ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100000"
                value={shopifyQuote}
                onChange={(e) => setShopifyQuote(Math.min(100000, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Markup (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={shippingMarkup}
                onChange={(e) => setShippingMarkup(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
        
        {/* Pickup Option */}
        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="pickup"
            checked={shippingType === 'pickup'}
            onChange={() => setShippingType('pickup')}
            className="w-4 h-4"
          />
          <label htmlFor="pickup" className="text-sm text-gray-700">
            Free local pickup (LA)
          </label>
        </div>
      </div>

      {/* Sales Tax - always show */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales Tax Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="20"
          value={salesTaxRate}
          onChange={(e) => setSalesTaxRate(Math.min(20, Math.max(0, Number(e.target.value))))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
}

export default OrderSettings;
