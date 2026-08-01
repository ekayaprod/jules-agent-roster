/**
 * @jest-environment jsdom
 */

const EventBinder = require('./EventBinder');

describe('EventBinder Prompt Fetch Recovery', () => {
    let appMock;
    let eventListeners;

    beforeEach(() => {
        jest.clearAllMocks();
        eventListeners = {};

        // Mock document.addEventListener
        document.addEventListener = jest.fn((event, cb) => {
            eventListeners[event] = cb;
        });

        appMock = {
            elements: {},
            getAgentForUI: jest.fn(),
            agentRepo: {
                fetchPrompt: jest.fn()
            },
        };

        global.MESSAGES = { NO_PROTOCOL_DATA: 'no data' };
        global.AgentUtils = {
            getPromptUrl: jest.fn(),
        };
    });

    it('fallback console.error when TelemetryUtils is missing for PROMPT_FETCH_ERROR', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EventBinder.bind(appMock);

        const mouseoverHandler = eventListeners['mouseover'];

        const flipCard = document.createElement('div');
        flipCard.classList.add('flip-card');
        const frontTarget = document.createElement('button');
        frontTarget.setAttribute('data-action', 'flip-card');
        frontTarget.setAttribute('data-index', 'custom-1');
        flipCard.appendChild(frontTarget);
        document.body.appendChild(flipCard);

        const customAgent = {
            name: 'CustomAgent',
            isCustom: true,
        };
        appMock.getAgentForUI.mockReturnValue(customAgent);

        const mockError = new Error('Network Timeout');
        appMock.agentRepo.fetchPrompt.mockRejectedValue(mockError);

        const event = new MouseEvent('mouseover', { bubbles: true });
        Object.defineProperty(event, 'target', { value: frontTarget, enumerable: true });

        delete window.TelemetryUtils;

        mouseoverHandler(event);

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(consoleSpy).toHaveBeenCalledWith("Failed to pre-fetch custom agent prompt:", mockError);
        consoleSpy.mockRestore();
    });

    it('dispatches PROMPT_FETCH_ERROR via TelemetryUtils when available', async () => {
        window.TelemetryUtils = {
            dispatchEvent: jest.fn()
        };

        EventBinder.bind(appMock);

        const mouseoverHandler = eventListeners['mouseover'];

        const flipCard = document.createElement('div');
        flipCard.classList.add('flip-card');
        const frontTarget = document.createElement('button');
        frontTarget.setAttribute('data-action', 'flip-card');
        frontTarget.setAttribute('data-index', 'custom-1');
        flipCard.appendChild(frontTarget);
        document.body.appendChild(flipCard);

        const customAgent = {
            name: 'CustomAgent',
            isCustom: true,
        };
        appMock.getAgentForUI.mockReturnValue(customAgent);

        const mockError = new Error('Network Timeout');
        appMock.agentRepo.fetchPrompt.mockRejectedValue(mockError);

        const event = new MouseEvent('mouseover', { bubbles: true });
        Object.defineProperty(event, 'target', { value: frontTarget, enumerable: true });

        mouseoverHandler(event);

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("PROMPT_FETCH_ERROR", mockError);

        delete window.TelemetryUtils;
    });
});
