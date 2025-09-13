/**
 * Clear corrupted localStorage data that might be causing JSON parsing errors
 */
export function clearCorruptedLocalStorageData() {
  const keysToCheck = [
    'tradingMetricsForPerformance',
    'trading-calendar-selected-date',
    'userSettings',
    'tradingData'
  ];

  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // Try to parse the item
        JSON.parse(item);
        console.log(`✓ ${key} is valid JSON`);
      }
    } catch (error) {
      console.warn(`✗ ${key} contains corrupted data, clearing...`, error.message);
      localStorage.removeItem(key);
    }
  });
}

/**
 * Initialize localStorage with safe defaults
 */
export function initializeLocalStorageWithDefaults() {
  const defaults = {
    'tradingMetricsForPerformance': [],
    'userSettings': {
      display: { currency: 'USD' },
      theme: 'dark'
    }
  };

  Object.entries(defaults).forEach(([key, defaultValue]) => {
    try {
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        console.log(`✓ Initialized ${key} with default value`);
      }
    } catch (error) {
      console.warn(`Failed to initialize ${key}:`, error.message);
    }
  });
}



