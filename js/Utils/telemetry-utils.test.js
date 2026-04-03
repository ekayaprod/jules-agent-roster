const TelemetryUtils = require('./telemetry-utils');

describe('TelemetryUtils', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('dispatches structured JSON with a standard string error', () => {
        TelemetryUtils.dispatchEvent('TEST_EVENT', 'string error msg', { extra: 'data' });

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedArg = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(loggedArg);

        expect(parsed).toEqual({
            event: 'TEST_EVENT',
            error: 'string error msg',
            extra: 'data'
        });
    });

    it('extracts the message from an Error object boundary', () => {
        const errorObj = new Error('Boundary Error Message');
        errorObj.stack = 'fake stack trace'; // ensure stack is ignored

        TelemetryUtils.dispatchEvent('CRITICAL_FAIL', errorObj);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedArg = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(loggedArg);

        expect(parsed).toEqual({
            event: 'CRITICAL_FAIL',
            error: 'Boundary Error Message'
        });
    });

    it('handles null/undefined error gracefully without crashing', () => {
        TelemetryUtils.dispatchEvent('NULL_EVENT', null);

        const loggedArg = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(loggedArg);

        expect(parsed).toEqual({
            event: 'NULL_EVENT',
            error: null
        });
    });

    it('survives missing arguments (boundary assault)', () => {
        // Interrogate strict missing bounds
        TelemetryUtils.dispatchEvent();

        const loggedArg = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(loggedArg);

        expect(parsed).toEqual({
            event: undefined,
            error: undefined
        });
    });
});
