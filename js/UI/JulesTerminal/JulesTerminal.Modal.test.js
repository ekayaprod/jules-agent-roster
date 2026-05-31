/**
 * @jest-environment jsdom
 */

const { BUTTON_STATES, TOAST_TYPES } = require('../../constants/ui');
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;
const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const JulesTerminal = require('./JulesTerminal');
global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;

// Mock utilities
global.StorageUtils = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

global.DOMUtils = {
    setButtonState: jest.fn(),
    getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse term-muted-text">[SYS] ${msg}</div>`),
    getTerminalSessionHTML: jest.fn().mockImplementation((emoji, name, status, id) => `
            <span class="term-agent-name">${emoji} ${name}</span>
            <span class="term-separator">—</span>
            <span class="term-status"${id ? ` id="${id}"` : ''}>${status}</span>
        `),
    createMarkdownPreBlock: jest.fn().mockImplementation((text) => {
        const pre = document.createElement('pre');
        pre.textContent = text;
        return pre;
    })
};

global.FormatUtils = {
    escapeRegex: jest.fn().mockImplementation((str) => str),
    escapeHTML: jest.fn().mockImplementation((str) => str),
    extractRepoPath: jest.fn().mockImplementation((sourceName) => sourceName ? sourceName.replace('sources/github/', '') : '')
};

