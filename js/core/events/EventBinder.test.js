const { TextEncoder, TextDecoder } = require("util"); global.TextEncoder = TextEncoder; global.TextDecoder = TextDecoder;

describe('EventBinder (Boundary Interrogation)', () => {
    let app;
    let EventBinder;

    beforeEach(() => {
        document.body.innerHTML = '<div id="toast"></div><div id="masterDropdownMenu"></div><div id="fusionsModal"></div>';

        global.DOMUtils = { closeDropdownMenu: jest.fn() };
        global.SEARCH_DEBOUNCE_MS = 300;
        global.PerformanceUtils = { debounce: (f) => f };
        global.CSS = { escape: (str) => str };
        global.AgentCard = { getPromptNode: jest.fn().mockReturnValue(document.createElement('div')) };
        global.AgentUtils = { getPromptUrl: jest.fn().mockReturnValue('http://prompt'), getValidCustomAgents: jest.fn().mockReturnValue([]) };
        global.DownloadUtils = { downloadTextFile: jest.fn() };
        global.ClipboardUtils = { copyText: jest.fn(), animateButtonSuccess: jest.fn() };
        global.FormatUtils = { formatAgentPrompts: jest.fn(), CUSTOM_ROSTER_HEADER: '' };

        app = {
            elements: { searchInput: document.createElement('input'), masterCopyBtn: document.createElement('button'), masterDownloadCoreBtn: document.createElement('button'), masterCopyFusionsBtn: document.createElement('button'), masterDownloadFusionsBtn: document.createElement('button') },
            activeDropdowns: new Set(),
            toast: { show: jest.fn() }, showToast: jest.fn(), renderAgents: jest.fn(),
            filterAgents: jest.fn(), renderAgents: jest.fn(),
            clearSearch: jest.fn(),
            copyAgent: jest.fn(),
            copyAll: jest.fn(),
            downloadAll: jest.fn(),
            downloadCustomAgents: jest.fn(),
            julesManager: { loadSources: jest.fn(), initialized: true, launchSession: jest.fn(), loadActiveSessionsForRepo: jest.fn(), loadPullRequestsForRepo: jest.fn(), cleanup: jest.fn() },
            pinnedManager: { togglePin: jest.fn().mockReturnValue(true), getPinned: jest.fn().mockReturnValue(['0']) },
            getAgentForUI: jest.fn().mockReturnValue({ name: 'Agent', prompt: 'prompt content' }),
            agentRepo: { fetchPrompt: jest.fn().mockResolvedValue('fetched prompt content') },
            exportController: { downloadCustomAgentsByParent: jest.fn() },
            _cardHtmlCache: new Map(),
            _domNodeCache: new Map()
        };

        EventBinder = require('./EventBinder');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('gracefully degrades when JulesManager loadSources throws an unhandled exception', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        app.julesManager.loadSources.mockRejectedValueOnce(new Error('Network Initialization Failed'));
        const activateToggle = document.createElement('input');
        activateToggle.type = 'checkbox';
        activateToggle.id = 'julesActivateToggle';
        document.body.appendChild(activateToggle);

        EventBinder.bind(app);

        activateToggle.checked = true;
        const changeEvent = new Event('change');

        expect(() => activateToggle.dispatchEvent(changeEvent)).not.toThrow();

        // Wait for next tick so the async catch handler runs
        await new Promise(process.nextTick);
        consoleSpy.mockRestore();
    });

    it('toggles pin and synchronizes aria-pressed for valid agent index', () => {
        EventBinder.bind(app);

        const card = document.createElement('div');
        card.classList.add('flip-card');

        const pinBtn = document.createElement('button');
        pinBtn.setAttribute('data-action', 'toggle-pin');
        pinBtn.setAttribute('data-index', '0');
        pinBtn.setAttribute('aria-pressed', 'false');
        card.appendChild(pinBtn);
        document.body.appendChild(card);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        pinBtn.dispatchEvent(clickEvent);

        expect(app.pinnedManager.togglePin).toHaveBeenCalledWith('0');
        expect(pinBtn.classList.contains('pinned')).toBe(true);
        expect(pinBtn.getAttribute('aria-pressed')).toBe('true');
    });

    it('flips card back and stops propagation', () => {
        EventBinder.bind(app);

        const card = document.createElement('div');
        card.classList.add('flip-card', 'flipped');

        const flipBackBtn = document.createElement('button');
        flipBackBtn.setAttribute('data-action', 'flip-card-back');
        card.appendChild(flipBackBtn);
        document.body.appendChild(card);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        flipBackBtn.dispatchEvent(clickEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(card.classList.contains('flipped')).toBe(false);
    });

    it('closes specific dropdowns when Escape is pressed', () => {
        EventBinder.bind(app);

        const dropdown = document.createElement('div');
        dropdown.id = 'card-dropdown-0';
        dropdown.classList.add('dropdown-menu', 'visible');
        document.body.appendChild(dropdown);
        app.activeDropdowns.add(dropdown);

        const toggleBtn = document.createElement('button');
        toggleBtn.setAttribute('data-action', 'toggle-card-dropdown');
        toggleBtn.setAttribute('data-index', '0');
        document.body.appendChild(toggleBtn);

        const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escEvent);

        expect(global.DOMUtils.closeDropdownMenu).toHaveBeenCalledWith(dropdown, app);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    // 🕵️ The Boundary Interrogation: Test julesRepoPicker DOM event integration
    it('interrogates julesRepoPicker change event with valid sourceName', async () => {
        const picker = document.createElement('select');
        picker.innerHTML = '<option value="repo1">repo1</option>';
        app.elements.julesRepoPicker = picker;

        app._cardHtmlCache.set('key', 'html');
        app._domNodeCache.set('key', document.createElement('div'));

        app.julesManager.loadActiveSessionsForRepo.mockResolvedValue();
        app.julesManager.loadPullRequestsForRepo.mockResolvedValue();

        EventBinder.bind(app);

        picker.value = 'repo1';
        picker.dispatchEvent(new Event('change'));

        // Allow async promises to resolve
        await new Promise(process.nextTick);

        expect(app._cardHtmlCache.size).toBe(0);
        expect(app._domNodeCache.size).toBe(0);
        expect(app.renderAgents).toHaveBeenCalled();
        expect(app.julesManager.loadActiveSessionsForRepo).toHaveBeenCalledWith('repo1');
        expect(app.julesManager.loadPullRequestsForRepo).toHaveBeenCalledWith('repo1');
        expect(app.julesManager.cleanup).not.toHaveBeenCalled();
    });

    it('interrogates julesRepoPicker change event with falsy sourceName', async () => {
        const picker = document.createElement('select');
        picker.innerHTML = '<option value="">none</option>';
        app.elements.julesRepoPicker = picker;

        const terminal = document.createElement('div');
        terminal.classList.add('active');
        app.elements.julesTerminal = terminal;

        EventBinder.bind(app);

        picker.value = '';
        picker.dispatchEvent(new Event('change'));

        // Allow async promises to resolve
        await new Promise(process.nextTick);

        expect(app.renderAgents).toHaveBeenCalled();
        expect(app.julesManager.loadActiveSessionsForRepo).not.toHaveBeenCalled();
        expect(app.julesManager.cleanup).toHaveBeenCalled();
        expect(terminal.classList.contains('active')).toBe(false);
        expect(terminal.innerHTML).toContain('Awaiting Agent launch command');
    });
});
