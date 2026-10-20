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

    it('extracts error message for original_error when the error passed is an Error instance', () => {
        consoleErrorSpy.mockImplementationOnce(() => {
            throw new Error('console.error failed');
        });

        const testError = new Error('Test error message');
        TelemetryUtils.dispatchEvent('TEST_ERROR_INSTANCE', testError, { someContext: 'val' });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

        const fallbackCall = consoleErrorSpy.mock.calls[1][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.event).toBe('TEST_ERROR_INSTANCE');
        expect(parsed.error).toBe('Test error message');
        expect(parsed.original_error).toBe('Test error message');
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

    it('handles native JSON.stringify errors properly', () => {
        TelemetryUtils.dispatchEvent('TEST_NATIVE_STRINGIFY_ERROR', 'Test error', { bigintVal: 1n });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        const fallbackCall = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.event).toBe('TEST_NATIVE_STRINGIFY_ERROR');
        expect(parsed.error).toBe('Test error');
        expect(parsed.additionalContext).toBe('[Circular Reference]');
    });

    it('safely handles errors thrown during payload generation (e.g. from getters)', () => {
        const maliciousError = new Error('Original');
        Object.defineProperty(maliciousError, 'message', {
            get() {
                throw new Error('Malicious getter');
            }
        });

        // The application should not crash
        expect(() => {
            TelemetryUtils.dispatchEvent('TEST_GETTER_ERROR', maliciousError, { someContext: 'val' });
        }).not.toThrow();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        const fallbackCall = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.event).toBe('TEST_GETTER_ERROR');
        expect(parsed.error).toBe('Payload generation failed');
        expect(parsed.additionalContext).toBe('[Circular Reference]');
        expect(parsed.original_error).toBe('Unextractable error');
    });

    it('safely handles errors thrown during context spreading', () => {
        const maliciousContext = {
            get badProp() {
                throw new Error('Bad property');
            }
        };

        expect(() => {
            TelemetryUtils.dispatchEvent('TEST_SPREAD_ERROR', 'Error string', maliciousContext);
        }).not.toThrow();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        const fallbackCall = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(fallbackCall);

        expect(parsed.event).toBe('TEST_SPREAD_ERROR');
        expect(parsed.error).toBe('Payload generation failed');
        expect(parsed.additionalContext).toBe('[Circular Reference]');
        expect(parsed.original_error).toBe('Error string');
    });
});
