// components/AddTradeModal.jsx
'use client';

import { useState, useEffect } from 'react';

export default function AddTradeModal({ showModal, setShowModal, handleSubmit, formData, handleChange, selectedDate, loading = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [pastedImage, setPastedImage] = useState(null);

  // Update image preview when formData.image changes
  useEffect(() => {
    if (formData.image) {
      const fileReader = new FileReader();
      fileReader.onload = () => setImagePreview(fileReader.result);
      fileReader.readAsDataURL(formData.image);
    } else {
      setImagePreview(null);
    }
  }, [formData.image]);

  // Handle paste events for screenshots
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Create a new File object with a proper name
          const imageFile = new File([file], `screenshot-${Date.now()}.png`, {
            type: file.type,
            lastModified: Date.now()
          });
          
          // Update form data with the pasted image
          const event = {
            target: {
              name: 'image',
              files: [imageFile]
            }
          };
          handleChange(event);
          
          // Show preview
          const fileReader = new FileReader();
          fileReader.onload = () => setPastedImage(fileReader.result);
          fileReader.readAsDataURL(file);
          
          // Add note about pasted image
          if (!formData.notes.includes('📸 Screenshot pasted')) {
            const event2 = {
              target: {
                name: 'notes',
                value: formData.notes + (formData.notes ? '\n\n' : '') + '📸 Screenshot pasted from clipboard'
              }
            };
            handleChange(event2);
          }
        }
        break;
      }
    }
  };

  // Calculate position size and other metrics
  const calculateMetrics = () => {
    const entry = Number(formData.entry) || 0;
    const exit = Number(formData.exit) || 0;
    const lotSize = Number(formData.lotSize) || 0;
    
    const profit = exit - entry;
    const positionSize = entry * lotSize;
    const pips = Math.abs(profit);
    const riskAmount = Math.abs(profit * lotSize);
    
    return { profit, positionSize, pips, riskAmount };
  };

  const metrics = calculateMetrics();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Trade</h2>
          {selectedDate && (
            <p className="text-sm text-gray-400 mt-1">
              For {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol and Lot Size Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
              <input
                type="text"
                name="symbol"
                placeholder="e.g., EURUSD, GBPJPY"
                value={formData.symbol}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lot Size</label>
              <input
                type="number"
                name="lotSize"
                placeholder="0.01, 0.1, 1.0"
                step="0.01"
                min="0.01"
                value={formData.lotSize}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Entry and Exit Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
              <input
                type="number"
                name="entry"
                placeholder="1.23456"
                step="0.00001"
                value={formData.entry}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Exit Price</label>
              <input
                type="number"
                name="exit"
                placeholder="1.23567"
                step="0.00001"
                value={formData.exit}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculated Metrics Display */}
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Trade Calculations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">Profit/Loss</p>
                <p className={`text-lg font-bold ${metrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.profit >= 0 ? '+' : ''}{metrics.profit.toFixed(5)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Position Size</p>
                <p className="text-lg font-bold text-blue-400">
                  ${metrics.positionSize.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Pips</p>
                <p className="text-lg font-bold text-yellow-400">
                  {metrics.pips.toFixed(5)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Risk Amount</p>
                <p className="text-lg font-bold text-purple-400">
                  ${metrics.riskAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trade Notes
              <span className="text-xs text-gray-400 ml-2">(Ctrl+V to paste screenshots)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Enter trade analysis, strategy, or observations... (Ctrl+V to paste screenshots)"
              value={formData.notes}
              onChange={handleChange}
              onPaste={handlePaste}
              rows="3"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {pastedImage && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 mb-2">📸 Screenshot pasted successfully!</p>
                <img
                  src={pastedImage}
                  alt="Pasted Screenshot"
                  className="h-24 object-contain rounded border border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trade Screenshot
              <span className="text-xs text-gray-400 ml-2">(Upload file or paste with Ctrl+V)</span>
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {(imagePreview || pastedImage) && (
              <div className="mt-3">
                <img
                  src={imagePreview || pastedImage}
                  alt="Trade Preview"
                  className="h-32 object-contain rounded-lg border border-gray-600"
                />
                {pastedImage && (
                  <p className="text-xs text-green-400 mt-1">📸 Image pasted from clipboard</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Adding Trade...' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
