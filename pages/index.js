import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, Plus, Edit2, Trash2, Settings, FileText } from 'lucide-react';

export default function PrintingQuoteTool() {
  // Device type management with persistent storage
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCapacity, setNewDeviceCapacity] = useState(80);

  // Account manager management with persistent storage
  const [accountManagers, setAccountManagers] = useState([]);
  const [showManagerEditor, setShowManagerEditor] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');

  // Project Details
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [accountManager, setAccountManager] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [quantity, setQuantity] = useState(1000);
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

  // Production settings (adjustable)
  const [numMachines, setNumMachines] = useState(3);
  const [showProductionSettings, setShowProductionSettings] = useState(false);

  // Load device types and account managers on mount
  useEffect(() => {
    loadDeviceTypes();
    loadAccountManagers();
  }, []);

  const loadDeviceTypes = () => {
    try {
      const stored = localStorage.getItem('device-types');
      if (stored) {
        setDeviceTypes(JSON.parse(stored));
      } else {
        const defaults = [
          { name: '1mg Disposable', capacity: 88 },
          { name: '2mg Disposable', capacity: 77 },
          { name: 'MK Lighter', capacity: 80 }
        ];
        setDeviceTypes(defaults);
        localStorage.setItem('device-types', JSON.stringify(defaults));
      }
    } catch (error) {
      setDeviceTypes([
        { name: '1mg Disposable', capacity: 88 },
        { name: '2mg Disposable', capacity: 77 },
        { name: 'MK Lighter', capacity: 80 }
      ]);
    }
  };

  const loadAccountManagers = () => {
    try {
      const stored = localStorage.getItem('account-managers');
      if (stored) {
        setAccountManagers(JSON.parse(stored));
      } else {
        const defaults = ['Ryan', 'Kyle', 'Anthony', 'Clarence'];
        setAccountManagers(defaults);
        localStorage.setItem('account-managers', JSON.stringify(defaults));
      }
    } catch (error) {
      setAccountManagers(['Ryan', 'Kyle', 'Anthony', 'Clarence']);
    }
  };

  const saveDeviceTypes = (types) => {
    setDeviceTypes(types);
    try {
      localStorage.setItem('device-types', JSON.stringify(types));
    } catch (error) {
      console.error('Failed to save device types:', error);
    }
  };

  const saveAccountManagers = (managers) => {
    setAccountManagers(managers);
    try {
      localStorage.setItem('account-managers', JSON.stringify(managers));
    } catch (error) {
      console.error('Failed to save account managers:', error);
    }
  };

  const addDeviceType = () => {
    if (newDeviceName.trim()) {
      const newTypes = [...deviceTypes, { name: newDeviceName, capacity: newDeviceCapacity }];
      saveDeviceTypes(newTypes);
      setNewDeviceName('');
      setNewDeviceCapacity(80);
    }
  };

  const updateDeviceType = (index, name, capacity) => {
    const updated = [...deviceTypes];
    updated[index] = { name, capacity };
    saveDeviceTypes(updated);
    setEditingDevice(null);
  };

  const deleteDeviceType = (index) => {
    if (deviceTypes.length === 1) {
      const defaults = [
        { name: '1mg Disposable', capacity: 88 },
        { name: '2mg Disposable', capacity: 77 },
        { name: 'MK Lighter', capacity: 80 }
      ];
      saveDeviceTypes(defaults);
      setSelectedDevice(0);
      return;
    }
    
    const updated = deviceTypes.filter((_, i) => i !== index);
    saveDeviceTypes(updated);
    
    if (selectedDevice >= updated.length) {
      setSelectedDevice(updated.length - 1);
    }
  };

  const addAccountManager = () => {
    if (newManagerName.trim() && !accountManagers.includes(newManagerName.trim())) {
      const updated = [...accountManagers, newManagerName.trim()];
      saveAccountManagers(updated);
      setNewManagerName('');
    }
  };

  const deleteAccountManager = (name) => {
    const updated = accountManagers.filter(m => m !== name);
    saveAccountManagers(updated);
    if (accountManager === name && updated.length > 0) {
      setAccountManager(updated[0]);
    }
  };

  // Set default account manager once loaded
  useEffect(() => {
    if (accountManagers.length > 0 && !accountManager) {
      setAccountManager(accountManagers[0]);
    }
  }, [accountManagers, accountManager]);

  // Get current device capacity
  const deviceCapacity = deviceTypes[selectedDevice]?.capacity || 80;

  // Automatically optimize number of machines for small orders
  const optimizedNumMachines = useMemo(() => {
    const batchesNeeded = Math.ceil(quantity / deviceCapacity);
    const hasGloss = glossFinish !== 'none';
    const minutesPerBatch = hasGloss ? 45 : 35;
    const totalPrintMinutes = batchesNeeded * minutesPerBatch * (sides === 'double' ? 2 : 1);
    const productionHours = totalPrintMinutes / 60;
    
    if (productionHours < 2) return 1;
    if (productionHours < 12) return Math.min(2, numMachines);
    return numMachines;
  }, [quantity, deviceCapacity, glossFinish, sides, numMachines]);

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
    
    return {
      includedDesigns: included,
      extraDesigns: extra,
      extraDesignCost: designCost
    };
  }, [quantity, numDesigns, designWaivers]);

  const packagingCost = useMemo(() => {
    if (packaging === 'loose') return 0;
    if (packaging === 'sticker-mania') return 0.11 * quantity;
    return 0.16 * quantity;
  }, [packaging, quantity]);

  const baseQuote = (basePrice * quantity) + setupFee + glossCost + doubleSidedCost + 
                    extraDesignCost + packagingCost;

  const deviceSupplyCost = supplyingDevices ? deviceCost * quantity * (1 + deviceMarkup / 100) : 0;

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
  
  const batchesNeeded = Math.ceil(quantity / deviceCapacity);
  const hasGloss = glossFinish !== 'none';
  const minutesPerBatch = hasGloss ? 45 : 35;
  const totalPrintMinutes = batchesNeeded * minutesPerBatch * (sides === 'double' ? 2 : 1);
  const productionHours = totalPrintMinutes / 60;
  const productionDays = Math.ceil(productionHours / (6 * optimizedNumMachines));
  
  const machineSetupCost = productionDays * 23;
  const samplePrintingCost = sampleRun && !waiveSampleFee ? 0 : 23;
  
  const preProductionCost = fileSetupCost + machineSetupCost + samplePrintingCost;

  const numSidesPrinted = sides === 'double' ? 2 : 1;
  const baseCMYKInkCost = 0.03 * numSidesPrinted * quantity;
  
  let glossInkCost = 0;
  if (glossFinish === 'single-side') {
    glossInkCost = 0.01 * quantity;
  } else if (glossFinish === 'both-sides') {
    glossInkCost = 0.02 * quantity;
  }
  
  const inkCost = baseCMYKInkCost + glossInkCost;
  const productionLaborCost = (productionHours / optimizedNumMachines) * 23;
  const productionCost = inkCost + productionLaborCost;

  const repackagingCost = useMemo(() => {
    if (packaging === 'loose') return 0;
    return 0.06 * quantity;
  }, [packaging, quantity]);
  
  const shippingStagingCost = (40 / 60) * 20;
  const postProductionCost = repackagingCost + shippingStagingCost;

  const deviceCostFloor = supplyingDevices ? deviceCost * quantity : 0;
  const costFloor = preProductionCost + productionCost + postProductionCost + deviceCostFloor;

  const profit = totalQuote - costFloor;
  const profitMargin = totalQuote > 0 ? (profit / totalQuote) * 100 : 0;

  // Generate PDF Invoice - opens in new tab for printing
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
    if (supplyingDevices) lineItems.push({ desc: `Devices (${quantity.toLocaleString()} × ${(deviceCost * (1 + deviceMarkup / 100)).toFixed(2)})`, amount: deviceSupplyCost.toFixed(2) });
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
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 36px;
            margin: 0 0 20px 0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .company-info, .invoice-info {
            flex: 1;
          }
          .invoice-info {
            text-align: right;
          }
          .client-info {
            margin-bottom: 30px;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .details-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #f0f0f0;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .amount {
            text-align: right;
          }
          .totals {
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .totals-row.subtotal {
            border-top: 1px solid #ddd;
            font-weight: bold;
          }
          .totals-row.total {
            border-top: 2px solid #333;
            font-size: 18px;
            font-weight: bold;
            padding-top: 12px;
          }
          .per-unit {
            font-size: 12px;
            font-style: italic;
            color: #666;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            font-style: italic;
            color: #666;
          }
          .print-button {
            background: #10b981;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            margin: 20px auto;
            display: block;
          }
          .print-button:hover {
            background: #059669;
          }
          .print-instructions {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
          <p class="print-instructions">Click the button above, then select "Save as PDF" as your printer to download a PDF file.</p>
        </div>
        
        <div class="header">
          <h1>INVOICE</h1>
        </div>
        
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
          ${projectName ? `<div style="margin-top: 10px;"><strong>Project:</strong> ${projectName}</div>` : ''}
        </div>
        
        <div class="details-section">
          <div class="section-title" style="margin-bottom: 10px;">Project Details</div>
          <div class="details-grid">
            <div><strong>Device Type:</strong> ${deviceTypes[selectedDevice]?.name || 'N/A'}</div>
            <div><strong>Quantity:</strong> ${quantity.toLocaleString()} units</div>
            <div><strong>Designs:</strong> ${numDesigns} (${includedDesigns} included, ${extraDesigns > 0 ? extraDesigns - designWaivers + ' charged' : '0 extra'})</div>
            <div><strong>Finish:</strong> ${glossFinish === 'none' ? 'No Gloss' : glossFinish === 'single-side' ? 'Gloss on one side' : 'Gloss on both sides'}</div>
            <div><strong>Sides:</strong> ${sides === 'single' ? 'Single-sided' : 'Double-sided'}</div>
            <div><strong>Packaging:</strong> ${packaging === 'loose' ? 'Loose Bulk' : packaging === 'sticker-mania' ? 'Sticker Mania Packaging' : 'Client Packaging'}</div>
            <div><strong>Turnaround:</strong> ${turnaround === 'normal' ? 'Normal' : turnaround === 'rush' ? '48-72 Hour Rush' : 'Weekend/Overnight'}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td>${item.desc}</td>
                <td class="amount">$${item.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row subtotal">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row per-unit">
            <span>Per unit cost:</span>
            <span>$${(subtotal / quantity).toFixed(3)}/device</span>
          </div>
          ${salesTax > 0 ? `
            <div class="totals-row">
              <span>Sales Tax (${salesTaxRate}%):</span>
              <span>$${salesTax.toFixed(2)}</span>
            </div>
          ` : ''}
          ${shippingCost > 0 ? `
            <div class="totals-row">
              <span>Shipping:</span>
              <span>$${shippingCost.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>TOTAL:</span>
            <span>$${totalQuote.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          Thank you for your business!
        </div>
      </body>
      </html>
    `;
    
    // Open invoice in a new tab
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
    } else {
      // Fallback: download as HTML file if popup blocked
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Direct-to-Object Printing Quote Calculator</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowManagerEditor(!showManagerEditor)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Settings className="w-4 h-4" />
                Managers
              </button>
              <button
                onClick={() => setShowDeviceManager(!showDeviceManager)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Settings className="w-4 h-4" />
                Devices
              </button>
            </div>
          </div>

          {showManagerEditor && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4">Account Managers</h3>
              <div className="space-y-2 mb-4">
                {accountManagers.map((manager, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{manager}</span>
                    <button
                      onClick={() => deleteAccountManager(manager)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New manager name"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  onClick={addAccountManager}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          )}

          {showDeviceManager && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Device Type Manager</h3>
              <div className="space-y-2 mb-4">
                {deviceTypes.map((device, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    {editingDevice === index ? (
                      <>
                        <input
                          type="text"
                          value={device.name}
                          onChange={(e) => {
                            const updated = [...deviceTypes];
                            updated[index].name = e.target.value;
                            setDeviceTypes(updated);
                          }}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <input
                          type="number"
                          value={device.capacity}
                          onChange={(e) => {
                            const updated = [...deviceTypes];
                            updated[index].capacity = Number(e.target.value);
                            setDeviceTypes(updated);
                          }}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <button
                          onClick={() => updateDeviceType(index, device.name, device.capacity)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{device.name}</span>
                        <span className="text-sm text-gray-600">{device.capacity}/batch</span>
                        <button
                          onClick={() => setEditingDevice(index)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDeviceType(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New device name"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newDeviceCapacity}
                  onChange={(e) => setNewDeviceCapacity(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded"
                />
                <button
                  onClick={addDeviceType}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Manager
                </label>
                <select
                  value={accountManager}
                  onChange={(e) => setAccountManager(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {accountManagers.map((manager, index) => (
                    <option key={index} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {deviceTypes.map((device, index) => (
                    <option key={index} value={index}>
                      {device.name} ({device.capacity}/batch)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity: {quantity.toLocaleString()} units
                </label>
                <input
                  type="range"
                  min="100"
                  max="500000"
                  step="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  min="100"
                  max="500000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(500000, Math.max(100, Number(e.target.value))))}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of SKUs/Designs
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={numDesigns}
                  onChange={(e) => setNumDesigns(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {includedDesigns} design{includedDesigns !== 1 ? 's' : ''} included (1 per 1,000 units)
                  {extraDesigns > 0 && ` • ${extraDesigns} extra design${extraDesigns !== 1 ? 's' : ''} @ $35 each`}
                </p>
              </div>

              {extraDesigns > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of extra designs to waive fee for
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={extraDesigns}
                    value={designWaivers}
                    onChange={(e) => setDesignWaivers(Math.min(Number(e.target.value), extraDesigns))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gloss Finish
                </label>
                <select
                  value={glossFinish}
                  onChange={(e) => setGlossFinish(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">No Gloss</option>
                  <option value="single-side">Gloss on one side (+$0.07/device)</option>
                  <option value="both-sides" disabled={sides === 'single'}>
                    Gloss on both sides (+$0.12/device){sides === 'single' ? ' - Requires double-sided' : ''}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Sides
                </label>
                <select
                  value={sides}
                  onChange={(e) => {
                    setSides(e.target.value);
                    if (e.target.value === 'single' && glossFinish === 'both-sides') {
                      setGlossFinish('single-side');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="single">Single-sided</option>
                  <option value="double">Double-sided (+$0.31/device)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packaging
                </label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="loose">Loose Bulk (included)</option>
                  <option value="sticker-mania">Repack into Sticker Mania neutral packaging (+$0.11/device)</option>
                  <option value="client">Repack into client packaging (+$0.16/device)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turnaround
                </label>
                <select
                  value={turnaround}
                  onChange={(e) => setTurnaround(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal estimated turnaround</option>
                  <option value="rush">48-72 hour rush (+12%)</option>
                  <option value="weekend">Weekend/overnight (+20%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sample"
                    checked={sampleRun}
                    onChange={(e) => setSampleRun(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="sample" className="text-sm font-medium text-gray-700">
                    Pre-production sample run ($65 - credited back at 5k+)
                  </label>
                </div>
                {sampleRun && (
                  <div className="ml-7 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="waive-sample"
                      checked={waiveSampleFee}
                      onChange={(e) => setWaiveSampleFee(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="waive-sample" className="text-sm text-gray-600">
                      Waive sample fee
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Shipping
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="shopify"
                    checked={shippingType === 'shopify'}
                    onChange={() => setShippingType('shopify')}
                    className="w-4 h-4"
                  />
                  <label htmlFor="shopify" className="text-sm text-gray-700">
                    Shopify calculated shipping
                  </label>
                </div>
                {shippingType === 'shopify' && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Base Shopify quote ($)
                      </label>
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
                      <label className="block text-xs text-gray-600 mb-1">
                        Markup (%)
                      </label>
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
                  <label htmlFor="pickup" className="text-sm text-gray-700">
                    Free local pickup (LA)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={salesTaxRate}
                  onChange={(e) => setSalesTaxRate(Math.min(20, Math.max(0, Number(e.target.value))))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="supply-devices"
                    checked={supplyingDevices}
                    onChange={(e) => setSupplyingDevices(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="supply-devices" className="text-sm font-medium text-gray-700">
                    We are supplying devices
                  </label>
                </div>
                {supplyingDevices && (
                  <div className="ml-7 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Device cost per unit ($)
                      </label>
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
                      <label className="block text-xs text-gray-600 mb-1">
                        Markup (%)
                      </label>
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

              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowProductionSettings(!showProductionSettings)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  Production Settings
                </button>
                {showProductionSettings && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs text-gray-600 mb-1">
                      Number of machines running
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numMachines}
                      onChange={(e) => setNumMachines(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Auto-optimized to {optimizedNumMachines} machine{optimizedNumMachines !== 1 ? 's' : ''} for this order
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Calculations</h2>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Tier</h3>
                <div className="text-sm text-blue-800">
                  <p>Base Price: ${basePrice.toFixed(2)} per unit</p>
                  {setupFee > 0 && <p>Setup Fee: ${setupFee.toFixed(2)}</p>}
                  <p className="text-xs mt-2 text-blue-600">
                    Production: {productionDays} day{productionDays !== 1 ? 's' : ''} • {batchesNeeded} batch{batchesNeeded !== 1 ? 'es' : ''} • {deviceCapacity}/batch • {optimizedNumMachines} machine{optimizedNumMachines !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Project Quote</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Base ({quantity.toLocaleString()} × ${basePrice.toFixed(2)}):</span>
                    <span className="font-medium">${(basePrice * quantity).toFixed(2)}</span>
                  </div>
                  {setupFee > 0 && (
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-medium">${setupFee.toFixed(2)}</span>
                    </div>
                  )}
                  {glossCost > 0 && (
                    <div className="flex justify-between">
                      <span>Gloss finish ({glossFinish === 'both-sides' ? 'both sides' : 'one side'}):</span>
                      <span className="font-medium">${glossCost.toFixed(2)}</span>
                    </div>
                  )}
                  {doubleSidedCost > 0 && (
                    <div className="flex justify-between">
                      <span>Double-sided:</span>
                      <span className="font-medium">${doubleSidedCost.toFixed(2)}</span>
                    </div>
                  )}
                  {extraDesignCost > 0 && (
                    <div className="flex justify-between">
                      <span>Extra designs ({extraDesigns - designWaivers} × $35):</span>
                      <span className="font-medium">${extraDesignCost.toFixed(2)}</span>
                    </div>
                  )}
                  {packagingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Packaging:</span>
                      <span className="font-medium">${packagingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {supplyingDevices && (
                    <div className="flex justify-between">
                      <span>Devices ({quantity.toLocaleString()} × ${(deviceCost * (1 + deviceMarkup / 100)).toFixed(2)}):</span>
                      <span className="font-medium">${deviceSupplyCost.toFixed(2)}</span>
                    </div>
                  )}
                  {turnaroundFee > 0 && (
                    <div className="flex justify-between">
                      <span>Turnaround fee ({turnaround === 'rush' ? '12%' : '20%'}):</span>
                      <span className="font-medium">${turnaroundFee.toFixed(2)}</span>
                    </div>
                  )}
                  {sampleFee > 0 && (
                    <div className="flex justify-between">
                      <span>Sample run{quantity >= 5000 ? ' (credited)' : ''}:</span>
                      <span className="font-medium">${sampleFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-green-300 pt-2 flex justify-between font-semibold">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-700 italic">
                    <span>Per unit cost:</span>
                    <span>${(subtotal / quantity).toFixed(3)}/device</span>
                  </div>
                  {salesTax > 0 && (
                    <div className="flex justify-between">
                      <span>Sales Tax ({salesTaxRate}%):</span>
                      <span className="font-medium">${salesTax.toFixed(2)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-medium">${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-green-300 pt-2 flex justify-between text-base font-bold text-green-900">
                    <span>Total Quote:</span>
                    <span>${totalQuote.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Cost Floor</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
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
                        <span>Labor ({productionHours.toFixed(1)}hrs @ $23/hr):</span>
                        <span>${productionLaborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Subtotal:</span>
                        <span>${productionCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

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
                    <div className="flex justify-between text-base font-bold text-purple-900">
                      <span>Profit Margin:</span>
                      <span className={profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}>
                        {profitMargin.toFixed(1)}%
                      </span>
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

          {clientName && quantity >= 100 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={generatePDFInvoice}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg transform transition hover:scale-105"
              >
                <FileText className="w-6 h-6" />
                Generate PDF Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
