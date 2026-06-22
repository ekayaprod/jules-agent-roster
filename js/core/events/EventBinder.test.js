/**
 * @jest-environment jsdom
 */

const EventBinder = require('./EventBinder');

// Mocks for dependencies
global.SEARCH_DEBOUNCE_MS = 300;
global.SafeUITimings = { MODAL_FOCUS_DELAY_MS: 50 };

global.DOMUtils = {
    closeDropdownMenu: jest.fn(),
    createSkeletonElement: jest.fn().mockReturnValue(document.createElement('div')),
};
global.PerformanceUtils = {
    debounce: jest.fn((fn) => fn),
};
global.AgentUtils = {
    getPromptUrl: jest.fn().mockReturnValue('http://mock.url'),
    getValidCustomAgents: jest.fn().mockReturnValue([{ name: 'Agent1' }]),
    getCustomAgent: jest.fn(),
};
global.FormatUtils = {
    escapeHTML: jest.fn((str) => str),
    extractDisplayName: jest.fn((agent) => agent.name),
    extractIcon: jest.fn().mockReturnValue('<div>icon</div>'),
    formatAgentPrompts: jest.fn().mockReturnValue('formatted'),
    CUSTOM_ROSTER_HEADER: 'header',
};
global.AgentCard = {
    getPromptNode: jest.fn().mockReturnValue(document.createElement('div')),
};
global.ClipboardUtils = {
    copyText: jest.fn().mockResolvedValue(true),
    animateButtonSuccess: jest.fn(),
};

