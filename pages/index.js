import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Plus, Edit2, Trash2, Settings, FileText, Printer, Save, FolderOpen, History, GitCompare, Users, Download, X, Check, Clock, XCircle, Search } from 'lucide-react';

export default function PrintingQuoteTool() {
  // Device type management
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCapacity, setNewDeviceCapacity] = useState(80);

  // Account manager management
  const [accountManagers, setAccountManagers] = useState([]);
  const [showManagerEditor, setShowManagerEditor] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');

  // Printer settings
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [numPrinters, setNumPrinters] = useState(3);

  // Project Details
  const [clientName, setClientName] = useState('');
  const [accountManager, setAccountManager] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [quantity, setQuantity] = useState(1000);
  const [quantityInput, setQuantityInput] = useState('1000');
  const [numDesigns, setNumDesigns] = useState(1);
  const [sides, setSides] = useState('single');
  const [glossFinish, setGlossFinish] = useState('none');
  const [packaging, setPackaging] = useState('loose');
  const [turnaround, setTurnaround] = useState('normal');
  const [sampleRun, setSampleRun] = useState(true);
  const [waiveSampleFee, setWaiveSampleFee] = useState(false);
  
  // Shipping
  const [shippingType, setShippingType] = useState('shopify');
  const [shopifyQuote, setShopifyQuote] = useState(0);
  const [shippingMarkup, setShippingMarkup] = useState(20);
  const [salesTaxRate, setSalesTaxRate] = useState(0);

  // Design waivers
  const [designWaivers, setDesignWaivers] = useState(0);

  // Device supply
  const [supplyingDevices, setSupplyingDevices] = useState(false);
  const [deviceCost, setDeviceCost] = useState(0);
  const [deviceMarkup, setDeviceMarkup] = useState(30);

  // Quote management state
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonQuote, setComparisonQuote] = useState(null);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Default values
  const defaultDeviceTypes = [
    { name: '1mg Disposable', capacity: 88 },
    { name: '2mg Disposable', capacity: 77 },
    { name: 'MK Lighter', capacity: 80 }
  ];
  const defaultAccountManagers = ['Ryan', 'Kyle', 'Anthony', 'Clarence'];

  // Load device types from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('device-types');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeviceTypes(parsed.length > 0 ? parsed : defaultDeviceTypes);
      } else {
        setDeviceTypes(defaultDeviceTypes);
        localStorage.setItem('device-types', JSON.stringify(defaultDeviceTypes));
      }
    } catch (e) {
      console.error('Failed to load device types:', e);
      setDeviceTypes(defaultDeviceTypes);
    }
  }, []);

  // Save device types to localStorage whenever they change
  useEffect(() => {
    if (deviceTypes.length > 0) {
      try {
        localStorage.setItem('device-types', JSON.stringify(deviceTypes));
      } catch (e) {
        console.error('Failed to save device types:', e);
      }
    }
  }, [deviceTypes]);

  // Load account managers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('account-managers');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAccountManagers(parsed.length > 0 ? parsed : defaultAccountManagers);
        setAccountManager(parsed.length > 0 ? parsed[0] : defaultAccountManagers[0]);
      } else {
        setAccountManagers(defaultAccountManagers);
        setAccountManager(defaultAccountManagers[0]);
        localStorage.setItem('account-managers', JSON.stringify(defaultAccountManagers));
      }
    } catch (e) {
      console.error('Failed to load account managers:', e);
      setAccountManagers(defaultAccountManagers);
      setAccountManager(defaultAccountManagers[0]);
    }
  }, []);

  // Save account managers to localStorage whenever they change
  useEffect(() => {
    if (accountManagers.length > 0) {
      try {
        localStorage.setItem('account-managers', JSON.stringify(accountManagers));
      } catch (e) {
        console.error('Failed to save account managers:', e);
      }
    }
  }, [accountManagers]);

  // Load saved quotes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved-quotes');
      if (stored) {
        setSavedQuotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load quotes:', e);
    }
  }, []);

  // Save quotes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('saved-quotes', JSON.stringify(savedQuotes));
    } catch (e) {
      console.error('Failed to save quotes:', e);
    }
  }, [savedQuotes]);

  // Minimum order quantity constant
  const MINIMUM_ORDER_QUANTITY = 100;
  const isBelowMinimum = quantity > 0 && quantity < MINIMUM_ORDER_QUANTITY;

  // Handle quantity input change
  const handleQuantityInputChange = (value) => {
    setQuantityInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(Math.min(500000, numValue));
    }
  };

  const handleQuantitySliderChange = (value) => {
    const numValue = Number(value);
    setQuantity(numValue);
    setQuantityInput(numValue.toString());
  };

  const handleQuantityBlur = () => {
    if (quantityInput === '' || isNaN(parseInt(quantityInput, 10))) {
      setQuantityInput(quantity.toString());
    }
  };

  const handlePrinterChange = (value) => {
    const num = Math.max(1, Math.min(20, Number(value) || 1));
    setNumPrinters(num);
  };

  const addDeviceType = () => {
    if (newDeviceName.trim()) {
      setDeviceTypes([...deviceTypes, { name: newDeviceName, capacity: newDeviceCapacity }]);
      setNewDeviceName('');
      setNewDeviceCapacity(80);
    }
  };

  const updateDeviceType = (index, name, capacity) => {
    const updated = [...deviceTypes];
    updated[index] = { name, capacity };
    setDeviceTypes(updated);
    setEditingDevice(null);
  };

  const deleteDeviceType = (index) => {
    if (deviceTypes.length === 1) return;
    const updated = deviceTypes.filter((_, i) => i !== index);
    setDeviceTypes(updated);
    if (selectedDevice >= updated.length) {
      setSelectedDevice(updated.length - 1);
    }
  };

  const addAccountManager = () => {
    if (newManagerName.trim() && !accountManagers.includes(newManagerName.trim())) {
      setAccountManagers([...accountManagers, newManagerName.trim()]);
      setNewManagerName('');
    }
  };

  const deleteAccountManager = (name) => {
    const updated = accountManagers.filter(m => m !== name);
    setAccountManagers(updated);
    if (accountManager === name && updated.length > 0) {
      setAccountManager(updated[0]);
    }
  };

  // Get current device capacity
  const deviceCapacity = deviceTypes[selectedDevice]?.capacity || 80;

  // Auto-optimize number of printers based on job size
  const optimizedNumPrinters = useMemo(() => {
    const batchesNeeded = Math.ceil(quantity / deviceCapacity);
    const hasGloss = glossFinish !== 'none';
    const minutesPerBatch = hasGloss ? 45 : 35;
    const totalPrintMinutes = batchesNeeded * minutesPerBatch * (sides === 'double' ? 2 : 1);
    const productionHours = totalPrintMinutes / 60;
    
    // Auto-reduce printers for small jobs
    if (productionHours < 2) return 1;
    if (productionHours < 12) return Math.min(2, numPrinters);
    return numPrinters;
  }, [quantity, deviceCapacity, glossFinish, sides, numPrinters]);

  // PRODUCTION CALCULATIONS (using optimized printer count)
  const batchesNeeded = Math.ceil(quantity / deviceCapacity);
  const hasGloss = glossFinish !== 'none';
  const minutesPerBatch = hasGloss ? 45 : 35;
  const totalPrintMinutes = batchesNeeded * minutesPerBatch * (sides === 'double' ? 2 : 1);
  const productionHours = totalPrintMinutes / 60;
  
  const hoursPerWorkday = 6;
  const batchesPerPrinterPerDay = Math.floor((hoursPerWorkday * 60) / minutesPerBatch);
  const totalBatchesPerDay = batchesPerPrinterPerDay * optimizedNumPrinters;
  const productionDays = Math.ceil(batchesNeeded / totalBatchesPerDay);
  const effectiveProductionHours = productionHours / optimizedNumPrinters;

  // PRICING CALCULATIONS
  const basePrice = useMemo(() => {
    if (quantity >= 10000) return 0.66;
    if (quantity >= 3000) return 0.84;
    if (quantity >= 1000) return 1.05;
    if (quantity >= 500) return 1.10;
    return 1.20;
  }, [quantity]);

  const setupFee = quantity < 1000 ? 150 : 0;

  const glossCost = useMemo(() => {
    if (glossFinish === 'single-side') return 0.07 * quantity;
    if (glossFinish === 'both-sides') return 0.12 * quantity;
    return 0;
  }, [glossFinish, quantity]);

  const doubleSidedCost = sides === 'double' ? 0.31 * quantity : 0;

  const { includedDesigns, extraDesigns, extraDesignCost } = useMemo(() => {
    const included = Math.floor(quantity / 1000);
    const extra = Math.max(0, numDesigns - included);
    const waivedDesigns = Math.min(designWaivers, extra);
    const chargeableDesigns = extra - waivedDesigns;
    const designCost = chargeableDesigns * 35;
    return { includedDesigns: included, extraDesigns: extra, extraDesignCost: designCost };
  }, [quantity, numDesigns, designWaivers]);

  const packagingCost = useMemo(() => {
    if (packaging === 'loose') return 0;
    if (packaging === 'sticker-mania') return 0.11 * quantity;
    return 0.16 * quantity;
  }, [packaging, quantity]);

  const baseQuote = (basePrice * quantity) + setupFee + glossCost + doubleSidedCost + extraDesignCost + packagingCost;
  
  // Calculate device unit price rounded to 2 decimal places for display AND calculation consistency
  const deviceUnitPrice = supplyingDevices ? Math.round(deviceCost * (1 + deviceMarkup / 100) * 100) / 100 : 0;
  const deviceSupplyCost = supplyingDevices ? deviceUnitPrice * quantity : 0;
  const subtotalBeforeTurnaround = baseQuote + deviceSupplyCost;

  const turnaroundFee = useMemo(() => {
    if (turnaround === 'rush') return subtotalBeforeTurnaround * 0.12;
    if (turnaround === 'weekend') return subtotalBeforeTurnaround * 0.20;
    return 0;
  }, [turnaround, subtotalBeforeTurnaround]);

  const sampleFee = useMemo(() => {
    if (!sampleRun) return 0;
    if (waiveSampleFee) return 0;
    if (quantity >= 5000) return 0;
    return 65;
  }, [sampleRun, waiveSampleFee, quantity]);

  const subtotal = subtotalBeforeTurnaround + turnaroundFee + sampleFee;
  const salesTax = subtotal * (salesTaxRate / 100);
  const shippingCost = shippingType === 'pickup' ? 0 : shopifyQuote * (1 + shippingMarkup / 100);
  const totalQuote = subtotal + salesTax + shippingCost;

  // COST FLOOR CALCULATIONS
  const fileSetupCost = numDesigns * 10;
  const machineSetupCost = productionDays * 23;
  const samplePrintingCost = sampleRun && !waiveSampleFee ? 0 : 23;
  const preProductionCost = fileSetupCost + machineSetupCost + samplePrintingCost;

  const numSidesPrinted = sides === 'double' ? 2 : 1;
  const baseCMYKInkCost = 0.03 * numSidesPrinted * quantity;
  let glossInkCost = glossFinish === 'single-side' ? 0.01 * quantity : glossFinish === 'both-sides' ? 0.02 * quantity : 0;
  const inkCost = baseCMYKInkCost + glossInkCost;
  const productionLaborCost = effectiveProductionHours * 23;
  const productionCost = inkCost + productionLaborCost;

  const repackagingCost = useMemo(() => packaging === 'loose' ? 0 : 0.06 * quantity, [packaging, quantity]);
  const shippingStagingCost = (40 / 60) * 20;
  const postProductionCost = repackagingCost + shippingStagingCost;

  const deviceCostFloor = supplyingDevices ? deviceCost * quantity : 0;
  const costFloor = preProductionCost + productionCost + postProductionCost + deviceCostFloor;

  const profit = totalQuote - costFloor;
  const profitMargin = totalQuote > 0 ? (profit / totalQuote) * 100 : 0;

  // Get current quote data object
  const getCurrentQuoteData = () => ({
    id: currentQuoteId || `quote-${Date.now()}`,
    clientName,
    accountManager,
    selectedDevice,
    deviceTypeName: deviceTypes[selectedDevice]?.name || '',
    quantity,
    numDesigns,
    sides,
    glossFinish,
    packaging,
    turnaround,
    sampleRun,
    waiveSampleFee,
    shippingType,
    shopifyQuote,
    shippingMarkup,
    salesTaxRate,
    designWaivers,
    supplyingDevices,
    deviceCost,
    deviceMarkup,
    numPrinters,
    // Calculated values
    totalQuote,
    costFloor,
    profit,
    profitMargin,
    productionDays,
    // Metadata
    createdAt: new Date().toISOString(),
    status: 'pending'
  });

  // Generate PDF Invoice
  const generatePDFInvoice = () => {
    const date = new Date();
    const invoiceNum = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const lineItems = [];
    lineItems.push({ desc: `Base Printing (${quantity.toLocaleString()} × ${basePrice.toFixed(2)})`, amount: (basePrice * quantity).toFixed(2) });
    
    if (setupFee > 0) lineItems.push({ desc: 'Setup Fee', amount: setupFee.toFixed(2) });
    if (glossCost > 0) lineItems.push({ desc: `Gloss Finish (${glossFinish === 'both-sides' ? 'both sides' : 'one side'})`, amount: glossCost.toFixed(2) });
    if (doubleSidedCost > 0) lineItems.push({ desc: 'Double-sided Printing', amount: doubleSidedCost.toFixed(2) });
    if (extraDesignCost > 0) lineItems.push({ desc: `Extra Designs (${extraDesigns - designWaivers} × $35)`, amount: extraDesignCost.toFixed(2) });
    if (packagingCost > 0) lineItems.push({ desc: 'Packaging', amount: packagingCost.toFixed(2) });
    if (supplyingDevices) lineItems.push({ desc: `Devices (${quantity.toLocaleString()} × $${deviceUnitPrice.toFixed(2)})`, amount: deviceSupplyCost.toFixed(2) });
    if (turnaroundFee > 0) lineItems.push({ desc: `${turnaround === 'rush' ? 'Rush' : 'Weekend'} Turnaround Fee`, amount: turnaroundFee.toFixed(2) });
    if (sampleFee > 0) lineItems.push({ desc: `Sample Run${quantity >= 5000 ? ' (credited)' : ''}`, amount: sampleFee.toFixed(2) });
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceNum}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            @page { margin: 0.5in; }
          }
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 36px; margin: 0 0 20px 0; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info, .invoice-info { flex: 1; }
          .invoice-info { text-align: right; }
          .client-info { margin-bottom: 30px; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
          .details-section { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .amount { text-align: right; }
          .totals { margin-left: auto; width: 300px; margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .totals-row.subtotal { border-top: 1px solid #ddd; font-weight: bold; }
          .totals-row.total { border-top: 2px solid #333; font-size: 18px; font-weight: bold; padding-top: 12px; }
          .per-unit { font-size: 12px; font-style: italic; color: #666; }
          .footer { text-align: center; margin-top: 50px; font-style: italic; color: #666; }
          .print-button { background: #10b981; color: white; border: none; padding: 15px 30px; font-size: 16px; border-radius: 8px; cursor: pointer; margin: 20px auto; display: block; }
          .print-button:hover { background: #059669; }
          .print-instructions { text-align: center; color: #666; font-size: 14px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
          <p class="print-instructions">Click the button above, then select "Save as PDF" as your printer to download a PDF file.</p>
        </div>
        <div class="header"><h1>INVOICE</h1></div>
        <div class="info-section">
          <div class="company-info">
            <div style="font-weight: bold; font-size: 16px;">Sticker Mania</div>
            <div>info@stickermania818.com</div>
            <div>https://stickermania.us/</div>
          </div>
          <div class="invoice-info">
            <div><strong>Invoice #:</strong> ${invoiceNum}</div>
            <div><strong>Date:</strong> ${date.toLocaleDateString()}</div>
            <div><strong>Account Manager:</strong> ${accountManager}</div>
          </div>
        </div>
        <div class="client-info">
          <div class="section-title">Bill To:</div>
          <div>${clientName}</div>
        </div>
        <div class="details-section">
          <div class="section-title" style="margin-bottom: 10px;">Project Details</div>
          <div class="details-grid">
            <div><strong>Device Type:</strong> ${deviceTypes[selectedDevice]?.name || 'N/A'}</div>
            <div><strong>Quantity:</strong> ${quantity.toLocaleString()} units</div>
            <div><strong>Designs:</strong> ${numDesigns} (${includedDesigns} included)</div>
            <div><strong>Finish:</strong> ${glossFinish === 'none' ? 'No Gloss' : glossFinish === 'single-side' ? 'Gloss one side' : 'Gloss both sides'}</div>
            <div><strong>Sides:</strong> ${sides === 'single' ? 'Single-sided' : 'Double-sided'}</div>
            <div><strong>Packaging:</strong> ${packaging === 'loose' ? 'Loose Bulk' : packaging === 'sticker-mania' ? 'Sticker Mania' : 'Client Packaging'}</div>
            <div><strong>Turnaround:</strong> ${turnaround === 'normal' ? 'Normal' : turnaround === 'rush' ? 'Rush' : 'Weekend'}</div>
          </div>
        </div>
        <table>
          <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
          <tbody>${lineItems.map(item => `<tr><td>${item.desc}</td><td class="amount">$${item.amount}</td></tr>`).join('')}</tbody>
        </table>
        <div class="totals">
          <div class="totals-row subtotal"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="totals-row per-unit"><span>Per unit:</span><span>$${(subtotal / quantity).toFixed(3)}/device</span></div>
          ${salesTax > 0 ? `<div class="totals-row"><span>Sales Tax (${salesTaxRate}%):</span><span>$${salesTax.toFixed(2)}</span></div>` : ''}
          ${shippingCost > 0 ? `<div class="totals-row"><span>Shipping:</span><span>$${shippingCost.toFixed(2)}</span></div>` : ''}
          <div class="totals-row total"><span>TOTAL:</span><span>$${totalQuote.toFixed(2)}</span></div>
        </div>
        <div class="footer">Thank you for your business!</div>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
    } else {
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNum}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Invoice downloaded as HTML file. Open it in your browser and use Print > Save as PDF.');
    }
  };

  // Save current quote
  const saveQuote = () => {
    if (!clientName.trim()) {
      setSaveMessage('Please enter a client name first');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    const quoteData = getCurrentQuoteData();
    
    // Check if updating existing quote
    const existingIndex = savedQuotes.findIndex(q => q.id === currentQuoteId);
    
    if (existingIndex >= 0) {
      const updated = [...savedQuotes];
      updated[existingIndex] = { ...quoteData, updatedAt: new Date().toISOString() };
      setSavedQuotes(updated);
      setSaveMessage('Quote updated!');
    } else {
      quoteData.id = `quote-${Date.now()}`;
      setCurrentQuoteId(quoteData.id);
      setSavedQuotes([quoteData, ...savedQuotes]);
      setSaveMessage('Quote saved!');
    }
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Load a quote
  const loadQuote = (quote) => {
    setClientName(quote.clientName || '');
    setAccountManager(quote.accountManager || accountManagers[0]);
    setSelectedDevice(quote.selectedDevice || 0);
    setQuantity(quote.quantity || 1000);
    setQuantityInput((quote.quantity || 1000).toString());
    setNumDesigns(quote.numDesigns || 1);
    setSides(quote.sides || 'single');
    setGlossFinish(quote.glossFinish || 'none');
    setPackaging(quote.packaging || 'loose');
    setTurnaround(quote.turnaround || 'normal');
    setSampleRun(quote.sampleRun !== false);
    setWaiveSampleFee(quote.waiveSampleFee || false);
    setShippingType(quote.shippingType || 'shopify');
    setShopifyQuote(quote.shopifyQuote || 0);
    setShippingMarkup(quote.shippingMarkup || 20);
    setSalesTaxRate(quote.salesTaxRate || 0);
    setDesignWaivers(quote.designWaivers || 0);
    setSupplyingDevices(quote.supplyingDevices || false);
    setDeviceCost(quote.deviceCost || 0);
    setDeviceMarkup(quote.deviceMarkup || 30);
    setNumPrinters(quote.numPrinters || 3);
    setCurrentQuoteId(quote.id);
    setShowLoadDropdown(false);
    setShowHistory(false);
  };

  // Duplicate a quote (load without ID)
  const duplicateQuote = (quote) => {
    loadQuote(quote);
    setCurrentQuoteId(null);
    setClientName(quote.clientName + ' (Copy)');
  };

  // Delete a quote
  const deleteQuote = (quoteId) => {
    setSavedQuotes(savedQuotes.filter(q => q.id !== quoteId));
    if (currentQuoteId === quoteId) {
      setCurrentQuoteId(null);
    }
  };

  // Update quote status
  const updateQuoteStatus = (quoteId, status) => {
    setSavedQuotes(savedQuotes.map(q => 
      q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q
    ));
  };

  // Clear current quote (new quote)
  const newQuote = () => {
    setClientName('');
    setQuantity(1000);
    setQuantityInput('1000');
    setNumDesigns(1);
    setSides('single');
    setGlossFinish('none');
    setPackaging('loose');
    setTurnaround('normal');
    setSampleRun(true);
    setWaiveSampleFee(false);
    setShippingType('shopify');
    setShopifyQuote(0);
    setShippingMarkup(20);
    setSalesTaxRate(0);
    setDesignWaivers(0);
    setSupplyingDevices(false);
    setDeviceCost(0);
    setDeviceMarkup(30);
    setNumPrinters(3);
    setCurrentQuoteId(null);
  };

  // Get unique customers
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

  // Filter quotes for history
  const filteredQuotes = useMemo(() => {
    if (!historySearch.trim()) return savedQuotes;
    const search = historySearch.toLowerCase();
    return savedQuotes.filter(q => 
      q.clientName?.toLowerCase().includes(search) ||
      q.accountManager?.toLowerCase().includes(search) ||
      q.status?.toLowerCase().includes(search)
    );
  }, [savedQuotes, historySearch]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Account Manager', 'Quantity', 'Device', 'Total Quote', 'Cost Floor', 'Profit', 'Margin %', 'Status', 'Production Days'];
    const rows = savedQuotes.map(q => [
      new Date(q.createdAt).toLocaleDateString(),
      q.clientName,
      q.accountManager,
      q.quantity,
      q.deviceTypeName,
      q.totalQuote?.toFixed(2),
      q.costFloor?.toFixed(2),
      q.profit?.toFixed(2),
      q.profitMargin?.toFixed(1),
      q.status,
      q.productionDays
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status badge component
  const StatusBadge = ({ status, small = false }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    const icons = {
      pending: <Clock className={small ? "w-3 h-3" : "w-4 h-4"} />,
      won: <Check className={small ? "w-3 h-3" : "w-4 h-4"} />,
      lost: <XCircle className={small ? "w-3 h-3" : "w-4 h-4"} />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    );
  };

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
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Editing</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Quote Management Buttons */}
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
                      <div key={quote.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 cursor-pointer" onClick={() => loadQuote(quote)}>
                            <p className="font-medium text-sm">{quote.clientName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(quote.createdAt).toLocaleDateString()} • ${quote.totalQuote?.toFixed(2)}
                            </p>
                          </div>
                          <StatusBadge status={quote.status} small />
                        </div>
                      </div>
                    ))}
                    {savedQuotes.length > 10 && (
                      <div className="p-2 text-center text-sm text-blue-600 cursor-pointer hover:bg-blue-50" onClick={() => { setShowHistory(true); setShowLoadDropdown(false); }}>
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
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${saveMessage.includes('Please') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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

          {/* Printer Settings Panel */}
          {showPrinterSettings && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5 text-green-600" />
                Printer Settings
              </h3>
              <div className="space-y-4">
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
                    Auto-optimized to {optimizedNumPrinters} printer{optimizedNumPrinters !== 1 ? 's' : ''} for this order size
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Production Impact:</span></p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Batches/printer/day:</span> <span className="ml-2 font-medium">{batchesPerPrinterPerDay}</span></div>
                    <div><span className="text-gray-500">Total batches/day:</span> <span className="ml-2 font-medium">{totalBatchesPerDay}</span></div>
                    <div><span className="text-gray-500">Batches needed:</span> <span className="ml-2 font-medium">{batchesNeeded}</span></div>
                    <div><span className="text-gray-500">Est. days:</span> <span className="ml-2 font-medium text-green-600">{productionDays}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manager Editor */}
          {showManagerEditor && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">Account Managers</h3>
              <div className="space-y-2 mb-4">
                {accountManagers.map((manager, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{manager}</span>
                    <button onClick={() => deleteAccountManager(manager)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="New manager name" value={newManagerName} onChange={(e) => setNewManagerName(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                <button onClick={addAccountManager} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          )}

          {/* Device Manager */}
          {showDeviceManager && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Device Type Manager</h3>
              <div className="space-y-2 mb-4">
                {deviceTypes.map((device, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    {editingDevice === index ? (
                      <>
                        <input type="text" value={device.name} onChange={(e) => { const updated = [...deviceTypes]; updated[index].name = e.target.value; setDeviceTypes(updated); }} className="flex-1 px-2 py-1 border rounded" />
                        <input type="number" value={device.capacity} onChange={(e) => { const updated = [...deviceTypes]; updated[index].capacity = Number(e.target.value); setDeviceTypes(updated); }} className="w-20 px-2 py-1 border rounded" />
                        <button onClick={() => updateDeviceType(index, device.name, device.capacity)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{device.name}</span>
                        <span className="text-sm text-gray-600">{device.capacity}/batch</span>
                        <button onClick={() => setEditingDevice(index)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteDeviceType(index)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="New device name" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                <input type="number" placeholder="Capacity" value={newDeviceCapacity} onChange={(e) => setNewDeviceCapacity(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
                <button onClick={addDeviceType} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><Plus className="w-4 h-4" /> Add</button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Project Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter client name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Manager</label>
                <select value={accountManager} onChange={(e) => setAccountManager(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {accountManagers.map((manager, index) => (<option key={index} value={manager}>{manager}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select value={selectedDevice} onChange={(e) => setSelectedDevice(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {deviceTypes.map((device, index) => (<option key={index} value={index}>{device.name} ({device.capacity}/batch)</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity: {quantity.toLocaleString()} units
                  {isBelowMinimum && <span className="ml-2 text-amber-600 text-xs font-semibold">(Below minimum)</span>}
                </label>
                <input type="range" min="1" max="500000" step="1" value={quantity} onChange={(e) => handleQuantitySliderChange(e.target.value)} className="w-full" />
                <input type="text" inputMode="numeric" value={quantityInput} onChange={(e) => handleQuantityInputChange(e.target.value)} onBlur={handleQuantityBlur} className={`w-full mt-2 px-3 py-2 border rounded-lg ${isBelowMinimum ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`} />
                <p className="text-xs text-gray-500 mt-1">Minimum order quantity: {MINIMUM_ORDER_QUANTITY} units</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of SKUs/Designs</label>
                <input type="number" min="1" max="1000" value={numDesigns} onChange={(e) => setNumDesigns(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <p className="text-sm text-gray-500 mt-1">{includedDesigns} design{includedDesigns !== 1 ? 's' : ''} included (1 per 1,000 units){extraDesigns > 0 && ` • ${extraDesigns} extra @ $35 each`}</p>
              </div>

              {extraDesigns > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of extra designs to waive fee for</label>
                  <input
                    type="number"
                    min="0"
                    max={extraDesigns}
                    value={designWaivers}
                    onChange={(e) => setDesignWaivers(Math.min(Number(e.target.value), extraDesigns))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gloss Finish</label>
                <select value={glossFinish} onChange={(e) => setGlossFinish(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="none">No Gloss</option>
                  <option value="single-side">One side (+$0.07/device)</option>
                  <option value="both-sides" disabled={sides === 'single'}>Both sides (+$0.12/device)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Sides</label>
                <select value={sides} onChange={(e) => { setSides(e.target.value); if (e.target.value === 'single' && glossFinish === 'both-sides') setGlossFinish('single-side'); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="single">Single-sided</option>
                  <option value="double">Double-sided (+$0.31/device)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Packaging</label>
                <select value={packaging} onChange={(e) => setPackaging(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="loose">Loose Bulk (included)</option>
                  <option value="sticker-mania">Sticker Mania packaging (+$0.11)</option>
                  <option value="client">Client packaging (+$0.16)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turnaround</label>
                <select value={turnaround} onChange={(e) => setTurnaround(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="normal">Normal</option>
                  <option value="rush">48-72 hour rush (+12%)</option>
                  <option value="weekend">Weekend/overnight (+20%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="sample" checked={sampleRun} onChange={(e) => setSampleRun(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="sample" className="text-sm font-medium text-gray-700">Pre-production sample run ($65)</label>
                </div>
                {sampleRun && (
                  <div className="ml-7 flex items-center gap-3">
                    <input type="checkbox" id="waive-sample" checked={waiveSampleFee} onChange={(e) => setWaiveSampleFee(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="waive-sample" className="text-sm text-gray-600">Waive sample fee</label>
                  </div>
                )}
              </div>

              {/* Shipping Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Shipping</label>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="shopify"
                    checked={shippingType === 'shopify'}
                    onChange={() => setShippingType('shopify')}
                    className="w-4 h-4"
                  />
                  <label htmlFor="shopify" className="text-sm text-gray-700">Shopify calculated shipping</label>
                </div>
                {shippingType === 'shopify' && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Base Shopify quote ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100000"
                        value={shopifyQuote}
                        onChange={(e) => setShopifyQuote(Math.min(100000, Math.max(0, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Markup (%)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={shippingMarkup}
                        onChange={(e) => setShippingMarkup(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="pickup"
                    checked={shippingType === 'pickup'}
                    onChange={() => setShippingType('pickup')}
                    className="w-4 h-4"
                  />
                  <label htmlFor="pickup" className="text-sm text-gray-700">Free local pickup (LA)</label>
                </div>
              </div>

              {/* Sales Tax Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={salesTaxRate}
                  onChange={(e) => setSalesTaxRate(Math.min(20, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Device Supply Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="supply-devices"
                    checked={supplyingDevices}
                    onChange={(e) => setSupplyingDevices(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="supply-devices" className="text-sm font-medium text-gray-700">We are supplying devices</label>
                </div>
                {supplyingDevices && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Device cost per unit ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={deviceCost}
                        onChange={(e) => setDeviceCost(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Markup (%)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="200"
                        value={deviceMarkup}
                        onChange={(e) => setDeviceMarkup(Math.min(200, Math.max(0, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Calculations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Calculations</h2>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Tier</h3>
                <div className="text-sm text-blue-800">
                  <p>Base Price: ${basePrice.toFixed(2)} per unit</p>
                  {setupFee > 0 && <p>Setup Fee: ${setupFee.toFixed(2)}</p>}
                  <p className="text-xs mt-2 text-blue-600">Production: {productionDays} day{productionDays !== 1 ? 's' : ''} • {batchesNeeded} batch{batchesNeeded !== 1 ? 'es' : ''} • {deviceCapacity}/batch • {optimizedNumPrinters} printer{optimizedNumPrinters !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Project Quote</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Base ({quantity.toLocaleString()} × ${basePrice.toFixed(2)}):</span><span className="font-medium">${(basePrice * quantity).toFixed(2)}</span></div>
                  {setupFee > 0 && <div className="flex justify-between"><span>Setup Fee:</span><span className="font-medium">${setupFee.toFixed(2)}</span></div>}
                  {glossCost > 0 && <div className="flex justify-between"><span>Gloss finish ({glossFinish === 'both-sides' ? 'both sides' : 'one side'}):</span><span className="font-medium">${glossCost.toFixed(2)}</span></div>}
                  {doubleSidedCost > 0 && <div className="flex justify-between"><span>Double-sided:</span><span className="font-medium">${doubleSidedCost.toFixed(2)}</span></div>}
                  {extraDesignCost > 0 && <div className="flex justify-between"><span>Extra designs ({extraDesigns - designWaivers} × $35):</span><span className="font-medium">${extraDesignCost.toFixed(2)}</span></div>}
                  {packagingCost > 0 && <div className="flex justify-between"><span>Packaging:</span><span className="font-medium">${packagingCost.toFixed(2)}</span></div>}
                  {deviceSupplyCost > 0 && <div className="flex justify-between"><span>Devices ({quantity.toLocaleString()} × ${deviceUnitPrice.toFixed(2)}):</span><span className="font-medium">${deviceSupplyCost.toFixed(2)}</span></div>}
                  {turnaroundFee > 0 && <div className="flex justify-between"><span>Turnaround fee ({turnaround === 'rush' ? '12%' : '20%'}):</span><span className="font-medium">${turnaroundFee.toFixed(2)}</span></div>}
                  {sampleFee > 0 && <div className="flex justify-between"><span>Sample run{quantity >= 5000 ? ' (credited)' : ''}:</span><span className="font-medium">${sampleFee.toFixed(2)}</span></div>}
                  <div className="border-t border-green-300 pt-2 flex justify-between font-semibold"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-green-700 italic"><span>Per unit cost:</span><span>${(subtotal / quantity).toFixed(3)}/device</span></div>
                  {salesTax > 0 && <div className="flex justify-between"><span>Sales Tax ({salesTaxRate}%):</span><span className="font-medium">${salesTax.toFixed(2)}</span></div>}
                  {shippingCost > 0 && <div className="flex justify-between"><span>Shipping:</span><span className="font-medium">${shippingCost.toFixed(2)}</span></div>}
                  <div className="border-t-2 border-green-300 pt-2 flex justify-between text-base font-bold text-green-900"><span>Total Quote:</span><span>${totalQuote.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Cost Floor</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  {/* Pre-Production */}
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Pre-Production:</p>
                    <div className="ml-3 space-y-1">
                      <div className="flex justify-between">
                        <span>File setup ({numDesigns} design{numDesigns !== 1 ? 's' : ''}):</span>
                        <span>${fileSetupCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Machine setup ({productionDays} day{productionDays !== 1 ? 's' : ''}):</span>
                        <span>${machineSetupCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sample printing:</span>
                        <span>${samplePrintingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Subtotal:</span>
                        <span>${preProductionCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Production */}
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Production:</p>
                    <div className="ml-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Ink - White-CMYK (3¢ × {numSidesPrinted} side{numSidesPrinted > 1 ? 's' : ''}):</span>
                        <span>${baseCMYKInkCost.toFixed(2)}</span>
                      </div>
                      {glossInkCost > 0 && (
                        <div className="flex justify-between">
                          <span>Ink - Gloss ({glossFinish === 'both-sides' ? '1¢ × 2 sides' : '1¢ × 1 side'}):</span>
                          <span>${glossInkCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Labor ({effectiveProductionHours.toFixed(1)}hrs @ $23/hr):</span>
                        <span>${productionLaborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Subtotal:</span>
                        <span>${productionCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post-Production */}
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Post-Production:</p>
                    <div className="ml-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Repackaging:</span>
                        <span>${repackagingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping/staging:</span>
                        <span>${shippingStagingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Subtotal:</span>
                        <span>${postProductionCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Costs */}
                  {supplyingDevices && (
                    <div className="flex justify-between">
                      <span>Device costs:</span>
                      <span className="font-medium">${deviceCostFloor.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-red-300 pt-2 flex justify-between text-base font-bold text-red-900">
                    <span>Total Cost Floor:</span>
                    <span>${costFloor.toFixed(2)}</span>
                  </div>
                </div>
              </div>

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
                      <span>${profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span>Profit Margin:</span>
                      <span className={profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}>{profitMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Per Unit Analysis</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Cost per unit:</span>
                    <span className="font-medium">${(costFloor / quantity).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per unit:</span>
                    <span className="font-medium">${(totalQuote / quantity).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit per unit:</span>
                    <span className="font-medium">${(profit / quantity).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Invoice Button */}
          {clientName && (
            <div className="mt-6 flex justify-center">
              <button onClick={generatePDFInvoice} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg">
                <FileText className="w-6 h-6" />
                Generate PDF Invoice
              </button>
            </div>
          )}
        </div>

        {/* Quote History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2"><History className="w-6 h-6" /> Quote History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-indigo-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search by client, manager, or status..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
              </div>
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
                          <td className="p-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{quote.clientName}</td>
                          <td className="p-3">{quote.accountManager}</td>
                          <td className="p-3 text-right">{quote.quantity?.toLocaleString()}</td>
                          <td className="p-3 text-right font-medium">${quote.totalQuote?.toFixed(2)}</td>
                          <td className="p-3 text-right"><span className={quote.profitMargin >= 30 ? 'text-green-600' : quote.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}>{quote.profitMargin?.toFixed(1)}%</span></td>
                          <td className="p-3 text-center">
                            <select value={quote.status || 'pending'} onChange={(e) => updateQuoteStatus(quote.id, e.target.value)} className="text-xs border rounded px-2 py-1">
                              <option value="pending">Pending</option>
                              <option value="won">Won</option>
                              <option value="lost">Lost</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => loadQuote(quote)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Load"><FolderOpen className="w-4 h-4" /></button>
                              <button onClick={() => duplicateQuote(quote)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Duplicate"><Plus className="w-4 h-4" /></button>
                              <button onClick={() => { setComparisonQuote(quote); setShowComparison(true); }} className="p-1 text-pink-600 hover:bg-pink-50 rounded" title="Compare"><GitCompare className="w-4 h-4" /></button>
                              <button onClick={() => deleteQuote(quote.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
                {savedQuotes.length} total quotes • Won: {savedQuotes.filter(q => q.status === 'won').length} • Lost: {savedQuotes.filter(q => q.status === 'lost').length} • Pending: {savedQuotes.filter(q => !q.status || q.status === 'pending').length}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-pink-50">
                <h2 className="text-xl font-bold text-pink-900 flex items-center gap-2"><GitCompare className="w-6 h-6" /> Compare Quotes</h2>
                <button onClick={() => { setShowComparison(false); setComparisonQuote(null); }} className="p-2 hover:bg-pink-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Quote */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-bold text-blue-900 mb-4">Current Quote</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Client:</span> <span className="font-medium">{clientName || '(Not set)'}</span></p>
                      <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{quantity.toLocaleString()}</span></p>
                      <p><span className="text-gray-600">Device:</span> <span className="font-medium">{deviceTypes[selectedDevice]?.name}</span></p>
                      <p><span className="text-gray-600">Sides:</span> <span className="font-medium">{sides}</span></p>
                      <p><span className="text-gray-600">Gloss:</span> <span className="font-medium">{glossFinish}</span></p>
                      <p><span className="text-gray-600">Turnaround:</span> <span className="font-medium">{turnaround}</span></p>
                      <p><span className="text-gray-600">Printers:</span> <span className="font-medium">{optimizedNumPrinters} (of {numPrinters})</span></p>
                      <hr className="my-3" />
                      <p className="text-lg"><span className="text-gray-600">Total Quote:</span> <span className="font-bold text-green-600">${totalQuote.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Cost Floor:</span> <span className="font-medium">${costFloor.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Profit:</span> <span className="font-medium">${profit.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Margin:</span> <span className={`font-bold ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{profitMargin.toFixed(1)}%</span></p>
                      <p><span className="text-gray-600">Production:</span> <span className="font-medium">{productionDays} day{productionDays !== 1 ? 's' : ''}</span></p>
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
                            <div key={quote.id} onClick={() => setComparisonQuote(quote)} className="p-3 bg-white rounded border cursor-pointer hover:border-pink-400">
                              <p className="font-medium">{quote.clientName}</p>
                              <p className="text-xs text-gray-500">{new Date(quote.createdAt).toLocaleDateString()} • ${quote.totalQuote?.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{comparisonQuote.clientName}</span>
                          <button onClick={() => setComparisonQuote(null)} className="text-xs text-pink-600 hover:underline">Change</button>
                        </div>
                        <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{comparisonQuote.quantity?.toLocaleString()}</span></p>
                        <p><span className="text-gray-600">Device:</span> <span className="font-medium">{comparisonQuote.deviceTypeName}</span></p>
                        <p><span className="text-gray-600">Sides:</span> <span className="font-medium">{comparisonQuote.sides}</span></p>
                        <p><span className="text-gray-600">Gloss:</span> <span className="font-medium">{comparisonQuote.glossFinish}</span></p>
                        <p><span className="text-gray-600">Turnaround:</span> <span className="font-medium">{comparisonQuote.turnaround}</span></p>
                        <p><span className="text-gray-600">Printers:</span> <span className="font-medium">{comparisonQuote.numPrinters}</span></p>
                        <hr className="my-3" />
                        <p className="text-lg"><span className="text-gray-600">Total Quote:</span> <span className="font-bold text-green-600">${comparisonQuote.totalQuote?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Cost Floor:</span> <span className="font-medium">${comparisonQuote.costFloor?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Profit:</span> <span className="font-medium">${comparisonQuote.profit?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Margin:</span> <span className={`font-bold ${comparisonQuote.profitMargin >= 30 ? 'text-green-600' : comparisonQuote.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{comparisonQuote.profitMargin?.toFixed(1)}%</span></p>
                        <p><span className="text-gray-600">Production:</span> <span className="font-medium">{comparisonQuote.productionDays} day{comparisonQuote.productionDays !== 1 ? 's' : ''}</span></p>
                        
                        {/* Difference Summary */}
                        <hr className="my-3" />
                        <h4 className="font-semibold text-pink-800">Difference</h4>
                        <p><span className="text-gray-600">Quote:</span> <span className={`font-medium ${totalQuote - comparisonQuote.totalQuote >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalQuote - comparisonQuote.totalQuote >= 0 ? '+' : ''}${(totalQuote - comparisonQuote.totalQuote).toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Margin:</span> <span className={`font-medium ${profitMargin - comparisonQuote.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profitMargin - comparisonQuote.profitMargin >= 0 ? '+' : ''}{(profitMargin - comparisonQuote.profitMargin).toFixed(1)}%</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer View Modal */}
        {showCustomerView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-cyan-50">
                <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2"><Users className="w-6 h-6" /> Customer Management</h2>
                <button onClick={() => { setShowCustomerView(false); setSelectedCustomer(null); }} className="p-2 hover:bg-cyan-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {!selectedCustomer ? (
                  <div>
                    <p className="text-gray-600 mb-4">{uniqueCustomers.length} customers found</p>
                    <div className="space-y-2">
                      {uniqueCustomers.map(customer => (
                        <div key={customer.name} onClick={() => setSelectedCustomer(customer)} className="p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-cyan-400 flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.quotes.length} quote{customer.quotes.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${customer.totalValue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">total value</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedCustomer(null)} className="text-cyan-600 hover:underline mb-4">← Back to all customers</button>
                    <div className="bg-cyan-50 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-xl">{selectedCustomer.name}</h3>
                      <p className="text-gray-600">{selectedCustomer.quotes.length} quotes • Total: ${selectedCustomer.totalValue.toFixed(2)}</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Date</th>
                          <th className="text-right p-3">Qty</th>
                          <th className="text-right p-3">Quote</th>
                          <th className="text-center p-3">Status</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.quotes.map(quote => (
                          <tr key={quote.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right">{quote.quantity?.toLocaleString()}</td>
                            <td className="p-3 text-right font-medium">${quote.totalQuote?.toFixed(2)}</td>
                            <td className="p-3 text-center"><StatusBadge status={quote.status} /></td>
                            <td className="p-3 text-center">
                              <button onClick={() => { loadQuote(quote); setShowCustomerView(false); }} className="text-blue-600 hover:underline text-sm">Load</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
