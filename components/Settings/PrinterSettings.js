import React from 'react';
import { Printer } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Printer Settings panel component
 * Allows configuring number of printers and shows production impact
 */
export function PrinterSettings() {
  const {
    numPrinters,
    setNumPrinters,
    productionMetrics,
    showPrinterSettings,
    setShowPrinterSettings
  } = useQuote();

  const handlePrinterChange = (value) => {
    const num = Math.max(1, Math.min(20, Number(value) || 1));
    setNumPrinters(num);
  };

  if (!showPrinterSettings) return null;

  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Printer className="w-5 h-5 text-green-600" />
          Printer Settings
        </h3>
        <button
          onClick={() => setShowPrinterSettings(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Close
        </button>
      </div>

      <div className="space-y-4">
        {/* Printer Count Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Printers Devoted to This Project
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={numPrinters}
            onChange={(e) => handlePrinterChange(e.target.value)}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-2">
            Auto-optimized to {productionMetrics.optimizedPrinters} printer{productionMetrics.optimizedPrinters !== 1 ? 's' : ''} for this order size
          </p>
        </div>

        {/* Production Impact */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Production Impact:</span>
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Batches/printer/day:</span>
              <span className="ml-2 font-medium">{productionMetrics.batchesPerPrinterPerDay}</span>
            </div>
            <div>
              <span className="text-gray-500">Total batches:</span>
              <span className="ml-2 font-medium">{productionMetrics.totalBatches}</span>
            </div>
            <div>
              <span className="text-gray-500">Production days:</span>
              <span className="ml-2 font-medium">{productionMetrics.productionDays}</span>
            </div>
            <div>
              <span className="text-gray-500">Active printers:</span>
              <span className="ml-2 font-medium">{productionMetrics.optimizedPrinters}</span>
            </div>
            <div>
              <span className="text-gray-500">Total hours:</span>
              <span className="ml-2 font-medium">{productionMetrics.totalProductionHours.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-500">Effective hours:</span>
              <span className="ml-2 font-medium">{productionMetrics.effectiveProductionHours.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Optimization Info */}
        <div className="text-xs text-gray-600 bg-green-100 rounded p-2">
          <strong>Auto-optimization rules:</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li>Jobs under 2 hours → 1 printer</li>
            <li>Jobs 2-12 hours → up to 2 printers</li>
            <li>Larger jobs → full printer count</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PrinterSettings;
