/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;

describe('JulesTerminal', () => {
    let modals;
    let mockManager;
    let mockElements;
    let mockApp;

    beforeEach(() => {
        jest.useFakeTimers();

        mockElements = {
            julesInteractionModal: { classList: { add: jest.fn(), remove: jest.fn() } },
            interactionModalEmoji: {},
            interactionModalAgent: {},
            interactionModalMessage: {},
            interactionModalInput: { focus: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() }, value: '', setAttribute: jest.fn(), removeAttribute: jest.fn(), addEventListener: jest.fn() },
            interactionModalError: { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' },
            julesHistoryModal: { classList: { add: jest.fn(), remove: jest.fn() } },
            historyModalEmoji: {},
            historyModalAgent: {},
            historyModalContent: {},
            historyModalInput: { focus: jest.fn(), classList: { add: jest.fn(), remove: jest.fn() }, value: '', setAttribute: jest.fn(), removeAttribute: jest.fn(), addEventListener: jest.fn() },
            historyModalError: { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' },
            julesPRModal: { classList: { add: jest.fn(), remove: jest.fn() } },
            prModalTitleText: {},
            prModalExternalLink: {},
            prModalContent: { appendChild: jest.fn(), innerHTML: '' },
            prModalError: { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' },
            cancelInteractionBtn: { addEventListener: jest.fn() },
            submitInteractionBtn: { addEventListener: jest.fn() },
            cancelHistoryBtn: { addEventListener: jest.fn() },
            submitHistoryBtn: { addEventListener: jest.fn() },
            cancelPRBtn: { addEventListener: jest.fn() }
        };

        mockApp = {
            toast: {
                show: jest.fn()
            }
        };

        mockManager = {
            activeModalSessionId: null,
            getEl: jest.fn(id => mockElements[id]),
            constructor: { MODAL_FOCUS_DELAY_MS: 100 },
            app: mockApp
        };
        modals = new JulesModals(mockManager);

        global.window = global;
        window.julesAPI = {
            provideInput: jest.fn()
        };

        jest.spyOn(document, "getElementById");

        global.DOMUtils = {
            createMarkdownPreBlock: jest.fn(() => document.createElement('pre'))
        };

        global.JulesTerminal = {
            getTelemetryUtils: jest.fn()
        };

        global.PerformanceUtils = {
            debounce: jest.fn((fn) => fn)
        };
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.resetAllMocks();
    });

    describe('_showInteractionModal', () => {
        it('should update all DOM elements and show modal when all exist', () => {
            modals._showInteractionModal('session-1', '🤖', 'AgentName', 'Hello prompt');

            expect(mockManager.activeModalSessionId).toBe('session-1');
            expect(mockElements.interactionModalEmoji.textContent).toBe('🤖');
            expect(mockElements.interactionModalAgent.textContent).toBe('AgentName');
            expect(mockElements.interactionModalMessage.textContent).toBe('Hello prompt');
            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');

            jest.advanceTimersByTime(100);
            expect(mockElements.interactionModalInput.focus).toHaveBeenCalled();
        });

        it('should bail early if modal element is not found', () => {
            mockElements.julesInteractionModal = null;
            modals._showInteractionModal('session-2', '🤖', 'AgentName', 'Hello prompt');
            expect(mockManager.activeModalSessionId).toBe('session-2');
            expect(mockElements.interactionModalEmoji.textContent).toBeUndefined();
        });

        it('should gracefully handle missing emoji element', () => {
            mockElements.interactionModalEmoji = null;
            modals._showInteractionModal('session-1', '🤖', 'AgentName', 'Hello prompt');
            expect(mockElements.interactionModalAgent.textContent).toBe('AgentName');
            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');
        });

        it('should gracefully handle missing name element', () => {
            mockElements.interactionModalAgent = null;
            modals._showInteractionModal('session-1', '🤖', 'AgentName', 'Hello prompt');
            expect(mockElements.interactionModalEmoji.textContent).toBe('🤖');
            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');
        });

        it('should gracefully handle missing message element', () => {
            mockElements.interactionModalMessage = null;
            modals._showInteractionModal('session-1', '🤖', 'AgentName', 'Hello prompt');
            expect(mockElements.interactionModalEmoji.textContent).toBe('🤖');
            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');
        });

        it('should gracefully handle missing input element during focus', () => {
            mockElements.interactionModalInput = null;
            modals._showInteractionModal('session-1', '🤖', 'AgentName', 'Hello prompt');
            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');
            expect(() => jest.advanceTimersByTime(100)).not.toThrow();
        });
    });

    describe('_showHistoryModal', () => {
        it('should update all DOM elements and show history modal', () => {
            modals._showHistoryModal('session-3', '👻', 'GhostAgent');
            expect(mockManager.activeModalSessionId).toBe('session-3');
            expect(mockElements.historyModalEmoji.textContent).toBe('👻');
            expect(mockElements.historyModalAgent.textContent).toBe('GhostAgent');
            expect(mockElements.historyModalContent.innerHTML).toContain('skeleton-pulse');
            expect(mockElements.julesHistoryModal.classList.add).toHaveBeenCalledWith('visible');

            jest.advanceTimersByTime(100);
            expect(mockElements.historyModalInput.focus).toHaveBeenCalled();
        });

        it('should bail early if history modal is not found', () => {
            mockElements.julesHistoryModal = null;
            modals._showHistoryModal('session-3', '👻', 'GhostAgent');
            expect(mockElements.historyModalEmoji.textContent).toBeUndefined();
        });
    });

    describe('_showPRModal', () => {
        const mockPR = {
            number: 42,
            title: 'Fix issue',
            html_url: 'https://github.com/test/pull/42',
            body: 'My PR body'
        };

        it('should render PR details correctly', () => {
            modals._showPRModal(mockPR);
            expect(mockElements.prModalTitleText.textContent).toBe('#42 Fix issue');
            expect(mockElements.prModalExternalLink.href).toBe('https://github.com/test/pull/42');
            expect(global.DOMUtils.createMarkdownPreBlock).toHaveBeenCalledWith('My PR body');
            expect(mockElements.prModalError.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockElements.julesPRModal.classList.add).toHaveBeenCalledWith('visible');
        });

        it('should fallback if body is missing', () => {
            modals._showPRModal({ ...mockPR, body: undefined });
            expect(global.DOMUtils.createMarkdownPreBlock).toHaveBeenCalledWith('No description provided.');
        });

        it('should bail early if modal is missing', () => {
            mockElements.julesPRModal = null;
            modals._showPRModal(mockPR);
            expect(mockElements.prModalTitleText.textContent).toBeUndefined();
        });
    });

    describe('_transmitReply', () => {
        let mockCloseFn;
        let mockStatusSpan;

        beforeEach(() => {
            mockCloseFn = jest.fn();
            mockStatusSpan = {
                className: 'old-class',
                textContent: 'old-text',
                onclick: jest.fn()
            };
            document.getElementById.mockReturnValue(mockStatusSpan);
        });

        it('should close modal, update status immediately, and show success toast on API success', async () => {
            window.julesAPI.provideInput.mockResolvedValueOnce({});

            await modals._transmitReply('session-1', 'user reply', mockCloseFn, null);

            expect(mockCloseFn).toHaveBeenCalled();
            expect(mockApp.toast.show).toHaveBeenCalledWith("Transmitting reply...", "info");
            expect(mockStatusSpan.className).toBe("term-status status-success");
            expect(mockStatusSpan.textContent).toBe("Response provided");
            expect(mockStatusSpan.onclick).toBeNull();

            expect(window.julesAPI.provideInput).toHaveBeenCalledWith('session-1', 'user reply');
            expect(mockApp.toast.show).toHaveBeenCalledWith("Reply transmitted.", "success");
        });

        it('should gracefully handle missing status span without crashing', async () => {
            document.getElementById.mockReturnValue(null);
            window.julesAPI.provideInput.mockResolvedValueOnce({});

            await expect(modals._transmitReply('session-1', 'user reply', mockCloseFn, null)).resolves.not.toThrow();
            expect(window.julesAPI.provideInput).toHaveBeenCalled();
        });

        it('should invoke telemetry, show error toast, and DO NOT rollback state when API fails and rollbackState is falsy', async () => {
            const error = new Error('Network timeout');
            window.julesAPI.provideInput.mockRejectedValueOnce(error);

            const mockTelemetry = { dispatchEvent: jest.fn() };
            global.JulesTerminal.getTelemetryUtils.mockReturnValue(mockTelemetry);

            await modals._transmitReply('session-1', 'user reply', mockCloseFn, null);

            expect(mockTelemetry.dispatchEvent).toHaveBeenCalledWith('JULES_SEND_REPLY_FAILED', error);
            expect(mockApp.toast.show).toHaveBeenCalledWith("Failed to send reply.", "error");

            // It should NOT rollback statusSpan because rollbackState is null
            expect(mockStatusSpan.className).toBe("term-status status-success");
        });

        it('should rollback statusSpan state correctly when rollbackState is provided upon API failure', async () => {
            const error = new Error('API 500');
            window.julesAPI.provideInput.mockRejectedValueOnce(error);

            const mockTelemetry = { dispatchEvent: jest.fn() };
            global.JulesTerminal.getTelemetryUtils.mockReturnValue(mockTelemetry);

            const rollbackState = {
                className: 'term-status status-waiting',
                textContent: 'Needs response',
                onclick: jest.fn()
            };

            await modals._transmitReply('session-1', 'user reply', mockCloseFn, rollbackState);

            // Telemetry shouldn't be called if rollbackState exists (per the source logic)
            expect(mockTelemetry.dispatchEvent).not.toHaveBeenCalled();
            expect(mockApp.toast.show).toHaveBeenCalledWith("Failed to send reply.", "error");

            expect(mockStatusSpan.className).toBe('term-status status-waiting');
            expect(mockStatusSpan.textContent).toBe('Needs response');
            expect(mockStatusSpan.onclick).toBe(rollbackState.onclick);
        });

        it('should use default fallback values when rollbackState is provided but incomplete', async () => {
            window.julesAPI.provideInput.mockRejectedValueOnce(new Error('fail'));

            await modals._transmitReply('session-1', 'reply', mockCloseFn, { onclick: null });

            expect(mockStatusSpan.className).toBe('term-status status-waiting');
            expect(mockStatusSpan.textContent).toBe('⚠️ Response Needed (Click to view)');
            expect(mockStatusSpan.onclick).toBeNull();
        });
    });

    describe('_showKeyError and _clearKeyError', () => {
        it('should handle DOM manipulation for errors safely', () => {
            const input = { classList: { add: jest.fn(), remove: jest.fn() } };
            const span = { classList: { add: jest.fn(), remove: jest.fn() }, textContent: '' };

            modals._showKeyError(input, span, 'Bad input');
            expect(input.classList.add).toHaveBeenCalledWith('border-error');
            expect(span.textContent).toBe('Bad input');
            expect(span.classList.remove).toHaveBeenCalledWith('d-none');

            modals._clearKeyError(input, span);
            expect(input.classList.remove).toHaveBeenCalledWith('border-error');
            expect(span.textContent).toBe('');
            expect(span.classList.add).toHaveBeenCalledWith('d-none');

            // Missing args shouldn't throw
            expect(() => modals._showKeyError(null, null, '')).not.toThrow();
            expect(() => modals._clearKeyError(null, null)).not.toThrow();
        });
    });

    describe('_initPRModal', () => {
        it('should attach close click listener', () => {
            modals._initPRModal();
            expect(mockElements.cancelPRBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

            const clickHandler = mockElements.cancelPRBtn.addEventListener.mock.calls[0][1];
            clickHandler();
            expect(mockElements.julesPRModal.classList.remove).toHaveBeenCalledWith('visible');
        });
    });

    describe('_initInteractionModal', () => {
        it('should bind listeners to buttons and handle UI state closures', () => {
            modals._initInteractionModal();
            expect(mockElements.cancelInteractionBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockElements.submitInteractionBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockElements.interactionModalInput.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(mockElements.interactionModalInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));

            // Test closeModal via cancel btn
            mockManager.activeModalSessionId = 's1';
            const cancelHandler = mockElements.cancelInteractionBtn.addEventListener.mock.calls[0][1];
            cancelHandler();

            expect(mockElements.julesInteractionModal.classList.remove).toHaveBeenCalledWith('visible');
            expect(mockManager.activeModalSessionId).toBeNull();
            expect(mockElements.interactionModalInput.value).toBe('');
            expect(mockElements.interactionModalInput.classList.remove).toHaveBeenCalledWith('border-error');
            expect(mockElements.interactionModalError.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should abort handleSubmit if input is empty', async () => {
            modals._initInteractionModal();
            const submitHandler = mockElements.submitInteractionBtn.addEventListener.mock.calls[0][1];

            mockElements.interactionModalInput.value = '   '; // Only spaces
            await submitHandler();

            expect(mockElements.interactionModalInput.classList.add).toHaveBeenCalledWith('border-error');
            expect(mockElements.interactionModalError.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockElements.interactionModalError.textContent).toBe("Please provide a response before transmitting.");
            // No network calls made
            expect(window.julesAPI.provideInput).not.toHaveBeenCalled();
        });

        it('should invoke _transmitReply on submit success path', async () => {
            modals._initInteractionModal();
            mockManager.activeModalSessionId = 'test-session';
            mockElements.interactionModalInput.value = 'Valid Reply';

            // Spy on the internal function
            const transmitSpy = jest.spyOn(modals, '_transmitReply').mockResolvedValue();

            const submitHandler = mockElements.submitInteractionBtn.addEventListener.mock.calls[0][1];
            await submitHandler();

            expect(transmitSpy).toHaveBeenCalledWith('test-session', 'Valid Reply', expect.any(Function), expect.any(Object));
        });

        it('should trigger submit on enter key', async () => {
            modals._initInteractionModal();
            const transmitSpy = jest.spyOn(modals, '_transmitReply').mockResolvedValue();
            mockManager.activeModalSessionId = 'test-session';
            mockElements.interactionModalInput.value = 'Reply';

            const keydownHandler = mockElements.interactionModalInput.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];

            await keydownHandler({ key: 'Enter' });
            expect(transmitSpy).toHaveBeenCalled();

            // Other keys do nothing
            transmitSpy.mockClear();
            await keydownHandler({ key: 'Escape' });
            expect(transmitSpy).not.toHaveBeenCalled();
        });

        it('should handle history modal submission correctly', async () => {
            modals._initInteractionModal();
            mockManager.activeModalSessionId = 'hist-session';
            mockElements.historyModalInput.value = 'Valid Hist Reply';

            const transmitSpy = jest.spyOn(modals, '_transmitReply').mockResolvedValue();

            const submitHandler = mockElements.submitHistoryBtn.addEventListener.mock.calls[0][1];
            await submitHandler();

            expect(transmitSpy).toHaveBeenCalledWith('hist-session', 'Valid Hist Reply', expect.any(Function), null);
        });

        it('should show error on empty history modal submission', async () => {
            modals._initInteractionModal();
            mockManager.activeModalSessionId = 'hist-session';
            mockElements.historyModalInput.value = '';

            const transmitSpy = jest.spyOn(modals, '_transmitReply').mockResolvedValue();

            const submitHandler = mockElements.submitHistoryBtn.addEventListener.mock.calls[0][1];
            await submitHandler();

            expect(transmitSpy).not.toHaveBeenCalled();
            expect(mockElements.historyModalInput.classList.add).toHaveBeenCalledWith('border-error');
        });
    });


    describe('_initInteractionModal debounced clearing', () => {
        it('should clear errors after debounced input', () => {
            modals._initInteractionModal();
            const inputHandler = mockElements.interactionModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

            // Invoke the debounced input clearing
            inputHandler();

            expect(mockElements.interactionModalInput.classList.remove).toHaveBeenCalledWith('border-error');
            expect(mockElements.interactionModalError.textContent).toBe('');
            expect(mockElements.interactionModalError.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should handle history debounced input clearing', () => {
            modals._initInteractionModal();
            const inputHandler = mockElements.historyModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

            // Invoke the debounced history input clearing
            inputHandler();

            expect(mockElements.historyModalInput.classList.remove).toHaveBeenCalledWith('border-error');
            expect(mockElements.historyModalError.textContent).toBe('');
            expect(mockElements.historyModalError.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should safely do nothing if elements are missing during interaction debounced clearing', () => {
            modals._initInteractionModal();
            const inputHandler = mockElements.interactionModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

            mockElements.interactionModalError = null;
            expect(() => inputHandler()).not.toThrow();
        });

        it('should safely do nothing if elements are missing during history debounced clearing', () => {
            modals._initInteractionModal();
            const inputHandler = mockElements.historyModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

            mockElements.historyModalError = null;
            expect(() => inputHandler()).not.toThrow();
        });
    });

    describe('history modal cancel button with missing nodes', () => {
        it('should close correctly if nodes are missing', () => {
            modals._initInteractionModal();
            const cancelHandler = mockElements.cancelHistoryBtn.addEventListener.mock.calls[0][1];

            mockElements.historyModalInput = null;
            mockElements.historyModalError = null;
            expect(() => cancelHandler()).not.toThrow();
        });
    });

    describe('interaction modal cancel button with missing nodes', () => {
        it('should close correctly if nodes are missing', () => {
            modals._initInteractionModal();
            const cancelHandler = mockElements.cancelInteractionBtn.addEventListener.mock.calls[0][1];

            mockElements.interactionModalInput = null;
            mockElements.interactionModalError = null;
            expect(() => cancelHandler()).not.toThrow();
        });

        it('should handle missing error element when text is missing', async () => {
            modals._initInteractionModal();
            const submitHandler = mockElements.submitInteractionBtn.addEventListener.mock.calls[0][1];

            mockElements.interactionModalInput.value = '';
            mockElements.interactionModalError = null;
            await expect(submitHandler()).resolves.toBeUndefined();
        });
    });


    describe('PerformanceUtils fallback branches', () => {
        let originalPerformanceUtils;

        beforeAll(() => {
            originalPerformanceUtils = global.PerformanceUtils;
        });

        afterAll(() => {
            global.PerformanceUtils = originalPerformanceUtils;
        });

        it('should fallback to synchronous input clearing if PerformanceUtils is missing', () => {
            delete global.PerformanceUtils;

            // Re-instantiate modals and call init to trigger the branch where PerformanceUtils is undefined
            const newModals = new JulesModals(mockManager);
            newModals._initInteractionModal();

            const inputHandler = mockElements.interactionModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];

            inputHandler();

            expect(mockElements.interactionModalInput.classList.remove).toHaveBeenCalledWith('border-error');
            expect(mockElements.interactionModalError.textContent).toBe('');

            // Also test history input clearing
            const historyInputHandler = mockElements.historyModalInput.addEventListener.mock.calls.find(call => call[0] === 'input')[1];
            historyInputHandler();
            expect(mockElements.historyModalInput.classList.remove).toHaveBeenCalledWith('border-error');
            expect(mockElements.historyModalError.textContent).toBe('');

            // also test safely missing nodes
            mockElements.interactionModalError = null;
            expect(() => inputHandler()).not.toThrow();

            mockElements.historyModalError = null;
            expect(() => historyInputHandler()).not.toThrow();

            global.PerformanceUtils = originalPerformanceUtils;
        });
    });

    describe('_transmitReply early return', () => {
        it('should abort handleHistorySubmit if activeModalSessionId is null', async () => {
            modals._initInteractionModal();
            mockManager.activeModalSessionId = null;
            const submitHandler = mockElements.submitHistoryBtn.addEventListener.mock.calls[0][1];
            await expect(submitHandler()).resolves.toBeUndefined();
        });
        it('should abort handleSubmit if activeModalSessionId is null', async () => {
            modals._initInteractionModal();
            mockElements.interactionModalInput.value = 'hi';
            mockManager.activeModalSessionId = null;
            const submitHandler = mockElements.submitInteractionBtn.addEventListener.mock.calls[0][1];
            await expect(submitHandler()).resolves.toBeUndefined();
        });
    });


    describe('history modal keydown missing enter', () => {
        it('should do nothing if keydown is not Enter', async () => {
            modals._initInteractionModal();
            mockManager.activeModalSessionId = 'hist-session';
            mockElements.historyModalInput.value = 'Valid Hist Reply';

            const transmitSpy = jest.spyOn(modals, '_transmitReply').mockResolvedValue();

            const keydownHandler = mockElements.historyModalInput.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];
            await keydownHandler({ key: 'Escape' });

            expect(transmitSpy).not.toHaveBeenCalled();

            await keydownHandler({ key: 'Enter' });
            expect(transmitSpy).toHaveBeenCalled();
        });
    });

    describe('getTelemetryUtils', () => {
        it('should return null when telemetry utils are undefined globally', () => {
            // Because JulesTerminal.getTelemetryUtils in source looks at global namespace.
            // We need to trick it.
            const originalTU = global.TelemetryUtils;
            delete global.TelemetryUtils;

            expect(JulesModals.getTelemetryUtils()).toBeNull();

            global.TelemetryUtils = originalTU;
        });
    });
});
