const RosterApp = require('./RosterApp');

describe('RosterApp init error handling', () => {
    let originalDocument;

    beforeAll(() => {
        originalDocument = global.document;
        global.AgentRepository = class { async fetchWithRetry() { return []; } async initialize() { return true; } };
        global.ToastNotification = class { show() {} };
        global.PinnedManager = class { isPinned() {} getPinned() { return []; } };
        global.JulesTerminal = class { async initialize() { return true; } };
        global.SearchController = class { init() {} filterAgents() {} clearSearch() {} };
        global.ExportController = class { copyAgent() {} downloadAgent() {} downloadCustomAgents() {} downloadAll() {} copyAll() {} };
        global.JulesAPI = class {};
        global.GithubAPI = class {};
        global.EventBinder = { bind: jest.fn() };
        global.AgentCard = { create: jest.fn() };
        global.FusionLab = class { renderUnlockedAgents() {} bindEvents() {} init() {} };
        global.AgentUtils = { sortAgents: jest.fn((agents) => agents), getCustomAgent: () => undefined, splitFusionKey: () => ['A', 'B'] };
        global.DOMUtils = { createSkeletonElement: jest.fn().mockReturnValue(document.createElement('div')) };
        global.window = { matchMedia: jest.fn() };
        global.CONFIG = {
            selectors: {
                main: '#main',
                toast: '#toast',
                categoryNav: '#category-nav'
            },
            categories: {
                test: 'test-grid'
            },
            sectionMap: { 'test-grid': 'test' }
        };
        global.EmptyState = { create: jest.fn().mockReturnValue(document.createElement('div')), ICONS: { ERROR: 'error' } };
    });

    afterAll(() => {
        global.document = originalDocument;
        delete global.window;
    });

    it('covers init catch block with JSON error via Promise.all override', async () => {
        const app = new RosterApp();
        app.elements = { main: document.createElement('div') };
        app.agentRepo = { fetchAgents: jest.fn().mockReturnValue(Promise.resolve()) };
        app.julesTerminal = { init: jest.fn().mockReturnValue(Promise.resolve()) };
        app.categoryKeys = [];
        app.agents = [];

        app.renderAgents = jest.fn();
        app.bindEvents = jest.fn();
        app.initObserver = jest.fn();
        app.renderSkeletons = jest.fn();
        app.cacheElements = jest.fn();

        const originalAll = Promise.all;
        try {
            Promise.all = jest.fn().mockRejectedValue(new Error('JSON parse error'));
            await app.init();

            expect(global.EmptyState.create).toHaveBeenCalledWith(expect.objectContaining({
                description: "Check your configuration file formatting and try again."
            }));
        } finally {
            Promise.all = originalAll;
        }
    });

    it('covers init catch block with network error via Promise.all override', async () => {
        const app = new RosterApp();
        app.elements = { main: document.createElement('div') };
        app.agentRepo = { fetchAgents: jest.fn().mockReturnValue(Promise.resolve()) };
        app.julesTerminal = { init: jest.fn().mockReturnValue(Promise.resolve()) };
        app.categoryKeys = [];
        app.agents = [];

        app.renderAgents = jest.fn();
        app.bindEvents = jest.fn();
        app.initObserver = jest.fn();
        app.renderSkeletons = jest.fn();
        app.cacheElements = jest.fn();

        const originalAll = Promise.all;
        try {
            Promise.all = jest.fn().mockRejectedValue(new Error('Network disconnected'));
            await app.init();

            expect(global.EmptyState.create).toHaveBeenCalledWith(expect.objectContaining({
                description: "Check your internet connection and refresh the page."
            }));
        } finally {
            Promise.all = originalAll;
        }
    });

    it('covers getAgentForUI unknown input', () => {
        const app = new RosterApp();
        app.agents = [{name: 'A'}];
        app.customAgents = { 'custom': { name: 'C' } };
        app.fusionLab = { compiler: { customAgentsMap: {} }, fusionIndex: { getAgent: jest.fn().mockReturnValue(null), isUnlocked: () => false } };

        expect(app.getAgentForUI('unknown')).toBeUndefined();
    });

    it('covers filterAgents and clearSearch', async () => {
        const app = new RosterApp();
        app.searchController = {
            filterAgents: jest.fn(),
            clearSearch: jest.fn()
        };

        await app.filterAgents('test');
        expect(app.searchController.filterAgents).toHaveBeenCalledWith('test');

        await app.clearSearch();
        expect(app.searchController.clearSearch).toHaveBeenCalled();
    });

    it('covers copyAgent, downloadAgent, downloadCustomAgents, downloadAll, copyAll', async () => {
        const app = new RosterApp();
        app.exportController = {
            copyAgent: jest.fn(),
            downloadAgent: jest.fn(),
            downloadCustomAgents: jest.fn(),
            downloadAll: jest.fn(),
            copyAll: jest.fn()
        };
        const btn = document.createElement('button');

        await app.copyAgent(1, btn);
        expect(app.exportController.copyAgent).toHaveBeenCalledWith(1, btn);

        await app.downloadAgent(1, btn);
        expect(app.exportController.downloadAgent).toHaveBeenCalledWith(1, btn);

        app.downloadCustomAgents(btn);
        expect(app.exportController.downloadCustomAgents).toHaveBeenCalledWith(btn);

        app.downloadAll(btn);
        expect(app.exportController.downloadAll).toHaveBeenCalledWith(btn);

        await app.copyAll(btn);
        expect(app.exportController.copyAll).toHaveBeenCalledWith(btn);
    });

    it('covers showToast', () => {
        const app = new RosterApp();
        app.toast = { show: jest.fn() };
        app.showToast('Test');
        expect(app.toast.show).toHaveBeenCalledWith('Test');
    });
});
