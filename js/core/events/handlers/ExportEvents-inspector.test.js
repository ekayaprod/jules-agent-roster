/**
 * @jest-environment jsdom
 */

const ExportEvents = require('./ExportEvents');

describe('ExportEvents Missing Error Handling', () => {
    let appMock;
    let eventListeners;

    beforeEach(() => {
        jest.clearAllMocks();
        eventListeners = {};

        appMock = {
            elements: {
                masterCopyFusionsBtn: {
                    addEventListener: jest.fn((event, cb) => {
                        eventListeners[event] = cb;
                    })
                },
                masterDropdownMenu: {
                    classList: {
                        remove: jest.fn()
                    }
                }
            },
            customAgents: {},
            toast: {
                show: jest.fn()
            }
        };

        global.AgentUtils = {
            getValidCustomAgents: jest.fn()
        };

        global.FormatUtils = {
            CUSTOM_ROSTER_HEADER: 'HEADER',
            formatAgentPrompts: jest.fn()
        };

        global.ClipboardUtils = {
            copyText: jest.fn(),
            animateButtonSuccess: jest.fn()
        };
    });

    afterEach(() => {
        delete global.AgentUtils;
        delete global.FormatUtils;
        delete global.ClipboardUtils;
    });

    // 🕵️ The Interrogation: Assert failure on rejection, proving the alibi breaks.
    it('should throw unhandled rejection when ClipboardUtils.copyText fails', async () => {
        ExportEvents.bind(appMock);
        const clickHandler = eventListeners['click'];

        global.AgentUtils.getValidCustomAgents.mockReturnValue([{ id: 1 }]);
        global.FormatUtils.formatAgentPrompts.mockReturnValue('PROMPT');

        const mockError = new Error('Clipboard Timeout');
        global.ClipboardUtils.copyText.mockRejectedValueOnce(mockError);

        const event = {
            currentTarget: {}
        };

        // Mathematically prove that the click handler explicitly fails to catch the error
        await expect(clickHandler(event)).rejects.toThrow('Clipboard Timeout');
    });
});
