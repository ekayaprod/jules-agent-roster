const JulesTerminal = require('../JulesTerminal');

// Mocks to replace undefined DOM references in the constructor/init
global.JulesModals = class JulesModals {
    constructor() {}
    _initInteractionModal() {}
    _initPRModal() {}
};
global.TerminalPolling = class TerminalPolling {
    constructor() {}
    cleanup() {}
    _clearPollingAndCache() {}
    startTerminalPolling() {}
};
global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn(),
    getTerminalSessionHTML: jest.fn()
};
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};
global.TelemetryUtils = {
    dispatchEvent: jest.fn()
};
global.window.julesAPI = {
    getSources: jest.fn(),
    createSession: jest.fn(),
    getSessions: jest.fn().mockResolvedValue({ sessions: [] })
};

describe('JulesTerminal (INSTRUMENTER Edge Cases)', () => {
    let terminal;
    let mockApp;

    beforeEach(() => {
        mockApp = {
            toast: { show: jest.fn() },
            agentRepo: { fetchPrompt: jest.fn() }
        };
        terminal = new JulesTerminal(mockApp);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    test('loadSources should fail gracefully if julesAPI throws an unhandled edge case', async () => {
        // Arrange
        document.body.innerHTML = '<select id="julesRepoPicker"></select>';
        window.julesAPI.getSources.mockRejectedValue(new Error('Network error'));

        // Act
        await terminal.loadSources();

        // Assert
        expect(mockApp.toast.show).toHaveBeenCalledWith(
            expect.stringContaining('Network error'),
            true
        );
    });

    test('launchSession should reject gracefully and cleanup optimistic UI on API failure', async () => {
        // Arrange
        document.body.innerHTML = `
            <select id="julesRepoPicker"><option value="repo" selected>repo</option></select>
            <input id="julesTaskInput" value="task" />
            <div id="julesTerminal"></div>
        `;
        const agent = { name: 'Agent', prompt: 'Prompt' };
        window.julesAPI.createSession.mockRejectedValueOnce(new Error('API Failure'));

        const toastSpy = jest.spyOn(mockApp.toast, 'show');

        // Act
        await terminal.launchSession(agent);

        // Let the queue process
        await new Promise(resolve => setTimeout(resolve, 0));

        // Assert
        expect(toastSpy).toHaveBeenCalledWith(
            expect.stringContaining('API Failure'),
            expect.anything(),
            expect.any(Number)
        );
    });
});
