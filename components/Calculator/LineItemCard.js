import React from 'react';
import { Trash2 } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Individual line item card component
 * Displays device selection, quantity, and all per-item options
 * @param {Object} props
 * @param {Object} props.item - Line item data
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-700">Item {index + 1}</span>
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
            <option value="double">Double (+$0.31)</option>
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

        {/* Device Supply Section */}
        <div className="col-span-2 pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id={`supply-${item.id}`}
              checked={item.supplyingDevices}
              onChange={(e) => updateLineItem(item.id, 'supplyingDevices', e.target.checked)}
              className="w-4 h-4"
            />
            <label
              htmlFor={`supply-${item.id}`}
              className="text-xs font-medium text-gray-700"
            >
              We are supplying devices
            </label>
          </div>

          {item.supplyingDevices && (
            <div className="grid grid-cols-2 gap-2 ml-6">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Cost/unit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.deviceCost}
                  onChange={(e) => updateLineItem(item.id, 'deviceCost', Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
                  value={item.deviceMarkup}
                  onChange={(e) => updateLineItem(item.id, 'deviceMarkup', Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LineItemCard;
