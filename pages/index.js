import React from 'react';
import {
  Calculator,
  Plus,
  Save,
  FolderOpen,
  History,
  GitCompare,
  Users,
  Download,
  FileText,
  Printer,
  Settings,
  Package
} from 'lucide-react';

// Context Provider
import { QuoteProvider, useQuote } from '../context/QuoteContext';

// Settings Components
import { DeviceManager } from '../components/Settings/DeviceManager';
import { ManagerEditor } from '../components/Settings/ManagerEditor';
import { PrinterSettings } from '../components/Settings/PrinterSettings';

// Calculator Components
import { LineItemCard } from '../components/Calculator/LineItemCard';
import { OrderSettings } from '../components/Calculator/OrderSettings';
import { QuoteBreakdown } from '../components/Calculator/QuoteBreakdown';
import { CostFloorBreakdown } from '../components/Calculator/CostFloorBreakdown';
import { ProfitAnalysis } from '../components/Calculator/ProfitAnalysis';

// Quote Management Components
import { QuoteHistory } from '../components/QuoteManagement/QuoteHistory';
import { QuoteComparison } from '../components/QuoteManagement/QuoteComparison';
import { CustomerView } from '../components/QuoteManagement/CustomerView';

// UI Components
import { StatusBadge } from '../components/UI/StatusBadge';

// Constants
import { MINIMUM_ORDER_QUANTITY } from '../utils/pricing';

/**
 * Main Calculator Content Component
 * Contains all the UI logic - separated from provider wrapper
 */
function CalculatorContent() {
  const {
    // Order info
    clientName,
    setClientName,
    accountManager,
    setAccountManager,
    accountManagers,
    
    // Line items
    lineItems,
    addLineItem,
    totalQuantity,
    lineItemPricing,
    
    // UI state
    showDeviceManager,
    setShowDeviceManager,
    showManagerEditor,
    setShowManagerEditor,
    showPrinterSettings,
    setShowPrinterSettings,
    showLoadDropdown,
    setShowLoadDropdown,
    setShowHistory,
    setShowComparison,
    setShowCustomerView,
    
    // Quote management
    currentQuoteId,
    saveMessage,
    savedQuotes,
    saveQuote,
    loadQuote,
    newQuote,
    exportToCSV,
    generateInvoice,
    
    // Calculations
    numPrinters,
    basePrice,
    setupFee,
    productionMetrics,
    isBelowMinimum
  } = useQuote();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quote Calculator</h1>
              {currentQuoteId && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Editing
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={newQuote}
                className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                title="New Quote"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
              <button
                onClick={saveQuote}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                title="Save Quote"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              
              {/* Load Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLoadDropdown(!showLoadDropdown)}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                  title="Load Quote"
                >
                  <FolderOpen className="w-4 h-4" />
                  Load
                </button>
                {showLoadDropdown && savedQuotes.length > 0 && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-auto">
                    {savedQuotes.slice(0, 10).map(quote => (
                      <div
                        key={quote.id}
                        className="p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => loadQuote(quote)}
                          >
                            <p className="font-medium text-sm">{quote.clientName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(quote.createdAt).toLocaleDateString()} • $
                              {quote.totalQuote?.toFixed(2)} •{' '}
                              {(quote.totalQuantity || quote.quantity)?.toLocaleString()} units
                            </p>
                          </div>
                          <StatusBadge status={quote.status} small />
                        </div>
                      </div>
                    ))}
                    {savedQuotes.length > 10 && (
                      <div
                        className="p-2 text-center text-sm text-blue-600 cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          setShowHistory(true);
                          setShowLoadDropdown(false);
                        }}
                      >
                        View all {savedQuotes.length} quotes →
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                title="Quote History"
              >
                <History className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center gap-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700"
                title="Compare Quotes"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </button>
              <button
                onClick={() => setShowCustomerView(true)}
                className="flex items-center gap-1 px-3 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700"
                title="Customer View"
              >
                <Users className="w-4 h-4" />
                Customers
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                saveMessage.includes('Please')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {saveMessage}
            </div>
          )}

          {/* Settings Row */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setShowPrinterSettings(!showPrinterSettings)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              <Printer className="w-4 h-4" />
              Printers ({numPrinters})
            </button>
            <button
              onClick={() => setShowManagerEditor(!showManagerEditor)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              <Settings className="w-4 h-4" />
              Managers
            </button>
            <button
              onClick={() => setShowDeviceManager(!showDeviceManager)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Settings className="w-4 h-4" />
              Devices
            </button>
          </div>

          {/* Settings Panels */}
          <PrinterSettings />
          <ManagerEditor />
          <DeviceManager />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Project Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Account Manager */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Manager
                </label>
                <select
                  value={accountManager}
                  onChange={(e) => setAccountManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {accountManagers.map((manager, index) => (
                    <option key={index} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Line Items
                  </h3>
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {/* Total Quantity Summary */}
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    isBelowMinimum
                      ? 'bg-amber-50 border border-amber-300'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Quantity:</span>
                    <span
                      className={`text-lg font-bold ${
                        isBelowMinimum ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    >
                      {totalQuantity.toLocaleString()} units
                    </span>
                  </div>
                  {isBelowMinimum && (
                    <p className="text-xs text-amber-600 mt-1">
                      Below minimum order quantity ({MINIMUM_ORDER_QUANTITY} units)
                    </p>
                  )}
                </div>

                {/* Line Item Cards */}
                <div className="space-y-4">
                  {lineItemPricing.map((item, index) => (
                    <LineItemCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>

              {/* Order Settings */}
              <OrderSettings />
            </div>

            {/* Right Column - Calculations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Calculations</h2>

              {/* Pricing Tier */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Tier</h3>
                <div className="text-sm text-blue-800">
                  <p>
                    Base Price: ${basePrice.toFixed(2)} per unit{' '}
                    <span className="text-xs text-blue-600">
                      (based on {totalQuantity.toLocaleString()} total units)
                    </span>
                  </p>
                  {setupFee > 0 && <p>Setup Fee: ${setupFee.toFixed(2)}</p>}
                  <p className="text-xs mt-2 text-blue-600">
                    Production: {productionMetrics.productionDays} day
                    {productionMetrics.productionDays !== 1 ? 's' : ''} •{' '}
                    {productionMetrics.totalBatches} batch
                    {productionMetrics.totalBatches !== 1 ? 'es' : ''} •{' '}
                    {productionMetrics.optimizedPrinters} printer
                    {productionMetrics.optimizedPrinters !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Quote Breakdown */}
              <QuoteBreakdown />

              {/* Cost Floor Breakdown */}
              <CostFloorBreakdown />

              {/* Profit Analysis */}
              <ProfitAnalysis />
            </div>
          </div>

          {/* Generate Invoice Button */}
          {clientName && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={generateInvoice}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg"
              >
                <FileText className="w-6 h-6" />
                Generate PDF Invoice
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <QuoteHistory />
        <QuoteComparison />
        <CustomerView />
      </div>
    </div>
  );
}

/**
 * Main Page Component
 * Wraps content with QuoteProvider
 */
export default function PrintingQuoteTool() {
  return (
    <QuoteProvider>
      <CalculatorContent />
    </QuoteProvider>
  );
}
