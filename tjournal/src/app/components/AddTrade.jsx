// components/AddTradeModal.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  getAvailablePairs,
  getAccountTypes
} from '../utils/forexCalculations';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatDateInTimezone, getTimezoneDisplayName, createDateTimeFromDeviceTime } from '../utils/timezoneUtils';
import { safeGetFromLocalStorage, safeSetToLocalStorage } from '../utils/safeJsonParse';

export default function AddTradeModal({ showModal, setShowModal, handleSubmit, formData, handleChange, selectedDate, selectedImage, loading = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [pastedImage, setPastedImage] = useState(null);
  const [tradeDirection, setTradeDirection] = useState('BUY');
  const [availablePairs] = useState(getAvailablePairs());
  const [mode, setMode] = useState('simple'); // 'simple' or 'advanced'
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get timezone from context
  const { userTimezone, getEffectiveTimezoneForUser } = useTimezone();

  // Update image preview when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = () => setImagePreview(fileReader.result);
      fileReader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  // Update current time every second when modal is open (User's Preferred Timezone)
  useEffect(() => {
    if (!showModal) return;
    
    const timer = setInterval(() => {
      // Get current time in user's preferred timezone
      const now = new Date();
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal]);



  // Automatically save metrics data to overall performance system
  const autoSaveMetrics = (tradeData) => {
    const metricsData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      date: selectedDate || new Date(),
      symbol: tradeData.symbol || '',
      profit: parseFloat(tradeData.profit || 0),
      riskAmount: parseFloat(tradeData.riskAmount || 0),
      entry: parseFloat(tradeData.entry || 0),
      exit: parseFloat(tradeData.exit || 0),
      lotSize: parseFloat(tradeData.lotSize || 0),
      notes: tradeData.notes || '',
      tradeDirection: tradeData.tradeDirection || tradeDirection,
      mode: mode,
      accountType: tradeData.accountType || 'STANDARD',
      userTimezone: userTimezone,
      deviceTimeTimestamp: selectedDate ? createDateTimeFromDeviceTime(selectedDate) : createDateTimeFromDeviceTime(new Date()),
      createdAt: new Date().toISOString() // Include createdAt for metrics data too
    };

    // Save to localStorage for overall performance system
    const existingMetrics = safeGetFromLocalStorage('tradingMetricsForPerformance', []);
    const updatedMetrics = [...existingMetrics, metricsData];
    safeSetToLocalStorage('tradingMetricsForPerformance', updatedMetrics);
    
    console.log('Metrics automatically saved to overall performance system:', metricsData);
  };


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

  // Simple validation for manual journaling mode
  const isFormValid = useMemo(() => {
    if (mode === 'simple') {
      return formData.symbol && formData.profit;
    } else {
      return formData.symbol && formData.profit;
    }
  }, [mode, formData.symbol, formData.profit]);

  // Auto-save metrics when significant data changes (debounced)
  useEffect(() => {
    if (formData.symbol && formData.profit && !loading) {
      const timeoutId = setTimeout(() => {
        // Only auto-save if we have meaningful data
        const hasSignificantData = formData.symbol && formData.profit && 
          (formData.notes || formData.riskAmount || formData.entry || formData.exit);
        
        if (hasSignificantData) {
          autoSaveMetrics({
            ...formData,
            tradeDirection: tradeDirection,
            mode: mode
          });
        }
      }, 2000); // 2 second delay to avoid excessive saves

      return () => clearTimeout(timeoutId);
    }
  }, [formData.symbol, formData.profit, formData.notes, formData.riskAmount, formData.entry, formData.exit, tradeDirection, mode, loading]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Trade</h2>
          {selectedDate ? (
            <p className="text-sm text-gray-400 mt-1">
              For {formatDateInTimezone(selectedDate, userTimezone, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}
              <span className="text-xs text-gray-500 ml-1">
                (Device time with selected date)
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">
              Will be recorded at: {formatDateInTimezone(currentTime, userTimezone, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
              <span className="text-xs text-gray-500 ml-1">
                (Device time with current date)
              </span>
            </p>
          )}
          
          {/* Mode Toggle */}
          <div className="flex justify-center mt-4">
            <div className="bg-gray-700 rounded-lg p-1 flex">
              <button
                type="button"
                onClick={() => setMode('simple')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'simple'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setMode('advanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'advanced'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                Advanced Mode
              </button>
            </div>
          </div>
        </div>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          
          try {
            // Create timestamp using device time with selected date (or current date if no selection)
            const targetDate = selectedDate || new Date();
            const deviceTimeTimestamp = createDateTimeFromDeviceTime(targetDate);
            
            // Create a modified form data object with modal state
            const modifiedFormData = {
              ...formData,
              accountType: 'STANDARD', // Default account type for both modes
              tradeDirection: tradeDirection,
              // For simple mode, set default values for fields not used
              ...(mode === 'simple' ? {
                entry: 0,
                exit: 0,
                lotSize: 0,
                riskAmount: 0
              } : {}),
              // For advanced mode, ensure manual inputs are properly formatted
              ...(mode === 'advanced' ? {
                profit: formData.profit ? parseFloat(formData.profit) : 0,
                riskAmount: formData.riskAmount ? parseFloat(formData.riskAmount) : 0,
                entry: formData.entry ? parseFloat(formData.entry) : 0,
                exit: formData.exit ? parseFloat(formData.exit) : 0,
                lotSize: formData.lotSize ? parseFloat(formData.lotSize) : 0
              } : {}),
              // Add device time timestamp with appropriate date
              deviceTimeTimestamp: deviceTimeTimestamp,
              userTimezone: userTimezone,
              // Add createdAt field with current local device time
              createdAt: new Date().toISOString() // This captures the exact moment the trade is created
            };
            
            // Create a custom event that includes the modified form data
            const customEvent = {
              ...e,
              preventDefault: e.preventDefault.bind(e), // Preserve the original preventDefault function
              target: {
                ...e.target,
                formData: modifiedFormData
              }
            };
            
            // Submit with the modified data
            await handleSubmit(customEvent);
            
            // Automatically save metrics data for review after successful submission
            autoSaveMetrics(modifiedFormData);
            
            // Clear local state after successful submission
            setImagePreview(null);
            setPastedImage(null);
            
          } catch (error) {
            console.error("Error in form submission:", error);
          }
        }} className="space-y-4">
          {mode === 'simple' ? (
            /* Simple Mode Form */
            <div className="space-y-4">
              {/* Currency Pair */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                <select
                  name="symbol"
                  value={formData.symbol || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Currency Pair</option>
                  {availablePairs.map(pair => (
                    <option key={pair.value} value={pair.value}>
                      {pair.label} ({pair.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trade Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trade Direction</label>
                <select
                  value={tradeDirection}
                  onChange={(e) => setTradeDirection(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="BUY">BUY (Long)</option>
                  <option value="SELL">SELL (Short)</option>
                </select>
              </div>

              {/* Manual Profit Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profit/Loss (USD)</label>
                <input
                  type="number"
                  name="profit"
                  placeholder="Enter profit/loss amount (e.g., 150.50 or -75.25)"
                  step="0.01"
                  value={formData.profit || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter positive value for profit, negative for loss
                </p>
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
                  value={formData.notes || ''}
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
                  key={`file-input-${showModal}-${mode}`}
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
            </div>
          ) : (
            /* Advanced Mode Form - Manual Journaling */
            <div className="space-y-4">
              {/* Currency Pair and Trade Direction Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                  <select
                    name="symbol"
                    value={formData.symbol || ''}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Currency Pair</option>
                    {availablePairs.map(pair => (
                      <option key={pair.value} value={pair.value}>
                        {pair.label} ({pair.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trade Direction</label>
                  <select
                    value={tradeDirection}
                    onChange={(e) => setTradeDirection(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                </div>
              </div>

              {/* Manual Profit/Loss Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profit/Loss (USD)</label>
                <input
                  type="number"
                  name="profit"
                  placeholder="Enter profit/loss amount (e.g., 150.50 or -75.25)"
                  step="0.01"
                  value={formData.profit || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter positive value for profit, negative for loss
                </p>
              </div>

              {/* Manual Risk Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Amount (USD)</label>
                <input
                  type="number"
                  name="riskAmount"
                  placeholder="Enter risk amount (e.g., 50.00)"
                  step="0.01"
                  min="0"
                  value={formData.riskAmount || ''}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Amount of money at risk for this trade
                </p>
              </div>

              {/* Optional: Entry and Exit Prices for Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entry Price (Optional)
                    <span className="text-xs text-gray-400 ml-2">(For reference only)</span>
                  </label>
                  <input
                    type="number"
                    name="entry"
                    placeholder="1.23456"
                    step="0.00001"
                    value={formData.entry || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exit Price (Optional)
                    <span className="text-xs text-gray-400 ml-2">(For reference only)</span>
                  </label>
                  <input
                    type="number"
                    name="exit"
                    placeholder="1.23567"
                    step="0.00001"
                    value={formData.exit || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Optional: Lot Size for Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lot Size (Optional)
                  <span className="text-xs text-gray-400 ml-2">(For reference only)</span>
                </label>
                <input
                  type="number"
                  name="lotSize"
                  placeholder="0.01, 0.1, 1.0"
                  step="0.01"
                  min="0.01"
                  value={formData.lotSize || ''}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Trade Summary for Manual Journaling */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Trade Summary
                </h3>
                
                {/* Manual Input Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Currency Pair</p>
                    <p className="text-sm font-semibold text-white">{formData.symbol || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Direction</p>
                    <p className={`text-sm font-semibold ${tradeDirection === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {tradeDirection}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Profit/Loss</p>
                    <p className={`text-sm font-bold ${(formData.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formData.profit ? (formData.profit >= 0 ? '+' : '') + '$' + parseFloat(formData.profit).toFixed(2) : '$0.00'}
                    </p>
                  </div>
                </div>

                {/* Risk Information */}
                {formData.riskAmount && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Risk Amount</p>
                      <p className="text-sm font-bold text-red-400">
                        ${parseFloat(formData.riskAmount || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Risk/Reward</p>
                      <p className="text-sm font-bold text-blue-400">
                        {formData.profit && formData.riskAmount ? 
                          (Math.abs(parseFloat(formData.profit)) / parseFloat(formData.riskAmount)).toFixed(2) : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Reference Information */}
                {(formData.entry || formData.exit || formData.lotSize) && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Reference Information:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
                      {formData.entry && (
                        <div>
                          <p className="text-gray-400">Entry Price</p>
                          <p className="text-white font-medium">{formData.entry}</p>
                        </div>
                      )}
                      {formData.exit && (
                        <div>
                          <p className="text-gray-400">Exit Price</p>
                          <p className="text-white font-medium">{formData.exit}</p>
                        </div>
                      )}
                      {formData.lotSize && (
                        <div>
                          <p className="text-gray-400">Lot Size</p>
                          <p className="text-white font-medium">{formData.lotSize}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  value={formData.notes || ''}
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
                  key={`file-input-${showModal}-${mode}`}
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-600">
            {/* Left side - Auto-save indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Auto-save to performance metrics enabled
            </div>

            {/* Right side - Cancel and Submit */}
            <div className="flex gap-3">
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
          </div>
        </form>

      </div>
    </div>
  );
}
