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
            activeModalSessionId: null,
            getEl: jest.fn((id) => mockElements[id]),
            constructor: {
                MODAL_FOCUS_DELAY_MS: 100
            }
        };

        modals = new JulesModals(mockManager);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('_showInteractionModal', () => {
        it('should update DOM and show modal correctly', () => {
            modals._showInteractionModal('session-123', '🤖', 'AgentName', 'Test prompt');

            expect(mockManager.activeModalSessionId).toBe('session-123');
            expect(mockElements.interactionModalEmoji.textContent).toBe('🤖');
            expect(mockElements.interactionModalAgent.textContent).toBe('AgentName');
            expect(mockElements.interactionModalMessage.textContent).toBe('Test prompt');

            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');

            expect(mockElements.interactionModalInput.focus).not.toHaveBeenCalled();
            jest.advanceTimersByTime(100);
            expect(mockElements.interactionModalInput.focus).toHaveBeenCalled();
        });

        it('should return early if modal element is not found', () => {
            mockElements.julesInteractionModal = null;

            modals._showInteractionModal('session-123', '🤖', 'AgentName', 'Test prompt');

            expect(mockManager.activeModalSessionId).toBe('session-123');
            expect(mockElements.interactionModalEmoji.textContent).toBeUndefined();
        });

        it('should not throw if optional elements are missing', () => {
            mockElements.interactionModalEmoji = null;
            mockElements.interactionModalAgent = null;
            mockElements.interactionModalMessage = null;
            mockElements.interactionModalInput = null;

            expect(() => {
                modals._showInteractionModal('session-123', '🤖', 'AgentName', 'Test prompt');
                jest.advanceTimersByTime(100);
            }).not.toThrow();

            expect(mockElements.julesInteractionModal.classList.add).toHaveBeenCalledWith('visible');
        });
    });
});
