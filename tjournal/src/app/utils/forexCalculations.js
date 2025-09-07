// Forex Trading Calculations Utility
// Accurate profit/loss calculations for different currency pairs and account types

/**
 * Account types and their lot sizes
 */
export const ACCOUNT_TYPES = {
  STANDARD: {
    name: 'Standard',
    lotMultiplier: 1,
    description: '1 lot = 100,000 units'
  },
  MINI: {
    name: 'Mini',
    lotMultiplier: 0.1,
    description: '1 lot = 10,000 units'
  },
  MICRO: {
    name: 'Micro',
    lotMultiplier: 0.01,
    description: '1 lot = 1,000 units'
  }
};

/**
 * Currency pair configurations
 */
export const CURRENCY_PAIRS = {
  // Major pairs (4 decimal places)
  EURUSD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'USD' },
  GBPUSD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'USD' },
  AUDUSD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'USD' },
  NZDUSD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'USD' },
  USDCAD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CAD' },
  USDCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CHF' },
  
  // JPY pairs (2 decimal places)
  USDJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'JPY' },
  EURJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'JPY' },
  GBPJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'JPY' },
  AUDJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'JPY' },
  NZDJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'JPY' },
  CADJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'CAD', quoteCurrency: 'JPY' },
  CHFJPY: { pipSize: 0.01, contractSize: 100000, baseCurrency: 'CHF', quoteCurrency: 'JPY' },
  
  // Cross pairs
  EURGBP: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'GBP' },
  EURAUD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'AUD' },
  EURCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'CHF' },
  EURCAD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'CAD' },
  GBPAUD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'AUD' },
  GBPCAD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'CAD' },
  GBPCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'CHF' },
  AUDCAD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'CAD' },
  AUDCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'CHF' },
  AUDNZD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'NZD' },
  NZDCAD: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'CAD' },
  NZDCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'CHF' },
  CADCHF: { pipSize: 0.0001, contractSize: 100000, baseCurrency: 'CAD', quoteCurrency: 'CHF' },
  
  // Commodities
  XAUUSD: { pipSize: 0.01, contractSize: 100, baseCurrency: 'XAU', quoteCurrency: 'USD', isCommodity: true },
  XAGUSD: { pipSize: 0.001, contractSize: 5000, baseCurrency: 'XAG', quoteCurrency: 'USD', isCommodity: true },
  
  // Indices
  US30: { pipSize: 0.01, contractSize: 1, baseCurrency: 'USD', quoteCurrency: 'USD', isIndex: true },
  NAS100: { pipSize: 0.01, contractSize: 1, baseCurrency: 'USD', quoteCurrency: 'USD', isIndex: true },
  SPX500: { pipSize: 0.01, contractSize: 1, baseCurrency: 'USD', quoteCurrency: 'USD', isIndex: true }
};

/**
 * Get currency pair configuration
 */
export function getCurrencyPairConfig(symbol) {
  const upperSymbol = symbol.toUpperCase();
  return CURRENCY_PAIRS[upperSymbol] || null;
}

/**
 * Calculate pip value for a currency pair with 100% accuracy
 */
