# Sticker Mania Printing Quote Calculator - Project Summary

**Last Updated:** December 9, 2024
**Version:** 2.2.0 (Device Dealer Mode + Service Types)

---

## Project Overview

A comprehensive printing quote calculator web application for Sticker Mania, a company that prints custom designs on vape devices (disposables, lighters, etc.). Now supports three service types: Print Only, Print + Devices, and Devices Only (Dealer Mode).

## Tech Stack

- **Framework:** Next.js 14.2.3
- **React:** 18.3.1
- **Styling:** Tailwind CSS 3.4.3
- **Icons:** lucide-react
- **Deployment:** Vercel (auto-deploys from GitHub)
- **Storage:** localStorage for persistence
- **Architecture:** Modular component-based with Context API

---

## New in v2.2.0: Device Dealer Mode

### Three Service Types per Line Item

Each line item can now be one of three service types:

1. **Print Only** 🖨️ - Client supplies their own devices, you just print
2. **Print + Devices** 📦 - You supply devices AND print on them
3. **Devices Only** 🛒 - You sell blank devices without any printing (Dealer Mode)

### Device Pricing Tiers

Devices now have quantity-based selling prices (not just cost + markup):

**1mg Disposable:**
| Quantity | Selling Price |
|----------|---------------|
| 100+ | $3.75 |
| 1,000+ | $3.25 |
| 3,000+ | $3.00 |
| 5,000+ | $2.75 |
| 10,000+ | $2.50 |

**2mg Disposable:**
| Quantity | Selling Price |
|----------|---------------|
| 100+ | $3.95 |
| 1,000+ | $3.45 |
| 3,000+ | $3.20 |
| 5,000+ | $2.95 |
| 10,000+ | $2.70 |

### Mixed Orders

A single order can contain multiple line items with different service types:
- Line 1: 1,000 units of 1mg Disposable (Print Only)
- Line 2: 500 units of 2mg Disposable (Print + Devices)
- Line 3: 2,000 units of MK Lighter (Devices Only)

---

## File Structure (v2.2)

```
/printing-quote-tool/
├── components/
│   ├── Calculator/
│   │   ├── LineItemCard.js       # Service type selector + options
│   │   ├── OrderSettings.js      # Conditional printing options
│   │   ├── QuoteBreakdown.js     # Printing + Device revenue display
│   │   ├── CostFloorBreakdown.js # Handles mixed order costs
│   │   └── ProfitAnalysis.js     # Profit metrics and commission
│   ├── QuoteManagement/
│   │   ├── QuoteHistory.js       # Searchable history table
│   │   ├── QuoteComparison.js    # Side-by-side comparison
│   │   └── CustomerView.js       # Customer aggregation
│   ├── Settings/
│   │   ├── DeviceManager.js      # Device pricing tier editor
│   │   ├── ManagerEditor.js      # Add/delete account managers
│   │   └── PrinterSettings.js    # Printer count configuration
│   └── UI/
│       └── StatusBadge.js        # Pending/Won/Lost badges
├── context/
│   └── QuoteContext.js           # Central state management
├── hooks/
│   ├── useLocalStorage.js        # localStorage sync + device migration
│   ├── useLineItems.js           # Service types + calculations
│   └── useQuoteCalculations.js   # Print vs device cost separation
├── pages/
│   ├── _app.js                   # App wrapper with global styles
│   └── index.js                  # Main calculator page
├── styles/
│   └── globals.css               # Tailwind directives
├── utils/
│   ├── pricing.js                # Service types, device pricing tiers
│   ├── costCalculations.js       # Production time, ink, labor costs
│   └── invoiceTemplate.js        # PDF invoice with service type labels
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Device Type Structure (v2.2)

Each device now stores:

```javascript
{
  name: '1mg Disposable',
  capacity: 88,           // Units per batch
  unitCost: 2.05,         // YOUR cost per device
  pricingTiers: [         // Selling prices by quantity
    { minQty: 10000, price: 2.50 },
    { minQty: 5000, price: 2.75 },
    { minQty: 3000, price: 3.00 },
    { minQty: 1000, price: 3.25 },
    { minQty: 100, price: 3.75 },
    { minQty: 0, price: 3.75 }
  ]
}
```

---

## Line Item Structure (v2.2)

```javascript
{
  id: "item-1234567890",
  deviceIndex: 0,
  quantity: 1000,
  serviceType: "print-only",  // NEW: "print-only" | "print-and-devices" | "devices-only"
  // Printing options (only apply when serviceType includes printing)
  sides: "single",
  glossFinish: "none",
  packaging: "loose"
}
```

---

## Key Calculations (v2.2)

### Print Quantity vs Total Quantity
```javascript
// Total quantity = all line items
totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

