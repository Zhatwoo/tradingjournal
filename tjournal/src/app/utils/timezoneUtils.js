// Timezone utility functions for consistent timezone handling across the app

/**
 * Get the effective timezone based on user settings
 * @param {string} userTimezone - User's selected timezone from settings
 * @returns {string} - The timezone to use for display
 */
export const getEffectiveTimezone = (userTimezone) => {
  if (!userTimezone || userTimezone === 'auto') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return userTimezone;
};

/**
 * Convert a date to a specific timezone
 * @param {Date|string} date - The date to convert
 * @param {string} timezone - The target timezone
 * @returns {Date} - Date converted to the target timezone
 */
export const convertToTimezone = (date, timezone) => {
  const dateObj = new Date(date);
  const effectiveTimezone = getEffectiveTimezone(timezone);
  
  // For UTC offset strings (e.g., "UTC+8", "UTC-5")
  if (effectiveTimezone.startsWith('UTC')) {
    const offset = effectiveTimezone.replace('UTC', '');
    const offsetHours = parseInt(offset);
    return new Date(dateObj.getTime() + (offsetHours * 60 * 60 * 1000));
  }
  
  // For timezone names (e.g., "Asia/Singapore", "America/New_York")
  return new Date(dateObj.toLocaleString("en-US", { timeZone: effectiveTimezone }));
};

/**
 * Format a date in the user's preferred timezone
 * @param {Date|string} date - The date to format
 * @param {string} userTimezone - User's selected timezone
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDateInTimezone = (date, userTimezone, options = {}) => {
  const dateObj = new Date(date);
  const effectiveTimezone = getEffectiveTimezone(userTimezone);
  
  // Handle UTC offset strings (e.g., "UTC+8", "UTC-5")
  if (effectiveTimezone.startsWith('UTC')) {
    const offset = effectiveTimezone.replace('UTC', '');
    const offsetHours = parseInt(offset);
    const adjustedDate = new Date(dateObj.getTime() + (offsetHours * 60 * 60 * 1000));
    
    // Remove timeZone from options for UTC offset handling
    const { timeZone, ...otherOptions } = options;
    return adjustedDate.toLocaleString(undefined, otherOptions);
  }
  
  // For proper timezone names (e.g., "Asia/Singapore", "America/New_York")
  try {
    const defaultOptions = {
      timeZone: effectiveTimezone,
      ...options
    };
    
    return dateObj.toLocaleString(undefined, defaultOptions);
  } catch (error) {
    // Fallback to device timezone if the timezone is invalid
    console.warn(`Invalid timezone: ${effectiveTimezone}, falling back to device timezone`);
    const { timeZone, ...otherOptions } = options;
    return dateObj.toLocaleString(undefined, otherOptions);
  }
};

/**
 * Get a date string in YYYY-MM-DD format for the user's timezone
 * @param {Date|string} date - The date to convert
 * @param {string} userTimezone - User's selected timezone
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const getDateStringInTimezone = (date, userTimezone) => {
  const dateObj = new Date(date);
  const effectiveTimezone = getEffectiveTimezone(userTimezone);
  
  // For UTC offset strings (e.g., "UTC+8", "UTC-5")
  if (effectiveTimezone.startsWith('UTC')) {
    const offset = effectiveTimezone.replace('UTC', '');
    const offsetHours = parseInt(offset);
    const adjustedDate = new Date(dateObj.getTime() + (offsetHours * 60 * 60 * 1000));
    return adjustedDate.toLocaleDateString('en-CA');
  }
  
  // For proper timezone names (e.g., "Asia/Singapore", "America/New_York")
  try {
    return dateObj.toLocaleDateString('en-CA', { timeZone: effectiveTimezone });
  } catch (error) {
    // Fallback to device timezone if the timezone is invalid
    console.warn(`Invalid timezone: ${effectiveTimezone}, falling back to device timezone`);
    return dateObj.toLocaleDateString('en-CA');
  }
};

/**
 * Get current time in the user's preferred timezone
 * @param {string} userTimezone - User's selected timezone
 * @returns {Date} - Current time in the specified timezone
 */
export const getCurrentTimeInTimezone = (userTimezone) => {
  const now = new Date();
  return convertToTimezone(now, userTimezone);
};

/**
 * Get timezone display name
 * @param {string} timezone - The timezone identifier
 * @returns {string} - Display name for the timezone
 */
export const getTimezoneDisplayName = (timezone) => {
  if (!timezone || timezone === 'auto') {
    return `Auto (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
  }
  
  if (timezone.startsWith('UTC')) {
    return timezone;
  }
  
  try {
    const date = new Date();
    const timeZoneName = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value;
    
    return `${timezone.split('/').pop().replace('_', ' ')} (${timeZoneName || timezone})`;
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, returning as-is`);
    return timezone;
  }
};

/**
 * Get timezone offset in hours
 * @param {string} timezone - The timezone identifier
 * @returns {number} - Offset in hours from UTC
 */
export const getTimezoneOffset = (timezone) => {
  if (!timezone || timezone === 'auto') {
    return new Date().getTimezoneOffset() / -60;
  }
  
  if (timezone.startsWith('UTC')) {
    return parseInt(timezone.replace('UTC', ''));
  }
  
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    return (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
  } catch (error) {
    return 0;
  }
};

/**
 * Create a timezone-aware timestamp for trade uploads
 * This ensures consistent sorting and display across different timezones
 * @param {string} userTimezone - User's selected timezone
 * @param {Date} customDate - Optional custom date (defaults to current time)
 * @returns {string} - ISO string timestamp in the user's timezone
 */
export const createTimezoneAwareTimestamp = (userTimezone, customDate = null) => {
  const date = customDate || new Date();
  const effectiveTimezone = getEffectiveTimezone(userTimezone);
  
  // For UTC offset strings (e.g., "UTC+8", "UTC-5")
  if (effectiveTimezone.startsWith('UTC')) {
    const offset = effectiveTimezone.replace('UTC', '');
    const offsetHours = parseInt(offset);
    const adjustedDate = new Date(date.getTime() + (offsetHours * 60 * 60 * 1000));
    return adjustedDate.toISOString();
  }
  
  // For proper timezone names (e.g., "Asia/Singapore", "America/New_York")
  try {
    // Create a date string in the target timezone
    const timeString = date.toLocaleString("sv-SE", { timeZone: effectiveTimezone });
    // Convert back to a proper Date object and return ISO string
    return new Date(timeString).toISOString();
  } catch (error) {
    // Fallback to device timezone if the timezone is invalid
    console.warn(`Invalid timezone: ${effectiveTimezone}, falling back to device timezone`);
    return date.toISOString();
  }
};

/**
 * Create a timestamp using device time with a specific date
 * This combines the current device time with a selected date
 * @param {Date} targetDate - The target date (from calendar or current date)
 * @param {Date} deviceTime - Optional device time (defaults to current time)
 * @returns {string} - ISO string timestamp combining device time with target date
 */
export const createDateTimeFromDeviceTime = (targetDate, deviceTime = null) => {
  const now = deviceTime || new Date();
  const target = new Date(targetDate);
  
  // Get the time components from device time
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  
  // Set the date components from target date
  const year = target.getFullYear();
  const month = target.getMonth();
  const day = target.getDate();
  
  // Create new date combining target date with device time
  const combinedDateTime = new Date(year, month, day, hours, minutes, seconds, milliseconds);
  
  return combinedDateTime.toISOString();
};