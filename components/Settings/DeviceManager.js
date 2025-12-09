import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';
import { generateDevicePricingTiers } from '../../utils/pricing';

/**
 * Device Manager panel component
 * Allows adding, editing, and deleting device types with pricing tiers
 */
export function DeviceManager() {
  const {
    deviceTypes,
    addDeviceType,
    updateDeviceType,
    updateDevicePricingTiers,
    deleteDeviceType,
    showDeviceManager,
    setShowDeviceManager
  } = useQuote();

  const [editingDevice, setEditingDevice] = useState(null);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCapacity, setNewDeviceCapacity] = useState(80);
  const [newDeviceUnitCost, setNewDeviceUnitCost] = useState(2.00);

  // Local state for editing
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(80);
  const [editUnitCost, setEditUnitCost] = useState(0);
  const [editPricingTiers, setEditPricingTiers] = useState([]);

  const handleStartEdit = (index) => {
    const device = deviceTypes[index];
    setEditingDevice(index);
    setEditName(device.name);
    setEditCapacity(device.capacity);
    setEditUnitCost(device.unitCost || 0);
    setEditPricingTiers(device.pricingTiers ? [...device.pricingTiers] : generateDevicePricingTiers(device.unitCost || 2.00));
  };

  const handleSaveEdit = (index) => {
    updateDeviceType(index, editName, editCapacity, editUnitCost, editPricingTiers);
    setEditingDevice(null);
    setExpandedDevice(null);
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
  };

  const handleAddDevice = () => {
    if (addDeviceType(newDeviceName, newDeviceCapacity, newDeviceUnitCost)) {
      setNewDeviceName('');
      setNewDeviceCapacity(80);
      setNewDeviceUnitCost(2.00);
    }
  };

  const handleDeleteDevice = (index) => {
    if (!deleteDeviceType(index)) {
      alert('Cannot delete the last device type');
    }
  };

  const handleUpdateTierPrice = (tierIndex, newPrice) => {
    const updated = [...editPricingTiers];
    updated[tierIndex] = { ...updated[tierIndex], price: Number(newPrice) };
    setEditPricingTiers(updated);
  };

  const toggleExpand = (index) => {
    if (expandedDevice === index) {
      setExpandedDevice(null);
    } else {
      setExpandedDevice(index);
    }
  };

  if (!showDeviceManager) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Device Types & Pricing
        </h3>
        <button
          onClick={() => setShowDeviceManager(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Close
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-2 mb-4">
        {deviceTypes.map((device, index) => (
          <div key={index} className="bg-white rounded-lg border overflow-hidden">
            {editingDevice === index ? (
              // Edit Mode
              <div className="p-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    placeholder="Capacity"
                    min="1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(Number(e.target.value))}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder="Your Cost"
                    min="0"
                  />
                </div>

                {/* Pricing Tiers Editor */}
                <div className="bg-amber-50 rounded p-2 border border-amber-200">
                  <p className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Selling Price Tiers
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {editPricingTiers.map((tier, tierIndex) => (
                      <div key={tierIndex} className="flex items-center gap-1">
                        <span className="text-gray-600 w-16">{tier.minQty}+ units:</span>
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleUpdateTierPrice(tierIndex, e.target.value)}
                          className="w-16 px-1 py-0.5 border rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Margin at 1000+: ${(editPricingTiers.find(t => t.minQty === 1000)?.price - editUnitCost).toFixed(2)}/unit
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expandedDevice === index ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <span className="flex-1 font-medium">{device.name}</span>
                  <span className="text-sm text-gray-600">{device.capacity}/batch</span>
                  <span className="text-sm text-green-600">${(device.unitCost || 0).toFixed(2)} cost</span>
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                    disabled={deviceTypes.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Pricing View */}
                {expandedDevice === index && device.pricingTiers && (
                  <div className="px-3 pb-3 border-t bg-gray-50">
                    <p className="text-xs font-medium text-gray-600 mt-2 mb-1">Selling Prices:</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                      {device.pricingTiers.map((tier, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-500">{tier.minQty}+ units:</span>
                          <span className="font-medium text-green-600">${tier.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Your cost: ${(device.unitCost || 0).toFixed(2)} • 
                      Best margin: ${((device.pricingTiers[0]?.price || 0) - (device.unitCost || 0)).toFixed(2)}/unit at 10k+
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Device */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Add New Device Type</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Device name"
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
            title="Units per batch"
            min="1"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Your cost ($)"
            value={newDeviceUnitCost}
            onChange={(e) => setNewDeviceUnitCost(Number(e.target.value))}
            className="w-28 px-3 py-2 border rounded"
            title="Your cost per unit"
            min="0"
          />
          <button
            onClick={handleAddDevice}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pricing tiers will be auto-generated based on your cost. You can edit them after adding.
        </p>
      </div>
    </div>
  );
}

export default DeviceManager;
