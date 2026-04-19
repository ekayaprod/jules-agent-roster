const { TextEncoder, TextDecoder } = require("util"); global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;

const fs = require('fs');
const path = require('path');

// Read the actual FormatUtils, AgentUtils, and PinnedManager
const FormatUtils = require('../Utils/format-utils');
const AgentUtils = require('../Utils/agent-utils');
const PinnedManager = require('../Features/Pinned/PinnedManager');

describe('RosterApp (Boundary Interrogation)', () => {
    let app;
    let dom;

    beforeAll(() => {
        global.DOMUtils = require('../Utils/dom-utils');
        global.EventBinder = require('./events/EventBinder');
    });

    beforeEach(() => {
        // Mock DOM Environment


        document.body.innerHTML = '<div id="toast"></div><div id="masterDropdownMenu"></div>';

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
        global.SEARCH_DEBOUNCE_MS = 300;
        global.PinnedManager = PinnedManager;

        // Mock module export for test environment injection
        const RosterApp = require('./RosterApp');

        app = new RosterApp();
        app.renderAgents = jest.fn();
        app.showToast = jest.fn();
        app.filterAgents = jest.fn();
        app.elements = { searchInput: document.createElement('input') };
        global.CSS = { escape: (str) => str };
        window.CSS = global.CSS;

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
        // Setup valid agent card click
        const target = document.createElement('button');
        target.setAttribute('data-action', 'toggle-pin');
        target.setAttribute('data-index', '0');

        const card = document.createElement('div');
        card.classList.add('flip-card');
        card.appendChild(target);
        document.body.appendChild(card);

        target.click();

        // Verify pinning logic triggered successfully
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

    /**
     * Enforces the Phantom Agent Doctrine:
     * A user cannot pin an agent index that does not exist in the active or custom matrix.
     * @mock {target} - Simulates an interaction event targeting index "999" (out of bounds).
     * @expected {false} - Triggers graceful failure paths resulting in a false state and skipped rendering without throwing application-halting exceptions.
     */
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

    it('correctly retrieves agents via getAgentForUI across multiple contexts', () => {
        // Setup complex fusionLab mock state
        app.fusionLab = {
            compiler: {
                customAgentsMap: { 'AgentA,AgentB': { name: 'Mapped Fusion Agent' } },
                fuse: jest.fn().mockReturnValue({ name: 'Dynamically Fused Agent' })
            },
            lastFusionResult: { name: 'Last Fusion Result' },
            fusionIndex: {
                isUnlocked: jest.fn().mockImplementation(key => key === 'AgentA,AgentC')
            },
            agentMap: new Map([
                ['AgentA', { name: 'Base A' }],
                ['AgentC', { name: 'Base C' }]
            ])
        };

        // 1. Base Agent
        expect(app.getAgentForUI(0)).toEqual({ name: 'ActiveAgent0', category: 'strategy' });

        // 2. Custom Agent via AgentUtils.getCustomAgent (requires exact structure or fallback to compiler map)
        expect(app.getAgentForUI('AgentA,AgentB')).toEqual({ name: 'Mapped Fusion Agent' });

        // 3. Last Fusion Result
        expect(app.getAgentForUI('fusion-result')).toEqual({ name: 'Last Fusion Result' });

        // 4. Dynamically Fused Agent
        expect(app.getAgentForUI('AgentA,AgentC')).toEqual({ name: 'Dynamically Fused Agent' });
        expect(app.fusionLab.compiler.fuse).toHaveBeenCalledWith({ name: 'Base A' }, { name: 'Base C' });

        // 5. Unresolvable / Missing Agent
        expect(app.getAgentForUI('MissingAgent')).toBeUndefined();
    });

    it('gracefully degrades when delegating to uninitialized controllers', async () => {
        // Explicitly set controllers to undefined to simulate missing dependencies
        app.searchController = undefined;
        app.exportController = undefined;

        const btn = document.createElement('button');

        // Verify async delegators return without throwing
        expect(await app.filterAgents('query')).toBeUndefined();
        expect(await app.clearSearch()).toBeUndefined();
        expect(await app.copyAgent('0', btn)).toBeUndefined();
        expect(await app.downloadAgent('0', btn)).toBeUndefined();
        expect(await app.copyAll(btn)).toBeUndefined();

        // Verify sync delegators return without throwing
        expect(() => app.downloadCustomAgents(btn)).not.toThrow();
        expect(() => app.downloadAll(btn)).not.toThrow();
    });

    it('gracefully handles missing DOM targets during observer initialization', () => {
        // Interrogate intersection observer boundaries
        const originalObserver = global.IntersectionObserver;
        global.IntersectionObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            disconnect: jest.fn()
        }));

        const existingObserver = { disconnect: jest.fn() };
        app.observer = existingObserver;
        app.elements = { navPills: [] };

        // Test with empty references where CONFIG.sectionMap points to nothing
        app.categoryLookup = {};
        app.categoryElements = {};

        expect(() => app.initObserver()).not.toThrow();
        expect(existingObserver.disconnect).toHaveBeenCalled();
        expect(global.IntersectionObserver).toHaveBeenCalled();

        // Restore global
        global.IntersectionObserver = originalObserver;
    });
});
