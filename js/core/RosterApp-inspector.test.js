/**
 * @jest-environment jsdom
 */

const RosterApp = require('./RosterApp');
const GlobalEvents = require('./events/handlers/GlobalEvents');
const DOMUtils = require('../Utils/dom/dom-utils');

describe('RosterApp Inspector Adjustments', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = '';

        // Mock global dependencies
        global.DOMUtils = DOMUtils;
        global.FormatUtils = { extractDisplayName: jest.fn(), escapeRegex: jest.fn() };
        global.ClipboardUtils = { copyToClipboard: jest.fn() };
        global.PromptParser = { parsePrompt: jest.fn() };
        global.AgentUtils = { getPromptUrl: jest.fn(), getCustomAgent: jest.fn() };
        global.PerformanceUtils = { debounce: fn => fn };
        global.StorageUtils = { getItem: jest.fn(), setItem: jest.fn() };
        global.JulesAPI = class {};
        global.GithubAPI = class {};
        global.AgentRepository = class { fetchPrompt() {} };
        global.ToastNotification = class { show() {} };
        global.PinnedManager = class { togglePin() { return true; } getPinned() { return []; } };
        global.CONFIG = { selectors: { toast: '#toast' } };
        global.JulesTerminal = class { loadSources() {} loadActiveSessionsForRepo() {} loadPullRequestsForRepo() {} };
        global.SearchController = class {};
        global.ExportController = class {};

        app = new RosterApp();
    });

    describe('GlobalEvents', () => {
        it('should correctly handle toggle-card-dropdown clicks across the Click Matrix', () => {
            app.elements = { "category-nav": document.createElement('div'), searchInput: null };
            app.agents = [];
            app.customAgents = {};
            app.activeDropdowns = new Set();

            GlobalEvents.bind(app);

            // Construct mock DOM
            const toggleBtn = document.createElement('button');
            toggleBtn.setAttribute('data-action', 'toggle-card-dropdown');
            toggleBtn.setAttribute('data-index', '1');
            document.body.appendChild(toggleBtn);

            const dropdownMenu1 = document.createElement('div');
            dropdownMenu1.id = 'card-dropdown-1';
            document.body.appendChild(dropdownMenu1);

            const dropdownMenu2 = document.createElement('div');
            dropdownMenu2.id = 'card-dropdown-2';
            document.body.appendChild(dropdownMenu2);

            app.activeDropdowns.add(dropdownMenu2);

            // Fire click event
            toggleBtn.click();

            expect(dropdownMenu1.classList.contains('visible')).toBe(true);
            expect(app.activeDropdowns.has(dropdownMenu1)).toBe(true);
            expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

            // Fire click event again to toggle off
            toggleBtn.click();

            expect(dropdownMenu1.classList.contains('visible')).toBe(false);
            expect(app.activeDropdowns.has(dropdownMenu1)).toBe(false);
            expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
        });

        it('allows pinning securely on a valid base agent index', () => {
             app.elements = { "category-nav": document.createElement('div'), searchInput: null };
             app.agents = { '0': { name: 'Test Agent' } };
             app.customAgents = {};
             app.activeDropdowns = new Set();
             app.getAgentForUI = jest.fn().mockReturnValue({ name: 'Test Agent' });
             app.renderAgents = jest.fn();
             app.showToast = jest.fn();
             app.pinnedManager.getPinned = jest.fn().mockReturnValue(['0']);

             GlobalEvents.bind(app);

             const target = document.createElement('button');
             target.setAttribute('data-action', 'toggle-pin');
             target.setAttribute('data-index', '0');

             const card = document.createElement('div');
             card.classList.add('flip-card');
             card.appendChild(target);
             document.body.appendChild(card);

             target.click();

             expect(app.pinnedManager.getPinned()).toContain('0');
             expect(app.renderAgents).toHaveBeenCalled();
             expect(app.showToast).toHaveBeenCalled();
        });

        it('toggles aria-pressed attribute correctly when pinning an agent', () => {
            app.elements = { "category-nav": document.createElement('div'), searchInput: null };
            app.agents = {};
            app.customAgents = { 'AgentA+AgentB': { name: 'Fused Agent' } };
            app.pinnedManager = { togglePin: jest.fn().mockReturnValue(true), getPinned: jest.fn().mockReturnValue(['AgentA+AgentB']) };
            app.getAgentForUI = jest.fn().mockReturnValue({ name: 'Fused Agent' });
            app.renderAgents = jest.fn();
            app.showToast = jest.fn();

            GlobalEvents.bind(app);

            const target = document.createElement('button');
            target.setAttribute('data-action', 'toggle-pin');
            target.setAttribute('data-index', 'AgentA+AgentB');
            target.setAttribute('aria-pressed', 'false');

            const card = document.createElement('div');
            card.classList.add('flip-card');
            card.appendChild(target);
            document.body.appendChild(card);

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

        it('locks focus and sets aria-expanded when Escape key closes dropdown menu', () => {
             app.elements = { "category-nav": document.createElement('div'), searchInput: null };
             app.activeDropdowns = new Set();

             GlobalEvents.bind(app);

             const toggleBtn = document.createElement('button');
             toggleBtn.setAttribute('data-action', 'toggle-card-dropdown');
             toggleBtn.setAttribute('data-index', '1');
             toggleBtn.setAttribute('aria-expanded', 'true');
             document.body.appendChild(toggleBtn);

             const dropdown = document.createElement('div');
             dropdown.id = 'card-dropdown-1';
             dropdown.classList.add('dropdown-menu', 'visible');
             document.body.appendChild(dropdown);
             app.activeDropdowns.add(dropdown);

             const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
             document.dispatchEvent(escapeEvent);

             expect(dropdown.classList.contains('visible')).toBe(false);
             expect(app.activeDropdowns.size).toBe(0);
             expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
             expect(document.activeElement).toBe(toggleBtn);
        });
    });
});
