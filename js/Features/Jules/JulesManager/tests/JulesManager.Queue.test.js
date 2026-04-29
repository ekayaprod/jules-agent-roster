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

describe('JulesManager Queue Execution', () => {
    let app, api, julesTerminal, julesManager;
    let originalFormatUtils, originalWindow, originalRequire;

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
        jest.useRealTimers();
    });

    it('launchSession unblocks async queue correctly', async () => {
        const agent = { name: 'Inspector' };
        const btn = document.createElement('button');

        julesManager._fetchAndRenderSessions = jest.fn().mockResolvedValue();
        julesManager._createAndInsertSessionBlock = jest.fn().mockReturnValue({ parentNode: document.createElement('div'), remove: jest.fn() });

        const _processSessionQueueSpy = jest.spyOn(julesManager, '_processSessionQueue');
        await julesManager.launchSession(agent, btn);

        expect(_processSessionQueueSpy).toHaveBeenCalled();
    });

    it('should queue and process correctly', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        julesManager.sessionQueue.push(async () => { throw new Error('Queue Error') });
        await julesManager._processSessionQueue();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Queue execution error:", expect.any(Error));
    });

    it('should wait 1000ms if items remain in queue', async () => {
        jest.useFakeTimers();
        let counter = 0;

        julesManager.sessionQueue.push(async () => { counter++; });
        julesManager.sessionQueue.push(async () => { counter++; });

        const promise = julesManager._processSessionQueue();

        await Promise.resolve();

        expect(counter).toBe(1);

        jest.advanceTimersByTime(1000);
        for(let i=0; i<10; i++) await Promise.resolve();

        expect(counter).toBe(2);

        await promise;
        jest.useRealTimers();
    });
});