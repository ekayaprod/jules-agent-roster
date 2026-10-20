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
        let payload;
        try {
            payload = {
                event: eventName,
                error: error instanceof Error ? error.message : error,
                ...additionalContext
            };
            // Using ES2019 optional catch binding to avoid unused parameters
            console.error(JSON.stringify(payload));
        } catch {
            if (!payload) {
                payload = {
                    event: eventName,
                    error: "Payload generation failed"
                };
            }
            payload.error_payload_stringification_failed = true;
            payload.additionalContext = "[Circular Reference]";
            try {
                let originalError = error;
                try {
                    originalError = error && error.message ? error.message : error;
                } catch {
                    originalError = "Unextractable error";
                }

                console.error(JSON.stringify({
                    event: payload.event,
                    error: payload.error,
                    additionalContext: payload.additionalContext,
                    original_error: originalError
                }));
            } catch {
                // If console.error or fallback JSON stringification fails, fail silently
                // to prevent telemetry from crashing the application.
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelemetryUtils;
    if (typeof global !== 'undefined') global.TelemetryUtils = TelemetryUtils;
} else if (typeof window !== 'undefined') {
    window.TelemetryUtils = TelemetryUtils;
}
