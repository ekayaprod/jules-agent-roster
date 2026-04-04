/**
 * Utility class for structured telemetry logging.
 * Replaces unstructured console.error calls with consistent JSON logging.
 */
class TelemetryUtils {
    /**
     * Dispatches a structured telemetry event using console.error.
     * @param {string} eventName - The standardized telemetry event name.
     * @param {Error|string} error - The error object or message string.
     * @param {Object} [additionalContext] - Any extra context to include.
     */
    static dispatchEvent(eventName, error, additionalContext = {}) {
        const payload = {
            event: eventName,
            error: error instanceof Error ? error.message : error,
            ...additionalContext
        };
        console.error(JSON.stringify(payload));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelemetryUtils;
    if (typeof global !== 'undefined') global.TelemetryUtils = TelemetryUtils;
} else if (typeof window !== 'undefined') {
    window.TelemetryUtils = TelemetryUtils;
}
