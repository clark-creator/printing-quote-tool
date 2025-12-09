/**
 * Invoice template generator
 * Creates HTML invoice for printing/PDF export
 * Supports print-only, devices-only, and print+devices line items
 */

import { SERVICE_TYPES } from './pricing';

/**
 * Generate invoice number
 * @returns {string} Invoice number in format INV-YYYYMMDD-XXX
 */
export function generateInvoiceNumber() {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `INV-${datePart}-${randomPart}`;
}

/**
 * Generate line items HTML for invoice
 * @param {Array} lineItems - Array of line item pricing data
 * @param {number} basePrice - Base price per unit for printing
 * @returns {string} HTML string for line items
 */
function generateLineItemsHTML(lineItems, basePrice) {
  return lineItems.map((item) => {
    const rows = [];
    const isDevicesOnly = item.serviceType === SERVICE_TYPES.DEVICES_ONLY;
    const isPrintAndDevices = item.serviceType === SERVICE_TYPES.PRINT_AND_DEVICES;
    
    // Line item header with service type badge
    const serviceLabel = isDevicesOnly 
      ? '🛒 Devices Only' 
      : isPrintAndDevices 
        ? '📦 Print + Devices' 
        : '🖨️ Print Only';
    
    rows.push(`
      <tr class="line-item-header">
        <td colspan="2" style="background: #f8f8f8; font-weight: bold; padding-top: 15px;">
          ${item.deviceName} (${item.quantity.toLocaleString()} units)
          <span style="font-size: 11px; font-weight: normal; margin-left: 10px; color: #666;">
            ${serviceLabel}
          </span>
        </td>
      </tr>
    `);
    
    // Printing costs (if applicable)
    if (!isDevicesOnly) {
      rows.push(`
        <tr>
          <td style="padding-left: 20px;">Printing (${item.quantity.toLocaleString()} × $${basePrice.toFixed(2)})</td>
          <td class="amount">$${item.basePrintingCost.toFixed(2)}</td>
        </tr>
      `);
      
      // Gloss finish
      if (item.glossCost > 0) {
        rows.push(`
          <tr>
            <td style="padding-left: 20px;">Gloss Finish (${item.glossFinish === 'both-sides' ? 'both sides' : 'one side'})</td>
            <td class="amount">$${item.glossCost.toFixed(2)}</td>
          </tr>
        `);
      }
      
      // Double-sided
      if (item.doubleSidedCost > 0) {
        rows.push(`
          <tr>
            <td style="padding-left: 20px;">Double-sided Printing</td>
            <td class="amount">$${item.doubleSidedCost.toFixed(2)}</td>
          </tr>
        `);
      }
      
      // Packaging
      if (item.packagingCost > 0) {
        rows.push(`
          <tr>
            <td style="padding-left: 20px;">Packaging</td>
            <td class="amount">$${item.packagingCost.toFixed(2)}</td>
          </tr>
        `);
      }
    }
    
    // Device revenue (if applicable)
    if (item.deviceRevenue > 0) {
      rows.push(`
        <tr>
          <td style="padding-left: 20px;">Devices (${item.quantity.toLocaleString()} × $${item.deviceSellingPrice.toFixed(2)})</td>
          <td class="amount">$${item.deviceRevenue.toFixed(2)}</td>
        </tr>
      `);
    }
    
    return rows.join('');
  }).join('');
}

/**
 * Generate order-level charges HTML
 * @param {Object} params - Order level charges
 * @returns {string} HTML string for order charges
 */
function generateOrderChargesHTML({ setupFee, extraDesignCost, chargeableDesigns, turnaroundFee, turnaround, sampleFee, hasPrinting }) {
  const rows = [];
  
  if (setupFee > 0 || extraDesignCost > 0 || turnaroundFee > 0 || sampleFee > 0) {
    rows.push(`
      <tr>
        <td colspan="2" style="background: #f8f8f8; font-weight: bold; padding-top: 15px;">
          Order-Level Charges
        </td>
      </tr>
    `);
    
    if (setupFee > 0) {
      rows.push(`
        <tr>
          <td>Setup Fee</td>
          <td class="amount">$${setupFee.toFixed(2)}</td>
        </tr>
      `);
    }
    
    if (extraDesignCost > 0) {
      rows.push(`
        <tr>
          <td>Extra Designs (${chargeableDesigns} × $35)</td>
          <td class="amount">$${extraDesignCost.toFixed(2)}</td>
        </tr>
      `);
    }
    
    if (turnaroundFee > 0) {
      const turnaroundLabel = turnaround === 'rush' ? 'Rush' : 'Weekend';
      const turnaroundPercent = turnaround === 'rush' ? '12%' : '20%';
      rows.push(`
        <tr>
          <td>${turnaroundLabel} Turnaround Fee (${turnaroundPercent})</td>
          <td class="amount">$${turnaroundFee.toFixed(2)}</td>
        </tr>
      `);
    }
    
    if (sampleFee > 0) {
      rows.push(`
        <tr>
          <td>Sample Run</td>
          <td class="amount">$${sampleFee.toFixed(2)}</td>
        </tr>
      `);
    }
  }
  
  return rows.join('');
}

