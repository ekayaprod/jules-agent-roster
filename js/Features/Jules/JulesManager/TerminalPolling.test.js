/**
 * @jest-environment jsdom
 */

const TerminalPolling = require('./TerminalPolling');
const { getByText } = require('@testing-library/dom');
const userEvent = require('@testing-library/user-event').default;

describe('TerminalPolling', () => {
    let polling;
    let mockManager;
    let mockBlock;
    let user;

    beforeEach(() => {
        jest.useFakeTimers();
        user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
        statusSpan.id = 'status-mutated-session123';
        mockBlock.appendChild(statusSpan);

        polling = new TerminalPolling(mockManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should handle interaction modal onclick correctly', async () => {
        const state = {
            isCompleted: false,
            hasError: false,
            isWaitingForInput: true,
            latestLog: 'Processing...',
            rawMessage: 'Needs input'
        };

        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = getByText(mockBlock, /Response Needed/i);
        expect(statusSpan.className).toBe('term-status status-waiting');

        await user.click(statusSpan);
        expect(mockManager.modals._showInteractionModal).toHaveBeenCalledWith('session123', '🤖', 'AgentName', 'Needs input');
    });

    it('should format fullHistoryMarkdown correctly and handle contentEl', async () => {
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
        const originalClearInterval = global.clearInterval;
        global.clearInterval = jest.fn();
        mockManager.julesPollingIntervals['session123'] = 999;

        const state = { isCompleted: true };
        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = getByText(mockBlock, /Execution Finished/i);
        expect(statusSpan.className).toBe('term-status status-success');
        expect(global.clearInterval).toHaveBeenCalledWith(999);
        expect(mockManager.loadPullRequestsForRepo).toHaveBeenCalledWith('test-repo');

        global.clearInterval = originalClearInterval;

        jest.advanceTimersByTime(10);
        expect(mockManager.dismissSession).toHaveBeenCalledWith('session123');
    });

    it('should handle hasError state', () => {
        const originalClearInterval = global.clearInterval;
        global.clearInterval = jest.fn();
        const state = { hasError: true, latestLog: 'Error occurred' };
        mockManager.julesPollingIntervals['session123'] = 123; // mock interval ID

        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = getByText(mockBlock, /Error occurred/i);
        expect(statusSpan.className).toBe('term-status status-error');
        expect(statusSpan.innerHTML).toContain('<button'); // dismiss button
        expect(global.clearInterval).toHaveBeenCalledWith(123);

        global.clearInterval = originalClearInterval;
    });

    it('should catch API errors', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        window.julesService.getActivities.mockRejectedValue(new Error('API fail'));

        const TelemetryUtils = require('../../../Utils/telemetry-utils.js');
        const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises

        expect(dispatchSpy).toHaveBeenCalledWith("JULES_POLLING_ERROR", expect.any(Error));
        dispatchSpy.mockRestore();
    });

    it('should handle isWaitingForInput=false correctly', () => {
        const state = { isWaitingForInput: false, latestLog: 'Processing...', hasError: false, isCompleted: false };
        polling._updatePollingState('session123', mockBlock, state, 'AgentName', '🤖');

        const statusSpan = getByText(mockBlock, /Processing.../i);
        expect(statusSpan.className).toBe('term-status');
        expect(statusSpan.onclick).toBeNull();
    });

    it('should format fullHistoryMarkdown missing fields correctly', async () => {
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
        const originalClearInterval = global.clearInterval;
        global.clearInterval = jest.fn();

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        expect(global.clearInterval).toHaveBeenCalledWith(999);
        global.clearInterval = originalClearInterval;
    });

    it('should handle uninitialized julesPollingIntervals', () => {
        mockManager.julesPollingIntervals = null;
        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');
        expect(mockManager.julesPollingIntervals).toHaveProperty('session123');
    });

    it('should format empty history and pass "No history available." to createMarkdownPreBlock', async () => {
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
        const activities = [
            { error: { } }
        ];
        window.julesService.getActivities.mockResolvedValue({ activities });

        polling.startTerminalPolling('session123', mockBlock, 'Agent', '🤖');

        jest.advanceTimersByTime(10);
        await Promise.resolve(); // flush promises
        await Promise.resolve();

        const statusSpan = getByText(mockBlock, /Exception: Unknown error/i);
        expect(statusSpan).not.toBeNull();
    });

    it('should format long text and handle missing historyModalContent element', async () => {
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
