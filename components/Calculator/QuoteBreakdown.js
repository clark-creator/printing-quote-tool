import React from 'react';
import { Calculator } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Quote Breakdown component
 * Displays the complete project quote with line item and order-level charges
 */
export function QuoteBreakdown() {
  const {
    basePrice,
    setupFee,
    totalQuantity,
    lineItemPricing,
    quoteBreakdown,
    turnaround,
    salesTaxRate,
    designCosts
  } = useQuote();

  const {
    extraDesignCost,
    chargeableDesigns,
    turnaroundFee,
    sampleFee,
    subtotal,
    salesTax,
    shippingCost,
    totalQuote
  } = quoteBreakdown;

  const hasOrderCharges = setupFee > 0 || extraDesignCost > 0 || turnaroundFee > 0 || sampleFee > 0;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-green-900">Project Quote</h3>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        {/* Per Line Item Breakdown */}
        {lineItemPricing.map((item, index) => (
          <div key={item.id} className="border-b border-green-200 pb-2">
            <p className="font-medium text-green-800 mb-1">
              {item.deviceName} ({item.quantity.toLocaleString()} units)
            </p>
            <div className="ml-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Base ({item.quantity.toLocaleString()} × ${basePrice.toFixed(2)}):</span>
                <span>${item.basePrintingCost.toFixed(2)}</span>
              </div>
              {item.glossCost > 0 && (
                <div className="flex justify-between">
                  <span>Gloss ({item.glossFinish === 'both-sides' ? 'both' : 'one'} side):</span>
                  <span>${item.glossCost.toFixed(2)}</span>
                </div>
              )}
              {item.doubleSidedCost > 0 && (
                <div className="flex justify-between">
                  <span>Double-sided:</span>
                  <span>${item.doubleSidedCost.toFixed(2)}</span>
                </div>
              )}
              {item.packagingCost > 0 && (
                <div className="flex justify-between">
                  <span>Packaging:</span>
                  <span>${item.packagingCost.toFixed(2)}</span>
                </div>
              )}
              {item.deviceSupplyCost > 0 && (
                <div className="flex justify-between">
                  <span>Devices ({item.quantity.toLocaleString()} × ${item.deviceUnitPrice.toFixed(2)}):</span>
                  <span>${item.deviceSupplyCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Order-Level Charges */}
        {hasOrderCharges && (
          <div className="pt-1">
            <p className="font-medium text-green-800 mb-1">Order Charges</p>
            <div className="ml-3 space-y-1 text-xs">
              {setupFee > 0 && (
                <div className="flex justify-between">
                  <span>Setup Fee:</span>
                  <span>${setupFee.toFixed(2)}</span>
                </div>
              )}
              {extraDesignCost > 0 && (
                <div className="flex justify-between">
                  <span>Extra designs ({chargeableDesigns} × $35):</span>
                  <span>${extraDesignCost.toFixed(2)}</span>
                </div>
              )}
              {turnaroundFee > 0 && (
                <div className="flex justify-between">
                  <span>Turnaround fee ({turnaround === 'rush' ? '12%' : '20%'}):</span>
                  <span>${turnaroundFee.toFixed(2)}</span>
                </div>
              )}
              {sampleFee > 0 && (
                <div className="flex justify-between">
                  <span>Sample run:</span>
                  <span>${sampleFee.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="border-t border-green-300 pt-2 flex justify-between font-semibold">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Per Unit Cost */}
        <div className="flex justify-between text-xs text-green-700 italic">
          <span>Per unit cost:</span>
          <span>${(subtotal / totalQuantity).toFixed(3)}/device</span>
        </div>

        {/* Tax */}
        {salesTax > 0 && (
          <div className="flex justify-between">
            <span>Sales Tax ({salesTaxRate}%):</span>
            <span className="font-medium">${salesTax.toFixed(2)}</span>
          </div>
        )}

        {/* Shipping */}
        {shippingCost > 0 && (
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-medium">${shippingCost.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-green-300 pt-2 flex justify-between text-base font-bold text-green-900">
          <span>Total Quote:</span>
          <span>${totalQuote.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default QuoteBreakdown;
