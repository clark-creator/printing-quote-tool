import React from 'react';
import { DollarSign } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { SERVICE_TYPES } from '../../utils/pricing';

/**
 * Cost Floor Breakdown component
 * Displays transparent cost calculations with explicit formulas
 * Handles mixed orders with print-only, devices-only, and print+devices line items
 */
export function CostFloorBreakdown() {
  const {
    numDesigns,
    sampleRun,
    waiveSampleFee,
    lineItemPricing,
    lineItemTotals,
    productionMetrics,
    costFloorBreakdown,
    hasPrinting,
    hasDevices
  } = useQuote();

  const { preProduction, production, postProduction, shippingStaging } = costFloorBreakdown;

  // Filter line items by type for display
  const printingItems = lineItemPricing.filter(item => item.serviceType !== SERVICE_TYPES.DEVICES_ONLY);
  const deviceItems = lineItemPricing.filter(item => item.serviceType !== SERVICE_TYPES.PRINT_ONLY);

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-900">Cost Floor (Transparent Breakdown)</h3>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        {/* Pre-Production - Only show if there's printing */}
        {hasPrinting && (
          <div>
            <p className="font-semibold text-red-800 mb-1">Pre-Production:</p>
            <div className="ml-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>
                  File setup: {numDesigns} design{numDesigns !== 1 ? 's' : ''} × ${preProduction.fileSetupPerDesign}
                </span>
                <span>${preProduction.fileSetupCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Machine setup: {productionMetrics.productionDays} day{productionMetrics.productionDays !== 1 ? 's' : ''} × ${preProduction.machineSetupPerDay}
                </span>
                <span>${preProduction.machineSetupCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Sample printing: {sampleRun && !waiveSampleFee ? '$0 (fee charged)' : '$23 (no fee charged)'}
                </span>
                <span>${preProduction.samplePrintingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Subtotal:</span>
                <span>${preProduction.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Production - Only show if there's printing */}
        {hasPrinting && (
          <div>
            <p className="font-semibold text-red-800 mb-1">Production (Printing):</p>
            <div className="ml-3 space-y-2 text-xs">
              {/* Ink breakdown per line item - only for print items */}
              {printingItems.map((item) => (
                <div key={item.id} className="border-b border-red-100 pb-1">
                  <p className="font-medium text-red-700">
                    {item.deviceName} ({item.quantity.toLocaleString()} units):
                  </p>
                  <div className="ml-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>
                        Ink - CMYK: $0.03 × {item.numSides} side{item.numSides > 1 ? 's' : ''} × {item.quantity.toLocaleString()}
                      </span>
                      <span>${item.cmykInkCost.toFixed(2)}</span>
                    </div>
                    {item.glossInkCost > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Ink - Gloss: ${item.glossCostPerUnit.toFixed(2)} × {item.quantity.toLocaleString()}
                        </span>
                        <span>${item.glossInkCost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-1">
                <span>Total Ink Cost:</span>
                <span>${lineItemTotals.totalInkCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Labor: {productionMetrics.effectiveProductionHours.toFixed(1)} hrs × ${production.laborPerHour}/hr
                </span>
                <span>${production.laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Subtotal:</span>
                <span>${production.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Post-Production - Only show if there's printing */}
        {hasPrinting && (
          <div>
            <p className="font-semibold text-red-800 mb-1">Post-Production:</p>
            <div className="ml-3 space-y-1 text-xs">
              {/* Repackaging per line item */}
              {printingItems.map((item) => (
                item.repackagingCost > 0 && (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      Repackaging ({item.deviceName}): $0.06 × {item.quantity.toLocaleString()}
                    </span>
                    <span>${item.repackagingCost.toFixed(2)}</span>
                  </div>
                )
              ))}
              {lineItemTotals.repackagingCost === 0 && (
                <div className="flex justify-between">
                  <span>Repackaging: $0.00 (loose packaging)</span>
                  <span>$0.00</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>
                  Shipping/staging: ({shippingStaging.minutes} min / 60 min) × ${shippingStaging.hourlyRate}/hr
                </span>
                <span>${shippingStaging.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Subtotal:</span>
                <span>${postProduction.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Device Costs - Only show if there are devices */}
        {hasDevices && lineItemTotals.deviceCostFloor > 0 && (
          <div>
            <p className="font-semibold text-red-800 mb-1">Device Supply (Your Cost):</p>
            <div className="ml-3 space-y-1 text-xs">
              {deviceItems.map((item) => (
                item.deviceCostFloor > 0 && (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.deviceName}: ${item.deviceUnitCost?.toFixed(2)} × {item.quantity.toLocaleString()}
                    </span>
                    <span>${item.deviceCostFloor.toFixed(2)}</span>
                  </div>
                )
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Device Cost:</span>
                <span>${lineItemTotals.deviceCostFloor.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* No printing message */}
        {!hasPrinting && (
          <div className="bg-amber-50 rounded p-2 text-xs text-amber-700">
            <strong>Devices Only Order:</strong> No printing costs apply.
          </div>
        )}

        {/* Total Cost Floor */}
        <div className="border-t-2 border-red-300 pt-2 flex justify-between text-base font-bold text-red-900">
          <span>Total Cost Floor:</span>
          <span>${costFloorBreakdown.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default CostFloorBreakdown;
