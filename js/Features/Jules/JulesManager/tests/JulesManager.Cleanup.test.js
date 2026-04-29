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

const JulesManager = require('../JulesManager.js');

describe('JulesManager Cleanup Coverage', () => {
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

    it('should clear dismissedSessionIds on cleanup (line 623)', () => {
        julesManager.dismissedSessionIds = new Set([1, 2]);
        const clearSpy = jest.spyOn(julesManager.dismissedSessionIds, 'clear');

        julesManager.cleanup();

        expect(clearSpy).toHaveBeenCalled();
    });

    it('should clear polling intervals in _clearPollingAndCache (line 631)', () => {
        julesManager.julesPollingIntervals = {
             'key1': setInterval(() => {}, 10000)
        };
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

        julesManager._clearPollingAndCache();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should clear activeSessionsTimeout on cleanup (line 619)', () => {
        jest.useFakeTimers();
        julesManager.activeSessionsTimeout = setTimeout(() => {}, 10000);
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

        julesManager.cleanup();

        expect(clearTimeoutSpy).toHaveBeenCalledWith(expect.any(Number));
        expect(julesManager.activeSessionsTimeout).toBeNull();
        jest.useRealTimers();
    });
});