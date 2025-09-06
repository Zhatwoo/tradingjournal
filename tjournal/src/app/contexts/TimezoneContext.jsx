'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getEffectiveTimezone } from '../utils/timezoneUtils';

const TimezoneContext = createContext();

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  const [userTimezone, setUserTimezone] = useState('auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.settings?.display?.timezone) {
              setUserTimezone(userData.settings.display.timezone);
            }
          }
        } catch (error) {
          console.error('Error loading timezone settings:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getEffectiveTimezoneForUser = () => {
    return getEffectiveTimezone(userTimezone);
  };

  const value = {
    userTimezone,
    setUserTimezone,
    getEffectiveTimezoneForUser,
    loading
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};
