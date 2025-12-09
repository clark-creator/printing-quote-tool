import React from 'react';
import { Trash2, Printer, Package, ShoppingBag } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../../utils/pricing';

/**
 * Individual line item card component
 * Displays device selection, quantity, service type, and all per-item options
 * @param {Object} props
 * @param {Object} props.item - Line item data with calculations
 * @param {number} props.index - Index in the line items array
 */
export function LineItemCard({ item, index }) {
  const {
    deviceTypes,
    lineItems,
    updateLineItem,
    removeLineItem
  } = useQuote();

  const handleQuantityInputChange = (value) => {
    updateLineItem(item.id, 'quantityInput', value);
  };

  const handleQuantityBlur = () => {
    updateLineItem(item.id, 'quantityInput', item.quantity.toString());
  };

  // Determine service type for styling
  const isPrintOnly = item.serviceType === SERVICE_TYPES.PRINT_ONLY;
  const isDevicesOnly = item.serviceType === SERVICE_TYPES.DEVICES_ONLY;
  const isPrintAndDevices = item.serviceType === SERVICE_TYPES.PRINT_AND_DEVICES;

  // Get current device for pricing display
  const currentDevice = deviceTypes[item.deviceIndex] || {};

  return (
    <div className={`border-2 rounded-lg p-4 ${
      isDevicesOnly 
        ? 'bg-amber-50 border-amber-200' 
        : isPrintAndDevices 
          ? 'bg-purple-50 border-purple-200'
          : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Item {index + 1}</span>
          {/* Service type badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDevicesOnly 
              ? 'bg-amber-100 text-amber-700' 
              : isPrintAndDevices 
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
          }`}>
            {isDevicesOnly && <ShoppingBag className="w-3 h-3 inline mr-1" />}
            {isPrintOnly && <Printer className="w-3 h-3 inline mr-1" />}
            {isPrintAndDevices && <Package className="w-3 h-3 inline mr-1" />}
            {isDevicesOnly ? 'Devices Only' : isPrintAndDevices ? 'Print + Devices' : 'Print Only'}
          </span>
        </div>
        {lineItems.length > 1 && (
          <button
            onClick={() => removeLineItem(item.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Service Type */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Service Type
          </label>
          <select
            value={item.serviceType}
            onChange={(e) => updateLineItem(item.id, 'serviceType', e.target.value)}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded font-medium"
          >
            <option value={SERVICE_TYPES.PRINT_ONLY}>
              🖨️ Print Only (client supplies devices)
            </option>
            <option value={SERVICE_TYPES.PRINT_AND_DEVICES}>
              📦 Print + Devices (we supply & print)
            </option>
            <option value={SERVICE_TYPES.DEVICES_ONLY}>
              🛒 Devices Only (no printing)
            </option>
          </select>
        </div>

        {/* Device Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Device Type
          </label>
          <select
            value={item.deviceIndex}
            onChange={(e) => updateLineItem(item.id, 'deviceIndex', Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            {deviceTypes.map((device, i) => (
              <option key={i} value={i}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Quantity
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={item.quantityInput}
            onChange={(e) => handleQuantityInputChange(e.target.value)}
            onBlur={handleQuantityBlur}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>

        {/* Device Pricing Display (for orders with devices) */}
        {!isPrintOnly && item.deviceSellingPrice > 0 && (
          <div className="col-span-2 bg-white rounded p-2 border border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Device Price:</span>
              <span className="font-semibold text-green-600">
                ${item.deviceSellingPrice.toFixed(2)}/unit
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>Your cost: ${currentDevice.unitCost?.toFixed(2)}/unit</span>
              <span>Margin: ${(item.deviceSellingPrice - (currentDevice.unitCost || 0)).toFixed(2)}/unit</span>
            </div>
          </div>
        )}

        {/* Printing Options - Only show if service includes printing */}
        {!isDevicesOnly && (
          <>
            {/* Sides */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sides
              </label>
              <select
                value={item.sides}
                onChange={(e) => updateLineItem(item.id, 'sides', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="single">Single-sided</option>
                <option value="double">Double (+$0.35)</option>
              </select>
            </div>

            {/* Gloss Finish */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Gloss Finish
              </label>
              <select
                value={item.glossFinish}
                onChange={(e) => updateLineItem(item.id, 'glossFinish', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="none">No Gloss</option>
                <option value="single-side">One side (+$0.07)</option>
                <option value="both-sides" disabled={item.sides === 'single'}>
                  Both sides (+$0.12)
                </option>
              </select>
            </div>

            {/* Packaging */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Packaging
              </label>
              <select
                value={item.packaging}
                onChange={(e) => updateLineItem(item.id, 'packaging', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="loose">Loose Bulk (included)</option>
                <option value="sticker-mania">Sticker Mania (+$0.11)</option>
                <option value="client">Client packaging (+$0.16)</option>
              </select>
            </div>
          </>
        )}

        {/* Line Item Summary */}
        <div className="col-span-2 pt-2 border-t mt-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Line Item Total:</span>
            <span className="font-bold text-gray-900">
              ${item.lineItemSubtotal?.toFixed(2) || '0.00'}
            </span>
          </div>
          {item.lineItemSubtotal > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>Per unit:</span>
              <span>${(item.lineItemSubtotal / item.quantity).toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LineItemCard;
