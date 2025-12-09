import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLocalStorage, DEFAULT_DEVICE_TYPES, DEFAULT_ACCOUNT_MANAGERS, STORAGE_KEYS, migrateDeviceTypes } from '../hooks/useLocalStorage';
import { useLineItems } from '../hooks/useLineItems';
import { useQuoteCalculations, generateQuoteData, generateInvoiceData } from '../hooks/useQuoteCalculations';
import { generateInvoiceNumber, generateInvoiceHTML, openInvoice } from '../utils/invoiceTemplate';
import { MINIMUM_ORDER_QUANTITY, generateDevicePricingTiers, DEFAULT_DEVICE_PRICING_TIERS } from '../utils/pricing';

// Create the context
const QuoteContext = createContext(null);

/**
 * Quote Provider component - wraps the app and provides all quote state
 */
export function QuoteProvider({ children }) {
  // ============================================
  // PERSISTENT STATE (localStorage)
  // ============================================
  const [rawDeviceTypes, setRawDeviceTypes] = useLocalStorage(STORAGE_KEYS.DEVICE_TYPES, DEFAULT_DEVICE_TYPES);
  const [accountManagers, setAccountManagers] = useLocalStorage(STORAGE_KEYS.ACCOUNT_MANAGERS, DEFAULT_ACCOUNT_MANAGERS);
  const [savedQuotes, setSavedQuotes] = useLocalStorage(STORAGE_KEYS.SAVED_QUOTES, []);

  // Ensure device types have pricing tiers (migration)
  const deviceTypes = useMemo(() => migrateDeviceTypes(rawDeviceTypes), [rawDeviceTypes]);

  // ============================================
  // ORDER-LEVEL STATE
  // ============================================
  const [clientName, setClientName] = useState('');
  const [accountManager, setAccountManager] = useState(DEFAULT_ACCOUNT_MANAGERS[0]);
  const [numDesigns, setNumDesigns] = useState(1);
  const [designWaivers, setDesignWaivers] = useState(0);
  const [turnaround, setTurnaround] = useState('normal');
  const [sampleRun, setSampleRun] = useState(true);
  const [waiveSampleFee, setWaiveSampleFee] = useState(false);
  
  // Shipping & Tax
  const [shippingType, setShippingType] = useState('shopify');
  const [shopifyQuote, setShopifyQuote] = useState(0);
  const [shippingMarkup, setShippingMarkup] = useState(20);
  const [salesTaxRate, setSalesTaxRate] = useState(0);
  
  // Printers
  const [numPrinters, setNumPrinters] = useState(3);
  
  // Quote management
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // ============================================
  // UI STATE
  // ============================================
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [showManagerEditor, setShowManagerEditor] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [comparisonQuote, setComparisonQuote] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historySearch, setHistorySearch] = useState('');

  // ============================================
  // LINE ITEMS (custom hook)
  // ============================================
  const {
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    setAllLineItems,
    resetLineItems,
    totalQuantity,
    printQuantity,
    lineItemCalculations,
    lineItemPricing,
    lineItemTotals,
    avgMinutesPerBatch,
    hasPrinting,
    hasDevices
  } = useLineItems(deviceTypes);

  // ============================================
  // CALCULATIONS (custom hook)
  // ============================================
  const {
    basePrice,
    setupFee,
    designCosts,
    productionMetrics,
    quoteBreakdown,
    costFloorBreakdown,
    profitAnalysis
  } = useQuoteCalculations({
    totalQuantity,
    printQuantity,
    lineItemTotals,
    lineItemPricing,
    avgMinutesPerBatch,
    hasPrinting,
    hasDevices,
    numDesigns,
    designWaivers,
    turnaround,
    sampleRun,
    waiveSampleFee,
    shippingType,
    shopifyQuote,
    shippingMarkup,
    salesTaxRate,
    numPrinters
  });

  // ============================================
  // DERIVED VALUES
  // ============================================
  const isBelowMinimum = totalQuantity > 0 && totalQuantity < MINIMUM_ORDER_QUANTITY;

  // Filter quotes for history search
  const filteredQuotes = useMemo(() => {
    if (!historySearch.trim()) return savedQuotes;
    const search = historySearch.toLowerCase();
    return savedQuotes.filter(q =>
      q.clientName?.toLowerCase().includes(search) ||
      q.accountManager?.toLowerCase().includes(search) ||
      q.status?.toLowerCase().includes(search)
    );
  }, [savedQuotes, historySearch]);

  // Get unique customers with aggregated data
  const uniqueCustomers = useMemo(() => {
    const customers = {};
    savedQuotes.forEach(q => {
      if (q.clientName) {
        if (!customers[q.clientName]) {
          customers[q.clientName] = { name: q.clientName, quotes: [], totalValue: 0 };
        }
        customers[q.clientName].quotes.push(q);
        customers[q.clientName].totalValue += q.totalQuote || 0;
      }
    });
    return Object.values(customers).sort((a, b) => b.totalValue - a.totalValue);
  }, [savedQuotes]);

  // ============================================
  // DEVICE TYPE MANAGEMENT
  // ============================================
  const addDeviceType = useCallback((name, capacity, unitCost, pricingTiers = null) => {
    if (name.trim()) {
      const tiers = pricingTiers || generateDevicePricingTiers(unitCost);
      setRawDeviceTypes(prev => [...prev, { name: name.trim(), capacity, unitCost, pricingTiers: tiers }]);
      return true;
    }
    return false;
  }, [setRawDeviceTypes]);

  const updateDeviceType = useCallback((index, name, capacity, unitCost, pricingTiers = null) => {
    setRawDeviceTypes(prev => {
      const updated = [...prev];
      const existingTiers = updated[index]?.pricingTiers;
      updated[index] = { 
        name, 
        capacity, 
        unitCost, 
        pricingTiers: pricingTiers || existingTiers || generateDevicePricingTiers(unitCost)
      };
      return updated;
    });
  }, [setRawDeviceTypes]);

  const updateDevicePricingTiers = useCallback((index, pricingTiers) => {
    setRawDeviceTypes(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], pricingTiers };
      }
      return updated;
    });
  }, [setRawDeviceTypes]);

  const deleteDeviceType = useCallback((index) => {
    if (deviceTypes.length <= 1) return false;
    setRawDeviceTypes(prev => prev.filter((_, i) => i !== index));
    return true;
  }, [deviceTypes.length, setRawDeviceTypes]);

  // ============================================
  // ACCOUNT MANAGER MANAGEMENT
  // ============================================
  const addAccountManager = useCallback((name) => {
    if (name.trim() && !accountManagers.includes(name.trim())) {
      setAccountManagers(prev => [...prev, name.trim()]);
      return true;
    }
    return false;
  }, [accountManagers, setAccountManagers]);

  const deleteAccountManager = useCallback((name) => {
    const updated = accountManagers.filter(m => m !== name);
    setAccountManagers(updated);
    if (accountManager === name && updated.length > 0) {
      setAccountManager(updated[0]);
    }
  }, [accountManagers, accountManager, setAccountManagers]);

  // ============================================
  // QUOTE MANAGEMENT
  // ============================================
  const saveQuote = useCallback(() => {
    if (!clientName.trim()) {
      setSaveMessage('Please enter a client name first');
      setTimeout(() => setSaveMessage(''), 3000);
      return false;
    }

    const quoteData = generateQuoteData({
      currentQuoteId,
      clientName,
      accountManager,
      lineItems,
      deviceTypes,
      numDesigns,
      turnaround,
      sampleRun,
      waiveSampleFee,
      shippingType,
      shopifyQuote,
      shippingMarkup,
      salesTaxRate,
      designWaivers,
      numPrinters,
      totalQuantity,
      printQuantity,
      quoteBreakdown,
      costFloorBreakdown,
      profitAnalysis,
      productionMetrics,
      hasPrinting,
      hasDevices
    });

    const existingIndex = savedQuotes.findIndex(q => q.id === currentQuoteId);

    if (existingIndex >= 0) {
      const updated = [...savedQuotes];
      updated[existingIndex] = { ...quoteData, updatedAt: new Date().toISOString() };
      setSavedQuotes(updated);
      setSaveMessage('Quote updated!');
    } else {
      quoteData.id = `quote-${Date.now()}`;
      setCurrentQuoteId(quoteData.id);
      setSavedQuotes(prev => [quoteData, ...prev]);
      setSaveMessage('Quote saved!');
    }

    setTimeout(() => setSaveMessage(''), 3000);
    return true;
  }, [
    clientName, currentQuoteId, accountManager, lineItems, deviceTypes,
    numDesigns, turnaround, sampleRun, waiveSampleFee, shippingType,
    shopifyQuote, shippingMarkup, salesTaxRate, designWaivers, numPrinters,
    totalQuantity, printQuantity, quoteBreakdown, costFloorBreakdown, profitAnalysis,
    productionMetrics, hasPrinting, hasDevices, savedQuotes, setSavedQuotes
  ]);

  const loadQuote = useCallback((quote) => {
    setClientName(quote.clientName || '');
    setAccountManager(quote.accountManager || accountManagers[0]);

    // Load line items (handle both old single-device and new multi-device format)
    if (quote.lineItems && Array.isArray(quote.lineItems)) {
      setAllLineItems(quote.lineItems);
    } else {
      // Legacy single-device quote format
      setAllLineItems([{
        id: 'item-1',
        deviceIndex: quote.selectedDevice || 0,
        quantity: quote.quantity || 1000,
        serviceType: quote.supplyingDevices ? 'print-and-devices' : 'print-only',
        sides: quote.sides || 'single',
        glossFinish: quote.glossFinish || 'none',
        packaging: quote.packaging || 'loose'
      }]);
    }

    setNumDesigns(quote.numDesigns || 1);
    setTurnaround(quote.turnaround || 'normal');
    setSampleRun(quote.sampleRun !== false);
    setWaiveSampleFee(quote.waiveSampleFee || false);
    setShippingType(quote.shippingType || 'shopify');
    setShopifyQuote(quote.shopifyQuote || 0);
    setShippingMarkup(quote.shippingMarkup || 20);
    setSalesTaxRate(quote.salesTaxRate || 0);
    setDesignWaivers(quote.designWaivers || 0);
    setNumPrinters(quote.numPrinters || 3);
    setCurrentQuoteId(quote.id);
    setShowLoadDropdown(false);
    setShowHistory(false);
  }, [accountManagers, setAllLineItems]);

  const duplicateQuote = useCallback((quote) => {
    loadQuote(quote);
    setCurrentQuoteId(null);
    setClientName(quote.clientName + ' (Copy)');
  }, [loadQuote]);

  const deleteQuote = useCallback((quoteId) => {
    setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
    if (currentQuoteId === quoteId) {
      setCurrentQuoteId(null);
    }
  }, [currentQuoteId, setSavedQuotes]);

  const updateQuoteStatus = useCallback((quoteId, status) => {
    setSavedQuotes(prev => prev.map(q =>
      q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q
    ));
  }, [setSavedQuotes]);

  const newQuote = useCallback(() => {
    setClientName('');
    resetLineItems();
    setNumDesigns(1);
    setDesignWaivers(0);
    setTurnaround('normal');
    setSampleRun(true);
    setWaiveSampleFee(false);
    setShippingType('shopify');
    setShopifyQuote(0);
    setShippingMarkup(20);
    setSalesTaxRate(0);
    setNumPrinters(3);
    setCurrentQuoteId(null);
  }, [resetLineItems]);

  // ============================================
  // INVOICE GENERATION
  // ============================================
  const generateInvoice = useCallback(() => {
    const invoiceNumber = generateInvoiceNumber();
    const invoiceData = generateInvoiceData({
      clientName,
      accountManager,
      lineItemPricing,
      basePrice,
      totalQuantity,
      printQuantity,
      numDesigns,
      designCosts,
      turnaround,
      quoteBreakdown,
      salesTaxRate,
      hasPrinting,
      hasDevices
    });
    
    const html = generateInvoiceHTML({
      invoiceNumber,
      ...invoiceData
    });
    
    openInvoice(html, invoiceNumber);
  }, [
    clientName, accountManager, lineItemPricing, basePrice,
    totalQuantity, printQuantity, numDesigns, designCosts, turnaround,
    quoteBreakdown, salesTaxRate, hasPrinting, hasDevices
  ]);

  // ============================================
  // CSV EXPORT
  // ============================================
  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'Client', 'Account Manager', 'Total Quantity', 'Print Qty', 'Line Items', 'Total Quote', 'Cost Floor', 'Profit', 'Margin %', 'Status', 'Production Days', 'Has Printing', 'Has Devices'];
    const rows = savedQuotes.map(q => [
      new Date(q.createdAt).toLocaleDateString(),
      q.clientName,
      q.accountManager,
      q.totalQuantity || q.quantity,
      q.printQuantity || q.totalQuantity || q.quantity,
      q.lineItems?.length || 1,
      q.totalQuote?.toFixed(2),
      q.costFloor?.toFixed(2),
      q.profit?.toFixed(2),
      q.profitMargin?.toFixed(1),
      q.status,
      q.productionDays,
      q.hasPrinting !== false ? 'Yes' : 'No',
      q.hasDevices ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [savedQuotes]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    // Device types
    deviceTypes,
    addDeviceType,
    updateDeviceType,
    updateDevicePricingTiers,
    deleteDeviceType,
    
    // Account managers
    accountManagers,
    addAccountManager,
    deleteAccountManager,
    
    // Order settings
    clientName, setClientName,
    accountManager, setAccountManager,
    numDesigns, setNumDesigns,
    designWaivers, setDesignWaivers,
    turnaround, setTurnaround,
    sampleRun, setSampleRun,
    waiveSampleFee, setWaiveSampleFee,
    
    // Shipping & tax
    shippingType, setShippingType,
    shopifyQuote, setShopifyQuote,
    shippingMarkup, setShippingMarkup,
    salesTaxRate, setSalesTaxRate,
    
    // Printers
    numPrinters, setNumPrinters,
    
    // Line items
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    totalQuantity,
    printQuantity,
    lineItemCalculations,
    lineItemPricing,
    lineItemTotals,
    hasPrinting,
    hasDevices,
    
    // Calculations
    basePrice,
    setupFee,
    designCosts,
    productionMetrics,
    quoteBreakdown,
    costFloorBreakdown,
    profitAnalysis,
    
    // Derived values
    isBelowMinimum,
    
    // Quote management
    savedQuotes,
    currentQuoteId,
    saveMessage,
    saveQuote,
    loadQuote,
    duplicateQuote,
    deleteQuote,
    updateQuoteStatus,
    newQuote,
    filteredQuotes,
    uniqueCustomers,
    
    // Invoice & export
    generateInvoice,
    exportToCSV,
    
    // UI state
    showDeviceManager, setShowDeviceManager,
    showManagerEditor, setShowManagerEditor,
    showPrinterSettings, setShowPrinterSettings,
    showHistory, setShowHistory,
    showLoadDropdown, setShowLoadDropdown,
    showComparison, setShowComparison,
    showCustomerView, setShowCustomerView,
    comparisonQuote, setComparisonQuote,
    selectedCustomer, setSelectedCustomer,
    historySearch, setHistorySearch
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
}

/**
 * Custom hook to use the quote context
 * @returns {Object} Quote context value
 */
export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}

export default QuoteContext;
