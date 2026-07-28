/**
 * @jest-environment jsdom
 */

const StorageUtils = require('./storage-utils');

describe('StorageUtils Global/Window Fallbacks', () => {
    it('uses global.TelemetryUtils when window.TelemetryUtils is not available', () => {
        const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
        Object.defineProperty(global, 'localStorage', {
            get: () => { throw new Error('Simulated global fallback error'); },
            configurable: true
        });

        // Set up global context with TelemetryUtils, remove window
        const mockDispatch = jest.fn();
        global.TelemetryUtils = { dispatchEvent: mockDispatch };

        const originalWindow = global.window;
        delete global.window;

        // Execute to trigger catch block
        StorageUtils.getJsonArrayItem('test_key', 'test_event');
        expect(mockDispatch).toHaveBeenCalledWith('test_event', expect.any(Error), expect.any(Object));

        mockDispatch.mockClear();
        StorageUtils.setJsonItem('test_key', {}, 'test');
        expect(mockDispatch).toHaveBeenCalledWith('STORAGE_ITEM_SAVE_FAILED', expect.any(Error), expect.any(Object));

        mockDispatch.mockClear();
        StorageUtils.getItem('test_key');
        expect(mockDispatch).toHaveBeenCalledWith('STORAGE_ITEM_RETRIEVAL_FAILED', expect.any(Error), expect.any(Object));

        mockDispatch.mockClear();
        StorageUtils.setItem('test_key', 'val');
        expect(mockDispatch).toHaveBeenCalledWith('STORAGE_ITEM_SAVE_FAILED', expect.any(Error), expect.any(Object));

        // Restore global scope
        global.window = originalWindow;
        delete global.TelemetryUtils;
        Object.defineProperty(global, 'localStorage', originalLocalStorage);
    });
});
