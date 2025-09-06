// components/AddTradeModal.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  calculateTradeProfitLoss, 
  calculatePipValue, 
  calculatePositionSize, 
  calculateRiskAmount,
  getPipSize,
  formatPrice,
  validateLotSize,
  getAvailablePairs,
  getAccountTypes,
  ACCOUNT_TYPES
} from '../utils/forexCalculations';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatDateInTimezone, getTimezoneDisplayName, createDateTimeFromDeviceTime } from '../utils/timezoneUtils';

export default function AddTradeModal({ showModal, setShowModal, handleSubmit, formData, handleChange, selectedDate, loading = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [pastedImage, setPastedImage] = useState(null);
  const [accountType, setAccountType] = useState('STANDARD');
  const [tradeDirection, setTradeDirection] = useState('BUY');
  const [stopLossPips, setStopLossPips] = useState('');
  const [availablePairs] = useState(getAvailablePairs());
  const [accountTypes] = useState(getAccountTypes());
  const [mode, setMode] = useState('simple'); // 'simple' or 'advanced'
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get timezone from context
  const { userTimezone, getEffectiveTimezoneForUser } = useTimezone();

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

  // Real-time metrics calculation using useMemo for performance
  const metrics = useMemo(() => {
    const entry = Number(formData.entry) || 0;
    const exit = Number(formData.exit) || 0;
    const lotSize = Number(formData.lotSize) || 0;
    const symbol = formData.symbol || '';
    
    if (!symbol || !entry || !exit || !lotSize) {
      return { 
        profit: 0, 
        positionSize: 0, 
        pips: 0, 
        riskAmount: 0, 
        pipValue: 0,
        riskRewardRatio: 0,
        riskPercentage: 0,
        potentialProfit: 0,
        potentialLoss: 0
      };
    }
    
    // Calculate profit/loss using forex formulas
    const profit = calculateTradeProfitLoss(symbol, entry, exit, lotSize, accountType, tradeDirection);
    
    // Calculate position size
    const positionSize = calculatePositionSize(symbol, lotSize, accountType, entry);
    
    // Calculate pip value
    const pipValue = calculatePipValue(symbol, accountType, entry);
    
    // Calculate pips moved
    const pipSize = getPipSize(symbol);
    const pips = Math.abs(exit - entry) / pipSize;
    
    // Calculate risk amount if stop loss is provided
    const riskAmount = stopLossPips ? calculateRiskAmount(symbol, lotSize, Number(stopLossPips), accountType, entry) : 0;
    
    // Calculate additional metrics
    const riskRewardRatio = riskAmount > 0 ? Math.abs(profit) / riskAmount : 0;
    const riskPercentage = riskAmount > 0 ? (riskAmount / positionSize) * 100 : 0;
    
    // Calculate potential profit/loss scenarios
    const potentialProfit = pipValue * pips;
    const potentialLoss = stopLossPips ? pipValue * Number(stopLossPips) : 0;
    
    return { 
      profit, 
      positionSize, 
      pips, 
      riskAmount, 
      pipValue,
      riskRewardRatio,
      riskPercentage,
      potentialProfit,
      potentialLoss
    };
  }, [formData.entry, formData.exit, formData.lotSize, formData.symbol, accountType, tradeDirection, stopLossPips]);

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
                Advanced
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
              accountType: mode === 'simple' ? 'STANDARD' : accountType,
              tradeDirection: tradeDirection,
              stopLossPips: mode === 'simple' ? '' : stopLossPips,
              // For simple mode, set default values for fields not used
              ...(mode === 'simple' ? {
                entry: 0,
                exit: 0,
                lotSize: 0
              } : {}),
              // Add device time timestamp with appropriate date
              deviceTimeTimestamp: deviceTimeTimestamp,
              userTimezone: userTimezone
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
                  value={formData.symbol}
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
            </div>
          ) : (
            /* Advanced Mode Form */
            <div className="space-y-4">
              {/* Account Type and Trade Direction Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
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

              {/* Symbol and Lot Size Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                  <select
                    name="symbol"
                    value={formData.symbol}
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
                    className={`w-full p-3 rounded-lg bg-gray-700 text-white border focus:outline-none focus:ring-1 ${
                      formData.lotSize && !validateLotSize(Number(formData.lotSize), accountType) 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {formData.lotSize && !validateLotSize(Number(formData.lotSize), accountType) && (
                    <p className="text-red-400 text-xs mt-1">Invalid lot size for {accountType} account</p>
                  )}
                </div>
              </div>

              {/* Entry and Exit Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                  <input
                    type="number"
                    name="entry"
                    placeholder={formData.symbol ? formatPrice(formData.symbol, 1.23456) : "1.23456"}
                    step={formData.symbol ? getPipSize(formData.symbol) : "0.00001"}
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
                    placeholder={formData.symbol ? formatPrice(formData.symbol, 1.23567) : "1.23567"}
                    step={formData.symbol ? getPipSize(formData.symbol) : "0.00001"}
                    value={formData.exit}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stop Loss Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss (Pips)</label>
                  <input
                    type="number"
                    placeholder="20"
                    step="1"
                    value={stopLossPips}
                    onChange={(e) => setStopLossPips(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Amount</label>
                  <div className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500">
                    <span className="text-lg font-bold text-purple-400">
                      ${metrics.riskAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Calculated Metrics Display */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Real-time Trade Calculations
                </h3>
                
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Profit/Loss (USD)</p>
                    <p className={`text-lg font-bold ${metrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics.profit >= 0 ? '+' : ''}${metrics.profit.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Position Size</p>
                    <p className="text-lg font-bold text-blue-400">
                      ${metrics.positionSize.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Pips Moved</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {metrics.pips.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Pip Value</p>
                    <p className="text-lg font-bold text-purple-400">
                      ${metrics.pipValue.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Risk Management Metrics */}
                {stopLossPips && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Risk Amount</p>
                      <p className="text-lg font-bold text-red-400">
                        ${metrics.riskAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Risk/Reward Ratio</p>
                      <p className={`text-lg font-bold ${metrics.riskRewardRatio >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        1:{metrics.riskRewardRatio.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Risk %</p>
                      <p className={`text-lg font-bold ${metrics.riskPercentage <= 2 ? 'text-green-400' : metrics.riskPercentage <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {metrics.riskPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Trade Information */}
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Account Type</p>
                      <p className="text-sm font-semibold text-white">{ACCOUNT_TYPES[accountType]?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Trade Direction</p>
                      <p className={`text-sm font-semibold ${tradeDirection === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {tradeDirection}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Currency Pair</p>
                      <p className="text-sm font-semibold text-white">{formData.symbol || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                {stopLossPips && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Risk Assessment:</span>
                      <div className="flex items-center gap-2">
                        {metrics.riskPercentage <= 2 ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">
                            ✅ Low Risk
                          </span>
                        ) : metrics.riskPercentage <= 5 ? (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30">
                            ⚠️ Medium Risk
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/30">
                            🚨 High Risk
                          </span>
                        )}
                        {metrics.riskRewardRatio >= 2 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/30">
                            🎯 Good R/R
                          </span>
                        )}
                      </div>
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
            </div>
          )}

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
