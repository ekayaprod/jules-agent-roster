/**
 * @jest-environment jsdom
 */

const { BUTTON_STATES, TOAST_TYPES } = require('../../constants/ui');
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const JulesTerminal = require('./JulesTerminal');
global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;

global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse term-muted-text">[SYS] ${msg}</div>`),
    getTerminalSessionHTML: jest.fn().mockImplementation((emoji, name, status, id) => `
            <span class="term-agent-name">${emoji} ${name}</span>
            <span class="term-separator">—</span>
            <span class="term-status"${id ? ` id="${id}"` : ''}>${status}</span>
        `),
    createMarkdownPreBlock: jest.fn().mockImplementation((text) => {
        const pre = document.createElement('pre');
        pre.textContent = text;
        return pre;
    })
};

global.FormatUtils = {
    escapeRegex: jest.fn().mockImplementation((str) => str),
    escapeHTML: jest.fn().mockImplementation((str) => str),
    extractRepoPath: jest.fn().mockImplementation((sourceName) => sourceName ? sourceName.replace('sources/github/', '') : '')
};

global.TelemetryUtils = {
    dispatchEvent: jest.fn()
};

describe('JulesTerminal', () => {
    let julesTerminal;
    let mockApp;
    let mockToast;

    beforeEach(() => {
        jest.useFakeTimers();

        mockToast = {
            show: jest.fn()
        };

        mockApp = {
            toast: mockToast,
            agents: [{ name: 'TestAgent', emoji: '🤖' }],
            customAgents: { 'custom': { name: 'CustomAgent', emoji: '🔥' } },
            agentRepo: {
                fetchPrompt: jest.fn().mockResolvedValue("Fetched Prompt")
            }
        };

        document.body.innerHTML = `
            <div id="settingsModal"></div>
            <button id="openSettingsBtn"></button>
            <button id="closeSettingsBtn"></button>
            <button id="saveSettingsBtn"></button>
            <input id="julesApiKeyInput" />
            <span id="julesApiKeyError"></span>
            <input id="githubTokenInput" />
            <span id="githubTokenError"></span>
            <select id="julesRepoPicker"></select>
            <div id="julesTerminal"></div>
            <div id="julesRunnerPanel"></div>
            <input id="julesTaskInput" />
            <input type="checkbox" id="julesActivateToggle" />
        `;

        global.window.githubAPI = {
            getPullRequests: jest.fn().mockResolvedValue([]),
            getPullRequest: jest.fn(),
            mergePullRequest: jest.fn(),
            closePullRequest: jest.fn()
        };
        global.window.julesAPI = {
            configure: jest.fn(),
            getSources: jest.fn(),
            getSessions: jest.fn().mockResolvedValue({ sessions: [] }),
            createSession: jest.fn().mockResolvedValue({ id: 'new-session' }),
            getActivities: jest.fn(),
            apiKey: 'test-key'
        };

        julesTerminal = new JulesTerminal(mockApp);
    });

    afterEach(() => {
        julesTerminal.cleanup();
        jest.clearAllTimers();
        jest.restoreAllMocks();
        jest.clearAllMocks();
        document.body.innerHTML = '';
        delete global.window.julesAPI;
        delete global.window.githubAPI;
    });

    describe('Constructor & Basic Initialization', () => {
        it('initializes with expected defaults', () => {
            expect(julesTerminal.app).toBe(mockApp);
            expect(julesTerminal.currentRepo).toBeNull();
            expect(julesTerminal.julesPollingIntervals).toEqual({});
            expect(julesTerminal.modals).toBeInstanceOf(JulesModals);
            expect(julesTerminal.polling).toBeInstanceOf(TerminalPolling);
        });

        it('getEl returns cached elements', () => {
            const el1 = julesTerminal.getEl('settingsModal');
            const el2 = julesTerminal.getEl('settingsModal');
            expect(el1).not.toBeNull();
            expect(el1).toBe(el2);
        });

        it('cleanup calls polling cleanup', () => {
            const cleanupSpy = jest.spyOn(julesTerminal.polling, 'cleanup');
            julesTerminal.cleanup();
            expect(cleanupSpy).toHaveBeenCalled();
        });
    });

    describe('init() and Modal Logic', () => {
        it('sets initialized to true', async () => {
            await julesTerminal.init();
            expect(julesTerminal.initialized).toBe(true);
        });

        it('opens modal and focuses input on openBtn click', async () => {
            global.StorageUtils.getItem.mockReturnValue('valid_key_123');
            await julesTerminal.init();
            const openBtn = document.getElementById('openSettingsBtn');
            const modal = document.getElementById('settingsModal');
            const input = document.getElementById('julesApiKeyInput');

            const focusSpy = jest.spyOn(input, 'focus');

            openBtn.click();
            expect(modal.classList.contains('visible')).toBe(true);
            expect(input.value).toBe('valid_key_123');

            jest.advanceTimersByTime(JulesTerminal.MODAL_FOCUS_QUICK_DELAY_MS);
            expect(focusSpy).toHaveBeenCalled();
        });

        it('closes modal on closeBtn click', async () => {
            await julesTerminal.init();
            const closeBtn = document.getElementById('closeSettingsBtn');
            const modal = document.getElementById('settingsModal');

            modal.classList.add('visible');
            closeBtn.click();
            expect(modal.classList.contains('visible')).toBe(false);
        });

        it('validates API key and saves successfully', async () => {
            await julesTerminal.init();
            const saveBtn = document.getElementById('saveSettingsBtn');
            const input = document.getElementById('julesApiKeyInput');
            const githubInput = document.getElementById('githubTokenInput');

            input.value = 'new_valid_key_123';
            githubInput.value = 'github_key_123';

            await saveBtn.click();

            // Advance timers for setTimeout inside toast or modal delays if any
            await jest.advanceTimersByTimeAsync(100);
            await Promise.resolve(); // Allow internal promises inside the click listener to complete

            expect(global.StorageUtils.setItem).toHaveBeenCalledWith('jules_api_key', 'new_valid_key_123');
            expect(global.StorageUtils.setItem).toHaveBeenCalledWith('github_api_key', 'github_key_123');
            expect(mockToast.show).toHaveBeenCalledWith('Connecting to APIs...');
        });

        it('shows error if API key is missing on save', async () => {
            await julesTerminal.init();
            const saveBtn = document.getElementById('saveSettingsBtn');
            const input = document.getElementById('julesApiKeyInput');

            input.value = '';

            await saveBtn.click();

            expect(global.StorageUtils.setItem).not.toHaveBeenCalled();
        });
    });

    describe('Repo Data Loading Methods', () => {
        it('loadSources populates dropdown with repos', async () => {
            global.window.julesAPI.getSources.mockResolvedValue({
                sources: [
                    { name: 'sources/github/owner/repo1' },
                    { name: 'sources/github/owner/repo2', githubRepo: { owner: 'owner', repo: 'repo2' } }
                ]
            });
            const picker = document.getElementById('julesRepoPicker');

            await julesTerminal.loadSources();

            expect(picker.options.length).toBe(3); // 1 placeholder + 2 repos
            expect(picker.options[0].value).toBe('');
            expect(picker.options[1].value).toBe('sources/github/owner/repo1');
            expect(picker.options[1].textContent).toBe('owner/repo1');
            expect(picker.options[2].value).toBe('sources/github/owner/repo2');
            expect(picker.options[2].textContent).toBe('owner/repo2');

            // Trigger change listener logic
            julesTerminal.loadPullRequestsForRepo = jest.fn();
            julesTerminal.loadActiveSessionsForRepo = jest.fn();

            picker.value = 'sources/github/owner/repo1';
            picker.dispatchEvent(new Event('change'));

            // Need a microtask wait to see async listener promises
            await Promise.resolve();
            expect(julesTerminal.loadPullRequestsForRepo).toHaveBeenCalledWith('sources/github/owner/repo1');
            expect(julesTerminal.loadActiveSessionsForRepo).toHaveBeenCalledWith('sources/github/owner/repo1');
        });

        it('loadSources handles API errors and reverts to default', async () => {
            const picker = document.getElementById('julesRepoPicker');
            picker.innerHTML = '<option value="">Original Default</option>';
            global.window.julesAPI.getSources.mockRejectedValue(new Error('API Down'));

            await julesTerminal.loadSources();

            expect(picker.innerHTML).toContain('Original Default');
            expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('Unable to connect to GitHub: API Down'), true);
        });

        it('loadActiveSessionsForRepo starts polling and updates UI', async () => {
            const terminal = document.getElementById('julesTerminal');
            // Mock _startSessionPolling to prevent background polling loops during test
            const startSpy = jest.spyOn(julesTerminal.polling, '_startSessionPolling').mockImplementation(() => {});
            const clearSpy = jest.spyOn(julesTerminal.polling, '_clearPollingAndCache');

            await julesTerminal.loadActiveSessionsForRepo('sources/github/owner/repo1');

            expect(clearSpy).toHaveBeenCalled();
            expect(terminal.innerHTML).toContain('Checking active Jules routines...');
            expect(julesTerminal.currentRepo).toBe('sources/github/owner/repo1');
            expect(startSpy).toHaveBeenCalledWith('sources/github/owner/repo1', terminal);
        });

        it('loadPullRequestsForRepo fetches and renders PRs', async () => {
            global.window.githubAPI.getPullRequests.mockResolvedValue([
                { number: 1, title: 'Fix bug' },
                { number: 2, title: 'Add feature' }
            ]);

            const renderSpy = jest.spyOn(julesTerminal, '_renderPullRequests');

            await julesTerminal.loadPullRequestsForRepo('sources/github/owner/repo1');

            expect(global.window.githubAPI.getPullRequests).toHaveBeenCalledWith('sources/github/owner/repo1');
            expect(renderSpy).toHaveBeenCalledWith(
                [{ number: 1, title: 'Fix bug' }, { number: 2, title: 'Add feature' }],
                document.getElementById('julesTerminal')
            );
        });

        it('_renderPullRequests adds PR items to terminal', () => {
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '<div id="fetchingIndicator">Loading...</div>';

            julesTerminal._renderPullRequests([{ number: 123, title: 'My PR' }], terminal);

            const prItems = terminal.querySelectorAll('.term-pr-item');
            expect(prItems.length).toBe(1);
            expect(prItems[0].innerHTML).toContain('#123');
            expect(prItems[0].innerHTML).toContain('My PR');

            // Check fetching indicator was removed
            expect(terminal.querySelector('#fetchingIndicator')).toBeNull();
        });
    });

    describe('Session Processing Methods', () => {
        it('_fetchAndRenderSessions handles missing API key', async () => {
            global.window.julesAPI.apiKey = null;
            await julesTerminal._fetchAndRenderSessions('sources/github/owner/repo', document.getElementById('julesTerminal'));
            expect(global.window.julesAPI.getSessions).not.toHaveBeenCalled();
        });

        it('_fetchAndRenderSessions skips ended and dismissed sessions', async () => {
            const terminal = document.getElementById('julesTerminal');
            global.window.julesAPI.getSessions.mockResolvedValue({
                sessions: [
                    { id: 's1', sourceContext: { source: 'other-repo' } },
                    { id: 's2', sourceContext: { source: 'sources/github/owner/repo' }, state: 'COMPLETED' },
                    { id: 's3', sourceContext: { source: 'sources/github/owner/repo' }, state: 'RUNNING', createTime: new Date().toISOString() },
                    { id: 's4', sourceContext: { source: 'sources/github/owner/repo' }, state: 'RUNNING' }
                ]
            });
            julesTerminal.dismissedSessionIds.add('s4');
            const processSpy = jest.spyOn(julesTerminal, '_processSession');

            await julesTerminal._fetchAndRenderSessions('sources/github/owner/repo', terminal);

            // s1 is wrong repo, s2 is COMPLETED, s4 is dismissed. Only s3 should process.
            expect(processSpy).toHaveBeenCalledTimes(1);
            expect(processSpy.mock.calls[0][0].id).toBe('s3');
        });

        it('_processSession creates block and starts polling', () => {
            const terminal = document.getElementById('julesTerminal');
            const session = { id: 's1', title: 'TestAgent' };

            const startPollingSpy = jest.spyOn(julesTerminal.polling, 'startTerminalPolling').mockImplementation(() => {});

            julesTerminal._processSession(session, terminal);

            expect(julesTerminal.renderedSessionIds.has('s1')).toBe(true);
            const block = terminal.querySelector('#session-s1');
            expect(block).not.toBeNull();
            expect(startPollingSpy).toHaveBeenCalledWith('s1', block, 'TestAgent', '🤖');
        });

        it('dismissSession removes element and clears interval', () => {
            const terminal = document.getElementById('julesTerminal');
            const item = document.createElement('div');
            item.id = 'session-s1';
            terminal.appendChild(item);

            julesTerminal.julesPollingIntervals['s1'] = setInterval(() => {}, 1000);
            julesTerminal.renderedSessionIds.add('s1');

            const clearSpy = jest.spyOn(global, 'clearInterval');

            julesTerminal.dismissSession('s1');

            expect(julesTerminal.dismissedSessionIds.has('s1')).toBe(true);
            expect(julesTerminal.renderedSessionIds.has('s1')).toBe(false);
            expect(clearSpy).toHaveBeenCalled();
            expect(terminal.querySelector('#session-s1')).toBeNull();
        });

        it('_checkEmptyTerminal sets waiting message when empty', () => {
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '';

            julesTerminal._checkEmptyTerminal();

            expect(terminal.innerHTML).toContain('Ready. Awaiting execution commands...');
        });
    });

    describe('Session Launch & Queueing', () => {
        it('launchSession fails if no repo selected', async () => {
            document.getElementById('julesRepoPicker').value = '';
            await julesTerminal.launchSession({ name: 'Agent', prompt: 'Do it' });
            expect(mockToast.show).toHaveBeenCalledWith('Select a target repository first.', TOAST_TYPES.ERROR);
        });

        it('launchSession adds to queue and executes successfully', async () => {
            const picker = document.getElementById('julesRepoPicker');
            picker.innerHTML = '<option value="sources/github/owner/repo">owner/repo</option>';
            picker.value = 'sources/github/owner/repo';

            document.getElementById('julesTaskInput').value = 'Test task';

            const btn = document.createElement('button');
            const agent = { name: 'TestAgent', prompt: 'My Prompt', emoji: '🤖' };

            julesTerminal._fetchAndRenderSessions = jest.fn();
            const queueSpy = jest.spyOn(julesTerminal, '_processSessionQueue');

            await julesTerminal.launchSession(agent, btn);
            await new Promise(process.nextTick);

            expect(queueSpy).toHaveBeenCalled();
            expect(julesTerminal.sessionQueue.length).toBe(0);
            await new Promise(process.nextTick);

            expect(global.window.julesAPI.createSession).toHaveBeenCalledWith('My Prompt', 'Test task', 'sources/github/owner/repo', 'TestAgent');
            expect(mockToast.show).toHaveBeenCalledWith('Session launched successfully.', TOAST_TYPES.SUCCESS);
            expect(julesTerminal._fetchAndRenderSessions).toHaveBeenCalledWith('sources/github/owner/repo', document.getElementById('julesTerminal'));
        });

        it('launchSession fetches prompt if undefined', async () => {
            const picker = document.getElementById('julesRepoPicker');
            picker.innerHTML = '<option value="sources/github/owner/repo">owner/repo</option>';
            picker.value = 'sources/github/owner/repo';

            const btn = document.createElement('button');
            const agent = { name: 'TestAgent' }; // No prompt

            await julesTerminal.launchSession(agent, btn);
            await new Promise(process.nextTick);

            expect(mockApp.agentRepo.fetchPrompt).toHaveBeenCalled();
            expect(agent.prompt).toBe('Fetched Prompt');
            expect(global.window.julesAPI.createSession).toHaveBeenCalledWith('Fetched Prompt', expect.any(String), 'sources/github/owner/repo', 'TestAgent');
        });

        it('launchSession handles API creation failure', async () => {
            const picker = document.getElementById('julesRepoPicker');
            picker.innerHTML = '<option value="sources/github/owner/repo">owner/repo</option>';
            picker.value = 'sources/github/owner/repo';

            global.window.julesAPI.createSession.mockRejectedValue(new Error('Creation Failed'));

            const agent = { name: 'TestAgent', prompt: 'My Prompt' };
            await julesTerminal.launchSession(agent);
            await new Promise(process.nextTick);

            expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('Could not launch the session: Creation Failed'), TOAST_TYPES.ERROR, 20000);
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_LAUNCH_SESSION_FAILED', expect.any(Error), expect.any(Object));
        });

        it('_processSessionQueue processes tasks and prevents overlap', async () => {
            let task1Executed = false;
            let task2Executed = false;

            julesTerminal.sessionQueue.push(async () => { task1Executed = true; });
            julesTerminal.sessionQueue.push(async () => { task2Executed = true; });

            const promise = julesTerminal._processSessionQueue();
            expect(julesTerminal.isProcessingQueue).toBe(true);

            // Advance first delay
            await jest.advanceTimersByTimeAsync(1000);

            // Advance second delay
            await jest.advanceTimersByTimeAsync(1000);

            await promise;

            expect(task1Executed).toBe(true);
            expect(task2Executed).toBe(true);
            expect(julesTerminal.isProcessingQueue).toBe(false);
        });
    });

});
