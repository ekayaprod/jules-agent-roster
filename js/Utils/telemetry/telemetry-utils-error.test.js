const TelemetryUtils = require('./telemetry-utils');

describe('TelemetryUtils error scenarios', () => {
    let consoleErrorSpy;
    let jsonStringifySpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jsonStringifySpy = jest.spyOn(JSON, 'stringify');
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        jsonStringifySpy.mockRestore();
    });

    it('should catch and handle errors when JSON.stringify fails', () => {
        jsonStringifySpy.mockImplementationOnce(() => {
            throw new Error('Mock stringify error');
        });

        TelemetryUtils.dispatchEvent('TEST_ERROR_EVENT', 'Test error', { someContext: 'val' });

        expect(jsonStringifySpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        const fallbackCall = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.event).toBe('TEST_ERROR_EVENT');
        expect(parsed.error).toBe('Test error');
        expect(parsed.additionalContext).toBe('[Circular Reference]');
    });

    it('fails silently if the fallback catch block is triggered', () => {
        jsonStringifySpy.mockImplementation(() => {
            throw new Error('Permanent stringify error');
        });

        expect(() => {
            TelemetryUtils.dispatchEvent('TEST_SILENT_FAIL', 'error', { someContext: 'value' });
        }).not.toThrow();

        expect(jsonStringifySpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    it('handles original_error correctly when error is not an Error object but falsy', () => {
        jsonStringifySpy.mockImplementationOnce(() => {
            throw new Error('Mock stringify error');
        });

        TelemetryUtils.dispatchEvent('TEST_FALSY_ERROR', null, { someContext: 'val' });

        const fallbackCall = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.original_error).toBeNull();
    });
});
