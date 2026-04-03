/**
 * @jest-environment jsdom
 */

const TerminalPolling = require('./TerminalPolling');

describe('TerminalPolling', () => {
    let polling;
    let mockManager;
    let mockBlock;

    beforeEach(() => {
        mockManager = {
            julesPollingIntervals: {},
            sortByCreateTime: jest.fn(),
            getEl: jest.fn(),
            activeModalSessionId: null,
            loadPullRequestsForRepo: jest.fn(),
            dismissSession: jest.fn(),
            currentRepo: 'test-repo',
            modals: {
                _showInteractionModal: jest.fn()
            },
            constructor: {
                TERMINAL_POLL_MS: 10,
                SUCCESS_DISMISS_DELAY_MS: 10
            }
        };

        window.julesService = {
            getActivities: jest.fn()
        };

        global.DOMUtils = {
            createMarkdownPreBlock: jest.fn().mockReturnValue(document.createElement('pre'))
        };

        global.FormatUtils = {
            escapeHTML: jest.fn(str => str)
        };

        mockBlock = document.createElement('div');
        const statusSpan = document.createElement('span');
        statusSpan.id = 'status-session123';
        mockBlock.appendChild(statusSpan);

        polling = new TerminalPolling(mockManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should handle interaction modal onclick correctly', () => {
        const state = {
            isCompleted: false,
            hasError: false,
            isWaitingForInput: true,
            latestLog: 'Processing...',
            rawMessage: 'Needs input'
        };

        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = mockBlock.querySelector('#status-session123');
        expect(statusSpan.className).toBe('term-status status-waiting');
        expect(statusSpan.onclick).not.toBeNull();

        // Simulate click
        statusSpan.onclick();
        expect(mockManager.modals._showInteractionModal).toHaveBeenCalledWith('session123', '🤖', 'AgentName', 'Needs input');
    });

    it('should format fullHistoryMarkdown correctly and handle contentEl', async () => {
        jest.useFakeTimers();

        const activities = [
            { title: 'Title', description: 'Desc', type: 'USER_INPUT', message: 'User Msg', error: { message: 'Err' } }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        mockManager.activeModalSessionId = 'session123';
        const mockContentEl = document.createElement('div');
        mockManager.getEl.mockReturnValue(mockContentEl);

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        expect(window.julesService.getActivities).toHaveBeenCalledWith('session123');
        expect(mockManager.getEl).toHaveBeenCalledWith('historyModalContent');
        expect(mockContentEl.innerHTML).toContain('<pre>'); // Contains the pre block
        expect(global.DOMUtils.createMarkdownPreBlock).toHaveBeenCalled();
    });

    it('should handle completed state', () => {
        jest.useFakeTimers();
        const state = { isCompleted: true };
        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = mockBlock.querySelector('#status-session123');
        expect(statusSpan.className).toBe('term-status status-success');
        expect(mockManager.loadPullRequestsForRepo).toHaveBeenCalledWith('test-repo');

        jest.advanceTimersByTime(10);
        expect(mockManager.dismissSession).toHaveBeenCalledWith('session123');
    });

    it('should handle hasError state', () => {
        const state = { hasError: true, latestLog: 'Error occurred' };
        mockManager.julesPollingIntervals['session123'] = 123; // mock interval ID

        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = mockBlock.querySelector('#status-session123');
        expect(statusSpan.className).toBe('term-status status-error');
        expect(statusSpan.innerHTML).toContain('Error occurred');
        expect(statusSpan.innerHTML).toContain('<button'); // dismiss button
    });

    it('should catch API errors', async () => {
        jest.useFakeTimers();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        window.julesService.getActivities.mockRejectedValue(new Error('API fail'));

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises

        expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify({ event: "JULES_POLLING_ERROR", error: 'API fail' }));
    });

    it('should handle isWaitingForInput=false correctly', () => {
        const state = { isWaitingForInput: false, latestLog: 'Processing...', hasError: false, isCompleted: false };
        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = mockBlock.querySelector('#status-session123');
        expect(statusSpan.className).toBe('term-status');
        expect(statusSpan.onclick).toBeNull();
        expect(statusSpan.textContent).toBe('Processing...');
    });

    it('should format fullHistoryMarkdown missing fields correctly', async () => {
        jest.useFakeTimers();

        const activities = [
            { type: 'USER_INPUT' },
            { userActionRequired: true }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        expect(window.julesService.getActivities).toHaveBeenCalledWith('session123');
    });

    it('should handle activities polling early returns', async () => {
        jest.useFakeTimers();

        window.julesService.getActivities.mockResolvedValue({});

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises

        expect(window.julesService.getActivities).toHaveBeenCalledWith('session123');
    });

    it('should handle missing statusSpan', () => {
        const state = { isCompleted: true };
        const emptyBlock = document.createElement('div');
        polling._updatePollingState('session123', emptyBlock, state, 'AgentName', '🤖');
        // No crash
    });

    it('should handle _updatePollingState for planGenerated and others', async () => {
        jest.useFakeTimers();

        const activities = [
            { planGenerated: true },
            { planApproved: true },
            { sessionCompleted: true },
            { title: 'waiting for something' },
            { requiresInput: true },
            { type: 'INPUT' }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        expect(window.julesService.getActivities).toHaveBeenCalledWith('session123');
    });

    it('should clear existing interval on startTerminalPolling', () => {
        mockManager.julesPollingIntervals['session123'] = 999;
        const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        expect(clearIntervalSpy).toHaveBeenCalledWith(999);
    });

    it('should handle uninitialized julesPollingIntervals', () => {
        mockManager.julesPollingIntervals = null;
        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');
        expect(mockManager.julesPollingIntervals['session123']).toBeDefined();
    });

    it('should format empty history and pass "No history available." to createMarkdownPreBlock', async () => {
        jest.useFakeTimers();

        const activities = [];
        window.julesService.getActivities.mockResolvedValue({ activities });

        mockManager.activeModalSessionId = 'session123';
        const mockContentEl = document.createElement('div');
        mockManager.getEl.mockReturnValue(mockContentEl);

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        expect(global.DOMUtils.createMarkdownPreBlock).toHaveBeenCalledWith('No history available.');
    });

    it('should handle error missing message with Unknown error', async () => {
        jest.useFakeTimers();

        const activities = [
            { error: { } }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        const statusSpan = mockBlock.querySelector('#status-session123');
        expect(statusSpan.innerHTML).toContain('Exception: Unknown error');
    });

    it('should format long text and handle missing historyModalContent element', async () => {
        jest.useFakeTimers();

        const activities = [
            { title: 'A very very long title that exceeds seventy characters in length and will be truncated' },
            { error: { } }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        mockManager.activeModalSessionId = 'session123';
        mockManager.getEl.mockReturnValue(null); // contentEl missing

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        expect(window.julesService.getActivities).toHaveBeenCalledWith('session123');
        expect(mockManager.getEl).toHaveBeenCalledWith('historyModalContent');
    });
});
