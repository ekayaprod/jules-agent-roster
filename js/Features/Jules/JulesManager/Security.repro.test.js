/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const { BUTTON_STATES, TOAST_TYPES } = require('../../../constants/ui');
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;
const JulesManager = require('./index');
global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;

// Mock utilities
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse" style="color: var(--term-muted);">[SYS] ${msg}</div>`),
    getTerminalSessionHTML: jest.fn().mockImplementation((emoji, name, status, id) => `
            <span class="term-agent-name">${emoji} ${name}</span>
            <span class="term-separator">—</span>
            <span class="term-status"${id ? ` id="${id}"` : ''}>${status}</span>
        `),
};

// We want to test if it's NOT using escapeHTML correctly, but the real FormatUtils has it.
// To reproduce the failure, we can either use the real FormatUtils (if it's not being called)
// or mock it and see if it's called.
// Actually, the vulnerable code in the prompt says:
// block.innerHTML = `
//     <span class="term-agent-name">${agentEmoji} ${safeAgentName}</span>
// `;
// If we use the REAL FormatUtils, it DOES have escapeHTML.
// If the code DOES NOT call FormatUtils.escapeHTML(agentEmoji), it will be injected raw.

const FormatUtils = require('../../../Utils/format-utils.js');
global.FormatUtils = FormatUtils;

describe('JulesManager Security Repro', () => {
    let manager;
    let mockApp;

    beforeEach(() => {
        mockApp = {
            toast: { show: jest.fn() },
            agents: [],
            customAgents: {}
        };

        document.body.innerHTML = `
            <select id="julesRepoPicker"></select>
            <div id="julesTerminal"></div>
            <input id="julesTaskInput" />
            <div id="julesRunnerPanel"></div>
        `;

        global.window.julesService = {
            getSessions: jest.fn(),
            createSession: jest.fn(),
        };

        manager = new JulesManager(mockApp);
    });

    it('vulnerability in _processSession: agentEmoji is not escaped', () => {
        const terminal = document.getElementById('julesTerminal');
        const maliciousEmoji = '<img src=x onerror=alert(1)>';

        // Mock agent with malicious emoji
        mockApp.agents = [{ name: 'MaliciousAgent', emoji: maliciousEmoji }];

        const session = {
            id: 's1',
            title: 'MaliciousAgent',
            sourceContext: { source: 'repo' }
        };

        manager._processSession(session, terminal);

        const agentNameSpan = terminal.querySelector('.term-agent-name');
        // If it's vulnerable, the innerHTML will contain the raw <img> tag
        // If it's fixed, it will contain the escaped string &lt;img...
        expect(agentNameSpan.innerHTML).not.toContain(maliciousEmoji);
        expect(agentNameSpan.innerHTML).toContain(FormatUtils.escapeHTML(maliciousEmoji));
    });

    it('vulnerability in launchSession: agentEmoji is not escaped', async () => {
        const terminal = document.getElementById('julesTerminal');
        const maliciousEmoji = '<img src=x onerror=alert(2)>';

        document.getElementById('julesRepoPicker').innerHTML = '<option value="repo">repo</option>';
        document.getElementById('julesRepoPicker').value = 'repo';

        const agent = {
            name: 'MaliciousAgent',
            emoji: maliciousEmoji,
            prompt: 'test'
        };

        await manager.launchSession(agent);

        const optimisticBlock = terminal.querySelector('.term-session-line');
        const agentNameSpan = optimisticBlock.querySelector('.term-agent-name');

        expect(agentNameSpan.innerHTML).not.toContain(maliciousEmoji);
        expect(agentNameSpan.innerHTML).toContain(FormatUtils.escapeHTML(maliciousEmoji));
    });
});
