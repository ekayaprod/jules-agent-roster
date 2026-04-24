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
            julesTerminal: { loadSources: jest.fn(), initialized: true, launchSession: jest.fn(), loadActiveSessionsForRepo: jest.fn(), loadPullRequestsForRepo: jest.fn(), cleanup: jest.fn() },
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

    it('gracefully degrades when JulesTerminal loadSources throws an unhandled exception', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        app.julesTerminal.loadSources.mockRejectedValueOnce(new Error('Network Initialization Failed'));
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

    // 🕵️ The Boundary Interrogation: Master Dropdown Toggle
    it('toggles master dropdown visibility and stops propagation', () => {
        EventBinder.bind(app);

        const btn = document.createElement('button');
        const menu = document.createElement('div');
        app.elements.masterDropdownBtn = btn;
        app.elements.masterDropdownMenu = menu;
        document.body.appendChild(btn);
        document.body.appendChild(menu);

        EventBinder.bind(app); // Re-bind with the new elements

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        btn.dispatchEvent(clickEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(menu.classList.contains('visible')).toBe(true);
    });

    // 🕵️ The Boundary Interrogation: Show Fusions Modal
    it('shows fusions modal when fusions target is clicked', () => {
        document.body.innerHTML = '';
        const btn = document.createElement('button');
        btn.setAttribute('data-action', 'open-fusions-modal');
        btn.setAttribute('data-index', '0');
        document.body.appendChild(btn);

        const modal = document.createElement('div');
        modal.id = 'fusionsModal';
        document.body.appendChild(modal);

        const content = document.createElement('div');
        content.id = 'fusionsModalContent';
        document.body.appendChild(content);

        const list = document.createElement('div');
        list.id = 'fusionsModalList';
        document.body.appendChild(list);

        const cardArea = document.createElement('div');
        cardArea.id = 'fusionsModalCard';
        document.body.appendChild(cardArea);

        const titleSpan = document.createElement('span');
        titleSpan.id = "fusionsModalAgent";
        document.body.appendChild(titleSpan);

        const emojiSpan = document.createElement('span');
        emojiSpan.id = "fusionsModalEmoji";
        document.body.appendChild(emojiSpan);

        app.fusionLab = {
            fusionIndex: { unlockedKeys: new Set(['Agent,Other']) },
            compiler: {
                fusionMatrixMap: { 'Agent,Other': 'FusionAgent' },
                customAgentsMap: { 'FusionAgent': { name: 'FusionAgent', prompt: 'prompt' } }
            }
        };
        app.getAgentForUI = jest.fn().mockReturnValue({ name: 'Agent' });
        app.fusionLab._fusionCacheByAgent = null;
        app.activeDropdowns = new Set();

        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadParentFusionsBtn';
        document.body.appendChild(downloadBtn);

        global.AgentUtils.getCustomAgent = jest.fn().mockReturnValue({ name: 'Fusion Agent' });
        global.FormatUtils.extractIcon = jest.fn().mockReturnValue('icon');
        global.FormatUtils.extractDisplayName = jest.fn().mockReturnValue('Fusion Agent');
        global.FormatUtils.escapeHTML = jest.fn().mockReturnValue('Fusion Agent');

        app.getAgentForUI.mockReturnValueOnce({ name: 'Agent' });

        EventBinder.bind(app);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(modal.classList.contains('visible')).toBe(true);
        expect(list.innerHTML).toContain('Fusion Agent');
    });

    it('views fusion card from modal when clicked', () => {
        const btn = document.createElement('button');
        btn.setAttribute('data-action', 'view-fusion-card');
        btn.setAttribute('data-index', '0');
        document.body.appendChild(btn);

        const cardArea = document.createElement('div');
        cardArea.id = 'fusionsModalCard';
        document.body.appendChild(cardArea);

        app.getAgentForUI.mockReturnValueOnce({ name: 'Fusion Agent' });

        const card = document.createElement('div');
        card.classList.add('pop-in');
        global.AgentCard.create = jest.fn().mockReturnValue(card);

        EventBinder.bind(app);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(cardArea.innerHTML).toContain('div');
        expect(card.classList.contains('pop-in')).toBe(false);
        expect(card.style.margin).toBe('0px');
    });

    it('downloads parent fusions when button is clicked', () => {
        const btn = document.createElement('button');
        btn.id = 'downloadParentFusionsBtn';
        btn.setAttribute('data-parent-name', 'Parent Agent');
        document.body.appendChild(btn);

        app.exportController = { downloadCustomAgentsByParent: jest.fn() };

        EventBinder.bind(app);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(app.exportController.downloadCustomAgentsByParent).toHaveBeenCalledWith('Parent Agent', btn);
    });

    it('closes fusions modal when close button is clicked', () => {
        document.body.innerHTML = '';
        const btn = document.createElement('button');
        btn.id = 'closeFusionsModalBtn';
        document.body.appendChild(btn);

        const modal = document.createElement('div');
        modal.id = 'fusionsModal';
        modal.classList.add('visible');
        document.body.appendChild(modal);

        EventBinder.bind(app);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(modal.classList.contains('visible')).toBe(false);
    });

    it('gracefully fails fusions modal without app.fusionLab', () => {
        const btn = document.createElement('button');
        btn.setAttribute('data-action', 'open-fusions-modal');
        btn.setAttribute('data-index', '0');
        document.body.appendChild(btn);

        const modal = document.createElement('div');
        modal.id = 'fusionsModal';
        document.body.appendChild(modal);

        const content = document.createElement('div');
        content.id = 'fusionsModalContent';
        document.body.appendChild(content);

        app.fusionLab = null;

        app.getAgentForUI.mockReturnValueOnce({ name: 'Agent' });
        global.AgentUtils.getCustomAgent = jest.fn().mockReturnValue(null);
        global.FormatUtils.extractIcon = jest.fn().mockReturnValue('icon');
        global.FormatUtils.extractDisplayName = jest.fn().mockReturnValue('Fusion Agent');
        global.FormatUtils.escapeHTML = jest.fn().mockReturnValue('Fusion Agent');

        EventBinder.bind(app);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(modal.classList.contains('visible')).toBe(false);
    });

    // 🕵️ The Boundary Interrogation: Interrogate Global Click Delegation (Search Clear)
    it('closes search if clicked outside and input is empty', () => {
        EventBinder.bind(app);

        const nav = document.createElement('nav');
        nav.classList.add('search-active');
        app.elements['category-nav'] = nav;

        app.elements.searchInput = document.createElement('input');
        app.elements.searchInput.value = '   ';

        document.body.appendChild(nav);

        const clickEvent = new MouseEvent('click', { bubbles: true });
        document.body.dispatchEvent(clickEvent);

        expect(app.clearSearch).toHaveBeenCalled();
    });

    // 🕵️ The Boundary Interrogation: Test julesRepoPicker DOM event integration
    it('interrogates julesRepoPicker change event with valid sourceName', async () => {
        const picker = document.createElement('select');
        picker.innerHTML = '<option value="repo1">repo1</option>';
        app.elements.julesRepoPicker = picker;

        app._cardHtmlCache.set('key', 'html');
        app._domNodeCache.set('key', document.createElement('div'));

        app.julesTerminal.loadActiveSessionsForRepo.mockResolvedValue();
        app.julesTerminal.loadPullRequestsForRepo.mockResolvedValue();

        EventBinder.bind(app);

        picker.value = 'repo1';
        picker.dispatchEvent(new Event('change'));

        // Allow async promises to resolve
        await new Promise(process.nextTick);

        expect(app._cardHtmlCache.size).toBe(0);
        expect(app._domNodeCache.size).toBe(0);
        expect(app.renderAgents).toHaveBeenCalled();
        expect(app.julesTerminal.loadActiveSessionsForRepo).toHaveBeenCalledWith('repo1');
        expect(app.julesTerminal.loadPullRequestsForRepo).toHaveBeenCalledWith('repo1');
        expect(app.julesTerminal.cleanup).not.toHaveBeenCalled();
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
        expect(app.julesTerminal.loadActiveSessionsForRepo).not.toHaveBeenCalled();
        expect(app.julesTerminal.cleanup).toHaveBeenCalled();
        expect(terminal.classList.contains('active')).toBe(false);
        expect(terminal.innerHTML).toContain('Awaiting Agent launch command');
    });
});
