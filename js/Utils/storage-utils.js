// 🚨 Paramedic: Stripped illegal Node.js require() to prevent environment bleed and fatal boot crashes.
var getTelemetryUtils = () => typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);

/**
 * Utility class for interacting with localStorage.
 * Centralizes duplicate parsing, stringifying, and error handling logic.
 * @see ../../docs/architecture/Utils/README.md#storageutils-architecture for details on safe serialization boundaries.
 */
class StorageUtils {
    /**
     * Retrieves and parses a JSON array from localStorage.
     * @param {string} key - The localStorage key.
     * @param {string} errorEventName - The name of the event for error logging.
     * @returns {Array|null} The parsed array, or null if parsing fails or item doesn't exist.
     * @see ../../docs/architecture/Utils/README.md#storageutils-architecture
     */
    static getJsonArrayItem(key, errorEventName) {
        let stored = null;
        try {
            // 🐺 FORTIFY: Head 1 - Rate Limiting (Throttle massive read assaults)
            if (!this._readLimits) this._readLimits = { count: 0, windowStart: Date.now() };
            const now = Date.now();
            if (now - this._readLimits.windowStart > 1000) {
                this._readLimits.count = 0;
                this._readLimits.windowStart = now;
            }
            if (this._readLimits.count >= 500) {
                throw new Error("HTTP 429: Too Many Requests. Thundering herd blocked at storage boundary.");
            }
            this._readLimits.count++;

            if (typeof localStorage === 'undefined') return null;
            stored = localStorage.getItem(key);
            if (stored) {
                // 🐺 FORTIFY: Head 2 & 3 - Wrap parser and enforce schema stripping pollution
                if (stored.length > 500000) throw new Error("Invalid payload: Storage buffer exceeds maximum length.");

                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            const safeObj = {};
                            for (const k of Object.keys(item)) {
                                if (k !== '__proto__' && k !== 'constructor' && typeof k === 'string') {
                                    safeObj[k] = item[k];
                                }
                            }
                            return safeObj;
                        }
                        return item;
                    });
                }
            }
            return null;
        } catch (error) {
            console.warn("Assault intercepted by Cerberus at boundary", error);
            const tu = getTelemetryUtils();
            if (tu) tu.dispatchEvent(errorEventName, error, { stored: stored });
            return null;
        }
    }

    /**
     * Serializes and saves data to localStorage.
     * @param {string} key - The localStorage key.
     * @param {unknown} data - The data to stringify and save.
     * @param {string} componentName - The name of the component for warning logs.
     * @see ../../docs/architecture/Utils/README.md#storageutils-architecture
     */
    static setJsonItem(key, data, componentName) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`${componentName}: Failed to save to localStorage`, error);
        }
    }

    /**
     * Retrieves a raw string item from localStorage.
     * @param {string} key - The localStorage key.
     * @param {string} defaultValue - Fallback if not found.
     * @returns {string} The stored string.
     * @see ../../docs/architecture/Utils/README.md#storageutils-architecture
     */
    static getItem(key, defaultValue = "") {
        try {
            if (typeof localStorage === 'undefined') return defaultValue;
            return localStorage.getItem(key) || defaultValue;
        } catch {
            return defaultValue;
        }
    }

    /**
     * Saves a raw string item to localStorage.
     * @param {string} key - The localStorage key.
     * @param {string} value - The string to save.
     * @see ../../docs/architecture/Utils/README.md#storageutils-architecture
     */
    static setItem(key, value) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to save string to localStorage`, error);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
}
