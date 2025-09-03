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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New Trade</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="symbol"
            placeholder="Symbol"
            value={formData.symbol}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="entry"
              placeholder="Entry"
              value={formData.entry}
              onChange={handleChange}
              required
              className="p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="number"
              name="exit"
              placeholder="Exit"
              value={formData.exit}
              onChange={handleChange}
              required
              className="p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <input
            type="number"
            name="profit"
            placeholder="Profit"
            value={formData.profit}
            readOnly
            className="w-full p-2 rounded bg-gray-600 text-white"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm text-gray-300"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-24 object-contain rounded"
            />
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 rounded text-white"
            >
              Add Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
