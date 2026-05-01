global.JulesModals = class JulesModals {
    _showPRModal() {}
    _showHistoryModal() {}
};
global.TerminalPolling = class TerminalPolling {
    startPolling() {}
    stopPolling() {}
    startTerminalPolling() {}
};
global.DOMUtils = {
    getTerminalSessionHTML: jest.fn().mockReturnValue('<div>Mock HTML</div>'),
    getTerminalIndicatorHTML: jest.fn(),
    setButtonState: jest.fn()
};
global.FormatUtils = {
    escapeHTML: jest.fn(str => str),
    escapeRegex: jest.fn(str => str)
};
global.AgentUtils = {
    getPromptUrl: jest.fn().mockReturnValue('mock-url')
};
global.CORE_EMOJIS_REGEX = /(?:)/;
global.CORE_EMOJIS_MAP = new Map();

const JulesManager = require('../JulesManager.js');

describe('JulesManager - Missing Coverage (Lines 275, 322-323, 441, 464, 491, 569)', () => {
    let app, api, julesTerminal, julesManager;

    beforeEach(() => {
        app = {
            agentRepo: {
                agents: new Map(),
                fetchPrompt: jest.fn().mockResolvedValue('mock prompt content')
            },
            julesAPI: {
                listSessions: jest.fn(),
                createSession: jest.fn()
            },
            julesTerminal: {
                getTerminalElement: jest.fn()
            },
            toast: {
                show: jest.fn()
            }
        };
        api = app.julesAPI;
        julesTerminal = app.julesTerminal;

        julesManager = new JulesManager(app, api, julesTerminal);

        julesManager.getEl = jest.fn((id) => {
             if (id === 'julesRepoPicker') return { value: 'test/repo' };
             if (id === 'julesTaskInput') return { value: 'Test task' };
             if (id === 'julesTerminal') {
                 const div = document.createElement('div');
                 div.id = 'julesTerminal';
                 return div;
             }
             return null;
        });

        if (typeof global.window === 'undefined') {
            global.window = {};
        }
        global.window.julesService = {
            createSession: jest.fn().mockResolvedValue({ id: 123 }),
            apiKey: "mock-key"
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle PR link click correctly (lines 322-323)', () => {
        const terminal = document.createElement('div');
        julesManager.modals = { _showPRModal: jest.fn() };

        const pr = { number: 1, title: 'Test PR' };
        julesManager.currentRepo = 'test/repo';

        julesManager._renderPullRequests([pr], terminal);

        const renderedLink = terminal.querySelector('.pr-modal-trigger');
        const event = new MouseEvent('click');
        event.preventDefault = jest.fn();

        renderedLink.onclick(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(julesManager.modals._showPRModal).toHaveBeenCalledWith(pr, 'test/repo');
    });

    it('should correctly fall back to regex cache match for _agentMapCache (line 441)', () => {
         julesManager._agentMapCache = new Map();
         julesManager._agentMapCache.set('Inspector', { name: 'Inspector', emoji: '🕵️' });
         julesManager._agentRegexCache = new RegExp('(Inspector)');

         const session = { id: 1, title: 'Inspector-test' };
         const terminal = document.createElement('div');

         julesManager._processSession(session, terminal);

         expect(terminal.children.length).toBe(1);
    });

    it('should insert block into terminal fallback path (line 491)', () => {
        const terminal = document.createElement('div');

        const existingSession = document.createElement('div');
        existingSession.className = 'term-session-line';
        terminal.appendChild(existingSession);

        julesManager._createAndInsertSessionBlock(terminal, 'className', 'id', '🕵️', 'Inspector', 'status', 'statusId', null);

        expect(terminal.children.length).toBe(2);
        expect(terminal.firstChild.className).toBe('className');
        expect(terminal.lastChild).toBe(existingSession);
    });

    it('should catch error in _fetchAndRenderSessions (line 569)', async () => {
        const agent = { name: 'Inspector', prompt: 'prompt data' };

        julesManager._fetchAndRenderSessions = jest.fn().mockRejectedValue(new Error('Sync error'));
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const launchPromise = julesManager.launchSession(agent, null);

        await Promise.resolve();
        await launchPromise; await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

        expect(consoleWarnSpy).toHaveBeenCalledWith("Session launched successfully, but immediate terminal synchronization timed out:", expect.any(Error));
    });

    it('should handle history modal link click (line 464)', () => {
        const terminal = document.createElement('div');
        julesManager.modals = { _showHistoryModal: jest.fn() };

        const session = { id: 1, title: 'Inspector' };

        julesManager._agentMapCache = new Map();
        julesManager._agentMapCache.set('Inspector', { name: 'Inspector', emoji: '🕵️' });

        julesManager._processSession(session, terminal);

        const block = terminal.firstChild;
        const event = new MouseEvent('click');
        block.onclick(event);

        expect(julesManager.modals._showHistoryModal).toHaveBeenCalledWith(1, "🕵️", "Inspector");
    });

    it('should handle agent.prompt undefined fetching and button disabled (lines 542-545)', async () => {
        const agent = { name: 'Inspector' };
        const btn = document.createElement('button');

        julesManager._fetchAndRenderSessions = jest.fn().mockResolvedValue();

        const launchPromise = julesManager.launchSession(agent, btn);

        await launchPromise; await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

        expect(app.agentRepo.fetchPrompt).toHaveBeenCalled();
        expect(agent.prompt).toBe('mock prompt content');
        expect(btn.disabled).toBe(false);
    });
});

describe('JulesManager - startPolling coverage (line 275)', () => {
    let app, api, julesTerminal, julesManager;

    beforeEach(() => {
        app = {};
        api = {};
        julesTerminal = { getTerminalElement: jest.fn() };
        julesManager = new JulesManager(app, api, julesTerminal);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('should catch error on _fetchAndRenderSessions (line 275)', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        julesManager._fetchAndRenderSessions = jest.fn().mockRejectedValue(new Error('Polling error'));

        julesManager.currentRepo = 'test/repo';
        julesManager._startSessionPolling('test/repo', document.createElement('div'));

        await Promise.resolve();

        expect(consoleWarnSpy).toHaveBeenCalledWith("Session polling cycle encountered an error:", expect.any(Error));
    });
});