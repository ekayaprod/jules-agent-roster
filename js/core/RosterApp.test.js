const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read the actual FormatUtils, AgentUtils, and PinnedManager
const FormatUtils = require('../Utils/format-utils');
const AgentUtils = require('../Utils/agent-utils');
const PinnedManager = require('../Features/Pinned/PinnedManager');

describe('RosterApp (Boundary Interrogation)', () => {
    let app;
    let dom;

    beforeEach(() => {
        // Mock DOM Environment
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="toast"></div><div id="masterDropdownMenu"></div></body></html>', { url: "http://localhost/" });
        global.window = dom.window;
        global.document = dom.window.document;
        global.Event = dom.window.Event;
        global.requestAnimationFrame = (cb) => cb();

        // Mock Storage and Dependencies
        global.StorageUtils = {
            getJsonArrayItem: jest.fn().mockReturnValue([]),
            setJsonItem: jest.fn()
        };

        global.FormatUtils = FormatUtils;
        global.AgentUtils = AgentUtils;
        global.PerformanceUtils = { debounce: (f) => f };

        global.CONFIG = { selectors: { toast: '#toast' }, cache: { rosterCacheTTL: 0 } };

        global.ToastNotification = class { show() {} };
        global.JulesManager = class { init() {} };
        global.SearchController = class { init() {} };
        global.ExportController = class { init() {} };
        global.AgentRepository = class { async fetchWithRetry() { return []; } async initialize() { return true; } };
        global.PinnedManager = PinnedManager;

        // Mock module export for test environment injection
        const RosterApp = require('./RosterApp');

        app = new RosterApp();
        app.renderAgents = jest.fn();
        app.showToast = jest.fn();
        app.filterAgents = jest.fn();
        app.elements = { searchInput: document.createElement('input') };
        global.CSS = { escape: (str) => str };
        dom.window.CSS = global.CSS;

        // Initialize state
        app.agents = [
            { name: 'ActiveAgent0', category: 'strategy' },
            { name: 'ActiveAgent1', category: 'strategy' }
        ];
        app.customAgents = {};
        app.fusionLab = { compiler: { customAgentsMap: {} } };
        app.bindEvents();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('toggles pin securely on a valid agent index', () => {
        // Setup valid agent card click
        const evt = new dom.window.Event('click', { bubbles: true });
        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', '0');

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);
        Object.defineProperty(evt, 'target', { value: target, writable: false });

        document.dispatchEvent(evt);

        // Verify pinning logic triggered successfully
        expect(app.pinnedManager.getPinned()).toContain('0');
        expect(app.showToast).toHaveBeenCalledWith('Pinned');
        expect(app.renderAgents).toHaveBeenCalled();
    });

    it('fails securely when toggling pin on a missing or invalid agent index', () => {
        // THE BOUNDARY INTERROGATION: Explicitly asserts graceful failure on ghost/missing agents.
        // Setup invalid agent card click
        const evt = new dom.window.Event('click', { bubbles: true });
        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', '999'); // Non-existent index

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);
        Object.defineProperty(evt, 'target', { value: target, writable: false });

        document.dispatchEvent(evt);

        // Verification: togglePin should NOT be called, state shouldn't change
        expect(app.pinnedManager.getPinned()).not.toContain('999');
        expect(app.showToast).not.toHaveBeenCalledWith('Pinned');
        expect(app.renderAgents).not.toHaveBeenCalled();
    });
});
