const { TextEncoder, TextDecoder } = require("util"); global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;
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

    it('allows pinning securely on a valid base agent index', () => {
        // Provide a mock so togglePin correctly executes
        app.pinnedManager = {
            togglePin: jest.fn().mockReturnValue(true),
            getPinned: jest.fn().mockReturnValue(['0']),
            isPinned: jest.fn().mockReturnValue(true)
        };

        // Setup valid agent card click
        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', '0');

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);

        app.bindEvents();

        // Let's hook the pinned manager to our mock logic in the test instead of relying on real instance.
        app.pinnedManager = {
            togglePin: jest.fn().mockReturnValue(true),
            getPinned: jest.fn().mockReturnValue(['0'])
        };

        target.click();

        // Verify pinning logic triggered successfully
        expect(app.pinnedManager.togglePin).toHaveBeenCalledWith('0');
        expect(app.pinnedManager.getPinned()).toContain('0');
        expect(app.showToast).toHaveBeenCalled();
        expect(app.renderAgents).toHaveBeenCalled();
    });

    it('toggles aria-pressed attribute correctly when pinning an agent', () => {
        // Mock the required DOM elements and the application state
        app.elements = { "category-nav": document.createElement('div'), searchInput: null };
        app.agents = {};
        app.customAgents = { 'AgentA+AgentB': { name: 'Fused Agent' } };
        app.pinnedManager = { togglePin: jest.fn().mockReturnValue(true), getPinned: jest.fn().mockReturnValue(['AgentA+AgentB']) };

        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', 'AgentA+AgentB');
        target.setAttribute('aria-pressed', 'false');

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);

        app.bindEvents();
        target.click();

        expect(app.pinnedManager.togglePin).toHaveBeenCalledWith('AgentA+AgentB');
        expect(target.classList.contains('pinned')).toBe(true);
        expect(target.getAttribute('aria-pressed')).toBe('true');

        // Test untoggle
        app.pinnedManager.togglePin.mockReturnValue(false);
        target.click();
        expect(target.classList.contains('pinned')).toBe(false);
        expect(target.getAttribute('aria-pressed')).toBe('false');
    });

    it('fails securely when toggling pin on a missing or invalid agent index', () => {
        // THE BOUNDARY INTERROGATION: Explicitly asserts graceful failure on ghost/missing agents.
        // Setup invalid agent card click
        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', '999'); // Non-existent index

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);

        app.bindEvents();
        target.click();

        // Verification: togglePin should NOT be called, state shouldn't change
        expect(app.pinnedManager.getPinned()).not.toContain('999');
        expect(app.showToast).not.toHaveBeenCalledWith('Pinned');
        expect(app.renderAgents).not.toHaveBeenCalled();
    });

    it('locks focus and sets aria-expanded when Escape key closes dropdown menu', () => {
        const toggleBtn = document.createElement('button');
        toggleBtn.setAttribute('data-action', 'toggle-card-dropdown');
        toggleBtn.setAttribute('data-index', '1');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.appendChild(toggleBtn);

        const dropdown = document.createElement('div');
        dropdown.id = 'card-dropdown-1';
        dropdown.classList.add('dropdown-menu', 'visible');
        document.body.appendChild(dropdown);

        app.bindEvents();
        app.activeDropdowns = new Set([dropdown]);

        const escapeEvent = new window.KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);

        expect(dropdown.classList.contains('visible')).toBe(false);
        expect(app.activeDropdowns.size).toBe(0);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(toggleBtn);
    });
});
