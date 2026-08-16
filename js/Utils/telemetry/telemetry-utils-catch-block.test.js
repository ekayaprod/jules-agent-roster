const TelemetryUtils = require('./telemetry-utils');

describe('TelemetryUtils - Catch Block', () => {
    it('should handle payload stringification failure when logging an event', () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        const originalStringify = JSON.stringify;
        let callCount = 0;
        JSON.stringify = jest.fn().mockImplementation((val) => {
            callCount++;
            if (callCount === 1) {
                throw new Error('Circular reference mock');
            }
            return originalStringify(val);
        });

        TelemetryUtils.dispatchEvent('TEST_EVENT', 'Test error', { someContext: 'test' });

        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith(
            originalStringify({
                event: 'TEST_EVENT',
                error: 'Test error',
                additionalContext: '[Circular Reference]'
            })
        );

        consoleErrorMock.mockRestore();
        JSON.stringify = originalStringify;
    });
});