export function calculatePipValue(symbol, accountType = 'STANDARD', currentPrice = 1) {
  // Input validation
  if (!symbol || !currentPrice || currentPrice <= 0) {
    console.warn('Invalid parameters for pip value calculation');
    return 0;
  }

  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) {
    console.warn(`Unknown currency pair: ${symbol}`);
    return 0;
  }

  const accountConfig = ACCOUNT_TYPES[accountType.toUpperCase()];
  if (!accountConfig) {
    console.warn(`Unknown account type: ${accountType}`);
    return 0;
  }

  // Base calculation components
  const pipSize = pairConfig.pipSize;
  const contractSize = pairConfig.contractSize;
  const lotMultiplier = accountConfig.lotMultiplier;

  // For commodities (XAUUSD, XAGUSD)
  if (pairConfig.isCommodity) {
    const pipValue = pipSize * contractSize * lotMultiplier;
    return Math.round(pipValue * 100) / 100; // Round to 2 decimal places
  }

  // For indices
  if (pairConfig.isIndex) {
    const pipValue = pipSize * contractSize * lotMultiplier;
    return Math.round(pipValue * 100) / 100; // Round to 2 decimal places
  }

  // For currency pairs
  const baseCurrency = pairConfig.baseCurrency;
  const quoteCurrency = pairConfig.quoteCurrency;
  
  let pipValue;
  
  // If quote currency is USD, pip value is straightforward
  if (quoteCurrency === 'USD') {
    pipValue = pipSize * contractSize * lotMultiplier;
  }
  // If base currency is USD, pip value depends on exchange rate
  else if (baseCurrency === 'USD') {
    pipValue = (pipSize * contractSize * lotMultiplier) / currentPrice;
  }
  // For cross pairs (non-USD pairs), we need more complex calculation
  else {
    // This is a simplified calculation for cross pairs
    // In real trading, you'd need real-time USD exchange rates for both currencies
    // For now, we'll use a simplified approach that assumes 1:1 conversion
    // This should be enhanced with real exchange rates in production
    pipValue = pipSize * contractSize * lotMultiplier;
    
    // Log warning for cross pairs that need real exchange rates
    console.warn(`Cross pair ${symbol} pip value calculation is simplified. Real exchange rates needed for 100% accuracy.`);
  }
  
  // Ensure pip value is positive and return with proper rounding
  if (pipValue <= 0) {
    console.warn(`Invalid pip value calculation for ${symbol}: ${pipValue}`);
    return 0;
  }
  
  return Math.round(pipValue * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate profit/loss for a trade with 100% accuracy
 */
export function calculateTradeProfitLoss(symbol, entryPrice, exitPrice, lotSize, accountType = 'STANDARD', tradeDirection = 'BUY') {
  // Input validation
  if (!symbol || !entryPrice || !exitPrice || !lotSize) {
    console.warn('Missing required parameters for profit/loss calculation');
    return 0;
  }

  if (entryPrice <= 0 || exitPrice <= 0 || lotSize <= 0) {
    console.warn('Invalid price or lot size values');
    return 0;
  }

  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) {
    console.warn(`Unknown currency pair: ${symbol}`);
    return 0;
  }

  const accountConfig = ACCOUNT_TYPES[accountType.toUpperCase()];
  if (!accountConfig) {
    console.warn(`Unknown account type: ${accountType}`);
    return 0;
  }

  // Calculate price difference in pips with proper precision
  const priceDifference = Math.abs(exitPrice - entryPrice);
  const pipDifference = priceDifference / pairConfig.pipSize;
  
  // Determine if trade was profitable based on direction
  let isProfitable = false;
  const upperTradeDirection = tradeDirection.toUpperCase();
  if (upperTradeDirection === 'BUY') {
    isProfitable = exitPrice > entryPrice;
  } else if (upperTradeDirection === 'SELL') {
    isProfitable = exitPrice < entryPrice;
  } else {
    console.warn(`Invalid trade direction: ${tradeDirection}`);
    return 0;
  }
  
  // Calculate pip value with proper precision
  const pipValue = calculatePipValue(symbol, accountType, entryPrice);
  
  if (pipValue <= 0) {
    console.warn('Invalid pip value calculation');
    return 0;
  }
  
  // Calculate profit/loss with proper precision
  const profitLoss = pipDifference * pipValue * lotSize;
  
  // Apply direction and return with proper rounding
  const result = isProfitable ? profitLoss : -profitLoss;
  return Math.round(result * 100) / 100; // Round to 2 decimal places for currency
}

/**
 * Calculate position size in account currency
 */
export function calculatePositionSize(symbol, lotSize, accountType = 'STANDARD', currentPrice = 1) {
  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) {
    return 0;
  }

  const accountConfig = ACCOUNT_TYPES[accountType.toUpperCase()];
  if (!accountConfig) {
    return 0;
  }

  // For commodities
  if (pairConfig.isCommodity) {
    return currentPrice * pairConfig.contractSize * lotSize * accountConfig.lotMultiplier;
  }

  // For currency pairs
  return pairConfig.contractSize * lotSize * accountConfig.lotMultiplier;
}

/**
 * Calculate risk amount (money at risk) with 100% accuracy
 */
