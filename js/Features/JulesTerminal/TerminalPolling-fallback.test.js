const TerminalPolling = require('./TerminalPolling');

describe('TerminalPolling (Fallback Boundary)', () => {
    let mockTerminal;

    beforeAll(() => {
        global.JulesTerminal = { ACTIVE_SESSIONS_POLL_MS: 5000 };
    });

    afterAll(() => {
        delete global.JulesTerminal;
    });
    let pollingInstance;
    let originalGetTelemetryUtils;
    let mockTu;

    beforeEach(() => {
        mockTerminal = {
            _pollingActive: true,
            currentRepo: 'test-repo',
            _fetchAndRenderSessions: jest.fn()
        };

        pollingInstance = new TerminalPolling(mockTerminal);

        mockTu = {
            dispatchEvent: jest.fn()
        };

        originalGetTelemetryUtils = TerminalPolling.getTelemetryUtils;
        TerminalPolling.getTelemetryUtils = jest.fn(() => mockTu);
    });

    afterEach(() => {
        pollingInstance.cleanup();
        TerminalPolling.getTelemetryUtils = originalGetTelemetryUtils;
        jest.clearAllMocks();
    });

    it('dispatches JULES_POLLING_ERROR to telemetry when synchronous error occurs in background polling (Line 41)', () => {
        const syncError = new Error('Synchronous Polling Error');

        // Mock _fetchAndRenderSessions to throw synchronously
        mockTerminal._fetchAndRenderSessions.mockImplementation(() => {
            throw syncError;
        });

        // Trigger the poll loop synchronously to hit the catch block at line 37
        pollingInstance._startSessionPolling('test-repo', mockTerminal);

        // Verify the fallback error logic on line 41 was hit
        expect(TerminalPolling.getTelemetryUtils).toHaveBeenCalled();
        expect(mockTu.dispatchEvent).toHaveBeenCalledWith("JULES_POLLING_ERROR", syncError);
    });
});
