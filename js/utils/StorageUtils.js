/**
 * Utility class for interacting with localStorage.
 * Centralizes duplicate parsing, stringifying, and error handling logic.
 */
class StorageUtils {
    /**
     * Retrieves and parses a JSON array from localStorage.
     * @param {string} key - The localStorage key.
     * @param {string} errorEventName - The name of the event for error logging.
     * @returns {Array|null} The parsed array, or null if parsing fails or item doesn't exist.
     */
    static getJsonArrayItem(key, errorEventName) {
        let stored = null;
        try {
            if (typeof localStorage === 'undefined') return null;
            stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            return null;
        } catch (error) {
            console.error(JSON.stringify({
                event: errorEventName,
                stored: stored,
                error: error.message
            }));
            return null;
        }
    }

    /**
     * Serializes and saves data to localStorage.
     * @param {string} key - The localStorage key.
     * @param {any} data - The data to stringify and save.
     * @param {string} componentName - The name of the component for warning logs.
     */
    static setJsonItem(key, data, componentName) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`${componentName}: Failed to save to localStorage`, error);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
}
