/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const JulesTerminal = require('./JulesTerminal');

global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;
global.JulesTerminal = JulesTerminal;
global.DOMUtils = {
    getTerminalIndicatorHTML: jest.fn().mockReturnValue('<div>Indicator</div>'),
    getTerminalSessionHTML: jest.fn().mockReturnValue('<div></div>'),
    setButtonState: jest.fn()
};
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};
global.TelemetryUtils = {
    dispatchEvent: jest.fn()
};
global.NetworkUtils = {
    isOnline: jest.fn().mockReturnValue(true),
    addOfflineListener: jest.fn()
};
global.FormatUtils = {
    escapeHTML: jest.fn(str => str),
    escapeRegex: jest.fn(str => str)
};

describe('JulesTerminal - Additional Coverage', () => {
    let terminalInstance;
    let mockApp;

    beforeEach(() => {
        jest.clearAllMocks();

        document.body.innerHTML = `
            <div id="julesTerminal"></div>
            <div id="sourcesDropdown"></div>
            <div id="saveSettingsBtn"></div>
            <div id="closeSettingsBtn"></div>
            <div id="julesApiKeyInput"></div>
            <input id="githubTokenInput"></input>
            <div id="settingsModal"></div>
            <div id="julesApiKeyError"></div>
            <div id="githubTokenError"></div>
            <input type="checkbox" id="julesActivateToggle" />
        `;

        mockApp = {
            onSourcesLoaded: jest.fn(),
            agents: [{ name: 'Agent1', emoji: '🤖' }],
            customAgents: {}
        };

        window.julesAPI = {
            apiKey: 'test-api-key',
            getSessions: jest.fn()
        };

        terminalInstance = new JulesTerminal(mockApp);
        // Mock to prevent actually initializing interaction loops
        jest.spyOn(terminalInstance, 'init').mockImplementation(() => {});
        jest.spyOn(terminalInstance, 'loadSources').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete window.julesAPI;
    });

    // Tests will go here
    it('should call cleanup on polling instance', () => {
        const cleanupSpy = jest.spyOn(terminalInstance.polling, 'cleanup');
        terminalInstance.cleanup();
        expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should show error when saveBtn clicked and key is empty', () => {
        terminalInstance.init.mockRestore(); // restore for this test
        const saveBtn = document.getElementById('saveSettingsBtn');
        const keyInput = document.getElementById('julesApiKeyInput');
        const errorSpan = document.getElementById('julesApiKeyError');

        terminalInstance.modals = {
            _showKeyError: jest.fn(),
            _clearKeyError: jest.fn(),
            _initInteractionModal: jest.fn(),
            _initPRModal: jest.fn()
        };

        terminalInstance.init();

        keyInput.value = '   ';
        saveBtn.dispatchEvent(new Event('click'));
        expect(terminalInstance.modals._showKeyError).toHaveBeenCalledWith(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
    });

    it('should load active sessions for repo and insert indicator if absent', () => {
        const terminal = document.getElementById('julesTerminal');
        const sourceName = 'test-repo';

        terminalInstance.polling = {
            _clearPollingAndCache: jest.fn(),
            _startSessionPolling: jest.fn()
        };

        terminalInstance.loadActiveSessionsForRepo(sourceName);

        expect(terminalInstance.polling._clearPollingAndCache).toHaveBeenCalled();
        expect(terminalInstance.currentRepo).toBe(sourceName);
        expect(terminalInstance.polling._startSessionPolling).toHaveBeenCalledWith(sourceName, terminal);
        expect(DOMUtils.getTerminalIndicatorHTML).toHaveBeenCalledWith("Checking active Jules routines...");

        // Ensure indicator is appended
        expect(terminal.innerHTML).toContain('<div>Indicator</div>');

        // Call again with the same repo, it should not insert a new indicator
        DOMUtils.getTerminalIndicatorHTML.mockClear();
        terminalInstance.polling._clearPollingAndCache.mockClear();

        terminalInstance.loadActiveSessionsForRepo(sourceName);
        expect(terminalInstance.polling._clearPollingAndCache).not.toHaveBeenCalled();
        expect(DOMUtils.getTerminalIndicatorHTML).not.toHaveBeenCalled();
        expect(terminalInstance.polling._startSessionPolling).toHaveBeenCalledWith(sourceName, terminal);
    });

    it('should fetch and render sessions successfully', async () => {
        const terminal = document.getElementById('julesTerminal');
        const sourceName = 'test-repo';

        terminalInstance._checkEmptyTerminal = jest.fn();
        terminalInstance.dismissSession = jest.fn();
        terminalInstance._processSession = jest.fn();

        window.julesAPI.getSessions.mockResolvedValue({
            sessions: [
                {
                    id: 'session-1',
                    sourceContext: { source: sourceName },
                    state: 'ACTIVE',
                    createTime: new Date().toISOString() // recent
                },
                {
                    id: 'session-2',
                    sourceContext: { source: sourceName },
                    state: 'COMPLETED', // should be ignored
                    createTime: new Date().toISOString()
                },
                {
                    id: 'session-3',
                    sourceContext: { source: 'other-repo' }, // should be ignored
                    state: 'ACTIVE',
                    createTime: new Date().toISOString()
                }
            ]
        });

        terminalInstance.renderedSessionIds = new Set(['old-session']);

        await terminalInstance._fetchAndRenderSessions(sourceName, terminal);

        expect(window.julesAPI.getSessions).toHaveBeenCalledWith(JulesTerminal.PAGE_SIZE);
        expect(terminalInstance.dismissSession).toHaveBeenCalledWith('old-session');
        expect(terminalInstance._processSession).toHaveBeenCalledTimes(1);
        expect(terminalInstance._processSession).toHaveBeenCalledWith(expect.objectContaining({ id: 'session-1' }), terminal);
        expect(terminalInstance._checkEmptyTerminal).toHaveBeenCalled();
    });

    it('should process a session and create block', () => {
        const terminal = document.getElementById('julesTerminal');
        const session = {
            id: 'session-123',
            title: 'Agent1'
        };

        terminalInstance.renderedSessionIds = new Set();
        terminalInstance.modals = {
            _showHistoryModal: jest.fn()
        };
        terminalInstance.polling = {
            startTerminalPolling: jest.fn()
        };
        terminalInstance._createAndInsertSessionBlock = jest.fn().mockReturnValue(document.createElement('div'));

        terminalInstance._processSession(session, terminal);

        expect(terminalInstance.renderedSessionIds.has('session-123')).toBe(true);
        expect(terminalInstance._createAndInsertSessionBlock).toHaveBeenCalledWith(
            terminal,
            expect.any(String),
            'session-session-123',
            '🤖',
            'Agent1',
            'Initializing...',
            'status-session-123',
            expect.any(Function)
        );
        expect(terminalInstance.polling.startTerminalPolling).toHaveBeenCalledWith('session-123', expect.any(Object), 'Agent1', '🤖');

        // Ensure that calling it again with the same id returns early
        terminalInstance._createAndInsertSessionBlock.mockClear();
        terminalInstance._processSession(session, terminal);
        expect(terminalInstance._createAndInsertSessionBlock).not.toHaveBeenCalled();
    });

    it('should handle blur on keyInput correctly', () => {
        terminalInstance.init.mockRestore(); // restore for this test
        const keyInput = document.getElementById('julesApiKeyInput');
        const errorSpan = document.getElementById('julesApiKeyError');

        terminalInstance.modals = {
            _showKeyError: jest.fn(),
            _clearKeyError: jest.fn(),
            _initInteractionModal: jest.fn(),
            _initPRModal: jest.fn()
        };
        terminalInstance.polling = {
            _initActiveSessionPolling: jest.fn()
        };

        terminalInstance.init();

        // Test empty value
        keyInput.value = '   ';
        keyInput.dispatchEvent(new Event('blur'));
        expect(terminalInstance.modals._showKeyError).toHaveBeenCalledWith(keyInput, errorSpan, "Please enter your Jules API Key to connect.");

        // Test non-empty value
        terminalInstance.modals._showKeyError.mockClear();
        keyInput.value = 'valid-key';
        keyInput.dispatchEvent(new Event('blur'));
        expect(terminalInstance.modals._clearKeyError).toHaveBeenCalledWith(keyInput, errorSpan);
    });

});
