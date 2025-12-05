import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Device Manager panel component
 * Allows adding, editing, and deleting device types
 */
export function DeviceManager() {
  const {
    deviceTypes,
    addDeviceType,
    updateDeviceType,
    deleteDeviceType,
    showDeviceManager,
    setShowDeviceManager
  } = useQuote();

  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCapacity, setNewDeviceCapacity] = useState(80);
  const [newDeviceUnitCost, setNewDeviceUnitCost] = useState(0);

  // Local state for editing
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(80);
  const [editUnitCost, setEditUnitCost] = useState(0);

  const handleStartEdit = (index) => {
    const device = deviceTypes[index];
    setEditingDevice(index);
    setEditName(device.name);
    setEditCapacity(device.capacity);
    setEditUnitCost(device.unitCost || 0);
  };

  const handleSaveEdit = (index) => {
    updateDeviceType(index, editName, editCapacity, editUnitCost);
    setEditingDevice(null);
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
  };

  const handleAddDevice = () => {
    if (addDeviceType(newDeviceName, newDeviceCapacity, newDeviceUnitCost)) {
      setNewDeviceName('');
      setNewDeviceCapacity(80);
      setNewDeviceUnitCost(0);
    }
  };

  const handleDeleteDevice = (index) => {
    if (!deleteDeviceType(index)) {
      alert('Cannot delete the last device type');
    }
  };

  if (!showDeviceManager) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Device Types
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
          <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
            {editingDevice === index ? (
              <>
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
                  className="w-20 px-2 py-1 border rounded text-sm"
                  placeholder="Cost"
                  min="0"
                />
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
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{device.name}</span>
                <span className="text-sm text-gray-600">{device.capacity}/batch</span>
                <span className="text-sm text-green-600">${(device.unitCost || 0).toFixed(2)}/unit</span>
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
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Device */}
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
          placeholder="Cost ($)"
          value={newDeviceUnitCost}
          onChange={(e) => setNewDeviceUnitCost(Number(e.target.value))}
          className="w-24 px-3 py-2 border rounded"
          title="Cost per unit"
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
        Capacity = units per batch | Cost = your cost per device unit
      </p>
    </div>
  );
}

export default DeviceManager;
