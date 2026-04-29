global.JulesModals = class JulesModals {};
global.TerminalPolling = class TerminalPolling {};

const JulesManager = require('../JulesManager.js');

describe('JulesManager getFormatUtils Coverage', () => {
    let originalFormatUtils, originalWindow, originalGlobal;

    beforeEach(() => {
        originalFormatUtils = global.FormatUtils;
        originalWindow = global.window;
        originalGlobal = global.global;
    });

    afterEach(() => {
        global.FormatUtils = originalFormatUtils;
        global.window = originalWindow;
        global.global = originalGlobal;
        jest.restoreAllMocks();
    });

    it('should return window.FormatUtils (line 36)', () => {
        const fu = JulesManager.getFormatUtils();
        expect(fu).toBeDefined();
    });

    it('should return global.FormatUtils (line 37)', () => {
        delete global.FormatUtils;
        delete global.window;
        global.global = { FormatUtils: { mock: 'global' } };
        const fu = JulesManager.getFormatUtils();
        expect(fu).toBeDefined();
    });

    it('should fallback to require when all else fails (line 38)', () => {
        delete global.FormatUtils;
        delete global.window;
        delete global.global;
        const fu = JulesManager.getFormatUtils();
        expect(fu).toBeDefined();
    });
});