'use client';

import { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  itemType = "item",
  loading = false,
  destructive = true
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${destructive ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
              <AlertTriangle 
                size={20} 
                className={destructive ? 'text-red-400' : 'text-orange-400'} 
              />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4 leading-relaxed">
            {message}
          </p>
          
          {itemName && (
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4 border border-gray-600/50">
              <p className="text-sm text-gray-400 mb-1">Item to delete:</p>
              <p className="text-white font-medium">{itemName}</p>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
            <p className="text-yellow-300 text-sm">
              <strong>Warning:</strong> This action cannot be undone. The {itemType} will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              destructive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete {itemType}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