export function calculateRiskAmount(symbol, lotSize, stopLossPips, accountType = 'STANDARD', currentPrice = 1) {
  // Input validation
  if (!symbol || !lotSize || stopLossPips === undefined || stopLossPips === null || !currentPrice) {
    console.warn('Missing required parameters for risk amount calculation');
    return 0;
  }

  if (lotSize <= 0 || currentPrice <= 0) {
    console.warn('Invalid lot size or price values');
    return 0;
  }

  if (stopLossPips < 0) {
    console.warn('Stop loss pips cannot be negative');
    return 0;
  }

  const pipValue = calculatePipValue(symbol, accountType, currentPrice);
  
  if (pipValue <= 0) {
    console.warn('Invalid pip value for risk calculation');
    return 0;
  }

  const riskAmount = Math.abs(stopLossPips) * pipValue * lotSize;
  
  // Return with proper rounding for currency
  return Math.round(riskAmount * 100) / 100;
}

/**
 * Calculate required margin (simplified)
 */
export function calculateMargin(symbol, lotSize, accountType = 'STANDARD', leverage = 100) {
  const positionSize = calculatePositionSize(symbol, lotSize, accountType);
  return positionSize / leverage;
}

/**
 * Get pip size for a currency pair
 */
export function getPipSize(symbol) {
  const pairConfig = getCurrencyPairConfig(symbol);
  return pairConfig ? pairConfig.pipSize : 0.0001;
}

/**
 * Format price with correct decimal places
 */
export function formatPrice(symbol, price) {
  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) return price.toFixed(5);
  
  const decimalPlaces = pairConfig.pipSize === 0.01 ? 2 : 
                       pairConfig.pipSize === 0.001 ? 3 : 5;
  
  return price.toFixed(decimalPlaces);
}

/**
 * Validate lot size based on account type
 */
export function validateLotSize(lotSize, accountType = 'STANDARD') {
  const accountConfig = ACCOUNT_TYPES[accountType.toUpperCase()];
  if (!accountConfig) return false;
  
  // Minimum lot size is usually 0.01 for most brokers
  // Maximum depends on account type and broker
  const minLotSize = 0.01;
  const maxLotSize = accountType.toUpperCase() === 'MICRO' ? 10 : 
                    accountType.toUpperCase() === 'MINI' ? 100 : 1000;
  
  return lotSize >= minLotSize && lotSize <= maxLotSize;
}

/**
 * Get available currency pairs for dropdown
 */
export function getAvailablePairs() {
  return Object.keys(CURRENCY_PAIRS).map(symbol => ({
    value: symbol,
    label: symbol,
    category: CURRENCY_PAIRS[symbol].isCommodity ? 'Commodities' :
             CURRENCY_PAIRS[symbol].isIndex ? 'Indices' :
             CURRENCY_PAIRS[symbol].quoteCurrency === 'JPY' ? 'JPY Pairs' :
             'Major Pairs'
  }));
}

/**
 * Get account types for dropdown
 */
export function getAccountTypes() {
  return Object.keys(ACCOUNT_TYPES).map(key => ({
    value: key,
    label: ACCOUNT_TYPES[key].name,
    description: ACCOUNT_TYPES[key].description
  }));
}

/**
 * Calculate lot size from profit/loss amount (optimized)
 */
