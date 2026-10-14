/**
 * @jest-environment jsdom
 */

const PinnedManager = require('../Features/Pinned/PinnedManager');

// Setup globals before requiring RosterApp
global.CONFIG = {
    selectors: {
        toast: '#toast'
    }
};

global.AgentRepository = class AgentRepository {
    fetchAgents() {
        return Promise.resolve({ agents: [], customAgents: {}, fusionMatrix: {} });
    }
};

global.ToastNotification = class ToastNotification {
    show() {}
};

global.GlobalErrorBoundary = class GlobalErrorBoundary {
    attach() {}
};

global.JulesTerminal = class JulesTerminal {
    init() { return Promise.resolve(); }
};

global.JulesAPI = class JulesAPI {};
global.GithubAPI = class GithubAPI {};
global.SingularityBespokeBuilder = class SingularityBespokeBuilder {
    init() { return Promise.resolve(); }
};

global.AgentPicker = class AgentPicker {
    init() {}
};

global.FusionLab = class FusionLab {
    init() {}
};

global.SearchController = class SearchController {
    init() {}
};

global.ExportController = class ExportController {
    init() {}
};

global.PinnedManager = PinnedManager;
global.StorageUtils = {
    load: jest.fn(),
    save: jest.fn(),
    getJsonArrayItem: jest.fn().mockReturnValue([])
};

global.DOMUtils = {
    createSkeletonElement: jest.fn()
};

const RosterApp = require('./RosterApp');

describe('RosterApp Inspector Polygraph', () => {
    let app;

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        app = new RosterApp();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 🕵️ THE INTERROGATION: Assert failure on synchronous rejection before the try...catch block
    it('should throw an unhandled error when cacheElements fails synchronously during init', async () => {
        app.cacheElements = jest.fn(() => {
            throw new Error('cacheElements catastrophic failure');
        });

        // Mathematically prove that the sync error isn't caught by the async init promise or internal catch block
        await expect(app.init()).rejects.toThrow('cacheElements catastrophic failure');
    });
});
