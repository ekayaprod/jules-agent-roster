/**
 * Global Error Boundary to catch unhandled runtime errors and promise rejections.
 * Prevents silent failures by piping errors through TelemetryUtils and presenting accessible ToastNotifications.
 * @see ../../../docs/architecture/core/README.md#error-handling
 */
class GlobalErrorBoundary {
    /**
     * @param {RosterApp} app - The core RosterApp instance, used to access the ToastNotification system.
     */
    constructor(app) {
        this.app = app;
        this.initialized = false;

        this.handleError = this.handleError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    }

    /**
     * Attaches global listeners to the `window` object.
     * Prevents duplicate initialization.
     */
    init() {
        if (this.initialized) return;
        if (typeof window === 'undefined') return; // Defensive guard for non-browser environments

        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);

        this.initialized = true;
    }

    /**
     * Detaches global listeners from the `window` object.
     */
    destroy() {
        if (!this.initialized) return;
        if (typeof window === 'undefined') return;

        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

        this.initialized = false;
    }

    /**
     * Intercepts standard DOM ErrorEvents.
     * @param {ErrorEvent} event - The unhandled error event.
     */
    handleError(event) {
        const error = event.error || new Error(event.message || 'Unknown Error');
        const message = `Application Error: ${error.message}`;

        // Dispatch to telemetry
        const tu = typeof TelemetryUtils !== 'undefined' ? TelemetryUtils : (typeof window !== 'undefined' ? window.TelemetryUtils : null);
        if (tu) {
            tu.dispatchEvent("UNCAUGHT_GLOBAL_ERROR", error, { source: event.filename, lineno: event.lineno, colno: event.colno });
        } else {
            console.error("GlobalErrorBoundary: UNCAUGHT_GLOBAL_ERROR", error);
        }

        // Display user notification
        if (this.app && this.app.toast) {
            this.app.toast.show(message, typeof TOAST_TYPES !== 'undefined' ? TOAST_TYPES.ERROR : 'error', 10000);
        }
    }

    /**
     * Intercepts unhandled Promise RejectionEvents.
     * @param {PromiseRejectionEvent} event - The unhandled promise rejection event.
     */
    handleUnhandledRejection(event) {
        const reason = event.reason;
        const error = reason instanceof Error ? reason : new Error(String(reason) || 'Unknown Promise Rejection');
        const message = `Async Task Failed: ${error.message}`;

        // Dispatch to telemetry
        const tu = typeof TelemetryUtils !== 'undefined' ? TelemetryUtils : (typeof window !== 'undefined' ? window.TelemetryUtils : null);
        if (tu) {
            tu.dispatchEvent("UNHANDLED_PROMISE_REJECTION", error);
        } else {
            console.error("GlobalErrorBoundary: UNHANDLED_PROMISE_REJECTION", error);
        }

        // Display user notification
        if (this.app && this.app.toast) {
            this.app.toast.show(message, typeof TOAST_TYPES !== 'undefined' ? TOAST_TYPES.ERROR : 'error', 10000);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalErrorBoundary;
} else if (typeof window !== 'undefined') {
    window.GlobalErrorBoundary = GlobalErrorBoundary;
}