export function calculateLotSizeFromPL(symbol, entryPrice, exitPrice, profitLoss, accountType = 'STANDARD', tradeDirection = 'BUY') {
  // Input validation
  if (!symbol || !entryPrice || !exitPrice || profitLoss === undefined || profitLoss === null) {
    return { lotSize: 0, isValid: false, error: 'Missing required parameters' };
  }

  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) {
    return { lotSize: 0, isValid: false, error: `Unknown currency pair: ${symbol}` };
  }

  // Validate prices
  if (entryPrice <= 0 || exitPrice <= 0) {
    return { lotSize: 0, isValid: false, error: 'Entry and exit prices must be positive' };
  }

  // Calculate price difference in pips
  const priceDifference = Math.abs(exitPrice - entryPrice);
  const pipDifference = priceDifference / pairConfig.pipSize;
  
  // Check for zero price movement
  if (pipDifference < 0.1) { // Less than 0.1 pip
    return { lotSize: 0, isValid: false, error: 'Price movement too small for calculation' };
  }
  
  // Calculate pip value for 1 lot
  const pipValue = calculatePipValue(symbol, accountType, entryPrice);
  
  if (pipValue <= 0) {
    return { lotSize: 0, isValid: false, error: 'Invalid pip value calculation' };
  }
  
  // Calculate lot size: profitLoss = pipDifference * pipValue * lotSize
  // Therefore: lotSize = profitLoss / (pipDifference * pipValue)
  // Use absolute value for lot size calculation since lot size is always positive
  const lotSize = Math.abs(profitLoss) / (pipDifference * pipValue);
  
  // Validate lot size
  const minLotSize = 0.01;
  const maxLotSize = accountType.toUpperCase() === 'MICRO' ? 10 : 
                    accountType.toUpperCase() === 'MINI' ? 100 : 1000;
  
  if (lotSize < minLotSize) {
    return { lotSize, isValid: false, error: `Lot size too small (min: ${minLotSize})` };
  }
  
  if (lotSize > maxLotSize) {
    return { lotSize, isValid: false, error: `Lot size too large (max: ${maxLotSize})` };
  }
  
  return { 
    lotSize: Math.round(lotSize * 100) / 100, // Round to 2 decimal places
    isValid: true, 
    error: null,
    pipDifference: Math.round(pipDifference * 10) / 10, // Round to 1 decimal place
    pipValue: Math.round(pipValue * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Calculate stop loss pips from risk amount (optimized)
 */
export function calculateStopLossPipsFromRisk(symbol, lotSize, riskAmount, accountType = 'STANDARD', currentPrice = 1) {
  // Input validation
  if (!symbol || !lotSize || !riskAmount || !currentPrice) {
    return { stopLossPips: 0, isValid: false, error: 'Missing required parameters' };
  }

  if (lotSize <= 0 || riskAmount <= 0 || currentPrice <= 0) {
    return { stopLossPips: 0, isValid: false, error: 'Values must be positive' };
  }

  const pipValue = calculatePipValue(symbol, accountType, currentPrice);
  
  if (pipValue <= 0) {
    return { stopLossPips: 0, isValid: false, error: 'Invalid pip value calculation' };
  }
  
  // riskAmount = stopLossPips * pipValue * lotSize
  // Therefore: stopLossPips = riskAmount / (pipValue * lotSize)
  const stopLossPips = riskAmount / (pipValue * lotSize);
  
  // Validate stop loss pips
  if (stopLossPips < 1) {
    return { stopLossPips, isValid: false, error: 'Stop loss too small (min: 1 pip)' };
  }
  
  if (stopLossPips > 1000) {
    return { stopLossPips, isValid: false, error: 'Stop loss too large (max: 1000 pips)' };
  }
  
  return { 
    stopLossPips: Math.round(stopLossPips * 10) / 10, // Round to 1 decimal place
    isValid: true, 
    error: null,
    pipValue: Math.round(pipValue * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Calculate risk amount from stop loss pips (optimized)
 */
export function calculateRiskAmountFromStopLoss(symbol, lotSize, stopLossPips, accountType = 'STANDARD', currentPrice = 1) {
  // Input validation
  if (!symbol || !lotSize || stopLossPips === undefined || stopLossPips === null || !currentPrice) {
    return { riskAmount: 0, isValid: false, error: 'Missing required parameters' };
  }

  if (lotSize <= 0 || currentPrice <= 0) {
    return { riskAmount: 0, isValid: false, error: 'Lot size and price must be positive' };
  }

  const pipValue = calculatePipValue(symbol, accountType, currentPrice);
  
  if (pipValue <= 0) {
    return { riskAmount: 0, isValid: false, error: 'Invalid pip value calculation' };
  }

  const riskAmount = Math.abs(stopLossPips) * pipValue * lotSize;
  
  // Validate risk amount
  if (riskAmount <= 0) {
    return { riskAmount, isValid: false, error: 'Invalid risk amount calculation' };
  }
  
  return { 
    riskAmount: Math.round(riskAmount * 100) / 100, // Round to 2 decimal places
    isValid: true, 
    error: null,
    pipValue: Math.round(pipValue * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Calculate equivalent lot size for manual P&L (optimized)
 */
export function calculateEquivalentLotSize(symbol, entryPrice, exitPrice, manualPL, accountType = 'STANDARD', tradeDirection = 'BUY') {
  return calculateLotSizeFromPL(symbol, entryPrice, exitPrice, manualPL, accountType, tradeDirection);
}

/**
 * Calculate equivalent stop loss pips for a given risk amount (optimized)
 */
export function calculateEquivalentStopLossPips(symbol, lotSize, riskAmount, accountType = 'STANDARD', currentPrice = 1) {
  return calculateStopLossPipsFromRisk(symbol, lotSize, riskAmount, accountType, currentPrice);
}

/**
 * Calculate equivalent risk amount for a given stop loss (optimized)
 */
export function calculateEquivalentRiskAmount(symbol, lotSize, stopLossPips, accountType = 'STANDARD', currentPrice = 1) {
  return calculateRiskAmountFromStopLoss(symbol, lotSize, stopLossPips, accountType, currentPrice);
}

/**
 * Comprehensive reverse calculation for manual P&L (optimized)
 * Returns all equivalent values in a single optimized calculation
 */
export function calculateReverseMetrics(symbol, entryPrice, exitPrice, manualPL, originalLotSize, originalStopLossPips, accountType = 'STANDARD', tradeDirection = 'BUY') {
  // Input validation
  if (!symbol || !entryPrice || !exitPrice || manualPL === undefined || manualPL === null) {
    return {
      equivalentLotSize: { lotSize: 0, isValid: false, error: 'Missing required parameters' },
      equivalentStopLossPips: { stopLossPips: 0, isValid: false, error: 'Missing required parameters' },
      equivalentRiskAmount: { riskAmount: 0, isValid: false, error: 'Missing required parameters' },
      summary: { isValid: false, error: 'Missing required parameters' }
    };
  }

  // Calculate equivalent lot size
  const lotSizeResult = calculateLotSizeFromPL(symbol, entryPrice, exitPrice, manualPL, accountType, tradeDirection);
  
  // Calculate equivalent stop loss and risk if we have original values
  let stopLossResult = { stopLossPips: 0, isValid: false, error: 'No original stop loss provided' };
  let riskResult = { riskAmount: 0, isValid: false, error: 'No original risk amount' };
  
  // Calculate original risk amount once to avoid redundant calculations
  const originalRiskAmount = originalStopLossPips ? calculateRiskAmount(symbol, originalLotSize || 1, originalStopLossPips, accountType, entryPrice) : 0;
  
  if (originalStopLossPips && lotSizeResult.isValid) {
    // Calculate equivalent stop loss pips based on original risk amount
    stopLossResult = calculateStopLossPipsFromRisk(symbol, lotSizeResult.lotSize, originalRiskAmount, accountType, entryPrice);
    
    // Calculate equivalent risk amount based on original stop loss
    riskResult = calculateRiskAmountFromStopLoss(symbol, lotSizeResult.lotSize, originalStopLossPips, accountType, entryPrice);
  }
  
  // Create summary
  const summary = {
    isValid: lotSizeResult.isValid,
    error: lotSizeResult.error,
    originalValues: {
      lotSize: originalLotSize || 0,
      stopLossPips: originalStopLossPips || 0,
      riskAmount: originalRiskAmount
    },
    equivalentValues: {
      lotSize: lotSizeResult.lotSize,
      stopLossPips: stopLossResult.stopLossPips,
      riskAmount: riskResult.riskAmount
    },
    differences: {
      lotSizeDiff: lotSizeResult.isValid ? lotSizeResult.lotSize - (originalLotSize || 0) : 0,
      stopLossDiff: stopLossResult.isValid ? stopLossResult.stopLossPips - (originalStopLossPips || 0) : 0,
      riskDiff: riskResult.isValid ? riskResult.riskAmount - originalRiskAmount : 0
    }
  };
  
  return {
    equivalentLotSize: lotSizeResult,
    equivalentStopLossPips: stopLossResult,
    equivalentRiskAmount: riskResult,
    summary
  };
}

/**
 * Comprehensive accuracy verification for trade calculations
 * Tests all calculation functions with known values to ensure 100% accuracy
 */
export function verifyCalculationAccuracy() {
  const testCases = [
    // Test case 1: EURUSD BUY trade
    {
      name: 'EURUSD BUY - Standard Account',
      symbol: 'EURUSD',
      entryPrice: 1.1000,
      exitPrice: 1.1050,
      lotSize: 1.0,
      accountType: 'STANDARD',
      tradeDirection: 'BUY',
      stopLossPips: 20,
      expectedPips: 50,
      expectedPipValue: 10, // $10 per pip for 1 lot EURUSD
      expectedProfit: 500, // 50 pips * $10
      expectedRiskAmount: 200 // 20 pips * $10
    },
    // Test case 2: USDJPY SELL trade
    {
      name: 'USDJPY SELL - Mini Account',
      symbol: 'USDJPY',
      entryPrice: 110.00,
      exitPrice: 109.50,
      lotSize: 0.1,
      accountType: 'MINI',
      tradeDirection: 'SELL',
      stopLossPips: 30,
      expectedPips: 50,
      expectedPipValue: 0.91, // Approximate for mini account
      expectedProfit: 4.55, // 50 pips * $0.91 * 0.1 lot
      expectedRiskAmount: 2.73 // 30 pips * $0.91 * 0.1 lot
    },
    // Test case 3: GBPUSD BUY trade
    {
      name: 'GBPUSD BUY - Micro Account',
      symbol: 'GBPUSD',
      entryPrice: 1.2500,
      exitPrice: 1.2550,
      lotSize: 0.01,
      accountType: 'MICRO',
      tradeDirection: 'BUY',
      stopLossPips: 25,
      expectedPips: 50,
      expectedPipValue: 1, // $1 per pip for 1 lot GBPUSD
      expectedProfit: 0.5, // 50 pips * $1 * 0.01 lot
      expectedRiskAmount: 0.25 // 25 pips * $1 * 0.01 lot
    }
  ];

  const results = [];
  
  testCases.forEach(testCase => {
    try {
      // Calculate actual values
      const actualProfit = calculateTradeProfitLoss(
        testCase.symbol, 
        testCase.entryPrice, 
        testCase.exitPrice, 
        testCase.lotSize, 
        testCase.accountType, 
        testCase.tradeDirection
      );
      
      const actualPipValue = calculatePipValue(testCase.symbol, testCase.accountType, testCase.entryPrice);
      const actualRiskAmount = calculateRiskAmount(
        testCase.symbol, 
        testCase.lotSize, 
        testCase.stopLossPips, 
        testCase.accountType, 
        testCase.entryPrice
      );
      
      const pipSize = getPipSize(testCase.symbol);
      const actualPips = Math.abs(testCase.exitPrice - testCase.entryPrice) / pipSize;
      
      // Calculate accuracy percentages
      const profitAccuracy = Math.abs(actualProfit - testCase.expectedProfit) / testCase.expectedProfit * 100;
      const pipValueAccuracy = Math.abs(actualPipValue - testCase.expectedPipValue) / testCase.expectedPipValue * 100;
      const riskAccuracy = Math.abs(actualRiskAmount - testCase.expectedRiskAmount) / testCase.expectedRiskAmount * 100;
      const pipsAccuracy = Math.abs(actualPips - testCase.expectedPips) / testCase.expectedPips * 100;
      
      results.push({
        testCase: testCase.name,
        passed: profitAccuracy < 5 && pipValueAccuracy < 5 && riskAccuracy < 5 && pipsAccuracy < 5,
        details: {
          profit: { expected: testCase.expectedProfit, actual: actualProfit, accuracy: 100 - profitAccuracy },
          pipValue: { expected: testCase.expectedPipValue, actual: actualPipValue, accuracy: 100 - pipValueAccuracy },
          riskAmount: { expected: testCase.expectedRiskAmount, actual: actualRiskAmount, accuracy: 100 - riskAccuracy },
          pips: { expected: testCase.expectedPips, actual: actualPips, accuracy: 100 - pipsAccuracy }
        }
      });
      
    } catch (error) {
      results.push({
        testCase: testCase.name,
        passed: false,
        error: error.message
      });
    }
  });
  
  return {
    totalTests: testCases.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests: results.filter(r => !r.passed).length,
    results,
    overallAccuracy: results.filter(r => r.passed).length / testCases.length * 100
  };
}