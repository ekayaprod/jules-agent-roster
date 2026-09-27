/**
 * Global Error Boundary to catch unhandled errors and promise rejections.
 * Provides a safety net for unexpected crashes, logging them via TelemetryUtils
 * and displaying a user-friendly toast notification.
 */
class GlobalErrorBoundary {
    /**
     * @param {Object} app - The main RosterApp instance providing global state and toast access.
     */
    constructor(app) {
        this.app = app;
        this.handleError = this.handleError.bind(this);
        this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    }

    /**
     * Attaches global error listeners to the window object.
     */
    attach() {
        if (typeof window !== 'undefined') {
            window.addEventListener('error', this.handleError);
            window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        }
    }

    /**
     * Detaches global error listeners from the window object.
     */
    detach() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('error', this.handleError);
            window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        }
    }

    /**
     * Handles synchronous unhandled errors.
     * @param {ErrorEvent} event - The error event.
     */
    handleError(event) {
        const error = event.error || new Error(event.message || 'Unknown error');
        this._logAndNotify("UNHANDLED_ERROR", error);
    }

    /**
     * Handles asynchronous unhandled promise rejections.
     * @param {PromiseRejectionEvent} event - The promise rejection event.
     */
    handleUnhandledRejection(event) {
        const error = event.reason instanceof Error ? event.reason : new Error(event.reason || 'Unhandled Promise Rejection');
        this._logAndNotify("UNHANDLED_PROMISE_REJECTION", error);
    }

    /**
     * Internal method to dispatch telemetry and show a toast notification.
     * @param {string} eventName - The telemetry event name.
     * @param {Error} error - The error object.
     * @private
     */
    _logAndNotify(eventName, error) {
        const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
        if (tu) {
            tu.dispatchEvent(eventName, error);
        }

        if (this.app && this.app.toast) {
            const toastType = typeof window !== 'undefined' && window.TOAST_TYPES ? window.TOAST_TYPES.ERROR : 'error';
            this.app.toast.show('An unexpected error occurred. Please check the logs.', toastType);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalErrorBoundary;
}