// Print quantity = only line items that include printing
printQuantity = lineItems
  .filter(item => item.serviceType !== 'devices-only')
  .reduce((sum, item) => sum + item.quantity, 0);
```

### Device Selling Price (Quantity-Based)
```javascript
function getDeviceSellingPrice(quantity, pricingTiers) {
  for (const tier of pricingTiers.sort((a, b) => b.minQty - a.minQty)) {
    if (quantity >= tier.minQty) {
      return tier.price;
    }
  }
  return pricingTiers[pricingTiers.length - 1].price;
}
```

### Device Revenue & Profit
```javascript
// For each line item with devices:
deviceSellingPrice = getDeviceSellingPrice(quantity, device.pricingTiers);
deviceRevenue = deviceSellingPrice * quantity;
deviceCostFloor = device.unitCost * quantity;
deviceProfit = deviceRevenue - deviceCostFloor;
```

### Quote Breakdown
```javascript
// Printing charges (only for print service types)
printingSubtotal = basePrinting + gloss + doubleSided + packaging;

// Device revenue (for device service types)
deviceRevenue = sum of all device line item revenues;

// Combined
lineItemsSubtotal = printingSubtotal + deviceRevenue;
```

---

## Pricing Tiers

### Printing Tiers (unchanged)
| Quantity | Price per Device | Setup Fee |
|----------|------------------|-----------|
| 100-499 | $0.80 | $150 |
| 500-999 | $0.75 | $150 |
| 1,000-2,999 | $0.70 | - |
| 3,000-4,999 | $0.65 | - |
| 5,000-9,999 | $0.60 | - |
| 10,000-24,999 | $0.60 | - |

### Device Selling Prices (new)
Defined per device type, quantity-based tiers. See Device Type Structure above.

---

## localStorage Keys (v2.2)

| Key | Content |
|-----|---------|
| `device-types-v2` | Array of devices with pricingTiers (new key for migration) |
| `account-managers` | Array of manager names |
| `saved-quotes` | Array of quote objects with serviceType per line item |

---

## Quote Data Structure (v2.2)

```javascript
{
  id: "quote-1234567890",
  clientName: "Client Name",
  accountManager: "Ryan",
  lineItems: [
    {
      id: "item-1",
      deviceIndex: 0,
      deviceTypeName: "1mg Disposable",
      quantity: 1000,
      serviceType: "print-and-devices",  // NEW
      sides: "single",
      glossFinish: "none",
      packaging: "loose"
    }
  ],
  numDesigns: 1,
  turnaround: "normal",
  sampleRun: true,
  waiveSampleFee: false,
  shippingType: "shopify",
  shopifyQuote: 0,
  shippingMarkup: 20,
  salesTaxRate: 0,
  designWaivers: 0,
  numPrinters: 3,
  totalQuantity: 3000,
  printQuantity: 2000,      // NEW: quantity of print items only
  hasPrinting: true,        // NEW: order includes printing
  hasDevices: true,         // NEW: order includes devices
  totalQuote: 2500.00,
  costFloor: 1800.00,
  profit: 700.00,
  profitMargin: 28.0,
  productionDays: 2,
  createdAt: "2025-12-09T...",
  status: "pending"
}
```

---

## Version History

### v2.2.0 (December 9, 2024)
- **Added service types:** Print Only, Print + Devices, Devices Only
- **Added device pricing tiers** with quantity-based selling prices
- **Device Manager** now includes pricing tier editor
- **Mixed orders** support different service types per line item
- **Print quantity** tracked separately from total quantity
- **Conditional UI** hides printing options for devices-only orders
- **Invoice** updated to show service type labels

### v2.1.0 (December 9, 2024)
- Updated pricing tiers to new strategy
- Updated double-sided fee to flat $0.35/unit
- Added account manager commission display (10% of gross profit)

### v2.0.0 (December 4, 2024)
- Modular refactor with multi-device support
- Context API for state management
- Custom hooks for calculations
- Quote management system

---

## Deployment

- Hosted on Vercel
- Connected to GitHub repository
- Auto-deploys on push to main branch
- **Live URL:** https://printing-quote-tool.vercel.app/

### To Deploy Updates:
```bash
# Replace your local files with the updated ones
git add .
git commit -m "v2.2.0: Device dealer mode + service types"
git push
# Vercel auto-deploys within 1-2 minutes
```

---

## Future Enhancement Ideas

- Store device margin/profit in saved quotes
- Device inventory tracking
- Handling/inspection fee for device-only orders
- Bulk device discount for repeat customers
- Device sourcing cost tracking over time
