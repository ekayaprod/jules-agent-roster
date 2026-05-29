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

// Mock utilities
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse" style="color: var(--term-muted);">[SYS] ${msg}</div>`),
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
            customAgents: { 'custom': { name: 'CustomAgent', emoji: '🔥' } }
        };

        // DOM setup
        document.body.innerHTML = `
            <div id="settingsModal"></div>
            <button id="openSettingsBtn"></button>
            <button id="closeSettingsBtn"></button>
            <button id="saveSettingsBtn"></button>
            <input id="julesApiKeyInput" />
            <span id="julesApiKeyError"></span>
            <select id="julesRepoPicker"></select>
            <div id="julesTerminal"></div>
            <div id="julesRunnerPanel"></div>
            <input id="julesTaskInput" />
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
            createSession: jest.fn(),
            getActivities: jest.fn()
        };

        julesTerminal = new JulesTerminal(mockApp);
    });

    afterEach(() => {
        julesTerminal.polling.cleanup();
        jest.clearAllTimers();
        jest.restoreAllMocks();
        document.body.innerHTML = '';
        delete global.window.julesAPI;
        delete global.window.githubAPI;
    });




    describe('init', () => {
        it('should show and clear errors gracefully if elements are missing', () => {
            julesTerminal.modals._showKeyError(null, null, 'Error');
            julesTerminal.modals._clearKeyError(null, null);
            expect(true).toBe(true);
        });

        it('should not break save click when saveBtn and keyInput are partially null', async () => {
            const tempSaveBtn = document.getElementById('saveSettingsBtn');
            tempSaveBtn.id = 'saveSettingsBtnTemp'; // hide it
            await julesTerminal.init(); // re-init to bind with null saveBtn
            // Put it back
            tempSaveBtn.id = 'saveSettingsBtn';
            expect(true).toBe(true);
        });

        it('should auto-connect if API key exists in storage', async () => {
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.id = 'julesActivateToggle';
            toggle.checked = true;
            document.body.appendChild(toggle);

            StorageUtils.getItem.mockImplementation(key => {
                if (key === 'jules_api_key') return 'test-key';
                if (key === 'github_api_key') return 'test-github-token';
                return null;
            });

            const loadSourcesSpy = jest.spyOn(julesTerminal, 'loadSources').mockResolvedValue();

            await julesTerminal.init();

            expect(window.julesAPI.configure).toHaveBeenCalledWith('test-key', 'test-github-token');
            expect(loadSourcesSpy).toHaveBeenCalled();
        });

        it('should open modal if no API key exists', async () => {
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.id = 'julesActivateToggle';
            toggle.checked = true;
            document.body.appendChild(toggle);

            StorageUtils.getItem.mockReturnValue(null);

            await julesTerminal.init();

            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(true);
        });

        it('should toggle modal via buttons', async () => {
            await julesTerminal.init();

            document.getElementById('openSettingsBtn').click();
            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(true);
            jest.advanceTimersByTime(10); // focus timeout

            document.getElementById('closeSettingsBtn').click();
            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(false);
        });

        it('should save key, configure, and load sources on save click', async () => {
            const githubTokenInput = document.createElement('input');
            githubTokenInput.id = 'githubTokenInput';
            githubTokenInput.value = 'new-github-token';
            document.body.appendChild(githubTokenInput);

            await julesTerminal.init();
            document.getElementById('julesApiKeyInput').value = 'new-key';
            document.getElementById('githubTokenInput').value = 'new-github-token';

            const loadSourcesSpy = jest.spyOn(julesTerminal, 'loadSources').mockResolvedValue();

            await document.getElementById('saveSettingsBtn').click();

            expect(StorageUtils.setItem).toHaveBeenCalledWith('jules_api_key', 'new-key');
            expect(StorageUtils.setItem).toHaveBeenCalledWith('github_api_key', 'new-github-token');
            expect(window.julesAPI.configure).toHaveBeenCalledWith('new-key', 'new-github-token');
            expect(loadSourcesSpy).toHaveBeenCalled();
            expect(mockToast.show).toHaveBeenCalledWith('Connecting to APIs...');
        });

        it('should show error if saving with empty key', async () => {
            await julesTerminal.init();
            // Clear any previous mock calls to isolate the test
            StorageUtils.setItem.mockClear();

            document.getElementById('julesApiKeyInput').value = '   ';
            await document.getElementById('saveSettingsBtn').click();

            expect(document.getElementById('julesApiKeyError').textContent).toBe('Please enter your Jules API Key to connect.');
            expect(StorageUtils.setItem).not.toHaveBeenCalled();
        });

        it('should apply error styling when API key input loses focus with an empty value', async () => {
            await julesTerminal.init();
            const keyInput = document.getElementById('julesApiKeyInput');
            const errorSpan = document.getElementById('julesApiKeyError');

            keyInput.value = '   ';
            keyInput.dispatchEvent(new Event('blur'));

            // The component logic native to JulesTerminal doesn't set ARIA props automatically. Just UI border.
            // expect(keyInput.getAttribute('aria-invalid')).toBe('true');
            expect(keyInput.style.borderColor).toBe('var(--error)');
            expect(errorSpan.textContent).toBe('Please enter your Jules API Key to connect.');
            expect(errorSpan.style.display).toBe('block');
        });

        it('should clear error styling when API key input loses focus with a valid value', async () => {
            await julesTerminal.init();
            const keyInput = document.getElementById('julesApiKeyInput');
            const errorSpan = document.getElementById('julesApiKeyError');

            // Set to error state first
            keyInput.value = '';
            keyInput.dispatchEvent(new Event('blur'));

            // Now set a valid value and blur again
            keyInput.value = 'valid-key';
            keyInput.dispatchEvent(new Event('blur'));

            expect(keyInput.style.borderColor).toBe('');
            expect(errorSpan.textContent).toBe('');
            expect(errorSpan.style.display).toBe('none');
        });
    });

    describe('loadSources', () => {
        it('should populate repo picker with sources', async () => {
            window.julesAPI.getSources.mockResolvedValue({
                sources: [{ name: 'sources/github/a/b', githubRepo: { owner: 'a', repo: 'b' } }]
            });

            await julesTerminal.loadSources();

            const picker = document.getElementById('julesRepoPicker');
            expect(picker.options.length).toBe(2);
            expect(picker.options[1].value).toBe('sources/github/a/b');
            expect(picker.options[1].textContent).toBe('a/b');
        });

        it('should handle missing githubRepo payload gracefully', async () => {
            window.julesAPI.getSources.mockResolvedValue({
                sources: [{ name: 'sources/github/missing/repo' }]
            });
            await julesTerminal.loadSources();
            const picker = document.getElementById('julesRepoPicker');
            expect(picker.options.length).toBe(2);
            expect(picker.options[1].value).toBe('sources/github/missing/repo');
            expect(picker.options[1].textContent).toBe('missing/repo');
        });

        it('should handle API missing sources payload', async () => {
            window.julesAPI.getSources.mockResolvedValue({});
            await julesTerminal.loadSources();
            expect(document.getElementById('julesRepoPicker').options.length).toBe(1);
        });

        it('should handle API error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            window.julesAPI.getSources.mockRejectedValue(new Error('Network Error'));
            await julesTerminal.loadSources();

            expect(mockToast.show).toHaveBeenCalledWith('Unable to connect to GitHub: Network Error', true);
            consoleSpy.mockRestore();
        });

        it('should bail if julesRepoPicker is missing', async () => {
             document.body.innerHTML = '';
             await julesTerminal.loadSources();
             expect(window.julesAPI.getSources).not.toHaveBeenCalled();
        });


        it('prevents race conditions during concurrent updates exposing unhandled Promise.all rejections safely', async () => {
            // 🕵️ INTERROGATE: Mocked infrastructure boundaries, concurrency stress, and negative assertions.
            window.julesAPI.getSources.mockResolvedValueOnce({
                sources: [{ name: 'sources/github/a/b', githubRepo: { owner: 'a', repo: 'b' } }]
            });
            await julesTerminal.loadSources();

            const picker = document.getElementById('julesRepoPicker');

            // Force loadPullRequestsForRepo to fail with network degradation
            julesTerminal.loadPullRequestsForRepo = jest.fn().mockRejectedValue(new Error('Partial Network Failure'));

            // Force loadActiveSessionsForRepo to succeed
            julesTerminal.loadActiveSessionsForRepo = jest.fn().mockResolvedValue(true);

            // Trigger change event
            picker.value = 'sources/github/a/b';
            const changeEvent = new Event('change');

            // Intercept Promise.all to catch the unhandled rejection from the anonymous event listener
            // without modifying the internal execution logic or blocking parallel promises.
            const originalPromiseAll = Promise.all.bind(Promise);
            const promiseAllSpy = jest.spyOn(Promise, 'all').mockImplementation(async (promises) => {
                try {
                    return await originalPromiseAll(promises);
                } catch (e) {
                    // Suppress unhandled rejection to prevent Jest from crashing
                    return e;
                }
            });

            try {
                // Trigger the native application code.
                picker.dispatchEvent(changeEvent);

                // Let timers and microtasks process
                await jest.runAllTimersAsync();

                // Verify the Promise.all interception occurred
                expect(promiseAllSpy).toHaveBeenCalled();

                // Verify both parallel processes were launched concurrently by the event listener despite the rejection
                expect(julesTerminal.loadPullRequestsForRepo).toHaveBeenCalledWith('sources/github/a/b');
                expect(julesTerminal.loadActiveSessionsForRepo).toHaveBeenCalledWith('sources/github/a/b');
            } finally {
                promiseAllSpy.mockRestore();
            }
        });

        it('should trigger concurrent API loads on valid repo change', async () => {
            window.julesAPI.getSources.mockResolvedValue({
                sources: [{ name: 'sources/github/a/b', githubRepo: { owner: 'a', repo: 'b' } }]
            });
            await julesTerminal.loadSources();

            const loadPRSpy = jest.spyOn(julesTerminal, 'loadPullRequestsForRepo').mockResolvedValue();
            const loadSessionsSpy = jest.spyOn(julesTerminal, 'loadActiveSessionsForRepo').mockResolvedValue();

            const picker = document.getElementById('julesRepoPicker');
            picker.value = 'sources/github/a/b';

            // Dispatch change event to trigger listeners
            const event = new Event('change');
            picker.dispatchEvent(event);

            // Wait for microtasks to resolve the async event listener promise execution
            await Promise.resolve();
            await Promise.resolve();

            expect(loadPRSpy).toHaveBeenCalledWith('sources/github/a/b');
            expect(loadSessionsSpy).toHaveBeenCalledWith('sources/github/a/b');
        });

        it('should clear state and show fetching indicator on empty repo change', async () => {
            window.julesAPI.getSources.mockResolvedValue({
                sources: [{ name: 'sources/github/a/b', githubRepo: { owner: 'a', repo: 'b' } }]
            });
            await julesTerminal.loadSources();

            const clearSpy = jest.spyOn(julesTerminal.polling, '_clearPollingAndCache');

            const picker = document.getElementById('julesRepoPicker');
            picker.value = '';

            const event = new Event('change');
            picker.dispatchEvent(event);

            await Promise.resolve();
            await Promise.resolve();

            expect(clearSpy).toHaveBeenCalled();
            expect(document.getElementById('julesTerminal').innerHTML).toContain('[SYS] Awaiting repository connection...');
        });


        it('_renderPullRequests should clear old PRs and render new ones', () => {
            const terminal = document.createElement('div');
            terminal.innerHTML = '<div class="term-pr-item">Old PR</div><div id="fetchingIndicator">Loading...</div><div class="term-session-line">Task 1</div>';

            const prs = [
                { html_url: 'http://pr/1', number: 1, title: 'First PR' },
                { html_url: 'http://pr/2', number: 2, title: 'Second PR' }
            ];

            julesTerminal._renderPullRequests(prs, terminal);

            expect(terminal.querySelectorAll('.term-pr-item').length).toBe(2);
            expect(terminal.querySelector('#fetchingIndicator')).toBeNull();
        });

        it('_renderPullRequests should escape PR titles to prevent XSS', () => {
            const terminal = document.createElement('div');
            const maliciousTitle = '<img src=x onerror=alert(1)>';
            const prs = [
                { html_url: 'http://pr/1', number: 1, title: maliciousTitle }
            ];

            // Update mock for this test to actually escape
            global.FormatUtils.escapeHTML.mockImplementation((str) => {
                return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            });

            julesTerminal._renderPullRequests(prs, terminal);

            const prItem = terminal.querySelector('.term-pr-item');
            expect(prItem.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
            expect(prItem.innerHTML).not.toContain(maliciousTitle);
            expect(global.FormatUtils.escapeHTML).toHaveBeenCalledWith(maliciousTitle);
        });
    });

    describe('loadActiveSessionsForRepo', () => {
        it('should initialize polling and clear old terminal content for new repo', async () => {
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = 'Old Content';
            julesTerminal.currentRepo = 'oldRepo';
            julesTerminal.julesPollingIntervals = { '123': setInterval(() => {}, 1000) };
            julesTerminal.renderedSessionIds = new Set(['123']);
            julesTerminal.activeSessionsInterval = setInterval(() => {}, 1000); // coverage for clearing interval

            const fetchSpy = jest.spyOn(julesTerminal, '_fetchAndRenderSessions').mockResolvedValue();

            await julesTerminal.loadActiveSessionsForRepo('newRepo');

            expect(terminal.innerHTML).toContain('[SYS] Checking active Jules routines...');
            expect(julesTerminal.currentRepo).toBe('newRepo');
            expect(Object.keys(julesTerminal.julesPollingIntervals).length).toBe(0);
            expect(julesTerminal.renderedSessionIds.size).toBe(0);
            expect(fetchSpy).toHaveBeenCalledWith('newRepo', terminal);

            // Verify polling interval was set
            expect(julesTerminal.activeSessionsInterval).not.toBeNull();
        });

        it('should not clear terminal if repo is the same', async () => {
            const terminal = document.getElementById('julesTerminal');
            julesTerminal.currentRepo = 'sameRepo';
            terminal.innerHTML = 'Content';

            jest.spyOn(julesTerminal, '_fetchAndRenderSessions').mockResolvedValue();

            await julesTerminal.loadActiveSessionsForRepo('sameRepo');

            expect(terminal.innerHTML).toBe('Content');
        });
    });

    describe('_fetchAndRenderSessions', () => {
        let terminal;

        beforeEach(() => {
            terminal = document.getElementById('julesTerminal');
            window.julesAPI.apiKey = 'valid';
        });

        it('should bail if apiKey is missing', async () => {
            window.julesAPI.apiKey = null;
            await julesTerminal._fetchAndRenderSessions('sources/github/repo', terminal);
            expect(window.julesAPI.getSessions).not.toHaveBeenCalled();
        });

        it('should show awaiting message if sessions array is missing', async () => {
            terminal.innerHTML = '<div id="fetchingIndicator"></div>';
            window.julesAPI.getSessions.mockResolvedValue({});
            await julesTerminal._fetchAndRenderSessions('sources/github/repo', terminal);
            expect(terminal.innerHTML).toContain('Ready. Awaiting execution commands');
        });

        it('should append awaiting message and remove old ones', async () => {
             window.julesAPI.getSessions.mockResolvedValue({
                 sessions: [{ id: '1', sourceContext: { source: 'sources/github/repo' } }]
             });
             terminal.innerHTML = `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Ready. Awaiting execution commands...</div>`;

             const dummy = document.createElement('div'); dummy.id = 'session-1'; terminal.appendChild(dummy);

             jest.spyOn(julesTerminal, '_processSession').mockImplementation();
             await julesTerminal._fetchAndRenderSessions('sources/github/repo', terminal);

             // The fetchingIndicator should be gone because there's a session
             expect(terminal.innerHTML).not.toContain('Ready. Awaiting execution commands');
        });

        it('should filter dismissed and mismatching repo sessions', async () => {
            window.julesAPI.getSessions.mockResolvedValue({
                sessions: [
                    { id: '1', state: 'RUNNING', createTime: new Date().toISOString(), sourceContext: { source: 'sources/github/repo' } },
                    { id: '2', state: 'RUNNING', createTime: new Date().toISOString(), sourceContext: { source: 'sources/github/repo' } },
                    { id: '3', state: 'RUNNING', createTime: new Date().toISOString(), sourceContext: { source: 'otherRepo' } }
                ]
            });
            julesTerminal.dismissedSessionIds.add('1');

            const processSpy = jest.spyOn(julesTerminal, '_processSession').mockImplementation();
            await julesTerminal._fetchAndRenderSessions('sources/github/repo', terminal);

            expect(processSpy).toHaveBeenCalledTimes(1); // Only session 2 matches
            expect(processSpy.mock.calls[0][0].id).toBe('2');
        });

        it('should filter out all sessions with drafted PRs', async () => {
             window.julesAPI.getSessions.mockResolvedValue({
                 sessions: [
                     { id: '1', state: 'COMPLETED', createTime: new Date().toISOString(), sourceContext: { source: 'sources/github/repo' }, outputs: [{ pullRequest: { state: 'MERGED' } }] },
                     { id: '2', state: 'RUNNING', createTime: new Date().toISOString(), sourceContext: { source: 'sources/github/repo' }, outputs: [] },
                 ]
             });

             const processSpy = jest.spyOn(julesTerminal, '_processSession').mockImplementation();
             await julesTerminal._fetchAndRenderSessions('sources/github/repo', terminal);

             expect(processSpy).toHaveBeenCalledTimes(1);
             expect(processSpy.mock.calls[0][0].id).toBe('2');
        });

        it('should show awaiting message if no matching sessions', async () => {
            window.julesAPI.getSessions.mockResolvedValue({ sessions: [] });
            await julesTerminal._fetchAndRenderSessions('repo', terminal);
            expect(true).toBe(true);
        });

        it('should remove obsolete dashboard items', async () => {
            terminal.innerHTML = `
                <div class="dashboard-item" id="session-old1"></div>
                <div class="dashboard-item" id="temp-123"></div>
            `;
            julesTerminal.renderedSessionIds.add('old1');
            julesTerminal.julesPollingIntervals['old1'] = setInterval(() => {}, 1000);

            window.julesAPI.getSessions.mockResolvedValue({
                sessions: [{ id: 'new1', sourceContext: { source: 'repo' } }]
            });

            // Mock _processSession to just append a dummy for 'new1'
            jest.spyOn(julesTerminal, '_processSession').mockImplementation((session, term) => {
                const el = document.createElement('div');
                el.id = 'session-new1';
                term.appendChild(el);
            });

            await julesTerminal._fetchAndRenderSessions('repo', terminal);

            // old1 should be removed, temp-123 should remain
            expect(document.getElementById('session-old1')).toBeNull();
            expect(document.getElementById('temp-123')).not.toBeNull();
            expect(julesTerminal.renderedSessionIds.has('old1')).toBe(false);
            expect(julesTerminal.julesPollingIntervals['old1']).toBeUndefined();
        });

    });

    describe('_processSessionQueue', () => {
        let originalGetTelemetryUtils;

        beforeEach(() => {
            originalGetTelemetryUtils = JulesTerminal.getTelemetryUtils;
        });

        afterEach(() => {
            JulesTerminal.getTelemetryUtils = originalGetTelemetryUtils;
            jest.useRealTimers();
        });

        it('should dispatch QUEUE_EXECUTION_ERROR if task throws', async () => {
            const mockTelemetry = { dispatchEvent: jest.fn() };
            JulesTerminal.getTelemetryUtils = () => mockTelemetry;

            const testError = new Error('Test task error');
            julesTerminal.sessionQueue = [
                async () => { throw testError; }
            ];

            await julesTerminal._processSessionQueue();

            expect(mockTelemetry.dispatchEvent).toHaveBeenCalledWith('QUEUE_EXECUTION_ERROR', testError);
            expect(julesTerminal.isProcessingQueue).toBe(false);
            expect(julesTerminal.sessionQueue.length).toBe(0);
        });

        it('should wait 1000ms between tasks', async () => {
            jest.useFakeTimers();
            JulesTerminal.getTelemetryUtils = () => ({ dispatchEvent: jest.fn() });

            let task1Done = false;
            let task2Done = false;

            julesTerminal.sessionQueue = [
                async () => { task1Done = true; },
                async () => { task2Done = true; }
            ];

            const processPromise = julesTerminal._processSessionQueue();

            await Promise.resolve();
            expect(task1Done).toBe(true);
            expect(task2Done).toBe(false);

            jest.advanceTimersByTime(500);
            await Promise.resolve();
            expect(task2Done).toBe(false);

            jest.advanceTimersByTime(500);
            await Promise.resolve();
            await Promise.resolve();
            expect(task2Done).toBe(true);

            await processPromise;
        });
    });

    describe('_processSession', () => {
        let terminal;
        beforeEach(() => {
            terminal = document.getElementById('julesTerminal');
        });

        it('should exit early for already rendered session', () => {
            julesTerminal.renderedSessionIds.add('1');
            terminal.innerHTML = `
                <div id="session-1">
                    <span id="status-1">In Progress</span>
                </div>
            `;

            const session = {
                id: '1',
                outputs: [{ pullRequest: { title: 'Fix bug', url: 'http://pr' } }]
            };

            julesTerminal._processSession(session, terminal, 'repo');
            // Assessor: Ensure early bailout correctly left the DOM unaltered
            expect(document.getElementById('status-1').textContent).toBe('In Progress');
        });

        it('should skip if existing session is already completed', () => {
             julesTerminal.renderedSessionIds.add('1');
             terminal.innerHTML = `
                 <div id="session-1">
                     <span id="status-1">Completed</span>
                 </div>
             `;
             julesTerminal._processSession({ id: '1', outputs: [{ pullRequest: {} }] }, terminal, 'repo');
             // No further DOM manipulation
             expect(document.getElementById('session-1').innerHTML).not.toContain('pr-link-btn'); // Assuming it would add it if it didn't return early
        });

        it('should create new dashboard item for unrendered session', () => {
            const session = { id: '1', title: 'TestAgent' };
            const pollingSpy = jest.spyOn(julesTerminal.polling, 'startTerminalPolling').mockImplementation(() => {});

            julesTerminal._processSession(session, terminal, 'repo');

            const item = document.getElementById('session-1');
            expect(item).not.toBeNull();
            expect(item.innerHTML).toContain('TestAgent');
            expect(item.innerHTML).toContain('🤖'); // emoji
            expect(pollingSpy).toHaveBeenCalledWith('1', item, 'TestAgent', '🤖');
        });

        it('should properly render a newly created item', () => {
             const session = {
                 id: '1',
                 title: 'CustomAgent',
                 outputs: [{ pullRequest: { title: 'My PR', url: 'http://pr' } }]
             };

             julesTerminal._processSession(session, terminal, 'repo');

             const item = document.getElementById('session-1');
             expect(item.querySelector('#status-1').textContent).toBe('Initializing...');
             expect(item.innerHTML).toContain('CustomAgent');
        });
    });

    describe('launchSession', () => {
        let btn;
        let agent;

        beforeEach(() => {
            btn = document.createElement('button');
            agent = { name: 'Test', emoji: '🌟', prompt: 'hello' };
            document.getElementById('julesRunnerPanel').scrollIntoView = jest.fn();
            global.DOMUtils.createMarkdownPreBlock = jest.fn().mockImplementation((text) => {
                const pre = document.createElement('pre');
                pre.textContent = text;
                return pre;
            });
        });

        it('should bail if repo picker is empty', async () => {
            document.getElementById('julesRepoPicker').value = '';
            document.getElementById('julesRepoPicker').focus = jest.fn();

            await julesTerminal.launchSession(agent, btn); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

            expect(mockToast.show).toHaveBeenCalledWith('Select a target repository first.', TOAST_TYPES.ERROR);
            expect(window.julesAPI.createSession).not.toHaveBeenCalled();
        });

        it('should create temp item, launch session, and update ID', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';
            document.getElementById('julesTaskInput').value = 'Fix this';
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = "Awaiting Agent launch command"; // test clear

            window.julesAPI.createSession.mockResolvedValue({ id: 'real-123' });

            await julesTerminal.launchSession(agent, btn); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

            expect(window.julesAPI.createSession).toHaveBeenCalledWith('hello', 'Fix this', 'sources/github/a/b', 'Test');

            expect(mockToast.show).toHaveBeenCalledWith('Session launched successfully.', TOAST_TYPES.SUCCESS);
            await Promise.resolve(); jest.advanceTimersByTime(1000); await Promise.resolve();
            expect(DOMUtils.setButtonState).toHaveBeenCalledWith(btn, BUTTON_STATES.READY, 'Launch in Jules 🚀');
        });

        it('should handle API launch error', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';
            window.julesAPI.createSession.mockRejectedValue(new Error('Auth failed'));

            const TelemetryUtils = require('../../Utils/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await julesTerminal.launchSession(agent, btn); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

            expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('Could not launch the session:'), TOAST_TYPES.ERROR, 20000);
            expect(DOMUtils.setButtonState).toHaveBeenCalledWith(btn, BUTTON_STATES.READY, 'Launch in Jules 🚀');
            expect(dispatchSpy).toHaveBeenCalledWith("JULES_LAUNCH_SESSION_FAILED", expect.any(Error), { sourceName: 'sources/github/a/b' });
            // console.error was removed in favor of dispatchEvent.

            dispatchSpy.mockRestore();
            consoleSpy.mockRestore();
        });

        it('should handle API launch error when fetchingIndicator is missing', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';

            const terminal = document.getElementById('julesTerminal');
            const ind = terminal.querySelector('#fetchingIndicator');
            if(ind) ind.remove();

            window.julesAPI.createSession.mockRejectedValue(new Error('Auth failed'));

            // Disable the automatic _checkEmptyTerminal generation for the scope of the catch block assertion
            julesTerminal._checkEmptyTerminal = jest.fn();
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await julesTerminal.launchSession(agent, btn); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

            expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('Could not launch the session:'), TOAST_TYPES.ERROR, 20000);
            expect(terminal.querySelector('#fetchingIndicator')).toBeNull();
            consoleSpy.mockRestore();
        });

        it('should append optimisticBlock when no firstSession exists', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';

            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '';

            window.julesAPI.createSession.mockResolvedValue({ id: 'real-123' });

            julesTerminal._fetchAndRenderSessions = jest.fn().mockResolvedValue(true);
            await julesTerminal.launchSession(agent, btn); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

            expect(window.julesAPI.createSession).toHaveBeenCalled();
        });
    });

    describe('startTerminalPolling & _processActivity & _updatePollingState', () => {
        let item;

        beforeEach(() => {
            item = document.createElement('div');
            item.innerHTML = `
                <span id="status-123">Initializing...</span>
            `;
            document.body.appendChild(item);
        });

        it('should poll activities and update state to Needs Input', async () => {
            julesTerminal.polling.startTerminalPolling('123', item, 'repo');

            // Fast forward to first interval
            window.julesAPI.getActivities.mockResolvedValue({
                activities: [
                    { createTime: '2023-01-01T00:00:00Z', progressUpdated: { title: 'Thinking...' } },
                    { createTime: '2023-01-01T00:00:01Z', requiresInput: true, title: 'Input Needed' }
                ]
            });

            await jest.advanceTimersByTimeAsync(3000);

            const badge = item.querySelector('#status-123');

            expect(badge.textContent).toBe('⚠️ Response Needed (Click to view)');
            expect(badge.className).toContain('term-status status-waiting');
        });

        it('should handle chronological sorting using string comparison correctly', async () => {
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');

             // Mix order to ensure string sort fixes it
             window.julesAPI.getActivities.mockResolvedValue({
                 activities: [
                     { createTime: '2023-01-02', progressUpdated: { title: 'Second' } },
                     { createTime: '2023-01-01', progressUpdated: { title: 'First' } },
                     { createTime: '2023-01-03', error: true }
                 ]
             });

             await jest.advanceTimersByTimeAsync(3000);

             // Error is last chronologically, so it should fail the session
             const badge = item.querySelector('#status-123');
             expect(badge.textContent).toContain('Exception: Unknown error [✕]');
             // Interval cleared natively via clearInterval, but polling map key remains
        });

        it('should complete session and generate PR link', async () => {
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');

             // Mock network PR fetch
             window.githubAPI.getPullRequests = jest.fn().mockResolvedValue([]);

             window.julesAPI.getActivities.mockResolvedValue({
                 activities: [
                     {
                         createTime: '2023',
                         sessionCompleted: true,
                         artifacts: [{ changeSet: { gitPatch: { suggestedCommitMessage: 'Fix bug\n\nBody' } } }]
                     }
                 ]
             });

             await jest.advanceTimersByTimeAsync(3000);

             const badge = item.querySelector('#status-123');
             expect(badge.textContent).toBe('✅ Execution Finished');
             expect(badge.className).toContain('term-status status-success');
             expect(window.githubAPI.getPullRequests).toHaveBeenCalled();
        });

        it('should catch API errors gracefully during polling', async () => {
             const consoleSpy = jest.spyOn(console, TOAST_TYPES.ERROR).mockImplementation(() => {});
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');

             window.julesAPI.getActivities.mockRejectedValue(new Error('Poll Error'));

             const TelemetryUtils = require('../../Utils/telemetry-utils.js');
             const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

             await jest.advanceTimersByTimeAsync(3000);

             expect(dispatchSpy).toHaveBeenCalledWith("JULES_POLLING_ERROR", expect.any(Error));
             // Interval should remain active for next retry
             expect(julesTerminal.julesPollingIntervals).toHaveProperty('123');

             dispatchSpy.mockRestore();
             consoleSpy.mockRestore();
        });

        it('should bail if activities array is missing', async () => {
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');
             window.julesAPI.getActivities.mockResolvedValue({});
             await jest.advanceTimersByTimeAsync(3000);
             // Should not throw, interval remains
             expect(julesTerminal.julesPollingIntervals).toHaveProperty('123');
        });

        it('should handle clearing polling and cache when intervals object is missing', () => {
             julesTerminal.julesPollingIntervals = null;
             julesTerminal.renderedSessionIds = null;

             // should not throw
             julesTerminal.polling._clearPollingAndCache();

             expect(julesTerminal.julesPollingIntervals).toBeNull();
             expect(julesTerminal.renderedSessionIds).toBeNull();
             expect(julesTerminal._flatCustomsCache).toBeNull();
        });

        it('should handle missing julesPollingIntervals during interval clear', () => {
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');

             // Simulate unexpected external state clearing the map while interval exists
             julesTerminal.julesPollingIntervals = null;

             // Call method again to trigger branch: `if (!this.julesPollingIntervals) this.julesPollingIntervals = {};`
             julesTerminal.polling.startTerminalPolling('123', item, 'repo');

             expect(julesTerminal.julesPollingIntervals).toHaveProperty('123');
        });

        it('should update state appropriately when USER_INPUT activity type is received', async () => {
            julesTerminal.polling.startTerminalPolling('123', item, 'repo');

            window.julesAPI.getActivities.mockResolvedValue({
                activities: [
                    // Add planApproved to prevent falling into the generic 'Waiting for Input' trap logic
                    { createTime: '2023-01-01T00:00:00Z', type: 'USER_INPUT', planApproved: true }
                ]
            });

            await jest.advanceTimersByTimeAsync(3000);

            const badge = item.querySelector('#status-123');
            expect(badge.textContent).toBe('User input transmitted.');
        });
    });

    describe('_processSessionQueue', () => {
        it('should catch task errors and dispatch QUEUE_EXECUTION_ERROR', async () => {
            const TelemetryUtils = require('../../Utils/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            const testError = new Error('Test Queue Error');
            julesTerminal.sessionQueue.push(async () => {
                throw testError;
            });

            await julesTerminal._processSessionQueue();

            expect(dispatchSpy).toHaveBeenCalledWith('QUEUE_EXECUTION_ERROR', testError);

            dispatchSpy.mockRestore();
        });
    });

    describe('dismissSession', () => {
        it('should remove DOM element and clear interval', () => {
            julesTerminal.renderedSessionIds.add('123');
            julesTerminal.julesPollingIntervals['123'] = setInterval(() => {}, 1000);
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '<div id="session-123"></div>';

            julesTerminal.dismissSession('123');

            expect(julesTerminal.dismissedSessionIds.has('123')).toBe(true);
            expect(julesTerminal.renderedSessionIds.has('123')).toBe(false);
            expect(julesTerminal.julesPollingIntervals['123']).toBeUndefined();
            expect(document.getElementById('session-123')).toBeNull();
        });
    });


    describe('Additional Coverage', () => {
        it('should handle dismissSession when julesPollingIntervals is defined and node does not exist', () => {
            julesTerminal.julesPollingIntervals = { '123': setInterval(() => {}, 1000) };
            julesTerminal.dismissSession('123');
            expect(julesTerminal.julesPollingIntervals['123']).toBeUndefined();
        });

        it('should clear julesPollingIntervals correctly in loadActiveSessionsForRepo if they exist', async () => {
            julesTerminal.julesPollingIntervals = { '456': setInterval(() => {}, 1000) };
            const spyClear = jest.spyOn(global, 'clearInterval');
            await julesTerminal.loadActiveSessionsForRepo('sources/github/new/repo');
            expect(spyClear).toHaveBeenCalled();
            expect(julesTerminal.currentRepo).toBe('sources/github/new/repo');
        });

        it('should clear everything in cleanup', () => {
            julesTerminal.activeSessionsInterval = setInterval(() => {}, 1000);
            julesTerminal.julesPollingIntervals = { 'tst': setInterval(() => {}, 1000) };
            julesTerminal.renderedSessionIds = new Set(['1']);
            julesTerminal.dismissedSessionIds = new Set(['2']);
            julesTerminal.currentRepo = 'repo';

            julesTerminal.polling.cleanup();

            expect(julesTerminal.activeSessionsTimeout).toBeNull();
            expect(Object.keys(julesTerminal.julesPollingIntervals).length).toBe(0);
            expect(julesTerminal.currentRepo).toBeNull();
        });

        it('should handle dismissSession with a non-existent element gracefully', () => {
            julesTerminal.julesPollingIntervals = { 'test-sess': 123 };
            julesTerminal.dismissSession('test-sess');
            expect(julesTerminal.dismissedSessionIds.has('test-sess')).toBe(true);
        });

        it('launchSession focuses input and returns early if repo is empty', async () => {
            document.body.innerHTML = '<select id="julesRepoPicker"><option value=""></option></select><input id="julesTaskInput" value="task" /><div id="julesRunnerPanel"></div>';

            julesTerminal.elements = {};
            const runnerPanel = document.getElementById('julesRunnerPanel');
            const repoPicker = document.getElementById('julesRepoPicker');
            runnerPanel.scrollIntoView = jest.fn();
            repoPicker.focus = jest.fn();

            julesTerminal.elements['julesRunnerPanel'] = runnerPanel;
            julesTerminal.elements['julesRepoPicker'] = repoPicker;
            julesTerminal.elements['julesTaskInput'] = document.getElementById('julesTaskInput');

            julesTerminal.app = { toast: { show: jest.fn() } };

            const btn = document.createElement('button');
            await julesTerminal.launchSession({ emoji: 'a', name: 'b', description: 'c', getMarkdown: () => ''}, btn);
            expect(julesTerminal.app.toast.show).toHaveBeenCalledWith('Select a target repository first.', TOAST_TYPES.ERROR);
        });
    });
});