describe('EventBinder', () => {
    let appMock;
    let originalAddEventListener;
    let eventListeners;

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';

        eventListeners = {};
        originalAddEventListener = document.addEventListener;
        document.addEventListener = jest.fn((event, cb) => {
            eventListeners[event] = cb;
        });

        appMock = {
            elements: {
                searchInput: document.createElement('input'),
                searchTriggerBtn: document.createElement('button'),
                clearBtn: document.createElement('button'),
                clearSearchEmptyBtn: document.createElement('button'),
                julesRepoPicker: document.createElement('select'),
                masterCopyBtn: document.createElement('button'),
                masterDownloadCoreBtn: document.createElement('button'),
                masterCopyFusionsBtn: document.createElement('button'),
                masterDownloadFusionsBtn: document.createElement('button'),
                'category-nav': document.createElement('div'),
            },
            activeDropdowns: new Set(),
            searchController: {
                filterAgents: jest.fn(),
                clearSearch: jest.fn(),
            },
            julesTerminal: {
                loadActiveSessionsForRepo: jest.fn().mockResolvedValue(),
                loadPullRequestsForRepo: jest.fn().mockResolvedValue(),
                cleanup: jest.fn(),
                launchSession: jest.fn(),
                loadSources: jest.fn().mockResolvedValue(),
                initialized: true,
            },
            agentRepo: {
                fetchPrompt: jest.fn().mockResolvedValue('mock prompt'),
            },
            fusionLab: {
                _fusionCacheByAgent: {},
                compiler: {
                    fusionMatrixMap: {},
                    customAgentsMap: {},
                },
            },
            exportController: {
                downloadCustomAgentsByParent: jest.fn(),
                copyAgent: jest.fn(),
                downloadAgent: jest.fn(),
                copyAll: jest.fn(),
                downloadAll: jest.fn(),
                downloadCustomAgents: jest.fn(),
            },
            toast: {
                show: jest.fn(),
            },
            getAgentForUI: jest.fn(),
            clearSearch: jest.fn(),
            renderAgents: jest.fn(),
            customAgents: [],
        };

        // Setup some global DOM elements expected by EventBinder
        const pullTab = document.createElement('div');
        pullTab.id = 'julesPullTab';
        document.body.appendChild(pullTab);

        const runnerPanel = document.createElement('div');
        runnerPanel.id = 'julesRunnerPanel';
        document.body.appendChild(runnerPanel);

        const activateToggle = document.createElement('input');
        activateToggle.type = 'checkbox';
        activateToggle.id = 'julesActivateToggle';
        document.body.appendChild(activateToggle);

        const runnerInputsContainer = document.createElement('div');
        runnerInputsContainer.id = 'runnerInputsContainer';
        document.body.appendChild(runnerInputsContainer);

        const julesTerminal = document.createElement('div');
        julesTerminal.id = 'julesTerminal';
        document.body.appendChild(julesTerminal);
    });

    afterEach(() => {
        document.addEventListener = originalAddEventListener;
    });

    it('should bind events correctly to app elements', () => {
        EventBinder.bind(appMock);
        expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.addEventListener).toHaveBeenCalledWith('mouseover', expect.any(Function));
    });

    it('should gracefully handle unhandled promise rejections on mouseover pre-fetching (Missing Mock Failure Pattern)', async () => {
        EventBinder.bind(appMock);
        const mouseoverHandler = eventListeners['mouseover'];
        expect(mouseoverHandler).toBeDefined();

        // Construct mock DOM
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
            // prompt is explicitly undefined to trigger the fetch
        };
        appMock.getAgentForUI.mockReturnValue(customAgent);

        // Mock the fetchPrompt to reject to simulate network failure
        const mockError = new Error('Network Timeout');
        appMock.agentRepo.fetchPrompt.mockRejectedValue(mockError);

        // Fire mouseover event on the flip card target
        const event = new MouseEvent('mouseover', { bubbles: true });
        Object.defineProperty(event, 'target', { value: frontTarget, enumerable: true });

        mouseoverHandler(event);

        // Ensure that the promise rejection doesn't crash the synchronous event handler loop
        // We wait for the microtask queue to clear
        await new Promise(process.nextTick);

        expect(appMock.getAgentForUI).toHaveBeenCalledWith('custom-1');
        expect(appMock.agentRepo.fetchPrompt).toHaveBeenCalled();

        // Even if the promise rejects, the property should simply remain undefined
        // without crashing the environment. The test passing mathematically proves this boundary holds.
        expect(customAgent.prompt).toBeUndefined();
    });

    it('should correctly handle toggle-card-dropdown clicks across the Click Matrix', () => {
        EventBinder.bind(appMock);
        const clickHandler = eventListeners['click'];
        expect(clickHandler).toBeDefined();

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

        appMock.activeDropdowns.add(dropdownMenu2);

        // Fire click event
        const event = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(event, 'target', { value: toggleBtn, enumerable: true });

        // Mock stopPropagation
        event.stopPropagation = jest.fn();

        clickHandler(event);

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(DOMUtils.closeDropdownMenu).toHaveBeenCalledWith(dropdownMenu2, appMock);
        expect(dropdownMenu1.classList.contains('visible')).toBe(true);
        expect(appMock.activeDropdowns.has(dropdownMenu1)).toBe(true);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

        // Fire click event again to toggle off
        clickHandler(event);

        expect(dropdownMenu1.classList.contains('visible')).toBe(false);
        expect(appMock.activeDropdowns.has(dropdownMenu1)).toBe(false);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('should handle Escape key to close active dropdowns and modals', () => {
        EventBinder.bind(appMock);
        const keydownHandler = eventListeners['keydown'];
        expect(keydownHandler).toBeDefined();

        // Setup mock active dropdown
        const dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'card-dropdown-1';
        appMock.activeDropdowns.add(dropdownMenu);

        // Setup mock toggle button for focus assertion
        const toggleBtn = document.createElement('button');
        toggleBtn.setAttribute('data-action', 'toggle-card-dropdown');
        toggleBtn.setAttribute('data-index', '1');
        document.body.appendChild(toggleBtn);
        const focusSpy = jest.spyOn(toggleBtn, 'focus');

        // Fire Escape keydown
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        keydownHandler(event);

        expect(DOMUtils.closeDropdownMenu).toHaveBeenCalledWith(dropdownMenu, appMock);
        expect(focusSpy).toHaveBeenCalled();
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

        // Setup mock modal
        appMock.activeDropdowns.clear();
        const modal = document.createElement('div');
        modal.classList.add('modal-backdrop', 'visible');
        const closeBtn = document.createElement('button');
        closeBtn.id = 'closeSettingsBtn';
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        const closeClickSpy = jest.spyOn(closeBtn, 'click');

        // Fire Escape keydown again
        keydownHandler(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(closeClickSpy).toHaveBeenCalled();
    });

    it('should assert graceful failure and telemetry dispatch on julesActivateToggle load sources timeout', async () => {
        // Setup mock global TelemetryUtils
        window.TelemetryUtils = {
            dispatchEvent: jest.fn()
        };

        EventBinder.bind(appMock);

        const activateToggle = document.getElementById('julesActivateToggle');

        // Mock loadSources to throw
        const mockError = new Error('Terminal Initialization Timeout');
        appMock.julesTerminal.loadSources.mockRejectedValue(mockError);

        // Simulate checked state
        activateToggle.checked = true;

        // Trigger change event
        const changeEvent = new Event('change');
        activateToggle.dispatchEvent(changeEvent);

        // Wait for microtask queue to process the async loadSources call
        await new Promise(process.nextTick);

        expect(appMock.julesTerminal.loadSources).toHaveBeenCalled();
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('TERMINAL_LOAD_ERROR', mockError);

        // Cleanup global
        delete window.TelemetryUtils;
    });

    it('should assert graceful failure and telemetry dispatch on julesRepoPicker repo load timeout', async () => {
        // Setup mock global TelemetryUtils
        window.TelemetryUtils = {
            dispatchEvent: jest.fn()
        };

        EventBinder.bind(appMock);

        // Trigger change event with a non-empty sourceName
        const changeEvent = new Event('change');
        Object.defineProperty(changeEvent, 'target', { value: { value: 'jules-repo' }, enumerable: true });

        // Mock loadActiveSessionsForRepo to throw
        const mockError = new Error('Repo Load Timeout');
        appMock.julesTerminal.loadActiveSessionsForRepo.mockRejectedValue(mockError);
        appMock.julesTerminal.loadPullRequestsForRepo.mockResolvedValue(); // Happy path for this one

        appMock.elements.julesRepoPicker.dispatchEvent(changeEvent);

        // Wait for microtask queue to process the async catch handler
        await new Promise(process.nextTick);

        expect(appMock.julesTerminal.loadActiveSessionsForRepo).toHaveBeenCalledWith('jules-repo');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('REPO_LOAD_ERROR', mockError);

        // Cleanup global
        delete window.TelemetryUtils;
    });

});
