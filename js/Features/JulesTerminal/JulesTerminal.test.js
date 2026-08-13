/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const JulesTerminal = require('./JulesTerminal');
const FormatUtils = require('../../Utils/format/format-utils.js');
const { BUTTON_STATES, TOAST_TYPES } = require('../../constants/ui');

global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;
global.JulesTerminal = JulesTerminal;
global.FormatUtils = FormatUtils;
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;
global.DOMUtils = {
    getTerminalIndicatorHTML: jest.fn().mockReturnValue('<div>Ready. Awaiting execution commands...</div>'),
    getTerminalSessionHTML: jest.fn().mockReturnValue('<div></div>'),
    setButtonState: jest.fn()
};

global.TelemetryUtils = {
    dispatchEvent: jest.fn()
};

describe('JulesTerminal', () => {
    let manager;
    let mockApp;

    beforeEach(() => {
        mockApp = {
            toast: { show: jest.fn() },
            agents: [],
            customAgents: {}
        };

        document.body.innerHTML = `
            <select id="julesRepoPicker">
                <option value="">Original Text</option>
            </select>
            <div id="julesTerminal"></div>
            <input id="julesTaskInput" />
            <div id="julesRunnerPanel"></div>
        `;

        global.window.julesAPI = {
            getSources: jest.fn(),
            getSessions: jest.fn(),
            createSession: jest.fn(),
        };

        jest.clearAllMocks();

        manager = new JulesTerminal(mockApp);
    });

    it('should exist', () => {
        expect(manager).toBeDefined();
    });

    it('handles error in loadSources', async () => {
        const picker = document.getElementById("julesRepoPicker");
        const originalText = picker.options[0].textContent;
        const mockError = new Error("Test connection error");
        global.window.julesAPI.getSources.mockRejectedValueOnce(mockError);

        await manager.loadSources();

        expect(picker.innerHTML).toBe(`<option value="">${originalText}</option>`);
        expect(picker.disabled).toBe(false);
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("SOURCES_LOAD_FAILED", mockError);
        expect(mockApp.toast.show).toHaveBeenCalledWith("Unable to connect to GitHub: Test connection error", true);
    });

    describe('init', () => {
        beforeEach(() => {
            // Mock StorageUtils
            global.StorageUtils = {
                getItem: jest.fn(),
                setItem: jest.fn()
            };

            // Mock window.julesAPI
            global.window.julesAPI = {
                configure: jest.fn(),
                getSources: jest.fn().mockResolvedValue({ sources: [] })
            };

            // Set up document elements for init
            document.body.innerHTML += `
                <input id="julesActivateToggle" type="checkbox" checked />
                <div id="settingsModal"></div>
                <button id="openSettingsBtn"></button>
                <button id="closeSettingsBtn"></button>
                <button id="saveSettingsBtn"></button>
                <input id="julesApiKeyInput" />
                <span id="julesApiKeyError"></span>
                <input id="githubTokenInput" />
                <span id="githubTokenError"></span>
            `;

            manager = new JulesTerminal(mockApp);
            manager.modals = {
                _initInteractionModal: jest.fn(),
                _initPRModal: jest.fn(),
                _clearKeyError: jest.fn(),
                _showKeyError: jest.fn()
            };
            // Mock loadSources
            manager.loadSources = jest.fn().mockResolvedValue();
        });

        it('configures API and calls loadSources if valid api key exists', async () => {
            global.StorageUtils.getItem.mockImplementation((k) => {
                if (k === 'jules_api_key') return 'valid_key_123';
                if (k === 'github_api_key') return 'gh_token_123';
                return null;
            });

            await manager.init();

            expect(manager.initialized).toBe(true);
            expect(global.window.julesAPI.configure).toHaveBeenCalledWith('valid_key_123', 'gh_token_123');
            expect(manager.loadSources).toHaveBeenCalled();
            expect(manager.modals._initInteractionModal).toHaveBeenCalled();
            expect(manager.modals._initPRModal).toHaveBeenCalled();
        });

        it('shows modal if api key is missing and toggle is active', async () => {
            global.StorageUtils.getItem.mockReturnValue(null);

            await manager.init();

            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(true);
            expect(global.window.julesAPI.configure).not.toHaveBeenCalled();
            expect(manager.loadSources).not.toHaveBeenCalled();
        });
    });

    describe('dismissSession', () => {
        it('clears intervals, sets, and removes element from DOM', () => {
            const sessionId = 'test_session_1';
            manager.julesPollingIntervals = {
                [sessionId]: setInterval(() => {}, 10000)
            };
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

            manager.renderedSessionIds.add(sessionId);

            const sessionEl = document.createElement('div');
            sessionEl.id = `session-${sessionId}`;
            document.getElementById('julesTerminal').appendChild(sessionEl);

            manager.dismissSession(sessionId);

            expect(manager.dismissedSessionIds.has(sessionId)).toBe(true);
            expect(manager.renderedSessionIds.has(sessionId)).toBe(false);
            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(manager.julesPollingIntervals[sessionId]).toBeUndefined();
            expect(document.getElementById(`session-${sessionId}`)).toBeNull();

            clearIntervalSpy.mockRestore();
        });
    });

    describe('loadPullRequestsForRepo', () => {
        beforeEach(() => {
            global.window.githubAPI = {
                getPullRequests: jest.fn()
            };
        });

        it('fetches and renders pull requests', async () => {
            const mockPRs = [{ number: 1, title: 'Fix bug' }];
            global.window.githubAPI.getPullRequests.mockResolvedValue(mockPRs);

            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '<div id="fetchingIndicator"></div>';

            manager.modals = {
                _showPRModal: jest.fn()
            };

            await manager.loadPullRequestsForRepo('owner/repo');

            expect(global.window.githubAPI.getPullRequests).toHaveBeenCalledWith('owner/repo');
            expect(document.getElementById('fetchingIndicator')).toBeNull();
            expect(terminal.querySelectorAll('.term-pr-item').length).toBe(1);
            expect(terminal.innerHTML).toContain('#1 Fix bug');

            const prLink = terminal.querySelector('.pr-modal-trigger');
            prLink.click();
            expect(manager.modals._showPRModal).toHaveBeenCalledWith(mockPRs[0]);
        });

        it('clears existing PRs before rendering new ones', async () => {
            global.window.githubAPI.getPullRequests.mockResolvedValue([]);
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '<div class="term-pr-item">Old PR</div>';

            await manager.loadPullRequestsForRepo('owner/repo');

            expect(terminal.querySelectorAll('.term-pr-item').length).toBe(0);
        });
    });

    describe('launchSession', () => {
        beforeEach(() => {
            global.AgentUtils = {
                getPromptUrl: jest.fn().mockReturnValue('prompt_url')
            };

            mockApp.agentRepo = {
                fetchPrompt: jest.fn().mockResolvedValue('fetched prompt')
            };

            global.window.julesAPI.createSession = jest.fn().mockResolvedValue({});

            document.getElementById('julesRepoPicker').innerHTML = '<option value="owner/repo">owner/repo</option>';
            document.getElementById('julesRepoPicker').value = 'owner/repo';
            document.getElementById('julesTaskInput').value = 'task description';

            manager._fetchAndRenderSessions = jest.fn().mockResolvedValue();

            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('shows error toast if no repo is selected', async () => {
            document.getElementById('julesRepoPicker').value = '';

            await manager.launchSession({});

            expect(mockApp.toast.show).toHaveBeenCalledWith("Select a target repository first.", TOAST_TYPES.ERROR);
            expect(global.window.julesAPI.createSession).not.toHaveBeenCalled();
        });

        it('launches session successfully and processes queue', async () => {
            const agent = { name: 'TestAgent', prompt: 'test prompt' };
            const btn = document.createElement('button');

            await manager.launchSession(agent, btn);

            // Wait for queue processing promises to resolve
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            expect(global.window.julesAPI.createSession).toHaveBeenCalledWith('test prompt', 'task description', 'owner/repo', 'TestAgent');
            expect(mockApp.toast.show).toHaveBeenCalledWith("Session launched successfully.", TOAST_TYPES.SUCCESS);
            expect(manager._fetchAndRenderSessions).toHaveBeenCalledWith('owner/repo', document.getElementById('julesTerminal'));
        });

        it('fetches prompt if not provided', async () => {
            const agent = { name: 'TestAgent' };
            const btn = document.createElement('button');

            await manager.launchSession(agent, btn);

            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            expect(mockApp.agentRepo.fetchPrompt).toHaveBeenCalled();
            expect(agent.prompt).toBe('fetched prompt');
            expect(global.window.julesAPI.createSession).toHaveBeenCalledWith('fetched prompt', 'task description', 'owner/repo', 'TestAgent');
        });

        it('handles launch failure gracefully', async () => {
            const agent = { name: 'TestAgent', prompt: 'test' };
            const mockError = new Error('API Error');
            global.window.julesAPI.createSession.mockRejectedValue(mockError);

            await manager.launchSession(agent);

            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            expect(mockApp.toast.show).toHaveBeenCalledWith(expect.stringContaining('Could not launch the session: API Error'), TOAST_TYPES.ERROR, 20000);
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_LAUNCH_SESSION_FAILED', expect.any(Error), { sourceName: 'owner/repo' });
            expect(manager._fetchAndRenderSessions).not.toHaveBeenCalled();
        });
    });
});
