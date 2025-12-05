import React, { useState } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useQuote } from '../../context/QuoteContext';

/**
 * Manager Editor panel component
 * Allows adding and deleting account managers
 */
export function ManagerEditor() {
  const {
    accountManagers,
    addAccountManager,
    deleteAccountManager,
    showManagerEditor,
    setShowManagerEditor
  } = useQuote();

  const [newManagerName, setNewManagerName] = useState('');

  const handleAddManager = () => {
    if (addAccountManager(newManagerName)) {
      setNewManagerName('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddManager();
    }
  };

  if (!showManagerEditor) return null;

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Account Managers
        </h3>
        <button
          onClick={() => setShowManagerEditor(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Close
        </button>
      </div>

      {/* Manager List */}
      <div className="space-y-2 mb-4">
        {accountManagers.map((manager, index) => (
          <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
            <span className="flex-1 font-medium">{manager}</span>
            <button
              onClick={() => deleteAccountManager(manager)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
              disabled={accountManagers.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Manager */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New manager name"
          value={newManagerName}
          onChange={(e) => setNewManagerName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleAddManager}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

export default ManagerEditor;
