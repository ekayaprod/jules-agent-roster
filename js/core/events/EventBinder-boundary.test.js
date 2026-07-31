/**
 * @jest-environment jsdom
 */

const EventBinder = require('./EventBinder');

global.SafeUITimings = { MODAL_FOCUS_DELAY_MS: 50 };

global.MESSAGES = { NO_PROTOCOL_DATA: 'no data' };

global.DOMUtils = {
    closeDropdownMenu: jest.fn(),
    createSkeletonElement: jest.fn().mockReturnValue(document.createElement('div')),
};
global.PerformanceUtils = {
    debounce: jest.fn((fn) => fn),
};
global.AgentUtils = {
    getPromptUrl: jest.fn(),
    getValidCustomAgents: jest.fn(),
    getCustomAgent: jest.fn(),
};
global.FormatUtils = {
    escapeHTML: jest.fn((str) => str),
    extractDisplayName: jest.fn((agent) => agent.name),
    extractIcon: jest.fn().mockReturnValue('<div>icon</div>'),
    formatAgentPrompts: jest.fn(),
};
global.AgentCard = {
    getPromptNode: jest.fn(),
};
global.ClipboardUtils = {
    copyText: jest.fn(),
    animateButtonSuccess: jest.fn(),
};

describe('EventBinder Boundary and Error Recovery', () => {
    let appMock;
    let eventListeners;

    beforeEach(() => {
        jest.clearAllMocks();
        eventListeners = {};

        // Mock document.addEventListener
        document.addEventListener = jest.fn((event, cb) => {
            eventListeners[event] = cb;
        });

        // Set up the DOM with the element id
        document.body.innerHTML = '<input type="checkbox" id="julesActivateToggle" />';

        appMock = {
            elements: {
                julesRepoPicker: document.createElement('select'),
                julesTerminal: document.createElement('div'),
            },
            julesTerminal: {
                loadActiveSessionsForRepo: jest.fn().mockResolvedValue(),
                loadPullRequestsForRepo: jest.fn().mockResolvedValue(),
                loadSources: jest.fn().mockResolvedValue(),
                cleanup: jest.fn(),
                initialized: true,
            },
            getAgentForUI: jest.fn(),
            agentRepo: {
                fetchPrompt: jest.fn()
            },
            renderAgents: jest.fn(),
            _cardHtmlCache: new Map(),
            _domNodeCache: new Map(),
        };
    });

    it('fallback console.error when TelemetryUtils is missing for loadActiveSessionsForRepo', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EventBinder.bind(appMock);

        const changeEvent = new Event('change');
        Object.defineProperty(changeEvent, 'target', { value: { value: 'jules-repo' }, enumerable: true });

        const mockError = new Error('Repo Load Timeout');
        appMock.julesTerminal.loadActiveSessionsForRepo.mockRejectedValue(mockError);

        // Ensure TelemetryUtils is undefined
        delete window.TelemetryUtils;

        appMock.elements.julesRepoPicker.dispatchEvent(changeEvent);

        await new Promise(process.nextTick);

        expect(consoleSpy).toHaveBeenCalledWith(mockError);
        consoleSpy.mockRestore();
    });

    it('fallback console.error when TelemetryUtils is missing for loadPullRequestsForRepo', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EventBinder.bind(appMock);

        const changeEvent = new Event('change');
        Object.defineProperty(changeEvent, 'target', { value: { value: 'jules-repo' }, enumerable: true });

        const mockError = new Error('PR Load Timeout');
        appMock.julesTerminal.loadPullRequestsForRepo.mockRejectedValue(mockError);

        // Ensure TelemetryUtils is undefined
        delete window.TelemetryUtils;

        appMock.elements.julesRepoPicker.dispatchEvent(changeEvent);

        await new Promise(process.nextTick);

        expect(consoleSpy).toHaveBeenCalledWith(mockError);
        consoleSpy.mockRestore();
    });

    it('fallback console.error when TelemetryUtils is missing for loadSources in julesActivateToggle', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        EventBinder.bind(appMock);

        const changeEvent = new Event('change');
        const activateToggle = document.getElementById("julesActivateToggle");
        activateToggle.checked = true;

        const mockError = new Error('Sources Load Timeout');
        appMock.julesTerminal.loadSources.mockRejectedValue(mockError);

        // Ensure TelemetryUtils is undefined
        delete window.TelemetryUtils;

        activateToggle.dispatchEvent(changeEvent);

        await new Promise(process.nextTick);

        expect(consoleSpy).toHaveBeenCalledWith("JulesTerminal API failed to load sources after activation.", mockError);
        consoleSpy.mockRestore();
    });

    it('handles empty sourceName to cleanup terminal', () => {
        EventBinder.bind(appMock);

        const changeEvent = new Event('change');
        Object.defineProperty(changeEvent, 'target', { value: { value: '' }, enumerable: true });

        appMock.elements.julesTerminal.classList.add('active');

        appMock.elements.julesRepoPicker.dispatchEvent(changeEvent);

        expect(appMock.elements.julesTerminal.classList.contains('active')).toBe(false);
        expect(appMock.elements.julesTerminal.innerHTML).toContain('Awaiting Agent launch command...');
        expect(appMock.julesTerminal.cleanup).toHaveBeenCalled();
    });

    it('resolves fetchPrompt successfully on mouseover', async () => {
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
        appMock.agentRepo.fetchPrompt.mockResolvedValue("Fetched Prompt Success");

        const event = new MouseEvent('mouseover', { bubbles: true });
        Object.defineProperty(event, 'target', { value: frontTarget, enumerable: true });

        mouseoverHandler(event);

        await new Promise(process.nextTick);
        await new Promise(process.nextTick); // let microtasks process completely

        expect(customAgent.prompt).toBe("Fetched Prompt Success");
    });
});
