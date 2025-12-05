import React from 'react';
import { GitCompare, X } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Quote Comparison modal component
 * Side-by-side comparison of current quote vs saved quote
 */
export function QuoteComparison() {
  const {
    showComparison,
    setShowComparison,
    comparisonQuote,
    setComparisonQuote,
    savedQuotes,
    // Current quote values
    clientName,
    totalQuantity,
    lineItems,
    turnaround,
    numPrinters,
    quoteBreakdown,
    costFloorBreakdown,
    profitAnalysis,
    productionMetrics
  } = useQuote();

  if (!showComparison) return null;

  const { totalQuote } = quoteBreakdown;
  const { total: costFloor } = costFloorBreakdown;
  const { grossProfit: profit, profitMargin } = profitAnalysis;
  const { productionDays, optimizedPrinters } = productionMetrics;

  // Get device names for current quote
  const currentDevices = lineItems.map(item => item.deviceName || 'Unknown').join(', ');

  // Calculate differences if comparison quote is selected
  const quoteDiff = comparisonQuote ? totalQuote - comparisonQuote.totalQuote : 0;
  const marginDiff = comparisonQuote ? profitMargin - comparisonQuote.profitMargin : 0;

  const handleClose = () => {
    setShowComparison(false);
    setComparisonQuote(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-pink-50">
          <h2 className="text-xl font-bold text-pink-900 flex items-center gap-2">
            <GitCompare className="w-6 h-6" />
            Compare Quotes
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-pink-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Quote */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-bold text-blue-900 mb-4">Current Quote</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Client:</span>{' '}
                  <span className="font-medium">{clientName || '(Not set)'}</span>
                </p>
                <p>
                  <span className="text-gray-600">Quantity:</span>{' '}
                  <span className="font-medium">{totalQuantity.toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-gray-600">Line Items:</span>{' '}
                  <span className="font-medium">{lineItems.length}</span>
                </p>
                <p>
                  <span className="text-gray-600">Devices:</span>{' '}
                  <span className="font-medium">{currentDevices}</span>
                </p>
                <p>
                  <span className="text-gray-600">Turnaround:</span>{' '}
                  <span className="font-medium">{turnaround}</span>
                </p>
                <p>
                  <span className="text-gray-600">Printers:</span>{' '}
                  <span className="font-medium">{optimizedPrinters} (of {numPrinters})</span>
                </p>
                <hr className="my-3" />
                <p className="text-lg">
                  <span className="text-gray-600">Total Quote:</span>{' '}
                  <span className="font-bold text-green-600">${totalQuote.toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-600">Cost Floor:</span>{' '}
                  <span className="font-medium">${costFloor.toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-600">Profit:</span>{' '}
                  <span className="font-medium">${profit.toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-600">Margin:</span>{' '}
                  <span
                    className={`font-bold ${
                      profitMargin >= 30
                        ? 'text-green-600'
                        : profitMargin >= 15
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {profitMargin.toFixed(1)}%
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Production:</span>{' '}
                  <span className="font-medium">
                    {productionDays} day{productionDays !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </div>

            {/* Comparison Quote */}
            <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50">
              <h3 className="font-bold text-pink-900 mb-4">Compare With</h3>
              {!comparisonQuote ? (
                <div>
                  <p className="text-gray-600 mb-4">Select a quote to compare:</p>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {savedQuotes.map(quote => (
                      <div
                        key={quote.id}
                        onClick={() => setComparisonQuote(quote)}
                        className="p-3 bg-white rounded border cursor-pointer hover:border-pink-400"
                      >
                        <p className="font-medium">{quote.clientName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()} • ${quote.totalQuote?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {savedQuotes.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No saved quotes to compare</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{comparisonQuote.clientName}</span>
                    <button
                      onClick={() => setComparisonQuote(null)}
                      className="text-xs text-pink-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p>
                    <span className="text-gray-600">Quantity:</span>{' '}
                    <span className="font-medium">
                      {(comparisonQuote.totalQuantity || comparisonQuote.quantity)?.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Line Items:</span>{' '}
                    <span className="font-medium">{comparisonQuote.lineItems?.length || 1}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Device:</span>{' '}
                    <span className="font-medium">
                      {comparisonQuote.lineItems
                        ? comparisonQuote.lineItems.map(i => i.deviceTypeName).join(', ')
                        : comparisonQuote.deviceTypeName}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Turnaround:</span>{' '}
                    <span className="font-medium">{comparisonQuote.turnaround}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Printers:</span>{' '}
                    <span className="font-medium">{comparisonQuote.numPrinters}</span>
                  </p>
                  <hr className="my-3" />
                  <p className="text-lg">
                    <span className="text-gray-600">Total Quote:</span>{' '}
                    <span className="font-bold text-green-600">
                      ${comparisonQuote.totalQuote?.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Cost Floor:</span>{' '}
                    <span className="font-medium">${comparisonQuote.costFloor?.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Profit:</span>{' '}
                    <span className="font-medium">${comparisonQuote.profit?.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Margin:</span>{' '}
                    <span
                      className={`font-bold ${
                        comparisonQuote.profitMargin >= 30
                          ? 'text-green-600'
                          : comparisonQuote.profitMargin >= 15
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {comparisonQuote.profitMargin?.toFixed(1)}%
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Production:</span>{' '}
                    <span className="font-medium">
                      {comparisonQuote.productionDays} day{comparisonQuote.productionDays !== 1 ? 's' : ''}
                    </span>
                  </p>

                  {/* Difference Summary */}
                  <hr className="my-3" />
                  <h4 className="font-semibold text-pink-800">Difference</h4>
                  <p>
                    <span className="text-gray-600">Quote:</span>{' '}
                    <span
                      className={`font-medium ${
                        quoteDiff >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {quoteDiff >= 0 ? '+' : ''}${quoteDiff.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Margin:</span>{' '}
                    <span
                      className={`font-medium ${
                        marginDiff >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {marginDiff >= 0 ? '+' : ''}{marginDiff.toFixed(1)}%
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteComparison;
