const GlobalErrorBoundary = require('./GlobalErrorBoundary');

describe('GlobalErrorBoundary', () => {
    let mockApp;
    let mockTelemetryUtils;
    let errorBoundary;
    let originalWindow;
    let eventListeners;

    beforeEach(() => {
        eventListeners = {};
        originalWindow = global.window;

        // JSDOM overrides global.window.addEventListener, so we explicitly assign a jest.fn
        global.window.addEventListener = jest.fn((event, handler) => {
            eventListeners[event] = handler;
        });
        global.window.removeEventListener = jest.fn((event, handler) => {
            delete eventListeners[event];
        });
        global.window.TOAST_TYPES = { ERROR: 'error' };

        mockTelemetryUtils = {
            dispatchEvent: jest.fn()
        };
        global.TelemetryUtils = mockTelemetryUtils;

        mockApp = {
            toast: {
                show: jest.fn()
            }
        };

        errorBoundary = new GlobalErrorBoundary(mockApp);
    });

    afterEach(() => {
        global.window = originalWindow;
        delete global.TelemetryUtils;
        jest.clearAllMocks();
    });

    it('attaches event listeners on attach()', () => {
        errorBoundary.attach();
        expect(global.window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
        expect(global.window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
        expect(eventListeners['error']).toBeDefined();
        expect(eventListeners['unhandledrejection']).toBeDefined();
    });

    it('detaches event listeners on detach()', () => {
        errorBoundary.attach();
        errorBoundary.detach();
        expect(global.window.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
        expect(global.window.removeEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
        expect(eventListeners['error']).toBeUndefined();
        expect(eventListeners['unhandledrejection']).toBeUndefined();
    });

    it('handles synchronous errors and logs telemetry', () => {
        errorBoundary.attach();
        const testError = new Error('Test sync error');

        eventListeners['error']({ error: testError });

        expect(mockTelemetryUtils.dispatchEvent).toHaveBeenCalledWith('UNHANDLED_ERROR', testError);
        expect(mockApp.toast.show).toHaveBeenCalledWith('An unexpected error occurred. Please check the logs.', 'error');
    });

    it('handles synchronous errors with only message', () => {
        errorBoundary.attach();

        eventListeners['error']({ message: 'String sync error' });

        expect(mockTelemetryUtils.dispatchEvent).toHaveBeenCalledWith('UNHANDLED_ERROR', expect.any(Error));
        expect(mockTelemetryUtils.dispatchEvent.mock.calls[0][1].message).toBe('String sync error');
        expect(mockApp.toast.show).toHaveBeenCalledWith('An unexpected error occurred. Please check the logs.', 'error');
    });

    it('handles unhandled promise rejections and logs telemetry', () => {
        errorBoundary.attach();
        const testError = new Error('Test async error');

        eventListeners['unhandledrejection']({ reason: testError });

        expect(mockTelemetryUtils.dispatchEvent).toHaveBeenCalledWith('UNHANDLED_PROMISE_REJECTION', testError);
        expect(mockApp.toast.show).toHaveBeenCalledWith('An unexpected error occurred. Please check the logs.', 'error');
    });

    it('handles unhandled promise rejections with string reason', () => {
        errorBoundary.attach();

        eventListeners['unhandledrejection']({ reason: 'String async error' });

        expect(mockTelemetryUtils.dispatchEvent).toHaveBeenCalledWith('UNHANDLED_PROMISE_REJECTION', expect.any(Error));
        expect(mockTelemetryUtils.dispatchEvent.mock.calls[0][1].message).toBe('String async error');
        expect(mockApp.toast.show).toHaveBeenCalledWith('An unexpected error occurred. Please check the logs.', 'error');
    });

    it('handles missing telemetry utils gracefully', () => {
        delete global.TelemetryUtils;
        errorBoundary.attach();
        const testError = new Error('Test sync error');

        // Should not throw
        expect(() => {
            eventListeners['error']({ error: testError });
        }).not.toThrow();

        expect(mockApp.toast.show).toHaveBeenCalledWith('An unexpected error occurred. Please check the logs.', 'error');
    });

    it('handles missing toast cleanly', () => {
        mockApp.toast = undefined;
        errorBoundary.attach();
        const testError = new Error('Test sync error');

        // Should not throw
        expect(() => {
            eventListeners['error']({ error: testError });
        }).not.toThrow();

        expect(mockTelemetryUtils.dispatchEvent).toHaveBeenCalledWith('UNHANDLED_ERROR', testError);
    });
});
