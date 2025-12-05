import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Profit Analysis component
 * Displays profit metrics and per-unit analysis
 */
export function ProfitAnalysis() {
  const {
    quoteBreakdown,
    costFloorBreakdown,
    profitAnalysis,
    totalQuantity
  } = useQuote();

  const { totalQuote } = quoteBreakdown;
  const { total: costFloor } = costFloorBreakdown;
  const {
    grossProfit,
    profitMargin,
    marginStatus,
    costPerUnit,
    pricePerUnit,
    profitPerUnit
  } = profitAnalysis;

  // Color classes based on margin status
  const marginColorClass = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  }[marginStatus];

  return (
    <div className="space-y-4">
      {/* Profit Analysis */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Profit Analysis</h3>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Total Quote:</span>
            <span className="font-medium">${totalQuote.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Costs:</span>
            <span className="font-medium">-${costFloor.toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-purple-300 pt-2 space-y-2">
            <div className="flex justify-between text-base font-bold text-purple-900">
              <span>Gross Profit:</span>
              <span>${grossProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Profit Margin:</span>
              <span className={marginColorClass}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Margin Status Indicator */}
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Margin Status:</span>
            {marginStatus === 'good' && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Healthy (≥30%)
              </span>
            )}
            {marginStatus === 'warning' && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                Marginal (15-30%)
              </span>
            )}
            {marginStatus === 'danger' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                Low (&lt;15%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Per Unit Analysis */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Per Unit Analysis</h3>
        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Cost per unit:</span>
            <span className="font-medium">${costPerUnit.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Price per unit:</span>
            <span className="font-medium">${pricePerUnit.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Profit per unit:</span>
            <span className={`font-medium ${profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profitPerUnit.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Visual Breakdown Bar */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Price composition per unit:</p>
          <div className="h-4 rounded-full overflow-hidden flex bg-gray-200">
            {pricePerUnit > 0 && (
              <>
                <div
                  className="bg-red-400 h-full"
                  style={{ width: `${Math.min(100, (costPerUnit / pricePerUnit) * 100)}%` }}
                  title={`Cost: $${costPerUnit.toFixed(3)}`}
                />
                <div
                  className="bg-green-400 h-full"
                  style={{ width: `${Math.max(0, (profitPerUnit / pricePerUnit) * 100)}%` }}
                  title={`Profit: $${profitPerUnit.toFixed(3)}`}
                />
              </>
            )}
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-600">Cost ({((costPerUnit / pricePerUnit) * 100 || 0).toFixed(0)}%)</span>
            <span className="text-green-600">Profit ({((profitPerUnit / pricePerUnit) * 100 || 0).toFixed(0)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfitAnalysis;
