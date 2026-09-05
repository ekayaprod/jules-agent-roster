/**
 * @jest-environment jsdom
 */

const TerminalPolling = require('./TerminalPolling');

describe('TerminalPolling Inspector Boundary Tests', () => {
    let mockTerminal;
    let pollingInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();

        mockTerminal = {
            _pollingActive: false,
            currentRepo: 'test-repo',
            _fetchAndRenderSessions: jest.fn().mockResolvedValue(),
        };

        // Mock JulesTerminal constant
        global.JulesTerminal = {
            ACTIVE_SESSIONS_POLL_MS: 30000
        };

        pollingInstance = new TerminalPolling(mockTerminal);
    });

    afterEach(() => {
        pollingInstance.cleanup();
        jest.clearAllTimers();
        jest.useRealTimers();
        delete global.JulesTerminal;
    });

    // 🕵️ THE INTERROGATION: Explicitly asserts graceful failure on timeouts, proving the alibi breaks.
    it('gracefully handles _fetchAndRenderSessions rejection without breaking the polling loop', async () => {
        // Mock TelemetryUtils to assert the error is dispatched
        const dispatchEventMock = jest.fn();
        global.TelemetryUtils = { dispatchEvent: dispatchEventMock };

        const mockError = new Error('Connection Timeout');
        mockTerminal._fetchAndRenderSessions.mockRejectedValueOnce(mockError);

        pollingInstance._startSessionPolling('test-repo', mockTerminal);

        // Run the first poll (which handles the mocked rejection)
        await Promise.resolve(); // Wait for promise chain

        expect(dispatchEventMock).toHaveBeenCalledWith('JULES_POLLING_ERROR', mockError);
        expect(mockTerminal._fetchAndRenderSessions).toHaveBeenCalledTimes(1);

        // Ensure the polling loop was re-queued despite the error
        expect(mockTerminal.activeSessionsTimeout).toBeDefined();

        // Advance timer for the next poll
        mockTerminal._fetchAndRenderSessions.mockResolvedValueOnce(); // succeed this time
        jest.advanceTimersByTime(30000);

        await Promise.resolve(); // Wait for the second poll

        expect(mockTerminal._fetchAndRenderSessions).toHaveBeenCalledTimes(2);

        delete global.TelemetryUtils;
    });
});
