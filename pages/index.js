import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Plus, Edit2, Trash2, Settings, FileText, Printer, Save, FolderOpen, History, GitCompare, Users, Download, X, Check, Clock, XCircle, Search, ChevronDown, ChevronUp, Package } from 'lucide-react';

export default function PrintingQuoteTool() {
  // Device type management
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCapacity, setNewDeviceCapacity] = useState(80);
  const [newDeviceUnitCost, setNewDeviceUnitCost] = useState(0);

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
  
  // LINE ITEMS - Multi-device support
  const [lineItems, setLineItems] = useState([
    { id: 1, deviceTypeIndex: 0, quantity: 1000, quantityInput: '1000', sides: 'single', glossFinish: 'none', numDesigns: 1, supplyingDevice: false, deviceCost: 0, deviceMarkup: 30 }
  ]);
  const [expandedItems, setExpandedItems] = useState({ 1: true });

  // Shared order settings
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

  // COST FLOOR RATE CONSTANTS
  const RATES = {
    fileSetupPerDesign: 10,
    machineSetupPerDay: 23,
    samplePrintingCost: 23,
    inkCMYKPerSide: 0.03,
    inkGlossPerSide: 0.01,
    laborRatePerHour: 23,
    repackagingPerUnit: 0.06,
    shippingStagingMinutes: 40,
    shippingStagingHourlyRate: 20,
  };

  const defaultDeviceTypes = [
    { name: '1mg Disposable', capacity: 88, unitCost: 2.05 },
    { name: '2mg Disposable', capacity: 77, unitCost: 2.50 },
    { name: 'MK Lighter', capacity: 80, unitCost: 1.75 }
  ];
  const defaultAccountManagers = ['Ryan', 'Kyle', 'Anthony', 'Clarence'];
  const MINIMUM_ORDER_QUANTITY = 100;

  // Load device types
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
    } catch (e) { setDeviceTypes(defaultDeviceTypes); }
  }, []);

  useEffect(() => {
    if (deviceTypes.length > 0) {
      try { localStorage.setItem('device-types', JSON.stringify(deviceTypes)); } catch (e) {}
    }
  }, [deviceTypes]);

  useEffect(() => {
    if (deviceTypes.length > 0 && lineItems[0]?.deviceCost === 0) {
      setLineItems(items => items.map(item => ({ ...item, deviceCost: deviceTypes[item.deviceTypeIndex]?.unitCost || 0 })));
    }
  }, [deviceTypes]);

  // Load account managers
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
    } catch (e) { setAccountManagers(defaultAccountManagers); setAccountManager(defaultAccountManagers[0]); }
  }, []);

  useEffect(() => {
    if (accountManagers.length > 0) {
      try { localStorage.setItem('account-managers', JSON.stringify(accountManagers)); } catch (e) {}
    }
  }, [accountManagers]);

  // Load saved quotes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved-quotes');
      if (stored) setSavedQuotes(JSON.parse(stored));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('saved-quotes', JSON.stringify(savedQuotes)); } catch (e) {}
  }, [savedQuotes]);

  // LINE ITEM MANAGEMENT
  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(i => i.id), 0) + 1;
    setLineItems([...lineItems, { id: newId, deviceTypeIndex: 0, quantity: 1000, quantityInput: '1000', sides: 'single', glossFinish: 'none', numDesigns: 1, supplyingDevice: false, deviceCost: deviceTypes[0]?.unitCost || 0, deviceMarkup: 30 }]);
    setExpandedItems({ ...expandedItems, [newId]: true });
  };

  const removeLineItem = (id) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'deviceTypeIndex') updated.deviceCost = deviceTypes[value]?.unitCost || 0;
      if (field === 'quantityInput') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) updated.quantity = Math.min(500000, numValue);
      }
      if (field === 'quantity') updated.quantityInput = value.toString();
      if (field === 'sides' && value === 'single' && item.glossFinish === 'both-sides') updated.glossFinish = 'single-side';
      return updated;
    }));
  };

  const toggleExpanded = (id) => setExpandedItems({ ...expandedItems, [id]: !expandedItems[id] });

  // Device/Manager management
  const handlePrinterChange = (value) => setNumPrinters(Math.max(1, Math.min(20, Number(value) || 1)));

  const addDeviceType = () => {
    if (newDeviceName.trim()) {
      setDeviceTypes([...deviceTypes, { name: newDeviceName, capacity: newDeviceCapacity, unitCost: newDeviceUnitCost }]);
      setNewDeviceName(''); setNewDeviceCapacity(80); setNewDeviceUnitCost(0);
    }
  };

  const updateDeviceType = (index, name, capacity, unitCost) => {
    const updated = [...deviceTypes];
    updated[index] = { name, capacity, unitCost };
    setDeviceTypes(updated);
    setEditingDevice(null);
  };

  const deleteDeviceType = (index) => {
    if (deviceTypes.length === 1) return;
    const updated = deviceTypes.filter((_, i) => i !== index);
    setDeviceTypes(updated);
    setLineItems(lineItems.map(item => item.deviceTypeIndex >= updated.length ? { ...item, deviceTypeIndex: updated.length - 1, deviceCost: updated[updated.length - 1]?.unitCost || 0 } : item));
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
    if (accountManager === name && updated.length > 0) setAccountManager(updated[0]);
  };

  // CALCULATIONS
  const totalQuantity = useMemo(() => lineItems.reduce((sum, item) => sum + item.quantity, 0), [lineItems]);
  const totalDesigns = useMemo(() => lineItems.reduce((sum, item) => sum + item.numDesigns, 0), [lineItems]);

  const basePrice = useMemo(() => {
    if (totalQuantity >= 10000) return 0.66;
    if (totalQuantity >= 3000) return 0.84;
    if (totalQuantity >= 1000) return 1.05;
    if (totalQuantity >= 500) return 1.10;
    return 1.20;
  }, [totalQuantity]);

  const setupFee = totalQuantity < 1000 ? 150 : 0;
  const includedDesigns = Math.floor(totalQuantity / 1000);
  const extraDesigns = Math.max(0, totalDesigns - includedDesigns);
  const chargeableDesigns = extraDesigns - Math.min(designWaivers, extraDesigns);
  const extraDesignCost = chargeableDesigns * 35;

  const lineItemCalculations = useMemo(() => {
    return lineItems.map(item => {
      const device = deviceTypes[item.deviceTypeIndex];
      const deviceCapacity = device?.capacity || 80;
      const batchesNeeded = Math.ceil(item.quantity / deviceCapacity);
      const hasGloss = item.glossFinish !== 'none';
      const minutesPerBatch = hasGloss ? 45 : 35;
      const productionHours = (batchesNeeded * minutesPerBatch * (item.sides === 'double' ? 2 : 1)) / 60;
      const baseCost = basePrice * item.quantity;
      const glossCost = item.glossFinish === 'single-side' ? 0.07 * item.quantity : item.glossFinish === 'both-sides' ? 0.12 * item.quantity : 0;
      const doubleSidedCost = item.sides === 'double' ? 0.31 * item.quantity : 0;
      const deviceUnitPrice = item.supplyingDevice ? Math.round(item.deviceCost * (1 + item.deviceMarkup / 100) * 100) / 100 : 0;
      const deviceSupplyCost = item.supplyingDevice ? deviceUnitPrice * item.quantity : 0;
      const numSidesPrinted = item.sides === 'double' ? 2 : 1;
      const numGlossSides = item.glossFinish === 'none' ? 0 : item.glossFinish === 'single-side' ? 1 : 2;
      return {
        ...item, deviceName: device?.name || 'Unknown', deviceCapacity, batchesNeeded, productionHours, baseCost, glossCost, doubleSidedCost, deviceUnitPrice, deviceSupplyCost,
        lineTotal: baseCost + glossCost + doubleSidedCost + deviceSupplyCost, numSidesPrinted, numGlossSides,
        inkCostCMYK: RATES.inkCMYKPerSide * numSidesPrinted * item.quantity,
        inkCostGloss: RATES.inkGlossPerSide * numGlossSides * item.quantity,
        deviceCostFloor: item.supplyingDevice ? item.deviceCost * item.quantity : 0
      };
    });
  }, [lineItems, deviceTypes, basePrice]);

  const productionCalcs = useMemo(() => {
    const totalBatches = lineItemCalculations.reduce((sum, calc) => sum + calc.batchesNeeded, 0);
    const totalProductionHours = lineItemCalculations.reduce((sum, calc) => sum + calc.productionHours, 0);
    let optimizedPrinters = numPrinters;
    if (totalProductionHours < 2) optimizedPrinters = 1;
    else if (totalProductionHours < 12) optimizedPrinters = Math.min(2, numPrinters);
    const effectiveHours = totalProductionHours / optimizedPrinters;
    return { totalBatches, totalProductionHours, optimizedPrinters, effectiveHours, productionDays: Math.ceil(effectiveHours / 6) };
  }, [lineItemCalculations, numPrinters]);

  const packagingCost = useMemo(() => packaging === 'loose' ? 0 : packaging === 'sticker-mania' ? 0.11 * totalQuantity : 0.16 * totalQuantity, [packaging, totalQuantity]);
  const lineItemsSubtotal = useMemo(() => lineItemCalculations.reduce((sum, calc) => sum + calc.lineTotal, 0), [lineItemCalculations]);
  const baseQuote = lineItemsSubtotal + setupFee + extraDesignCost + packagingCost;
  const turnaroundFee = useMemo(() => turnaround === 'rush' ? baseQuote * 0.12 : turnaround === 'weekend' ? baseQuote * 0.20 : 0, [turnaround, baseQuote]);
  const sampleFee = useMemo(() => (!sampleRun || waiveSampleFee || totalQuantity >= 5000) ? 0 : 65, [sampleRun, waiveSampleFee, totalQuantity]);

  const subtotal = baseQuote + turnaroundFee + sampleFee;
  const salesTax = subtotal * (salesTaxRate / 100);
  const shippingCost = shippingType === 'pickup' ? 0 : shopifyQuote * (1 + shippingMarkup / 100);
  const totalQuote = subtotal + salesTax + shippingCost;

  const costFloorCalcs = useMemo(() => {
    const fileSetupCost = totalDesigns * RATES.fileSetupPerDesign;
    const machineSetupCost = productionCalcs.productionDays * RATES.machineSetupPerDay;
    const samplePrintingCost = sampleRun && !waiveSampleFee ? 0 : RATES.samplePrintingCost;
    const preProductionCost = fileSetupCost + machineSetupCost + samplePrintingCost;
    const totalInkCMYK = lineItemCalculations.reduce((sum, calc) => sum + calc.inkCostCMYK, 0);
    const totalInkGloss = lineItemCalculations.reduce((sum, calc) => sum + calc.inkCostGloss, 0);
    const totalCMYKSides = lineItemCalculations.reduce((sum, calc) => sum + (calc.numSidesPrinted * calc.quantity), 0);
    const totalGlossSides = lineItemCalculations.reduce((sum, calc) => sum + (calc.numGlossSides * calc.quantity), 0);
    const laborCost = productionCalcs.effectiveHours * RATES.laborRatePerHour;
    const productionCost = totalInkCMYK + totalInkGloss + laborCost;
    const repackagingCost = packaging === 'loose' ? 0 : RATES.repackagingPerUnit * totalQuantity;
    const shippingStagingCost = (RATES.shippingStagingMinutes / 60) * RATES.shippingStagingHourlyRate;
    const postProductionCost = repackagingCost + shippingStagingCost;
    const totalDeviceCostFloor = lineItemCalculations.reduce((sum, calc) => sum + calc.deviceCostFloor, 0);
    return { fileSetupCost, machineSetupCost, samplePrintingCost, preProductionCost, totalInkCMYK, totalCMYKSides, totalInkGloss, totalGlossSides, laborCost, productionCost, repackagingCost, shippingStagingCost, postProductionCost, totalDeviceCostFloor, totalCostFloor: preProductionCost + productionCost + postProductionCost + totalDeviceCostFloor };
  }, [totalDesigns, productionCalcs, sampleRun, waiveSampleFee, lineItemCalculations, packaging, totalQuantity]);

  const profit = totalQuote - costFloorCalcs.totalCostFloor;
  const profitMargin = totalQuote > 0 ? (profit / totalQuote) * 100 : 0;
  const hasItemBelowMinimum = lineItems.some(item => item.quantity > 0 && item.quantity < MINIMUM_ORDER_QUANTITY);

  const getCurrentQuoteData = () => ({
    id: currentQuoteId || `quote-${Date.now()}`, clientName, accountManager,
    lineItems: lineItems.map(item => ({ ...item, deviceTypeName: deviceTypes[item.deviceTypeIndex]?.name || '' })),
    quantity: totalQuantity, numDesigns: totalDesigns, packaging, turnaround, sampleRun, waiveSampleFee,
    shippingType, shopifyQuote, shippingMarkup, salesTaxRate, designWaivers, numPrinters,
    totalQuote, costFloor: costFloorCalcs.totalCostFloor, profit, profitMargin, productionDays: productionCalcs.productionDays,
    createdAt: new Date().toISOString(), status: 'pending'
  });

  // Generate PDF Invoice
  const generatePDFInvoice = () => {
    const date = new Date();
    const invoiceNum = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const lineItemRows = lineItemCalculations.map(calc => {
      let rows = [{ desc: `${calc.deviceName} - Base (${calc.quantity.toLocaleString()} × $${basePrice.toFixed(2)})`, amount: calc.baseCost.toFixed(2) }];
      if (calc.glossCost > 0) rows.push({ desc: `${calc.deviceName} - Gloss`, amount: calc.glossCost.toFixed(2) });
      if (calc.doubleSidedCost > 0) rows.push({ desc: `${calc.deviceName} - Double-sided`, amount: calc.doubleSidedCost.toFixed(2) });
      if (calc.deviceSupplyCost > 0) rows.push({ desc: `${calc.deviceName} - Devices (${calc.quantity.toLocaleString()} × $${calc.deviceUnitPrice.toFixed(2)})`, amount: calc.deviceSupplyCost.toFixed(2) });
      return rows;
    }).flat();
    const additionalItems = [];
    if (setupFee > 0) additionalItems.push({ desc: 'Setup Fee', amount: setupFee.toFixed(2) });
    if (extraDesignCost > 0) additionalItems.push({ desc: `Extra Designs (${chargeableDesigns} × $35)`, amount: extraDesignCost.toFixed(2) });
    if (packagingCost > 0) additionalItems.push({ desc: 'Packaging', amount: packagingCost.toFixed(2) });
    if (turnaroundFee > 0) additionalItems.push({ desc: `${turnaround === 'rush' ? 'Rush' : 'Weekend'} Turnaround`, amount: turnaroundFee.toFixed(2) });
    if (sampleFee > 0) additionalItems.push({ desc: 'Sample Run', amount: sampleFee.toFixed(2) });
    const allLineItems = [...lineItemRows, ...additionalItems];
    const deviceSummary = lineItemCalculations.map(calc => `${calc.deviceName}: ${calc.quantity.toLocaleString()}`).join(', ');

    const invoiceHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invoiceNum}</title><style>@media print{body{margin:0}.no-print{display:none!important}@page{margin:.5in}}body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333}.header{text-align:center;margin-bottom:30px}.header h1{font-size:36px;margin:0 0 20px}.info-section{display:flex;justify-content:space-between;margin-bottom:30px}.invoice-info{text-align:right}.section-title{font-weight:bold;font-size:14px;margin-bottom:5px}.details-section{background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:20px}.details-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#f0f0f0;padding:10px;text-align:left;border-bottom:2px solid #ddd}td{padding:10px;border-bottom:1px solid #eee}.amount{text-align:right}.totals{margin-left:auto;width:300px;margin-top:20px}.totals-row{display:flex;justify-content:space-between;padding:8px 0}.totals-row.subtotal{border-top:1px solid #ddd;font-weight:bold}.totals-row.total{border-top:2px solid #333;font-size:18px;font-weight:bold;padding-top:12px}.per-unit{font-size:12px;font-style:italic;color:#666}.footer{text-align:center;margin-top:50px;font-style:italic;color:#666}.print-button{background:#10b981;color:#fff;border:none;padding:15px 30px;font-size:16px;border-radius:8px;cursor:pointer;margin:20px auto;display:block}.print-button:hover{background:#059669}</style></head><body><div class="no-print" style="background:#f0fdf4;padding:20px;border-radius:8px;margin-bottom:30px"><button class="print-button" onclick="window.print()">Print / Save as PDF</button><p style="text-align:center;color:#666;font-size:14px">Click the button above, then select "Save as PDF"</p></div><div class="header"><h1>INVOICE</h1></div><div class="info-section"><div><div style="font-weight:bold;font-size:16px">Sticker Mania</div><div>info@stickermania818.com</div><div>https://stickermania.us/</div></div><div class="invoice-info"><div><strong>Invoice #:</strong> ${invoiceNum}</div><div><strong>Date:</strong> ${date.toLocaleDateString()}</div><div><strong>Account Manager:</strong> ${accountManager}</div></div></div><div style="margin-bottom:30px"><div class="section-title">Bill To:</div><div>${clientName}</div></div><div class="details-section"><div class="section-title" style="margin-bottom:10px">Project Details</div><div class="details-grid"><div><strong>Devices:</strong> ${deviceSummary}</div><div><strong>Total:</strong> ${totalQuantity.toLocaleString()} units</div><div><strong>Designs:</strong> ${totalDesigns} (${includedDesigns} included)</div><div><strong>Packaging:</strong> ${packaging === 'loose' ? 'Loose Bulk' : packaging === 'sticker-mania' ? 'Sticker Mania' : 'Client'}</div></div></div><table><thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead><tbody>${allLineItems.map(item => `<tr><td>${item.desc}</td><td class="amount">$${item.amount}</td></tr>`).join('')}</tbody></table><div class="totals"><div class="totals-row subtotal"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div><div class="totals-row per-unit"><span>Per unit:</span><span>$${(subtotal/totalQuantity).toFixed(3)}/device</span></div>${salesTax > 0 ? `<div class="totals-row"><span>Sales Tax (${salesTaxRate}%):</span><span>$${salesTax.toFixed(2)}</span></div>` : ''}${shippingCost > 0 ? `<div class="totals-row"><span>Shipping:</span><span>$${shippingCost.toFixed(2)}</span></div>` : ''}<div class="totals-row total"><span>TOTAL:</span><span>$${totalQuote.toFixed(2)}</span></div></div><div class="footer">Thank you for your business!</div></body></html>`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) { newWindow.document.write(invoiceHTML); newWindow.document.close(); }
    else { const blob = new Blob([invoiceHTML], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `invoice-${invoiceNum}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
  };

  // Quote management
  const saveQuote = () => {
    if (!clientName.trim()) { setSaveMessage('Please enter a client name first'); setTimeout(() => setSaveMessage(''), 3000); return; }
    const quoteData = getCurrentQuoteData();
    const existingIndex = savedQuotes.findIndex(q => q.id === currentQuoteId);
    if (existingIndex >= 0) {
      const updated = [...savedQuotes]; updated[existingIndex] = { ...quoteData, updatedAt: new Date().toISOString() };
      setSavedQuotes(updated); setSaveMessage('Quote updated!');
    } else {
      quoteData.id = `quote-${Date.now()}`; setCurrentQuoteId(quoteData.id);
      setSavedQuotes([quoteData, ...savedQuotes]); setSaveMessage('Quote saved!');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const loadQuote = (quote) => {
    setClientName(quote.clientName || '');
    setAccountManager(quote.accountManager || accountManagers[0]);
    if (quote.lineItems && quote.lineItems.length > 0) {
      const loadedItems = quote.lineItems.map((item, idx) => ({
        ...item, id: item.id || idx + 1, deviceTypeIndex: item.deviceTypeIndex || 0,
        quantity: item.quantity || 1000, quantityInput: (item.quantity || 1000).toString(),
        sides: item.sides || 'single', glossFinish: item.glossFinish || 'none', numDesigns: item.numDesigns || 1,
        supplyingDevice: item.supplyingDevice || false, deviceCost: item.deviceCost || deviceTypes[item.deviceTypeIndex || 0]?.unitCost || 0,
        deviceMarkup: item.deviceMarkup || 30
      }));
      setLineItems(loadedItems);
      const expanded = {}; loadedItems.forEach(item => { expanded[item.id] = true; }); setExpandedItems(expanded);
    } else {
      setLineItems([{ id: 1, deviceTypeIndex: quote.selectedDevice || 0, quantity: quote.quantity || 1000, quantityInput: (quote.quantity || 1000).toString(),
        sides: quote.sides || 'single', glossFinish: quote.glossFinish || 'none', numDesigns: quote.numDesigns || 1,
        supplyingDevice: quote.supplyingDevices || false, deviceCost: quote.deviceCost || deviceTypes[quote.selectedDevice || 0]?.unitCost || 0, deviceMarkup: quote.deviceMarkup || 30 }]);
      setExpandedItems({ 1: true });
    }
    setPackaging(quote.packaging || 'loose'); setTurnaround(quote.turnaround || 'normal');
    setSampleRun(quote.sampleRun !== false); setWaiveSampleFee(quote.waiveSampleFee || false);
    setShippingType(quote.shippingType || 'shopify'); setShopifyQuote(quote.shopifyQuote || 0);
    setShippingMarkup(quote.shippingMarkup || 20); setSalesTaxRate(quote.salesTaxRate || 0);
    setDesignWaivers(quote.designWaivers || 0); setNumPrinters(quote.numPrinters || 3);
    setCurrentQuoteId(quote.id); setShowLoadDropdown(false); setShowHistory(false);
  };

  const duplicateQuote = (quote) => { loadQuote(quote); setCurrentQuoteId(null); setClientName(quote.clientName + ' (Copy)'); };
  const deleteQuote = (quoteId) => { setSavedQuotes(savedQuotes.filter(q => q.id !== quoteId)); if (currentQuoteId === quoteId) setCurrentQuoteId(null); };
  const updateQuoteStatus = (quoteId, status) => { setSavedQuotes(savedQuotes.map(q => q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q)); };

  const newQuote = () => {
    setClientName('');
    setLineItems([{ id: 1, deviceTypeIndex: 0, quantity: 1000, quantityInput: '1000', sides: 'single', glossFinish: 'none', numDesigns: 1, supplyingDevice: false, deviceCost: deviceTypes[0]?.unitCost || 0, deviceMarkup: 30 }]);
    setExpandedItems({ 1: true }); setPackaging('loose'); setTurnaround('normal'); setSampleRun(true); setWaiveSampleFee(false);
    setShippingType('shopify'); setShopifyQuote(0); setShippingMarkup(20); setSalesTaxRate(0); setDesignWaivers(0); setNumPrinters(3); setCurrentQuoteId(null);
  };

  const uniqueCustomers = useMemo(() => {
    const customers = {};
    savedQuotes.forEach(q => { if (q.clientName) { if (!customers[q.clientName]) customers[q.clientName] = { name: q.clientName, quotes: [], totalValue: 0 }; customers[q.clientName].quotes.push(q); customers[q.clientName].totalValue += q.totalQuote || 0; }});
    return Object.values(customers).sort((a, b) => b.totalValue - a.totalValue);
  }, [savedQuotes]);

  const filteredQuotes = useMemo(() => {
    if (!historySearch.trim()) return savedQuotes;
    const search = historySearch.toLowerCase();
    return savedQuotes.filter(q => q.clientName?.toLowerCase().includes(search) || q.accountManager?.toLowerCase().includes(search) || q.status?.toLowerCase().includes(search));
  }, [savedQuotes, historySearch]);

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Account Manager', 'Quantity', 'Total Quote', 'Cost Floor', 'Profit', 'Margin %', 'Status', 'Production Days'];
    const rows = savedQuotes.map(q => [new Date(q.createdAt).toLocaleDateString(), q.clientName, q.accountManager, q.quantity, q.totalQuote?.toFixed(2), q.costFloor?.toFixed(2), q.profit?.toFixed(2), q.profitMargin?.toFixed(1), q.status, q.productionDays]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status, small = false }) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', won: 'bg-green-100 text-green-800', lost: 'bg-red-100 text-red-800' };
    const icons = { pending: <Clock className={small ? "w-3 h-3" : "w-4 h-4"} />, won: <Check className={small ? "w-3 h-3" : "w-4 h-4"} />, lost: <XCircle className={small ? "w-3 h-3" : "w-4 h-4"} /> };
    return (<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{icons[status] || icons.pending}{status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}</span>);
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
              {currentQuoteId && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Editing</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={newQuote} className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"><Plus className="w-4 h-4" /> New</button>
              <button onClick={saveQuote} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"><Save className="w-4 h-4" /> Save</button>
              <div className="relative">
                <button onClick={() => setShowLoadDropdown(!showLoadDropdown)} className="flex items-center gap-1 px-3 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"><FolderOpen className="w-4 h-4" /> Load</button>
                {showLoadDropdown && savedQuotes.length > 0 && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-auto">
                    {savedQuotes.slice(0, 10).map(quote => (
                      <div key={quote.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 cursor-pointer" onClick={() => loadQuote(quote)}>
                            <p className="font-medium text-sm">{quote.clientName}</p>
                            <p className="text-xs text-gray-500">{new Date(quote.createdAt).toLocaleDateString()} • ${quote.totalQuote?.toFixed(2)}</p>
                          </div>
                          <StatusBadge status={quote.status} small />
                        </div>
                      </div>
                    ))}
                    {savedQuotes.length > 10 && <div className="p-2 text-center text-sm text-blue-600 cursor-pointer hover:bg-blue-50" onClick={() => { setShowHistory(true); setShowLoadDropdown(false); }}>View all {savedQuotes.length} quotes →</div>}
                  </div>
                )}
              </div>
              <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><History className="w-4 h-4" /> History</button>
              <button onClick={() => setShowComparison(true)} className="flex items-center gap-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700"><GitCompare className="w-4 h-4" /> Compare</button>
              <button onClick={() => setShowCustomerView(true)} className="flex items-center gap-1 px-3 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700"><Users className="w-4 h-4" /> Customers</button>
              <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700"><Download className="w-4 h-4" /> Export</button>
            </div>
          </div>

          {saveMessage && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${saveMessage.includes('Please') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{saveMessage}</div>}

          {/* Settings Row */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => setShowPrinterSettings(!showPrinterSettings)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"><Printer className="w-4 h-4" /> Printers ({numPrinters})</button>
            <button onClick={() => setShowManagerEditor(!showManagerEditor)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"><Settings className="w-4 h-4" /> Managers</button>
            <button onClick={() => setShowDeviceManager(!showDeviceManager)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Settings className="w-4 h-4" /> Devices</button>
          </div>

          {/* Printer Settings Panel */}
          {showPrinterSettings && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Printer className="w-5 h-5 text-green-600" /> Printer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Printers</label>
                  <input type="number" min="1" max="20" value={numPrinters} onChange={(e) => handlePrinterChange(e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
                  <p className="text-xs text-gray-500 mt-2">Auto-optimized to {productionCalcs.optimizedPrinters} for this order</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Batches:</span> <span className="font-medium">{productionCalcs.totalBatches}</span></div>
                    <div><span className="text-gray-500">Days:</span> <span className="font-medium">{productionCalcs.productionDays}</span></div>
                    <div><span className="text-gray-500">Hours:</span> <span className="font-medium">{productionCalcs.effectiveHours.toFixed(1)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manager Editor */}
          {showManagerEditor && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-600" /> Account Managers</h3>
              <div className="space-y-2 mb-4">
                {accountManagers.map(manager => (
                  <div key={manager} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span>{manager}</span>
                    <button onClick={() => deleteAccountManager(manager)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="New manager" value={newManagerName} onChange={(e) => setNewManagerName(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                <button onClick={addAccountManager} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><Plus className="w-4 h-4" /> Add</button>
              </div>
            </div>
          )}

          {/* Device Manager */}
          {showDeviceManager && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600" /> Device Types</h3>
              <div className="space-y-2 mb-4">
                {deviceTypes.map((device, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                    {editingDevice === index ? (
                      <>
                        <input type="text" value={device.name} onChange={(e) => { const u = [...deviceTypes]; u[index].name = e.target.value; setDeviceTypes(u); }} className="flex-1 px-2 py-1 border rounded" />
                        <input type="number" value={device.capacity} onChange={(e) => { const u = [...deviceTypes]; u[index].capacity = Number(e.target.value); setDeviceTypes(u); }} className="w-20 px-2 py-1 border rounded" />
                        <input type="number" step="0.01" value={device.unitCost || 0} onChange={(e) => { const u = [...deviceTypes]; u[index].unitCost = Number(e.target.value); setDeviceTypes(u); }} className="w-20 px-2 py-1 border rounded" />
                        <button onClick={() => updateDeviceType(index, device.name, device.capacity, device.unitCost || 0)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{device.name}</span>
                        <span className="text-sm text-gray-600">{device.capacity}/batch</span>
                        <span className="text-sm text-green-600">${(device.unitCost || 0).toFixed(2)}</span>
                        <button onClick={() => setEditingDevice(index)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteDeviceType(index)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Name" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                <input type="number" placeholder="Capacity" value={newDeviceCapacity} onChange={(e) => setNewDeviceCapacity(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
                <input type="number" step="0.01" placeholder="Cost" value={newDeviceUnitCost} onChange={(e) => setNewDeviceUnitCost(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
                <button onClick={addDeviceType} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><Plus className="w-4 h-4" /> Add</button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter client name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Manager</label>
                  <select value={accountManager} onChange={(e) => setAccountManager(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {accountManagers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* LINE ITEMS */}
              <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Line Items</h3>
                    <span className="text-sm text-blue-600">({lineItems.length} • {totalQuantity.toLocaleString()} units)</span>
                  </div>
                  <button onClick={addLineItem} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Add</button>
                </div>
                <div className="divide-y divide-gray-200">
                  {lineItems.map((item, index) => {
                    const calc = lineItemCalculations[index];
                    const isExpanded = expandedItems[item.id];
                    const isBelowMin = item.quantity > 0 && item.quantity < MINIMUM_ORDER_QUANTITY;
                    return (
                      <div key={item.id} className={isBelowMin ? 'bg-amber-50' : 'bg-white'}>
                        <div className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpanded(item.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          <span className="font-medium text-gray-900 flex-1">{calc?.deviceName}<span className="text-gray-500 font-normal ml-2">{item.quantity.toLocaleString()} units{item.sides === 'double' && ' • 2-sided'}{item.glossFinish !== 'none' && ' • Gloss'}{item.supplyingDevice && ' • +Devices'}</span></span>
                          <span className="font-semibold text-green-600">${calc?.lineTotal.toFixed(2)}</span>
                          {lineItems.length > 1 && <button onClick={(e) => { e.stopPropagation(); removeLineItem(item.id); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Device Type</label>
                                <select value={item.deviceTypeIndex} onChange={(e) => updateLineItem(item.id, 'deviceTypeIndex', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                  {deviceTypes.map((d, i) => <option key={i} value={i}>{d.name} ({d.capacity}/batch)</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Quantity {isBelowMin && <span className="text-amber-600">(Below min)</span>}</label>
                                <input type="text" inputMode="numeric" value={item.quantityInput} onChange={(e) => updateLineItem(item.id, 'quantityInput', e.target.value)} onBlur={() => updateLineItem(item.id, 'quantityInput', item.quantity.toString())} className={`w-full px-3 py-2 border rounded-lg text-sm ${isBelowMin ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`} />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Sides</label>
                                <select value={item.sides} onChange={(e) => updateLineItem(item.id, 'sides', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                  <option value="single">Single</option><option value="double">Double (+$0.31)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Gloss</label>
                                <select value={item.glossFinish} onChange={(e) => updateLineItem(item.id, 'glossFinish', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                  <option value="none">None</option><option value="single-side">One side (+$0.07)</option><option value="both-sides" disabled={item.sides === 'single'}>Both (+$0.12)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Designs</label>
                                <input type="number" min="1" max="100" value={item.numDesigns} onChange={(e) => updateLineItem(item.id, 'numDesigns', Math.max(1, Number(e.target.value) || 1))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" id={`supply-${item.id}`} checked={item.supplyingDevice} onChange={(e) => updateLineItem(item.id, 'supplyingDevice', e.target.checked)} className="w-4 h-4" />
                                <label htmlFor={`supply-${item.id}`} className="text-sm font-medium text-gray-700">Supply devices</label>
                              </div>
                              {item.supplyingDevice && (
                                <div className="grid grid-cols-2 gap-3 ml-6">
                                  <div><label className="block text-xs text-gray-600 mb-1">Cost/unit ($)</label><input type="number" step="0.01" min="0" value={item.deviceCost} onChange={(e) => updateLineItem(item.id, 'deviceCost', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                                  <div><label className="block text-xs text-gray-600 mb-1">Markup (%)</label><input type="number" min="0" max="200" value={item.deviceMarkup} onChange={(e) => updateLineItem(item.id, 'deviceMarkup', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">{calc?.batchesNeeded} batches • {calc?.productionHours.toFixed(1)} hrs{item.supplyingDevice && ` • $${calc?.deviceUnitPrice.toFixed(2)}/unit`}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Settings */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 text-sm">Order Settings</h3>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Designs: {totalDesigns} ({includedDesigns} included, {extraDesigns} extra)</label>
                  {extraDesigns > 0 && <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Waive:</span><input type="number" min="0" max={extraDesigns} value={designWaivers} onChange={(e) => setDesignWaivers(Math.min(Number(e.target.value), extraDesigns))} className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" /></div>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Packaging</label><select value={packaging} onChange={(e) => setPackaging(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="loose">Loose Bulk</option><option value="sticker-mania">Sticker Mania (+$0.11)</option><option value="client">Client (+$0.16)</option></select></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Turnaround</label><select value={turnaround} onChange={(e) => setTurnaround(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="normal">Normal</option><option value="rush">Rush (+12%)</option><option value="weekend">Weekend (+20%)</option></select></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><input type="checkbox" id="sample" checked={sampleRun} onChange={(e) => setSampleRun(e.target.checked)} className="w-4 h-4" /><label htmlFor="sample" className="text-sm text-gray-700">Sample ($65)</label></div>
                  {sampleRun && <div className="flex items-center gap-2"><input type="checkbox" id="waive" checked={waiveSampleFee} onChange={(e) => setWaiveSampleFee(e.target.checked)} className="w-4 h-4" /><label htmlFor="waive" className="text-sm text-gray-600">Waive</label></div>}
                </div>
              </div>

              {/* Shipping */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 text-sm">Shipping & Tax</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><input type="radio" id="shopify" checked={shippingType === 'shopify'} onChange={() => setShippingType('shopify')} className="w-4 h-4" /><label htmlFor="shopify" className="text-sm text-gray-700">Shopify</label></div>
                  {shippingType === 'shopify' && <div className="ml-6 grid grid-cols-2 gap-2"><input type="number" step="0.01" placeholder="Base" value={shopifyQuote} onChange={(e) => setShopifyQuote(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" /><div className="flex items-center gap-1"><input type="number" value={shippingMarkup} onChange={(e) => setShippingMarkup(Number(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500">%</span></div></div>}
                  <div className="flex items-center gap-2"><input type="radio" id="pickup" checked={shippingType === 'pickup'} onChange={() => setShippingType('pickup')} className="w-4 h-4" /><label htmlFor="pickup" className="text-sm text-gray-700">Local pickup</label></div>
                </div>
                <div className="flex items-center gap-2"><label className="text-sm text-gray-700">Tax:</label><input type="number" step="0.1" min="0" max="20" value={salesTaxRate} onChange={(e) => setSalesTaxRate(Number(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500">%</span></div>
              </div>
            </div>
</span></div>
                </div>
              </div>
            </div>
          </div>

          {clientName && (
            <div className="mt-6 flex justify-center">
              <button onClick={generatePDFInvoice} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg">
                <FileText className="w-6 h-6" /> Generate PDF Invoice
              </button>
            </div>
          )}

          {hasItemBelowMinimum && <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-sm">⚠️ One or more line items are below the minimum order quantity of {MINIMUM_ORDER_QUANTITY} units.</div>}
        </div>

        {/* History Modal */}
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
                  <input type="text" placeholder="Search..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {filteredQuotes.length === 0 ? <p className="text-center text-gray-500 py-8">No quotes found</p> : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">Date</th><th className="text-left p-3">Client</th><th className="text-left p-3">Manager</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Quote</th><th className="text-right p-3">Margin</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th></tr></thead>
                    <tbody>
                      {filteredQuotes.map(quote => (
                        <tr key={quote.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{quote.clientName}</td>
                          <td className="p-3">{quote.accountManager}</td>
                          <td className="p-3 text-right">{quote.quantity?.toLocaleString()}</td>
                          <td className="p-3 text-right font-medium">${quote.totalQuote?.toFixed(2)}</td>
                          <td className="p-3 text-right"><span className={quote.profitMargin >= 30 ? 'text-green-600' : quote.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}>{quote.profitMargin?.toFixed(1)}%</span></td>
                          <td className="p-3 text-center"><select value={quote.status || 'pending'} onChange={(e) => updateQuoteStatus(quote.id, e.target.value)} className="text-xs border rounded px-2 py-1"><option value="pending">Pending</option><option value="won">Won</option><option value="lost">Lost</option></select></td>
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
              <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">{savedQuotes.length} quotes • Won: {savedQuotes.filter(q => q.status === 'won').length} • Lost: {savedQuotes.filter(q => q.status === 'lost').length}</div>
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
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-bold text-blue-900 mb-4">Current Quote</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Client:</span> <span className="font-medium">{clientName || '(Not set)'}</span></p>
                      <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{totalQuantity.toLocaleString()}</span></p>
                      <p><span className="text-gray-600">Items:</span> <span className="font-medium">{lineItems.length}</span></p>
                      <hr className="my-3" />
                      <p className="text-lg"><span className="text-gray-600">Total:</span> <span className="font-bold text-green-600">${totalQuote.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Costs:</span> <span className="font-medium">${costFloorCalcs.totalCostFloor.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Profit:</span> <span className="font-medium">${profit.toFixed(2)}</span></p>
                      <p><span className="text-gray-600">Margin:</span> <span className={`font-bold ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{profitMargin.toFixed(1)}%</span></p>
                    </div>
                  </div>
                  <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50">
                    <h3 className="font-bold text-pink-900 mb-4">Compare With</h3>
                    {!comparisonQuote ? (
                      <div>
                        <p className="text-gray-600 mb-4">Select a quote:</p>
                        <div className="space-y-2 max-h-80 overflow-auto">
                          {savedQuotes.map(q => (
                            <div key={q.id} onClick={() => setComparisonQuote(q)} className="p-3 bg-white rounded border cursor-pointer hover:border-pink-400">
                              <p className="font-medium">{q.clientName}</p>
                              <p className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()} • ${q.totalQuote?.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center mb-2"><span className="font-medium">{comparisonQuote.clientName}</span><button onClick={() => setComparisonQuote(null)} className="text-xs text-pink-600 hover:underline">Change</button></div>
                        <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{comparisonQuote.quantity?.toLocaleString()}</span></p>
                        <hr className="my-3" />
                        <p className="text-lg"><span className="text-gray-600">Total:</span> <span className="font-bold text-green-600">${comparisonQuote.totalQuote?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Costs:</span> <span className="font-medium">${comparisonQuote.costFloor?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Profit:</span> <span className="font-medium">${comparisonQuote.profit?.toFixed(2)}</span></p>
                        <p><span className="text-gray-600">Margin:</span> <span className={`font-bold ${comparisonQuote.profitMargin >= 30 ? 'text-green-600' : comparisonQuote.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{comparisonQuote.profitMargin?.toFixed(1)}%</span></p>
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
                <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2"><Users className="w-6 h-6" /> Customers</h2>
                <button onClick={() => { setShowCustomerView(false); setSelectedCustomer(null); }} className="p-2 hover:bg-cyan-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {!selectedCustomer ? (
                  <div>
                    <p className="text-gray-600 mb-4">{uniqueCustomers.length} customers</p>
                    <div className="space-y-2">
                      {uniqueCustomers.map(c => (
                        <div key={c.name} onClick={() => setSelectedCustomer(c)} className="p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-cyan-400 flex justify-between items-center">
                          <div><p className="font-semibold">{c.name}</p><p className="text-sm text-gray-500">{c.quotes.length} quote{c.quotes.length !== 1 ? 's' : ''}</p></div>
                          <div className="text-right"><p className="font-bold text-green-600">${c.totalValue.toFixed(2)}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedCustomer(null)} className="text-cyan-600 hover:underline mb-4">← Back</button>
                    <div className="bg-cyan-50 rounded-lg p-4 mb-4"><h3 className="font-bold text-xl">{selectedCustomer.name}</h3><p className="text-gray-600">{selectedCustomer.quotes.length} quotes • ${selectedCustomer.totalValue.toFixed(2)}</p></div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr><th className="text-left p-3">Date</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Quote</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th></tr></thead>
                      <tbody>
                        {selectedCustomer.quotes.map(q => (
                          <tr key={q.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right">{q.quantity?.toLocaleString()}</td>
                            <td className="p-3 text-right font-medium">${q.totalQuote?.toFixed(2)}</td>
                            <td className="p-3 text-center"><StatusBadge status={q.status} /></td>
                            <td className="p-3 text-center"><button onClick={() => { loadQuote(q); setShowCustomerView(false); }} className="text-blue-600 hover:underline text-sm">Load</button></td>
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