describe('JulesTerminal Modal Tests', () => {
    let julesTerminal;
    let mockApp;
    let mockToast;

    beforeEach(() => {
        jest.useFakeTimers();

        mockToast = {
            show: jest.fn()
        };

        mockApp = {
            toast: mockToast,
            agents: [{ name: 'TestAgent', emoji: '🤖' }],
            customAgents: { 'custom': { name: 'CustomAgent', emoji: '🔥' } }
        };

        // DOM setup
        document.body.innerHTML = `
            <div id="settingsModal"></div>
            <button id="openSettingsBtn"></button>
            <button id="closeSettingsBtn"></button>
            <button id="saveSettingsBtn"></button>
            <input id="julesApiKeyInput" />
            <span id="julesApiKeyError"></span>
            <select id="julesRepoPicker"></select>
            <div id="julesTerminal"></div>
            <div id="julesRunnerPanel"></div>
            <input id="julesTaskInput" />
        `;


    global.window.githubAPI = {
        getPullRequests: jest.fn().mockResolvedValue([]),
        getPullRequest: jest.fn(),
        mergePullRequest: jest.fn(),
        closePullRequest: jest.fn()
    };
    global.window.julesAPI = {
            configure: jest.fn(),
            getSources: jest.fn(),
            getSessions: jest.fn().mockResolvedValue({ sessions: [] }),
            createSession: jest.fn(),
            getActivities: jest.fn()
        };

        julesTerminal = new JulesTerminal(mockApp);
    });

    afterEach(() => {
        julesTerminal.polling.cleanup();
        jest.clearAllTimers();
        jest.restoreAllMocks();
        document.body.innerHTML = '';
        delete global.window.julesAPI;
        delete global.window.githubAPI;
    });

    describe('Interaction Modal Coverage', () => {
        let modal, cancelBtn, submitBtn, inputField, emojiEl, nameEl, msgEl;

        beforeEach(() => {
            document.body.innerHTML += `
                <div id="julesInteractionModal"></div>
                <button id="cancelInteractionBtn"></button>
                <button id="submitInteractionBtn"></button>
                <input id="interactionModalInput" />
                <span id="interactionModalEmoji"></span>
                <span id="interactionModalAgent"></span>
                <span id="interactionModalMessage"></span>
                <div id="status-s123"></div>
            `;
            modal = document.getElementById('julesInteractionModal');
            cancelBtn = document.getElementById('cancelInteractionBtn');
            submitBtn = document.getElementById('submitInteractionBtn');
            inputField = document.getElementById('interactionModalInput');
            emojiEl = document.getElementById('interactionModalEmoji');
            nameEl = document.getElementById('interactionModalAgent');
            msgEl = document.getElementById('interactionModalMessage');

            julesTerminal.modals._initInteractionModal();
        });

        it('should show history modal with correct data', () => {
            document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <span id="historyModalEmoji"></span>
                <span id="historyModalAgent"></span>
                <span id="historyModalContent"></span>
                <input id="historyModalInput" />
            `;
            const hModal = document.getElementById('julesHistoryModal');
            const hEmojiEl = document.getElementById('historyModalEmoji');
            const hNameEl = document.getElementById('historyModalAgent');
            const hMsgEl = document.getElementById('historyModalContent');

            // Force julesTerminal.getEl to look into DOM directly
            julesTerminal.getEl = jest.fn((id) => document.getElementById(id));

            julesTerminal.modals._showHistoryModal('s456', '👾', 'HistoryAgent');

            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s456');
            expect(hEmojiEl.textContent).toBe('👾');
            expect(hNameEl.textContent).toBe('HistoryAgent');
            expect(hMsgEl.innerHTML).toContain('Loading execution thread...');
            expect(hModal.classList.contains('visible')).toBe(true);

            jest.advanceTimersByTime(100);
        });

        it('should bail early and not throw if history modal is missing', () => {
            julesTerminal.getEl = jest.fn((id) => null);
            julesTerminal.modals._showHistoryModal('s456', '👾', 'HistoryAgent');
            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s456');
        });

        it('should gracefully handle missing inner DOM elements for history modal', () => {
            document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
            `;
            const hModal = document.getElementById('julesHistoryModal');

            julesTerminal.getEl = jest.fn((id) => {
                if (id === 'julesHistoryModal') return hModal;
                return null;
            });

            julesTerminal.modals._showHistoryModal('s456', '👾', 'HistoryAgent');

            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s456');
            expect(hModal.classList.contains('visible')).toBe(true);

            jest.advanceTimersByTime(100);
        });

        it('should show interaction modal with correct data', () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s123');
            expect(emojiEl.textContent).toBe('🤖');
            expect(nameEl.textContent).toBe('TestAgent');
            expect(msgEl.textContent).toBe('Please confirm');
            expect(modal.classList.contains('visible')).toBe(true);

            jest.advanceTimersByTime(100); // coverage for setTimeout focus
        });

        it('should bail early and not throw if modal is missing', () => {
            // Remove modal to test early return branch
            modal.remove();
            julesTerminal.elements['julesInteractionModal'] = null;

            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s123');
            expect(modal.classList.contains('visible')).toBe(false); // Should not have been modified
        });

        it('should gracefully handle missing inner DOM elements', () => {
            // Remove inner elements to test null-checks
            emojiEl.remove();
            nameEl.remove();
            msgEl.remove();
            inputField.remove();

            julesTerminal.elements['interactionModalEmoji'] = null;
            julesTerminal.elements['interactionModalAgent'] = null;
            julesTerminal.elements['interactionModalMessage'] = null;
            julesTerminal.elements['interactionModalInput'] = null;

            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            expect(julesTerminal.modals.terminal.activeModalSessionId).toBe('s123');
            expect(modal.classList.contains('visible')).toBe(true);

            // Should not throw on setTimeout focus if inputField is null
            jest.advanceTimersByTime(100);
        });

        it('should close modal on cancel button click', () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            cancelBtn.click();

            expect(modal.classList.contains('visible')).toBe(false);
            expect(julesTerminal.modals.terminal.activeModalSessionId).toBeNull();
            expect(inputField.value).toBe('');
        });

        it('should submit interaction on submit button click and handle success', async () => {
            window.julesAPI.provideInput = jest.fn().mockResolvedValueOnce({});
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            inputField.value = 'My response';
            await submitBtn.click();

            expect(window.julesAPI.provideInput).toHaveBeenCalledWith('s123', 'My response');
            expect(mockToast.show).toHaveBeenCalledWith('Reply transmitted.', TOAST_TYPES.SUCCESS);
            expect(modal.classList.contains('visible')).toBe(false);
            expect(inputField.disabled).toBe(false); // restored in finally

            const statusSpan = document.getElementById('status-s123');
            expect(statusSpan.textContent).toBe('Response provided');
        });

        it('should submit interaction on Enter keydown', async () => {
            window.julesAPI.provideInput = jest.fn().mockResolvedValueOnce({});
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            inputField.value = 'My response';
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            await inputField.dispatchEvent(event);

            expect(window.julesAPI.provideInput).toHaveBeenCalledWith('s123', 'My response');
        });

        it('should handle API failure during submission', async () => {
            window.julesAPI.provideInput = jest.fn().mockRejectedValueOnce(new Error('Network error'));
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            inputField.value = 'My response';
            await submitBtn.click();

            expect(mockToast.show).toHaveBeenCalledWith('Failed to send reply.', TOAST_TYPES.ERROR);
            // Illusionist: Modal now closes immediately due to optimistic UI.
            expect(modal.classList.contains('visible')).toBe(false);
        });

        it('should handle missing inputField or errorSpan during close', () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            inputField.remove();
            julesTerminal.elements['interactionModalInput'] = null;

            const errSpan = document.getElementById('interactionModalError');
            if (errSpan) errSpan.remove();
            julesTerminal.elements['interactionModalError'] = null;

            cancelBtn.click();
            expect(modal.classList.contains('visible')).toBe(false);
        });

        it('should not submit if input is empty and inputField/errorSpan are missing', async () => {
            window.julesAPI.provideInput = jest.fn();
            inputField.remove();
            julesTerminal.elements['interactionModalInput'] = null;
            const errSpan = document.getElementById('interactionModalError');
            if (errSpan) errSpan.remove();
            julesTerminal.elements['interactionModalError'] = null;
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            await submitBtn.click();
            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });

        it('should close PR modal on cancel button click', () => {
            document.body.innerHTML += `
                <div id="julesPRModal" class="visible"></div>
                <button id="cancelPRBtn"></button>
            `;
            const prModal = document.getElementById('julesPRModal');
            const cancelBtn = document.getElementById('cancelPRBtn');
            julesTerminal.modals._initPRModal();
            cancelBtn.click();
            expect(prModal.classList.contains('visible')).toBe(false);
        });

        it('should properly clear styles and attributes from inputField and errorSpan on close', () => {
            const span = document.createElement('span');
            span.id = 'interactionModalError';
            span.textContent = 'Some error';
            document.body.appendChild(span);
            // Re-init so the modal grabs the new span
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            const inputField = document.getElementById('interactionModalInput');
            const errorSpan = document.getElementById('interactionModalError');

            inputField.style.borderColor = "var(--error)";
            inputField.setAttribute("aria-invalid", "true");
            inputField.setAttribute("aria-describedby", "interactionModalError");
            errorSpan.classList.remove("hidden");

            const cancelBtn = document.getElementById('cancelInteractionBtn');
            cancelBtn.click();

            expect(inputField.style.borderColor).toBe('');
            expect(inputField.getAttribute('aria-invalid')).toBeNull();
            expect(inputField.getAttribute('aria-describedby')).toBeNull();
            expect(errorSpan.textContent).toBe('');
            expect(errorSpan.classList.contains('hidden')).toBe(true);
        });

        it('should show error styles if submission is empty and inputField/errorSpan are present', async () => {
            const span = document.createElement('span');
            span.id = 'interactionModalError';
            span.className = 'hidden';
            document.body.appendChild(span);
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            const inputField = document.getElementById('interactionModalInput');
            const errorSpan = document.getElementById('interactionModalError');
            const submitBtn = document.getElementById('submitInteractionBtn');

            inputField.value = '  '; // empty text
            await submitBtn.click();

            expect(inputField.style.borderColor).toBe('var(--error)');
            expect(inputField.getAttribute('aria-invalid')).toBe('true');
            expect(inputField.getAttribute('aria-describedby')).toBe('interactionModalError');
            expect(errorSpan.textContent).toBe('Please provide a response before transmitting.');
            expect(errorSpan.classList.contains('hidden')).toBe(false);
        });

        it('should clear error styles on input event', () => {
            const span = document.createElement('span');
            span.id = 'interactionModalError';
            span.textContent = 'Error';
            document.body.appendChild(span);
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            const inputField = document.getElementById('interactionModalInput');
            const errorSpan = document.getElementById('interactionModalError');

            inputField.style.borderColor = "var(--error)";
            inputField.setAttribute("aria-invalid", "true");
            inputField.setAttribute("aria-describedby", "interactionModalError");
            errorSpan.classList.remove("hidden");

            inputField.dispatchEvent(new Event('input'));

            expect(inputField.style.borderColor).toBe('');
            expect(inputField.getAttribute('aria-invalid')).toBeNull();
            expect(inputField.getAttribute('aria-describedby')).toBeNull();
            expect(errorSpan.textContent).toBe('');
            expect(errorSpan.classList.contains('hidden')).toBe(true);
        });

        it('should perform silent rollback when API fails but statusSpan is missing', async () => {
            window.julesAPI.provideInput = jest.fn().mockRejectedValueOnce(new Error('Network error'));
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            const statusSpan = document.getElementById('status-s123');
            if (statusSpan) statusSpan.remove();
            inputField.value = 'My response';
            await submitBtn.click();
            expect(mockToast.show).toHaveBeenCalledWith('Failed to send reply.', TOAST_TYPES.ERROR);
        });

        it('should handle interaction modal gracefully if inputField is missing during close', () => {
             julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
             julesTerminal.elements['interactionModalInput'] = null;
             const inEl = document.getElementById('interactionModalInput');
             if(inEl) inEl.remove();

             const cancelBtn = document.getElementById('cancelInteractionBtn');
             cancelBtn.click();

             expect(julesTerminal.modals.terminal.activeModalSessionId).toBeNull();
        });

        it('should handle interaction modal gracefully if errorSpan is missing during close', () => {
             julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
             julesTerminal.elements['interactionModalError'] = null;
             const errSpan = document.getElementById('interactionModalError');
             if(errSpan) errSpan.remove();

             const cancelBtn = document.getElementById('cancelInteractionBtn');
             cancelBtn.click();

             expect(julesTerminal.modals.terminal.activeModalSessionId).toBeNull();
        });

        it('should abort history modal submission if activeModalSessionId is null', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
            `;
            julesTerminal.modals._initInteractionModal();

            // Set state explicitly
            julesTerminal.modals.terminal.activeModalSessionId = null;

            const submitHistoryBtn = julesTerminal.getEl('submitHistoryBtn');
            window.julesAPI.provideInput = jest.fn();

            await submitHistoryBtn.click();
            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });

        it('should fallback to default emoji if agent and name mismatch', () => {
            julesTerminal.renderedSessionIds = new Set(['s2']);
            const terminal = document.createElement('div');

            const session = {
                id: 's2',
                title: 'Unknown Random Title'
            };

            // Remove it from set so _processSession continues
            julesTerminal.renderedSessionIds.clear();

            julesTerminal._processSession(session, terminal, 'owner/repo');

            // Verify emoji fallback
            const item = terminal.querySelector('#session-s2');
            expect(item).not.toBeNull();
            expect(item.innerHTML).toContain('🤖'); // Fallback emoji
        });

        it('should use customAgent emoji from app config', () => {
            const terminal = document.createElement('div');

            const session = {
                id: 'custom1',
                title: 'CustomAgent'
            };

            julesTerminal._processSession(session, terminal, 'owner/repo');

            const item = terminal.querySelector('#session-custom1');
            expect(item).not.toBeNull();
            expect(item.innerHTML).toContain('🔥'); // Emoji from mockApp.customAgents
        });

        it('should gracefully handle _processActivity with missing user_input act.message', async () => {
            const item = document.createElement('div');
            item.innerHTML = '<span id="status-123">Initializing...</span>';
            document.body.appendChild(item);

            julesTerminal.polling.startTerminalPolling('123', item, 'Bot', '🤖');

            window.julesAPI.getActivities.mockResolvedValueOnce({
                activities: [ { type: 'USER_INPUT', title: 'Input Needed' } ] // missing message but matching INPUT trigger
            });

            await jest.advanceTimersByTimeAsync(3000);
            const badge = item.querySelector('#status-123');
            // In the file, logic says:
            // if (act.type && act.type.includes('USER_INPUT') && act.message) { fullHistoryMarkdown += ... }
            // but later: if (act.type && act.type.includes('USER_INPUT')) { state.latestLog = "User input transmitted."; }
            // BUT since act.title exists and act.type includes INPUT, isWaitingForInput gets set to true, showing the warning modal.
            // That means 'User input transmitted.' gets overwritten in the UI by the NeedsInput state visually,
            // so we assert the correct UI state here.
            expect(badge.textContent).toBe('⚠️ Response Needed (Click to view)');
        });

        it('should format history modal correctly for various activity types', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
                <span id="historyModalEmoji"></span>
                <span id="historyModalAgent"></span>
                <div id="historyModalContent"></div>
                <div id="status-s123"></div>
            `;
            julesTerminal.modals._initInteractionModal();

             const item = document.createElement('div');
             item.innerHTML = '<span id="status-123">Initializing...</span>';
             document.body.appendChild(item);

             julesTerminal.modals._showHistoryModal('123', '🤖', 'TestAgent');
             julesTerminal.polling.startTerminalPolling('123', item, 'Bot', '🤖');

             window.julesAPI.getActivities.mockResolvedValueOnce({
                 activities: [
                     { title: 'Test Title', description: 'Test Desc', type: 'USER_INPUT', message: 'Hello', error: { message: 'Some err' } }
                 ]
             });

             await jest.advanceTimersByTimeAsync(3000);

             const contentEl = julesTerminal.getEl('historyModalContent');
             expect(contentEl.innerHTML).toContain('Test Title');
             expect(contentEl.innerHTML).toContain('Test Desc');
             expect(contentEl.innerHTML).toContain('*You:* Hello');
             expect(contentEl.innerHTML).toContain('**Error:** Some err');
        });

        it('should handle interaction modal gracefully if history fields are missing', async () => {
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            // Remove modal inputs
            const historyModalInput = document.getElementById('historyModalInput');
            if (historyModalInput) historyModalInput.remove();
            julesTerminal.elements['historyModalInput'] = null;

            const cancelHistoryBtn = document.getElementById('cancelHistoryBtn');
            if (cancelHistoryBtn) cancelHistoryBtn.click();

            const submitHistoryBtn = document.getElementById('submitHistoryBtn');
            if (submitHistoryBtn) await submitHistoryBtn.click();

            expect(mockToast.show).not.toHaveBeenCalledWith('Transmitting reply...', 'info');
        });

        it('should send reply via history modal and update UI optimistically', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
                <span id="historyModalEmoji"></span>
                <span id="historyModalAgent"></span>
                <div id="historyModalContent"></div>
                <div id="status-s123"></div>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            const historyModalInput = julesTerminal.getEl('historyModalInput');
            historyModalInput.value = 'History reply';

            window.julesAPI.provideInput = jest.fn().mockResolvedValueOnce({});

            const submitHistoryBtn = julesTerminal.getEl('submitHistoryBtn');
            await submitHistoryBtn.click();

            expect(window.julesAPI.provideInput).toHaveBeenCalledWith('s123', 'History reply');
            expect(mockToast.show).toHaveBeenCalledWith('Reply transmitted.', TOAST_TYPES.SUCCESS);
        });

        it('should handle history modal submission with empty input', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            const submitHistoryBtn = julesTerminal.getEl('submitHistoryBtn');
            await submitHistoryBtn.click();

            expect(julesTerminal.getEl('historyModalError').textContent).toBe('Please enter a response.');
        });

        it('should submit interaction on Enter keydown in history modal', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
                <div id="status-s123"></div>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            const historyModalInput = julesTerminal.getEl('historyModalInput');
            historyModalInput.value = 'Enter reply';

            window.julesAPI.provideInput = jest.fn().mockResolvedValueOnce({});

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            await historyModalInput.dispatchEvent(event);

            expect(window.julesAPI.provideInput).toHaveBeenCalledWith('s123', 'Enter reply');
        });

        it('should clear error on input event in history modal', () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError">Error here</span>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            const historyModalInput = julesTerminal.getEl('historyModalInput');
            historyModalInput.dispatchEvent(new Event('input'));

            expect(julesTerminal.getEl('historyModalError').textContent).toBe('');
            expect(julesTerminal.getEl('historyModalError').classList.contains('hidden')).toBe(true);
        });

        it('should handle API failure during history modal submission', async () => {
             const consoleSpy = jest.spyOn(console, TOAST_TYPES.ERROR).mockImplementation(() => {});
             document.body.innerHTML += `
                <div id="julesHistoryModal"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
                <div id="status-s123"></div>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals._showHistoryModal('s123', '🤖', 'TestAgent');

            const historyModalInput = julesTerminal.getEl('historyModalInput');
            historyModalInput.value = 'Failing reply';

            window.julesAPI.provideInput = jest.fn().mockRejectedValueOnce(new Error('API fail'));

            const submitHistoryBtn = julesTerminal.getEl('submitHistoryBtn');

            const TelemetryUtils = require('../../Utils/telemetry-utils.js');
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');

            await submitHistoryBtn.click();

            expect(mockToast.show).toHaveBeenCalledWith('Failed to send reply.', TOAST_TYPES.ERROR);
            expect(dispatchSpy).toHaveBeenCalledWith("JULES_SEND_REPLY_FAILED", expect.any(Error));
            dispatchSpy.mockRestore();
            consoleSpy.mockRestore();
        });

        it('should close history modal gracefully when activeModalSessionId is null', async () => {
             document.body.innerHTML += `
                <div id="julesHistoryModal" class="visible"></div>
                <button id="cancelHistoryBtn"></button>
                <button id="submitHistoryBtn"></button>
                <input id="historyModalInput" />
                <span id="historyModalError"></span>
            `;
            julesTerminal.modals._initInteractionModal();
            julesTerminal.modals.terminal.activeModalSessionId = null;

            const submitHistoryBtn = julesTerminal.getEl('submitHistoryBtn');
            await submitHistoryBtn.click(); // Should do nothing

            const cancelHistoryBtn = julesTerminal.getEl('cancelHistoryBtn');
            cancelHistoryBtn.click(); // Should close and not throw

            expect(julesTerminal.getEl('julesHistoryModal').classList.contains('visible')).toBe(false);
        });

        it('should handle interaction modal gracefully if inputField is missing but errorSpan is present during submission with empty text', async () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            julesTerminal.elements['interactionModalInput'] = null;
            inputField.remove();
            await submitBtn.click();
        });

        it('should handle interaction modal gracefully if inputField is present but errorSpan is missing during submission with empty text', async () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            julesTerminal.elements['interactionModalError'] = null;
            const errSpan = document.getElementById('interactionModalError');
            if (errSpan) errSpan.remove();
            await submitBtn.click();
        });

        it('should handle interaction modal missing elements gracefully when submit button clicked and input empty', async () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            const originalInputField = julesTerminal.getEl('interactionModalInput');
            originalInputField.value = '   ';

            julesTerminal.elements['interactionModalInput'] = null;
            julesTerminal.elements['interactionModalError'] = null;

            window.julesAPI.provideInput = jest.fn();
            await submitBtn.click();

            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });

        it('should handle interaction modal missing input field/error span during input event branch', async () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            const originalInputField = julesTerminal.getEl('interactionModalInput');

            julesTerminal.elements['interactionModalInput'] = null;
            julesTerminal.elements['interactionModalError'] = null;

            const event = new Event('input');
            if(originalInputField) {
                 originalInputField.dispatchEvent(event);
            }
        });

        it('should handle missing errorSpan when input is empty', async () => {
            window.julesAPI.provideInput = jest.fn();
            const errSpan = document.getElementById('interactionModalError');
            if (errSpan) errSpan.remove();
            julesTerminal.elements['interactionModalError'] = null;
            inputField.value = '';
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            await submitBtn.click();
            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });

        it('should handle interaction modal gracefully if inputField is missing during input event', async () => {
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');
            inputField.remove();
            julesTerminal.elements['interactionModalInput'] = null;
            const event = new Event('input');
            if(inputField) {
                inputField.dispatchEvent(event);
            }
            expect(true).toBe(true);
        });

        it('should not submit if input is empty', async () => {
            window.julesAPI.provideInput = jest.fn();
            julesTerminal.modals._showInteractionModal('s123', '🤖', 'TestAgent', 'Please confirm');

            inputField.value = '   '; // only whitespace
            await submitBtn.click();

            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });
    });

    describe('_showPRModal', () => {
        let prMock, modal, titleEl, linkEl, contentEl, errorEl, mergeBtn, closePRBtn;

        beforeEach(() => {
            prMock = {
                number: 123,
                title: 'Test PR',
                html_url: 'https://github.com/test/test/pull/123',
                body: 'Test body'
            };

            modal = document.createElement('div');
            titleEl = document.createElement('div');
            linkEl = document.createElement('a');
            contentEl = document.createElement('div');
            errorEl = document.createElement('div');
            mergeBtn = document.createElement('button');
            closePRBtn = document.createElement('button');

            julesTerminal.elements = {
                julesPRModal: modal,
                prModalTitleText: titleEl,
                prModalExternalLink: linkEl,
                prModalContent: contentEl,
                prModalError: errorEl,
                mergePRBtn: mergeBtn,
                closePRBtn: closePRBtn
            };

            // Mock getEl
            julesTerminal.getEl = jest.fn((id) => julesTerminal.elements[id]);
            julesTerminal.app = { toast: { show: jest.fn() } };
            julesTerminal.loadPullRequestsForRepo = jest.fn();

            window.julesAPI = {
                mergePullRequest: jest.fn(),
                closePullRequest: jest.fn()
            };

            global.DOMUtils = {
                getTerminalIndicatorHTML: jest.fn().mockImplementation((msg) => `<div id="fetchingIndicator" class="term-session-line skeleton-pulse term-muted-text">[SYS] ${msg}</div>`),
    getTerminalSessionHTML: jest.fn().mockImplementation((emoji, name, status, id) => `
            <span class="term-agent-name">${emoji} ${name}</span>
            <span class="term-separator">—</span>
            <span class="term-status"${id ? ` id="${id}"` : ''}>${status}</span>
        `),
                createMarkdownPreBlock: jest.fn().mockReturnValue(document.createElement('pre')),
                setButtonState: jest.fn()
            };
        });

        it('should bail if modal is missing', () => {
            julesTerminal.elements.julesPRModal = null;
            julesTerminal.modals._showPRModal(prMock);
            expect(titleEl.textContent).toBe(''); // Should not have been updated
        });

        it('should populate modal and show it', () => {
            julesTerminal.modals._showPRModal(prMock);
            expect(titleEl.textContent).toBe('#123 Test PR');
            expect(linkEl.href).toBe('https://github.com/test/test/pull/123');
            expect(contentEl.innerHTML).toBe('<pre></pre>');
            expect(errorEl.textContent).toBe('');
            expect(errorEl.classList.contains('hidden')).toBe(true);
            expect(modal.classList.contains('visible')).toBe(true);
        });

    });

});
