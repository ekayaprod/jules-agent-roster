const GlobalErrorBoundary = require('./GlobalErrorBoundary');

describe('GlobalErrorBoundary', () => {
    let appMock;
    let boundary;
    let telemetrySpy;
    let originalTelemetryUtils;

    beforeEach(() => {
        // Mock the app and toast system
        appMock = {
            toast: {
                show: jest.fn()
            }
        };

        // Mock TelemetryUtils
        telemetrySpy = jest.fn();
        originalTelemetryUtils = global.TelemetryUtils;
        global.TelemetryUtils = {
            dispatchEvent: telemetrySpy
        };

        // Mock TOAST_TYPES
        global.TOAST_TYPES = { ERROR: 'error', SUCCESS: 'success' };

        // Create boundary
        boundary = new GlobalErrorBoundary(appMock);

        // Mock console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        boundary.destroy();
        global.TelemetryUtils = originalTelemetryUtils;
        delete global.TOAST_TYPES;
        jest.restoreAllMocks();
    });

    it('should initialize and attach listeners', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

        boundary.init();
        expect(boundary.initialized).toBe(true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('error', boundary.handleError);
        expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', boundary.handleUnhandledRejection);
    });

    it('should not initialize multiple times', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

        boundary.init();
        boundary.init(); // second call
        expect(addEventListenerSpy).toHaveBeenCalledTimes(2); // 1 for error, 1 for unhandledrejection
    });

    it('should destroy and remove listeners', () => {
        boundary.init();
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        boundary.destroy();
        expect(boundary.initialized).toBe(false);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('error', boundary.handleError);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', boundary.handleUnhandledRejection);
    });

    it('should handle standard error events', () => {
        boundary.init();

        const mockError = new Error('Test Error');
        const mockEvent = new ErrorEvent('error', {
            error: mockError,
            message: 'Test Error',
            filename: 'test.js',
            lineno: 10,
            colno: 20
        });

        // Trigger the error
        window.dispatchEvent(mockEvent);

        // Verify telemetry was dispatched
        expect(telemetrySpy).toHaveBeenCalledWith(
            "UNCAUGHT_GLOBAL_ERROR",
            mockError,
            { source: 'test.js', lineno: 10, colno: 20 }
        );

        // Verify user toast was shown
        expect(appMock.toast.show).toHaveBeenCalledWith(
            'Application Error: Test Error',
            'error',
            10000
        );
    });

    it('should handle unhandled promise rejections', () => {
        boundary.init();

        const mockReason = new Error('Promise Rejected Error');

        // The jsdom doesn't fully support PromiseRejectionEvent natively in standard ways easily across versions
        // We can invoke the handler directly with a mock shape.
        boundary.handleUnhandledRejection({ reason: mockReason });

        // Verify telemetry was dispatched
        expect(telemetrySpy).toHaveBeenCalledWith(
            "UNHANDLED_PROMISE_REJECTION",
            mockReason
        );

        // Verify user toast was shown
        expect(appMock.toast.show).toHaveBeenCalledWith(
            'Async Task Failed: Promise Rejected Error',
            'error',
            10000
        );
    });

    it('should gracefully fall back if error object is missing', () => {
        boundary.init();
        boundary.handleError({ message: 'Fallback Message' });

        expect(telemetrySpy).toHaveBeenCalled();
        expect(appMock.toast.show).toHaveBeenCalledWith(
            'Application Error: Fallback Message',
            'error',
            10000
        );
    });

    it('should gracefully fall back if telemetry is missing', () => {
        delete global.TelemetryUtils;

        boundary.init();
        boundary.handleError({ message: 'No Telemetry' });

        expect(console.error).toHaveBeenCalled();
        expect(appMock.toast.show).toHaveBeenCalled();
    });
});