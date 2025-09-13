/**
 * Safely parse JSON with fallback handling
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallback - The fallback value if parsing fails
 * @returns {any} - Parsed JSON or fallback value
 */
export function safeJsonParse(jsonString, fallback = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    // Check if the string looks like HTML (common cause of the error)
    if (jsonString.trim().startsWith('<!DOCTYPE') || 
        jsonString.trim().startsWith('<html') ||
        jsonString.trim().startsWith('<')) {
      console.warn('Attempted to parse HTML as JSON:', jsonString.substring(0, 100) + '...');
      return fallback;
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error.message, 'Input:', jsonString.substring(0, 100) + '...');
    return fallback;
  }
}

/**
 * Safely get and parse JSON from localStorage
 * @param {string} key - The localStorage key
 * @param {any} fallback - The fallback value if parsing fails
 * @returns {any} - Parsed JSON or fallback value
 */
export function safeGetFromLocalStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, fallback);
  } catch (error) {
    console.warn(`Error accessing localStorage key "${key}":`, error.message);
    return fallback;
  }
}

/**
 * Safely set JSON to localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} - Success status
 */
export function safeSetToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error.message);
    return false;
  }
}



