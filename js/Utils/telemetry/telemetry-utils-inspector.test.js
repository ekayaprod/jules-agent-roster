/**
 * @jest-environment jsdom
 */

const TelemetryUtils = require('./telemetry-utils');

describe('TelemetryUtils Inspector Polygraph', () => {
    describe('dispatchEvent', () => {
        it('should handle circular references in additionalContext', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const circularObj = {};
            circularObj.self = circularObj;

            TelemetryUtils.dispatchEvent('TEST_EVENT', new Error('test error'), circularObj);

            expect(consoleSpy).toHaveBeenCalled();
            const calledWith = JSON.parse(consoleSpy.mock.calls[0][0]);

            expect(calledWith.event).toBe('TEST_EVENT');
            expect(calledWith.error).toBe('test error');
            expect(calledWith.additionalContext).toBe('[Circular Reference]');
            expect(calledWith.original_error).toBeDefined();

            consoleSpy.mockRestore();
        });
    });
});
