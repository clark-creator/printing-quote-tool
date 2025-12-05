import React from 'react';
import { Users, X } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { StatusBadge } from '../UI/StatusBadge';

/**
 * Customer View modal component
 * Displays customer aggregation with drill-down to individual quotes
 */
export function CustomerView() {
  const {
    showCustomerView,
    setShowCustomerView,
    uniqueCustomers,
    selectedCustomer,
    setSelectedCustomer,
    loadQuote
  } = useQuote();

  if (!showCustomerView) return null;

  const handleClose = () => {
    setShowCustomerView(false);
    setSelectedCustomer(null);
  };

  const handleLoadQuote = (quote) => {
    loadQuote(quote);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-cyan-50">
          <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Customer Management
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-cyan-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {!selectedCustomer ? (
            // Customer List View
            <div>
              <p className="text-gray-600 mb-4">
                {uniqueCustomers.length} customer{uniqueCustomers.length !== 1 ? 's' : ''} found
              </p>
              
              {uniqueCustomers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No customers yet. Save some quotes to see them here.</p>
              ) : (
                <div className="space-y-2">
                  {uniqueCustomers.map(customer => (
                    <div
                      key={customer.name}
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-cyan-400 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {customer.quotes.length} quote{customer.quotes.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${customer.totalValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">total value</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Customer Detail View
            <div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-cyan-600 hover:underline mb-4"
              >
                ← Back to all customers
              </button>

              {/* Customer Summary */}
              <div className="bg-cyan-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-xl">{selectedCustomer.name}</h3>
                <p className="text-gray-600">
                  {selectedCustomer.quotes.length} quote{selectedCustomer.quotes.length !== 1 ? 's' : ''} • Total: ${selectedCustomer.totalValue.toFixed(2)}
                </p>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedCustomer.quotes.filter(q => !q.status || q.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedCustomer.quotes.filter(q => q.status === 'won').length}
                  </p>
                  <p className="text-xs text-gray-600">Won</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {selectedCustomer.quotes.filter(q => q.status === 'lost').length}
                  </p>
                  <p className="text-xs text-gray-600">Lost</p>
                </div>
              </div>

              {/* Quotes Table */}
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Quote</th>
                    <th className="text-right p-3">Margin</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCustomer.quotes.map(quote => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        {(quote.totalQuantity || quote.quantity)?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${quote.totalQuote?.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={
                            quote.profitMargin >= 30
                              ? 'text-green-600'
                              : quote.profitMargin >= 15
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {quote.profitMargin?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={quote.status} small />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleLoadQuote(quote)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Load
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Win Rate */}
              {selectedCustomer.quotes.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Win Rate: </span>
                    {(() => {
                      const decided = selectedCustomer.quotes.filter(
                        q => q.status === 'won' || q.status === 'lost'
                      ).length;
                      const won = selectedCustomer.quotes.filter(q => q.status === 'won').length;
                      if (decided === 0) return 'No decided quotes yet';
                      return `${((won / decided) * 100).toFixed(0)}% (${won} of ${decided} decided)`;
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Avg Quote Value: </span>
                    ${(selectedCustomer.totalValue / selectedCustomer.quotes.length).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerView;
