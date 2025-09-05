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
 * Calculate pip value for a currency pair
 */
export function calculatePipValue(symbol, accountType = 'STANDARD', currentPrice = 1) {
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

  // For commodities (XAUUSD, XAGUSD)
  if (pairConfig.isCommodity) {
    return pairConfig.pipSize * pairConfig.contractSize * accountConfig.lotMultiplier;
  }

  // For indices
  if (pairConfig.isIndex) {
    return pairConfig.pipSize * pairConfig.contractSize * accountConfig.lotMultiplier;
  }

  // For currency pairs
  const baseCurrency = pairConfig.baseCurrency;
  const quoteCurrency = pairConfig.quoteCurrency;
  
  // If quote currency is USD, pip value is straightforward
  if (quoteCurrency === 'USD') {
    return pairConfig.pipSize * pairConfig.contractSize * accountConfig.lotMultiplier;
  }
  
  // If base currency is USD, pip value depends on exchange rate
  if (baseCurrency === 'USD') {
    return (pairConfig.pipSize * pairConfig.contractSize * accountConfig.lotMultiplier) / currentPrice;
  }
  
  // For cross pairs, we need the USD exchange rate of the quote currency
  // This is a simplified calculation - in real trading, you'd need real-time rates
  return pairConfig.pipSize * pairConfig.contractSize * accountConfig.lotMultiplier;
}

/**
 * Calculate profit/loss for a trade
 */
export function calculateTradeProfitLoss(symbol, entryPrice, exitPrice, lotSize, accountType = 'STANDARD', tradeDirection = 'BUY') {
  const pairConfig = getCurrencyPairConfig(symbol);
  if (!pairConfig) {
    console.warn(`Unknown currency pair: ${symbol}`);
    return 0;
  }

  // Calculate price difference in pips
  const priceDifference = Math.abs(exitPrice - entryPrice);
  const pipDifference = priceDifference / pairConfig.pipSize;
  
  // Determine if trade was profitable based on direction
  let isProfitable = false;
  if (tradeDirection.toUpperCase() === 'BUY') {
    isProfitable = exitPrice > entryPrice;
  } else {
    isProfitable = exitPrice < entryPrice;
  }
  
  // Calculate pip value
  const pipValue = calculatePipValue(symbol, accountType, entryPrice);
  
  // Calculate profit/loss
  const profitLoss = pipDifference * pipValue * lotSize;
  
  return isProfitable ? profitLoss : -profitLoss;
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
 * Calculate risk amount (money at risk)
 */
export function calculateRiskAmount(symbol, lotSize, stopLossPips, accountType = 'STANDARD', currentPrice = 1) {
  const pipValue = calculatePipValue(symbol, accountType, currentPrice);
  return Math.abs(stopLossPips) * pipValue * lotSize;
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
