'use client';

import { useEffect } from 'react';
import { clearCorruptedLocalStorageData, initializeLocalStorageWithDefaults } from '../utils/clearCorruptedData';

export default function LocalStorageInitializer() {
  useEffect(() => {
    // Clear any corrupted data and initialize with defaults
    clearCorruptedLocalStorageData();
    initializeLocalStorageWithDefaults();
  }, []);

  return null; // This component doesn't render anything
}



