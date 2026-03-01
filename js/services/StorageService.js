class StorageService {
  /**
   * Safely retrieves and parses an item from localStorage.
   * @param {string} key - The localStorage key.
   * @param {any} defaultValue - The fallback value if retrieval or parsing fails.
   * @returns {any} The parsed value or the default value.
   */
  static getItem(key, defaultValue = null) {
    let stored = null;
    try {
      stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return defaultValue;
    } catch (e) {
      console.error(
        JSON.stringify({
          event: "LOCAL_STORAGE_PARSE_FAILED",
          key: key,
          stored: stored,
          error: e.message,
        })
      );
      return defaultValue;
    }
  }

  /**
   * Safely serializes and saves an item to localStorage.
   * @param {string} key - The localStorage key.
   * @param {any} value - The value to store.
   * @returns {boolean} True if successful, false otherwise.
   */
  static setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.warn(
        JSON.stringify({
          event: "LOCAL_STORAGE_SAVE_FAILED",
          key: key,
          error: e.message,
        })
      );
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
