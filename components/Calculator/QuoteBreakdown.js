import React from 'react';
import { Calculator, Printer, ShoppingBag } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { SERVICE_TYPES } from '../../utils/pricing';

/**
 * Quote Breakdown component
 * Displays the complete project quote with line item and order-level charges
 * Now handles mixed orders with printing-only, devices-only, and print+devices line items
 */
export function QuoteBreakdown() {
  const {
    basePrice,
    setupFee,
    totalQuantity,
    printQuantity,
    lineItemPricing,
    quoteBreakdown,
    turnaround,
    salesTaxRate,
    designCosts,
    hasPrinting,
    hasDevices
  } = useQuote();

  const {
    printingSubtotal,
    deviceRevenue,
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
        {lineItemPricing.map((item, index) => {
          const isDevicesOnly = item.serviceType === SERVICE_TYPES.DEVICES_ONLY;
          const isPrintAndDevices = item.serviceType === SERVICE_TYPES.PRINT_AND_DEVICES;
          
          return (
            <div key={item.id} className="border-b border-green-200 pb-2">
              <div className="flex items-center gap-2 mb-1">
                {isDevicesOnly ? (
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                ) : (
                  <Printer className="w-4 h-4 text-blue-600" />
                )}
                <p className="font-medium text-green-800">
                  {item.deviceName} ({item.quantity.toLocaleString()} units)
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isDevicesOnly 
                    ? 'bg-amber-100 text-amber-700'
                    : isPrintAndDevices
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {isDevicesOnly ? 'Devices' : isPrintAndDevices ? 'Print+Devices' : 'Print'}
                </span>
              </div>
              
              <div className="ml-6 space-y-1 text-xs">
                {/* Printing costs (if applicable) */}
                {!isDevicesOnly && (
                  <>
                    <div className="flex justify-between">
                      <span>Printing ({item.quantity.toLocaleString()} × ${basePrice.toFixed(2)}):</span>
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
                  </>
                )}
                
                {/* Device revenue (if applicable) */}
                {item.deviceRevenue > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Devices ({item.quantity.toLocaleString()} × ${item.deviceSellingPrice.toFixed(2)}):</span>
                    <span>${item.deviceRevenue.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Line item subtotal */}
                <div className="flex justify-between font-medium pt-1 border-t border-green-100">
                  <span>Subtotal:</span>
                  <span>${item.lineItemSubtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary by Category */}
        {(hasPrinting && hasDevices) && (
          <div className="bg-white rounded p-2 border border-green-200">
            <div className="flex justify-between text-xs">
              <span className="text-blue-600">Printing Total:</span>
              <span className="font-medium">${printingSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-600">Device Revenue:</span>
              <span className="font-medium">${deviceRevenue.toFixed(2)}</span>
            </div>
          </div>
        )}

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
          <span>${(subtotal / totalQuantity).toFixed(3)}/unit</span>
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
