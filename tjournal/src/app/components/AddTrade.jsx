// components/AddTradeModal.jsx
'use client';

import { useState, useEffect } from 'react';

export default function AddTradeModal({ showModal, setShowModal, handleSubmit, formData, handleChange }) {
  const [imagePreview, setImagePreview] = useState(null);

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
        <h2 className="text-xl font-semibold mb-6 text-center text-white">Add New Trade</h2>
        
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Trade Notes</label>
            <textarea
              name="notes"
              placeholder="Enter trade analysis, strategy, or observations..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trade Screenshot</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Trade Preview"
                  className="h-32 object-contain rounded-lg border border-gray-600"
                />
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Add Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
