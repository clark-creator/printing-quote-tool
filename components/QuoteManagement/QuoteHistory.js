import React from 'react';
import { History, X, FolderOpen, Plus, GitCompare, Trash2, Search } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { StatusBadge } from '../UI/StatusBadge';

/**
 * Quote History modal component
 * Displays searchable table of all saved quotes with actions
 */
export function QuoteHistory() {
  const {
    showHistory,
    setShowHistory,
    savedQuotes,
    filteredQuotes,
    historySearch,
    setHistorySearch,
    loadQuote,
    duplicateQuote,
    deleteQuote,
    updateQuoteStatus,
    setShowComparison,
    setComparisonQuote
  } = useQuote();

  if (!showHistory) return null;

  // Stats for footer
  const wonCount = savedQuotes.filter(q => q.status === 'won').length;
  const lostCount = savedQuotes.filter(q => q.status === 'lost').length;
  const pendingCount = savedQuotes.filter(q => !q.status || q.status === 'pending').length;

  const handleCompare = (quote) => {
    setComparisonQuote(quote);
    setShowComparison(true);
    setShowHistory(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <History className="w-6 h-6" />
            Quote History
          </h2>
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 hover:bg-indigo-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, manager, or status..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          {filteredQuotes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No quotes found</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Manager</th>
                  <th className="text-right p-3">Qty</th>
                  <th className="text-right p-3">Quote</th>
                  <th className="text-right p-3">Margin</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">{quote.clientName}</td>
                    <td className="p-3">{quote.accountManager}</td>
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
                      <select
                        value={quote.status || 'pending'}
                        onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => loadQuote(quote)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Load"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateQuote(quote)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Duplicate"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCompare(quote)}
                          className="p-1 text-pink-600 hover:bg-pink-50 rounded"
                          title="Compare"
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          {savedQuotes.length} total quotes • Won: {wonCount} • Lost: {lostCount} • Pending: {pendingCount}
        </div>
      </div>
    </div>
  );
}

export default QuoteHistory;
