const StorageUtils = require('./storage-utils');

describe('StorageUtils Telemetry Exceptions', () => {
    let originalWindowTelemetryUtils;
    let originalGlobalTelemetryUtils;

    beforeEach(() => {
        originalWindowTelemetryUtils = window.TelemetryUtils;
        originalGlobalTelemetryUtils = global.TelemetryUtils;

        window.TelemetryUtils = { dispatchEvent: jest.fn() };
        global.TelemetryUtils = window.TelemetryUtils;
    });

    afterEach(() => {
        window.TelemetryUtils = originalWindowTelemetryUtils;
        global.TelemetryUtils = originalGlobalTelemetryUtils;
        jest.clearAllMocks();
    });

    it('dispatches telemetry when getJsonArrayItem throws an error', () => {
        const originalGetItem = StorageUtils._readLimits;
        StorageUtils._readLimits = { count: 501, windowStart: Date.now() };

        const result = StorageUtils.getJsonArrayItem('test-key', 'TEST_EVENT');
        expect(result).toBeNull();
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith(
            'TEST_EVENT',
            expect.any(Error),
            { stored: null }
        );
        StorageUtils._readLimits = originalGetItem;
    });

    it('dispatches telemetry when setJsonItem throws an error', () => {
        const originalSetItem = window.localStorage.setItem;
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn().mockImplementation(() => { throw new Error('setItem failed'); })
            },
            writable: true
        });

        StorageUtils.setJsonItem('test-key', { data: 1 }, 'TestComponent');
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith(
            'STORAGE_ITEM_SAVE_FAILED',
            expect.any(Error),
            { key: 'test-key' }
        );

        window.localStorage.setItem = originalSetItem;
    });

    it('dispatches telemetry when getItem throws an error', () => {
        const originalGetItem = window.localStorage.getItem;
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn().mockImplementation(() => { throw new Error('getItem failed'); })
            },
            writable: true
        });

        const result = StorageUtils.getItem('test-key', 'fallback');
        expect(result).toBe('fallback');
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith(
            'STORAGE_ITEM_RETRIEVAL_FAILED',
            expect.any(Error),
            { key: 'test-key' }
        );
        window.localStorage.getItem = originalGetItem;
    });

    it('dispatches telemetry when setItem throws an error', () => {
        const originalSetItem = window.localStorage.setItem;
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn().mockImplementation(() => { throw new Error('setItem failed'); })
            },
            writable: true
        });

        StorageUtils.setItem('test-key', 'test-value');
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith(
            'STORAGE_ITEM_SAVE_FAILED',
            expect.any(Error),
            { key: 'test-key' }
        );
        window.localStorage.setItem = originalSetItem;
    });
});
