/**
 * @jest-environment jsdom
 */

const JulesManager = require('./JulesManager');

// Mock utilities
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    createPRLink: jest.fn().mockImplementation((url, cb) => {
        const a = document.createElement('a');
        a.href = url;
        a.className = 'pr-link-btn';
        if (cb) a.addEventListener('click', cb);
        return a;
    })
};

global.FormatUtils = {
    createTerminalLineHTML: jest.fn().mockImplementation((msg, id) => {
        return `<div class="terminal-line"${id ? ` id="${id}"` : ''}>${msg}</div>`;
    })
};

describe('JulesManager', () => {
    let manager;
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
            <select id="julesRepoPicker"></select>
            <div id="julesTerminal"></div>
            <div id="julesRunnerPanel"></div>
            <input id="julesTaskInput" />
        `;

        global.window.julesService = {
            configure: jest.fn(),
            getSources: jest.fn(),
            getSessions: jest.fn(),
            createSession: jest.fn(),
            getActivities: jest.fn()
        };

        manager = new JulesManager(mockApp);
    });

    afterEach(() => {
        manager.cleanup();
        jest.clearAllTimers();
        jest.restoreAllMocks();
        document.body.innerHTML = '';
        delete global.window.julesService;
    });

    describe('init', () => {
        it('should auto-connect if API key exists in storage', async () => {
            StorageUtils.getItem.mockReturnValue('test-key');
            const loadSourcesSpy = jest.spyOn(manager, 'loadSources').mockResolvedValue();

            await manager.init();

            expect(window.julesService.configure).toHaveBeenCalledWith('test-key');
            expect(loadSourcesSpy).toHaveBeenCalled();
        });

        it('should open modal if no API key exists', async () => {
            StorageUtils.getItem.mockReturnValue(null);
            await manager.init();

            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(true);
        });

        it('should toggle modal via buttons', async () => {
            await manager.init();

            document.getElementById('openSettingsBtn').click();
            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(true);
            jest.advanceTimersByTime(10); // focus timeout

            document.getElementById('closeSettingsBtn').click();
            expect(document.getElementById('settingsModal').classList.contains('visible')).toBe(false);
        });

        it('should save key, configure, and load sources on save click', async () => {
            await manager.init();
            document.getElementById('julesApiKeyInput').value = 'new-key';
            const loadSourcesSpy = jest.spyOn(manager, 'loadSources').mockResolvedValue();

            await document.getElementById('saveSettingsBtn').click();

            expect(StorageUtils.setItem).toHaveBeenCalledWith('jules_api_key', 'new-key');
            expect(window.julesService.configure).toHaveBeenCalledWith('new-key');
            expect(loadSourcesSpy).toHaveBeenCalled();
            expect(mockToast.show).toHaveBeenCalledWith('Connecting to Jules...');
        });

        it('should show error if saving with empty key', async () => {
            await manager.init();
            // Clear any previous mock calls to isolate the test
            StorageUtils.setItem.mockClear();

            document.getElementById('julesApiKeyInput').value = '   ';
            await document.getElementById('saveSettingsBtn').click();

            expect(mockToast.show).toHaveBeenCalledWith('Please enter an API Key.');
            expect(StorageUtils.setItem).not.toHaveBeenCalled();
        });
    });

    describe('loadSources', () => {
        it('should populate repo picker with sources', async () => {
            window.julesService.getSources.mockResolvedValue({
                sources: [{ name: 'sources/github/a/b', githubRepo: { owner: 'a', repo: 'b' } }]
            });

            await manager.loadSources();

            const picker = document.getElementById('julesRepoPicker');
            expect(picker.options.length).toBe(2);
            expect(picker.options[1].value).toBe('sources/github/a/b');
            expect(picker.options[1].textContent).toBe('a/b');
            expect(mockToast.show).toHaveBeenCalledWith('Jules Repositories Loaded');
        });

        it('should handle API missing sources payload', async () => {
            window.julesService.getSources.mockResolvedValue({});
            await manager.loadSources();
            expect(document.getElementById('julesRepoPicker').options.length).toBe(1);
        });

        it('should handle API error gracefully', async () => {
            window.julesService.getSources.mockRejectedValue(new Error('Network Error'));
            await manager.loadSources();

            expect(mockToast.show).toHaveBeenCalledWith('Failed to fetch Repos. Check API Key.', true);
        });

        it('should bail if julesRepoPicker is missing', async () => {
             document.body.innerHTML = '';
             await manager.loadSources();
             expect(window.julesService.getSources).not.toHaveBeenCalled();
        });
    });

    describe('loadActiveSessionsForRepo', () => {
        it('should initialize polling and clear old terminal content for new repo', async () => {
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = 'Old Content';
            manager.currentRepo = 'oldRepo';
            manager.julesPollingIntervals = { '123': setInterval(() => {}, 1000) };
            manager.renderedSessionIds = new Set(['123']);
            manager.activeSessionsInterval = setInterval(() => {}, 1000); // coverage for clearing interval

            const fetchSpy = jest.spyOn(manager, '_fetchAndRenderSessions').mockResolvedValue();

            await manager.loadActiveSessionsForRepo('newRepo');

            expect(terminal.innerHTML).toContain('Fetching active sessions...');
            expect(manager.currentRepo).toBe('newRepo');
            expect(Object.keys(manager.julesPollingIntervals).length).toBe(0);
            expect(manager.renderedSessionIds.size).toBe(0);
            expect(fetchSpy).toHaveBeenCalledWith('newRepo', terminal);

            // Verify polling interval was set
            expect(manager.activeSessionsInterval).not.toBeNull();
        });

        it('should not clear terminal if repo is the same', async () => {
            const terminal = document.getElementById('julesTerminal');
            manager.currentRepo = 'sameRepo';
            terminal.innerHTML = 'Content';

            jest.spyOn(manager, '_fetchAndRenderSessions').mockResolvedValue();

            await manager.loadActiveSessionsForRepo('sameRepo');

            expect(terminal.innerHTML).toBe('Content');
        });
    });

    describe('_fetchAndRenderSessions', () => {
        let terminal;

        beforeEach(() => {
            terminal = document.getElementById('julesTerminal');
            window.julesService.apiKey = 'valid';
        });

        it('should bail if apiKey is missing', async () => {
            window.julesService.apiKey = null;
            await manager._fetchAndRenderSessions('repo', terminal);
            expect(window.julesService.getSessions).not.toHaveBeenCalled();
        });

        it('should show awaiting message if sessions array is missing', async () => {
            terminal.innerHTML = '<div id="fetchingIndicator"></div>';
            window.julesService.getSessions.mockResolvedValue({});
            await manager._fetchAndRenderSessions('repo', terminal);
            expect(terminal.innerHTML).toContain('Awaiting Agent launch');
        });

        it('should append awaiting message and remove old ones', async () => {
             window.julesService.getSessions.mockResolvedValue({
                 sessions: [{ id: '1', sourceContext: { source: 'repo' } }]
             });
             // test lines 233-234 where awaitingMsg is removed when repoSessions > 0
             terminal.innerHTML = FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...");

             jest.spyOn(manager, '_processSession').mockImplementation();
             await manager._fetchAndRenderSessions('repo', terminal);

             // The awaiting message should be gone
             expect(terminal.innerHTML).not.toContain('Awaiting Agent launch command');
        });

        it('should filter dismissed and mismatching repo sessions', async () => {
            window.julesService.getSessions.mockResolvedValue({
                sessions: [
                    { id: '1', sourceContext: { source: 'repo' } },
                    { id: '2', sourceContext: { source: 'repo' } },
                    { id: '3', sourceContext: { source: 'otherRepo' } }
                ]
            });
            manager.dismissedSessionIds.add('1');

            const processSpy = jest.spyOn(manager, '_processSession');
            await manager._fetchAndRenderSessions('repo', terminal);

            expect(processSpy).toHaveBeenCalledTimes(1); // Only session 2 matches
            expect(processSpy.mock.calls[0][0].id).toBe('2');
        });

        it('should filter out completed merged/closed PR sessions', async () => {
             window.julesService.getSessions.mockResolvedValue({
                 sessions: [
                     { id: '1', sourceContext: { source: 'repo' }, outputs: [{ pullRequest: { state: 'MERGED' } }] },
                     { id: '2', sourceContext: { source: 'repo' }, outputs: [{ pullRequest: { state: 'OPEN' } }] },
                 ]
             });

             const processSpy = jest.spyOn(manager, '_processSession');
             await manager._fetchAndRenderSessions('repo', terminal);

             expect(processSpy).toHaveBeenCalledTimes(1);
             expect(processSpy.mock.calls[0][0].id).toBe('2');
        });

        it('should show awaiting message if no matching sessions', async () => {
            window.julesService.getSessions.mockResolvedValue({ sessions: [] });
            await manager._fetchAndRenderSessions('repo', terminal);
            expect(terminal.innerHTML).toContain('Awaiting Agent launch');
        });

        it('should remove obsolete dashboard items', async () => {
            terminal.innerHTML = `
                <div class="dashboard-item" id="session-old1"></div>
                <div class="dashboard-item" id="temp-123"></div>
            `;
            manager.renderedSessionIds.add('old1');
            manager.julesPollingIntervals['old1'] = setInterval(() => {}, 1000);

            window.julesService.getSessions.mockResolvedValue({
                sessions: [{ id: 'new1', sourceContext: { source: 'repo' } }]
            });

            // Mock _processSession to just append a dummy for 'new1'
            jest.spyOn(manager, '_processSession').mockImplementation((session, term) => {
                const el = document.createElement('div');
                el.id = 'session-new1';
                term.appendChild(el);
            });

            await manager._fetchAndRenderSessions('repo', terminal);

            // old1 should be removed, temp-123 should remain
            expect(document.getElementById('session-old1')).toBeNull();
            expect(document.getElementById('temp-123')).not.toBeNull();
            expect(manager.renderedSessionIds.has('old1')).toBe(false);
            expect(manager.julesPollingIntervals['old1']).toBeUndefined();
        });

        it('should catch API errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            window.julesService.getSessions.mockRejectedValue(new Error('API Err'));

            await manager._fetchAndRenderSessions('repo', terminal);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('_processSession', () => {
        let terminal;
        beforeEach(() => {
            terminal = document.getElementById('julesTerminal');
        });

        it('should update existing uncompleted session to completed', () => {
            manager.renderedSessionIds.add('1');
            terminal.innerHTML = `
                <div id="session-1">
                    <div class="dashboard-status">
                        <span id="status-1">In Progress</span>
                    </div>
                    <div class="dashboard-meta"></div>
                </div>
            `;

            const session = {
                id: '1',
                outputs: [{ pullRequest: { title: 'Fix bug', url: 'http://pr' } }]
            };

            manager._processSession(session, terminal, 'repo');

            const status = document.getElementById('status-1');
            expect(status.textContent).toBe('Completed');
            expect(status.className).toContain('status-completed');

            const item = document.getElementById('session-1');
            expect(item.querySelector('.pr-link-btn')).not.toBeNull();

            // simulate click to test delegation
            const dummyTarget = document.createElement('div');
            item.appendChild(dummyTarget);
            dummyTarget.click();
            expect(manager.dismissedSessionIds.has('1')).toBe(true);
        });

        it('should skip if existing session is already completed', () => {
             manager.renderedSessionIds.add('1');
             terminal.innerHTML = `
                 <div id="session-1">
                     <span id="status-1">Completed</span>
                 </div>
             `;
             manager._processSession({ id: '1', outputs: [{ pullRequest: {} }] }, terminal, 'repo');
             // No further DOM manipulation
             expect(document.getElementById('session-1').innerHTML).not.toContain('pr-link-btn'); // Assuming it would add it if it didn't return early
        });

        it('should create new dashboard item for unrendered session', () => {
            const session = { id: '1', title: 'TestAgent' };
            const pollingSpy = jest.spyOn(manager, 'startTerminalPolling');

            manager._processSession(session, terminal, 'repo');

            const item = document.getElementById('session-1');
            expect(item).not.toBeNull();
            expect(item.innerHTML).toContain('TestAgent');
            expect(item.innerHTML).toContain('🤖'); // emoji
            expect(pollingSpy).toHaveBeenCalledWith('1', item, 'repo');
        });

        it('should create new completed dashboard item', () => {
             const session = {
                 id: '1',
                 title: 'CustomAgent',
                 outputs: [{ pullRequest: { title: 'My PR', url: 'http://pr' } }]
             };

             manager._processSession(session, terminal, 'repo');

             const item = document.getElementById('session-1');
             expect(item.querySelector('#status-1').textContent).toBe('Completed');
             expect(item.innerHTML).toContain('🔥'); // custom agent emoji
             expect(item.innerHTML).toContain('My PR');
             expect(item.querySelector('.pr-link-btn')).not.toBeNull();

             // click dismiss
             const dummy = document.createElement('div');
             item.appendChild(dummy);
             dummy.click();
             expect(manager.dismissedSessionIds.has('1')).toBe(true);
        });
    });

    describe('launchSession', () => {
        let btn;
        let agent;

        beforeEach(() => {
            btn = document.createElement('button');
            agent = { name: 'Test', emoji: '🌟', prompt: 'hello' };
            document.getElementById('julesRunnerPanel').scrollIntoView = jest.fn();
        });

        it('should bail if repo picker is empty', async () => {
            document.getElementById('julesRepoPicker').value = '';
            document.getElementById('julesRepoPicker').focus = jest.fn();

            await manager.launchSession(agent, btn);

            expect(mockToast.show).toHaveBeenCalledWith(expect.stringContaining('select a target repository'), 'error');
            expect(window.julesService.createSession).not.toHaveBeenCalled();
        });

        it('should create temp item, launch session, and update ID', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';
            document.getElementById('julesTaskInput').value = 'Fix this';
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = "Awaiting Agent launch command"; // test clear

            window.julesService.createSession.mockResolvedValue({ id: 'real-123' });
            const pollingSpy = jest.spyOn(manager, 'startTerminalPolling');

            await manager.launchSession(agent, btn);

            expect(window.julesService.createSession).toHaveBeenCalledWith('hello', 'Fix this', 'sources/github/a/b', 'Test Execution');

            const item = document.getElementById('session-real-123');
            expect(item).not.toBeNull();
            expect(item.innerHTML).toContain('a/b'); // repoPath

            const status = document.getElementById('status-real-123');
            expect(status.textContent).toBe('In Progress');

            expect(pollingSpy).toHaveBeenCalledWith('real-123', item, 'a/b');
            expect(mockToast.show).toHaveBeenCalledWith('Session for Test launched successfully!', 'success');
            expect(DOMUtils.setButtonState).toHaveBeenCalledWith(btn, 'ready', 'Launch in Jules 🚀');
        });

        it('should handle API launch error', async () => {
            document.getElementById('julesRepoPicker').innerHTML = '<option value="sources/github/a/b">a/b</option>';
            document.getElementById('julesRepoPicker').value = 'sources/github/a/b';
            window.julesService.createSession.mockRejectedValue(new Error('Auth failed'));

            await manager.launchSession(agent, btn);

            // temp ID should remain
            const items = document.querySelectorAll('.dashboard-item');
            expect(items.length).toBe(1);
            const item = items[0];

            expect(item.querySelector('.status-badge').textContent).toBe('Failed');
            expect(item.querySelector('.dashboard-meta').textContent).toBe('Launch Error: Auth failed');

            expect(mockToast.show).toHaveBeenCalledWith('Failed to launch session: Auth failed', 'error');
            expect(DOMUtils.setButtonState).toHaveBeenCalledWith(btn, 'ready', 'Launch in Jules 🚀');
        });
    });

    describe('startTerminalPolling & _processActivity & _updatePollingState', () => {
        let item;

        beforeEach(() => {
            item = document.createElement('div');
            item.innerHTML = `
                <div class="dashboard-meta">Starting...</div>
                <div class="dashboard-status">
                    <span id="status-123">In Progress</span>
                </div>
            `;
            document.body.appendChild(item);
        });

        it('should poll activities and update state to Needs Input', async () => {
            manager.startTerminalPolling('123', item, 'repo');

            // Fast forward to first interval
            window.julesService.getActivities.mockResolvedValue({
                activities: [
                    { createTime: '2023-01-01T00:00:00Z', progressUpdated: { title: 'Thinking...' } },
                    { createTime: '2023-01-01T00:00:01Z', requiresInput: true, title: 'Input Needed' }
                ]
            });

            await jest.advanceTimersByTimeAsync(3000);

            const meta = item.querySelector('.dashboard-meta');
            const badge = item.querySelector('#status-123');

            expect(meta.textContent).toBe('Input Needed');
            expect(badge.textContent).toBe('Needs Input');
            expect(badge.className).toContain('status-failed');
        });

        it('should handle chronological sorting using string comparison correctly', async () => {
             manager.startTerminalPolling('123', item, 'repo');

             // Mix order to ensure string sort fixes it
             window.julesService.getActivities.mockResolvedValue({
                 activities: [
                     { createTime: '2023-01-02', progressUpdated: { title: 'Second' } },
                     { createTime: '2023-01-01', progressUpdated: { title: 'First' } },
                     { createTime: '2023-01-03', error: true }
                 ]
             });

             await jest.advanceTimersByTimeAsync(3000);

             // Error is last chronologically, so it should fail the session
             const badge = item.querySelector('#status-123');
             expect(badge.textContent).toBe('Failed');
             expect(manager.julesPollingIntervals['123']).toBeUndefined(); // Interval cleared
        });

        it('should complete session and generate PR link', async () => {
             manager.startTerminalPolling('123', item, 'repo');

             window.julesService.getActivities.mockResolvedValue({
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
             expect(badge.textContent).toBe('Completed');
             expect(item.querySelector('.dashboard-meta').textContent).toBe('PR Drafted: Fix bug');
             expect(item.querySelector('.pr-link-btn')).not.toBeNull();
             expect(manager.julesPollingIntervals['123']).toBeUndefined(); // cleared
        });

        it('should complete session with fallback title if no PR artifact', async () => {
             manager.startTerminalPolling('123', item, 'repo');
             window.julesService.getActivities.mockResolvedValue({
                 activities: [{ sessionCompleted: true }]
             });
             await jest.advanceTimersByTimeAsync(3000);
             expect(item.querySelector('.dashboard-meta').textContent).toBe('Session Completed Successfully.');
        });

        it('should catch API errors gracefully during polling', async () => {
             const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
             manager.startTerminalPolling('123', item, 'repo');

             window.julesService.getActivities.mockRejectedValue(new Error('Poll Error'));

             await jest.advanceTimersByTimeAsync(3000);

             expect(consoleSpy).toHaveBeenCalled();
             // Interval should remain active for next retry
             expect(manager.julesPollingIntervals['123']).toBeDefined();

             consoleSpy.mockRestore();
        });

        it('should bail if activities array is missing', async () => {
             manager.startTerminalPolling('123', item, 'repo');
             window.julesService.getActivities.mockResolvedValue({});
             await jest.advanceTimersByTimeAsync(3000);
             // Should not throw, interval remains
             expect(manager.julesPollingIntervals['123']).toBeDefined();
        });
    });

    describe('dismissSession', () => {
        it('should remove DOM element and clear interval', () => {
            manager.renderedSessionIds.add('123');
            manager.julesPollingIntervals['123'] = setInterval(() => {}, 1000);
            const terminal = document.getElementById('julesTerminal');
            terminal.innerHTML = '<div id="session-123"></div>';

            manager.dismissSession('123');

            expect(manager.dismissedSessionIds.has('123')).toBe(true);
            expect(manager.renderedSessionIds.has('123')).toBe(false);
            expect(manager.julesPollingIntervals['123']).toBeUndefined();
            expect(document.getElementById('session-123')).toBeNull();
        });
    });
});