/**
 * Generate complete invoice HTML
 * @param {Object} data - All invoice data
 * @returns {string} Complete HTML document
 */
export function generateInvoiceHTML(data) {
  const {
    invoiceNumber,
    clientName,
    accountManager,
    lineItems,
    basePrice,
    totalQuantity,
    printQuantity,
    numDesigns,
    includedDesigns,
    turnaround,
    setupFee,
    extraDesignCost,
    chargeableDesigns,
    turnaroundFee,
    sampleFee,
    printingSubtotal,
    deviceRevenue,
    subtotal,
    salesTax,
    salesTaxRate,
    shippingCost,
    totalQuote,
    hasPrinting,
    hasDevices
  } = data;
  
  const date = new Date();
  const lineItemsHTML = generateLineItemsHTML(lineItems, basePrice);
  const orderChargesHTML = generateOrderChargesHTML({
    setupFee,
    extraDesignCost,
    chargeableDesigns,
    turnaroundFee,
    turnaround,
    sampleFee,
    hasPrinting
  });
  
  // Determine order type label
  let orderTypeLabel = 'Print Order';
  if (hasDevices && hasPrinting) {
    orderTypeLabel = 'Print + Device Order';
  } else if (hasDevices && !hasPrinting) {
    orderTypeLabel = 'Device Order';
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
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
        .category-summary {
          background: #f0f7ff;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          font-size: 13px;
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
        .order-type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-top: 10px;
        }
        .order-type-print { background: #dbeafe; color: #1e40af; }
        .order-type-devices { background: #fef3c7; color: #92400e; }
        .order-type-mixed { background: #ede9fe; color: #5b21b6; }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        <p class="print-instructions">Click the button above, then select "Save as PDF" as your printer to download a PDF file.</p>
      </div>
      
      <div class="header">
        <h1>INVOICE</h1>
        <span class="order-type-badge ${hasDevices && hasPrinting ? 'order-type-mixed' : hasDevices ? 'order-type-devices' : 'order-type-print'}">
          ${orderTypeLabel}
        </span>
      </div>
      
      <div class="info-section">
        <div class="company-info">
          <div style="font-weight: bold; font-size: 16px;">Sticker Mania</div>
          <div>info@stickermania818.com</div>
          <div>https://stickermania.us/</div>
        </div>
        <div class="invoice-info">
          <div><strong>Invoice #:</strong> ${invoiceNumber}</div>
          <div><strong>Date:</strong> ${date.toLocaleDateString()}</div>
          <div><strong>Account Manager:</strong> ${accountManager}</div>
        </div>
      </div>
      
      <div class="client-info">
        <div class="section-title">Bill To:</div>
        <div>${clientName}</div>
      </div>
      
      <div class="details-section">
        <div class="section-title" style="margin-bottom: 10px;">Order Summary</div>
        <div class="details-grid">
          <div><strong>Total Units:</strong> ${totalQuantity.toLocaleString()}</div>
          <div><strong>Line Items:</strong> ${lineItems.length}</div>
          ${hasPrinting ? `<div><strong>Print Units:</strong> ${printQuantity.toLocaleString()}</div>` : ''}
          ${hasPrinting ? `<div><strong>Designs:</strong> ${numDesigns} (${includedDesigns} included)</div>` : ''}
          <div><strong>Turnaround:</strong> ${turnaround === 'normal' ? 'Normal' : turnaround === 'rush' ? 'Rush' : 'Weekend'}</div>
        </div>
      </div>
      
      ${(hasPrinting && hasDevices) ? `
        <div class="category-summary">
          <strong>Category Breakdown:</strong>
          Printing: $${printingSubtotal.toFixed(2)} • 
          Devices: $${deviceRevenue.toFixed(2)}
        </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
          ${orderChargesHTML}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row subtotal">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row per-unit">
          <span>Per unit:</span>
          <span>$${(subtotal / totalQuantity).toFixed(3)}/unit</span>
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
      
      <div class="footer">Thank you for your business!</div>
    </body>
    </html>
  `;
}

/**
 * Open invoice in new window or download as HTML
 * @param {string} html - Invoice HTML content
 * @param {string} invoiceNumber - Invoice number for filename
 */
export function openInvoice(html, invoiceNumber) {
  const newWindow = window.open('', '_blank');
  
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  } else {
    // Fallback: download as HTML file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Invoice downloaded as HTML file. Open it in your browser and use Print > Save as PDF.');
  }
}
