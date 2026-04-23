/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');

describe('JulesModals', () => {
    let modals;
    let mockManager;
    let mockElements;

    beforeEach(() => {
        jest.useFakeTimers();

        mockElements = {
            julesInteractionModal: { classList: { add: jest.fn(), remove: jest.fn() } },
            interactionModalEmoji: {},
            interactionModalAgent: {},
            interactionModalMessage: {},
            interactionModalInput: { focus: jest.fn() }
        };

        mockManager = {
            getEl: jest.fn(id => mockElements[id]),
            constructor: { MODAL_FOCUS_DELAY_MS: 100 }
        };

        modals = new JulesModals(mockManager);
    });

    afterEach(() => {
        jest.clearAllTimers();
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
});
