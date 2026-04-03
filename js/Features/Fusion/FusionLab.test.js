const { BUTTON_STATES } = require("../../constants/ui.js");
global.BUTTON_STATES = BUTTON_STATES;
global.AgentUtils = require('../../Utils/agent-utils.js');
const FusionLab = require('./FusionLab');
const FormatUtils = require('../../Utils/format-utils');

describe('FusionLab Security', () => {
    let fusionLab;
    let mockElements;

    beforeEach(() => {
        fusionLab = new FusionLab();
        mockElements = {
            slotACard: {
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            },
            slotBCard: {
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            }
        };
        fusionLab.elements = mockElements;
        global.FormatUtils = FormatUtils;
    });

    test('renderSlots should escape agent name and emoji in innerHTML', () => {
        const maliciousAgent = {
            name: '<img src=x onerror=alert(1)>',
            emoji: '<script>alert("XSS")</script>'
        };

        fusionLab.state.slotA = maliciousAgent;
        fusionLab.renderSlots();

        const slotAContent = mockElements.slotACard.querySelector.mock.results[0].value;

        expect(slotAContent.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
        expect(slotAContent.innerHTML).not.toContain('<script>alert("XSS")</script>');
        expect(slotAContent.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(slotAContent.innerHTML).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('getPreMergePreviewHTML should escape agent name and emoji', () => {
        const agentA = { name: 'AgentA', emoji: '🍎' };
        const agentB = { name: 'AgentB', emoji: '🍌' };
        const maliciousResult = {
            name: '<img src=x onerror=alert(1)>',
            emoji: '<script>alert("XSS")</script>'
        };

        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.compiler = {
            fuse: jest.fn().mockReturnValue(maliciousResult)
        };
        fusionLab.fusionIndex = {
            isUnlocked: jest.fn().mockReturnValue(true)
        };

        const previewHTML = fusionLab.getPreMergePreviewHTML(agentB);

        expect(previewHTML).not.toContain('<img src=x onerror=alert(1)>');
        expect(previewHTML).not.toContain('<script>alert("XSS")</script>');
        expect(previewHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(previewHTML).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
});

describe('FusionLab.getPreMergePreviewHTML Edge Cases', () => {
    let fusionLab;
    const agentA = { name: 'AgentA', emoji: '🍎' };
    const agentB = { name: 'AgentB', emoji: '🍌' };

    beforeEach(() => {
        fusionLab = new FusionLab();
        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.compiler = {
            fuse: jest.fn().mockReturnValue({ name: 'Result', emoji: '🧬' })
        };
        fusionLab.fusionIndex = {
            isUnlocked: jest.fn().mockReturnValue(true)
        };
        global.FormatUtils = FormatUtils;
    });

    test('should return null if agentA is missing', () => {
        fusionLab.state.slotA = null;
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return null if agentB is missing', () => {
        fusionLab.state.slotB = null;
        expect(fusionLab.getPreMergePreviewHTML(agentA)).toBeNull();
    });

    test('should return null if agentA and agentB have the same name', () => {
        fusionLab.state.slotA = agentA;
        fusionLab.state.slotB = agentB;
        fusionLab.picker = { activePickerSlot: 'slotB' };
        // Passing agentA when slotA is already agentA should return null
        expect(fusionLab.getPreMergePreviewHTML(agentA)).toBeNull();
    });

    test('should return null if fusionIndex is not defined', () => {
        fusionLab.fusionIndex = undefined;
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return null if fusion is not unlocked in index', () => {
        fusionLab.fusionIndex.isUnlocked.mockReturnValue(false);
        expect(fusionLab.getPreMergePreviewHTML(agentB)).toBeNull();
    });

    test('should return preview HTML if fusion is unlocked', () => {
        const result = fusionLab.getPreMergePreviewHTML(agentB);
        expect(result).toContain('Already Discovered');
        expect(result).toContain('Result');
        expect(result).toContain('🧬');
    });

    test('should handle picker active slot override', () => {
        fusionLab.state.slotA = null;
        fusionLab.picker = { activePickerSlot: 'slotA' };
        const result = fusionLab.getPreMergePreviewHTML(agentA);
        expect(result).not.toBeNull();
        expect(result).toContain('Result');
    });
});

describe('FusionLab Interaction Handlers and Edge Cases', () => {
    let fusionLab;
    let mockElements;

    beforeEach(() => {
        fusionLab = new FusionLab();
        mockElements = {
            fuseBtn: {
                setAttribute: jest.fn(),
                removeAttribute: jest.fn(),
                classList: { remove: jest.fn(), add: jest.fn() }
            },
            errorEl: {
                hidden: true,
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            },
            labContent: {
                classList: { remove: jest.fn(), add: jest.fn() }
            },
            textSpan: {
                innerText: ''
            },
            slotACard: {
                focus: jest.fn(),
                scrollIntoView: jest.fn(),
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            },
            slotBCard: {
                focus: jest.fn(),
                scrollIntoView: jest.fn(),
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            },
            fusionResultContainer: {
                classList: { remove: jest.fn(), add: jest.fn() },
                innerHTML: '',
                appendChild: jest.fn(),
                querySelector: jest.fn().mockReturnValue({
                    setAttribute: jest.fn(),
                    focus: jest.fn(),
                    scrollIntoView: jest.fn()
                })
            },
            resetLabBtn: {
                classList: { remove: jest.fn(), add: jest.fn() }
            }
        };
        fusionLab.elements = mockElements;
        fusionLab.compiler = {
            fuse: jest.fn().mockReturnValue({ name: 'FusedResult' })
        };
        fusionLab.fusionIndex = {
            isUnlocked: jest.fn().mockReturnValue(true),
            unlock: jest.fn(),
            customAgents: {}
        };
        fusionLab.agentMap = new Map();

        global.DOMUtils = {
            setButtonState: jest.fn()
        };

        global.AgentCard = {
            create: jest.fn().mockReturnValue({
                classList: { remove: jest.fn(), add: jest.fn() }
            })
        };
    });

    test('handlePickerSelection sets agent, renders slots and clears error', () => {
        fusionLab.renderSlots = jest.fn();
        fusionLab.clearError = jest.fn();

        fusionLab.handlePickerSelection('slotA', { name: 'A' });

        expect(fusionLab.state.slotA).toEqual({ name: 'A' });
        expect(fusionLab.renderSlots).toHaveBeenCalled();
        expect(fusionLab.clearError).toHaveBeenCalled();
    });

    test('updateState sets button to Select Protocols and aria-disabled to true when both slots are empty', () => {
        fusionLab.state.slotA = null;
        fusionLab.state.slotB = null;
        fusionLab.updateState();
        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
        expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(mockElements.fuseBtn, "disabled", "Select Protocols");
    });

    test('updateState sets button to Select Agent A and aria-disabled to true when slotA is empty', () => {
        fusionLab.state.slotA = null;
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.updateState();
        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
        expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(mockElements.fuseBtn, "disabled", "Select Agent A");
    });

    test('updateState sets button to Select Agent B and aria-disabled to true when slotB is empty', () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = null;
        fusionLab.updateState();
        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
        expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(mockElements.fuseBtn, "disabled", "Select Agent B");
    });

    test('updateState sets button to Ignite Fusion Protocol and aria-disabled to false when both slots are filled', () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.updateState();
        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-disabled", "false");
        expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(mockElements.fuseBtn, "ready", "Ignite Fusion Protocol");
    });

    test('updateState handles missing fuseBtn gracefully', () => {
        fusionLab.elements.fuseBtn = null;
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        // Should not throw
        expect(() => fusionLab.updateState()).not.toThrow();
    });

    test('showError with missing slotA guides user to slotA', () => {
        fusionLab.state.slotA = null;
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.showError("Missing A");

        expect(mockElements.errorEl.hidden).toBe(false);
        expect(mockElements.textSpan.innerText).toBe("Missing A");
        expect(mockElements.slotACard.focus).toHaveBeenCalled();
        expect(mockElements.slotACard.scrollIntoView).toHaveBeenCalled();
    });

    test('showError with missing slotB guides user to slotB', () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = null;
        fusionLab.showError("Missing B");

        expect(mockElements.slotBCard.focus).toHaveBeenCalled();
    });

    test('clearError resets all error attributes', () => {
        mockElements.errorEl.hidden = false;
        fusionLab.clearError();

        expect(mockElements.errorEl.hidden).toBe(true);
        expect(mockElements.errorEl.removeAttribute).toHaveBeenCalledWith("aria-live");
        expect(mockElements.fuseBtn.classList.remove).toHaveBeenCalledWith("error");
        expect(mockElements.fuseBtn.removeAttribute).toHaveBeenCalledWith("aria-live");
        expect(mockElements.fuseBtn.removeAttribute).toHaveBeenCalledWith("aria-busy");
    });

    test('handleFusion fails securely when missing components', async () => {
        fusionLab.state.slotA = null;
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.showError = jest.fn();

        await fusionLab.handleFusion();

        expect(fusionLab.showError).toHaveBeenCalledWith("Select both protocols to initiate fusion.");
        expect(fusionLab.compiler.fuse).not.toHaveBeenCalled();
    });

    test('handleFusion displays specific error if fusion returns Error result', async () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.compiler.fuse.mockReturnValue({ name: 'Error', prompt: 'Invalid agents selected.' });
        fusionLab.showError = jest.fn();

        await fusionLab.handleFusion();

        expect(fusionLab.showError).toHaveBeenCalledWith("Select two distinct agents to initiate the fusion protocol.");
    });

    test('handleFusion successfully unlocks known custom agent and delegates animation', async () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.fusionIndex.customAgents['A,B'] = true;

        const fusedAgent = { name: 'C' };
        fusionLab.compiler.fuse.mockReturnValue(fusedAgent);

        fusionLab.animation = {
            runAnimation: jest.fn()
        };
        fusionLab.renderFusionResult = jest.fn();

        await fusionLab.handleFusion();

        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-live", "polite");
        expect(mockElements.fuseBtn.setAttribute).toHaveBeenCalledWith("aria-busy", "true");
        expect(mockElements.labContent.classList.add).toHaveBeenCalledWith("hidden");
        expect(fusionLab.fusionIndex.unlock).toHaveBeenCalledWith('A,B');
        expect(fusionLab.renderFusionResult).toHaveBeenCalledWith(fusedAgent);
        expect(fusionLab.animation.runAnimation).toHaveBeenCalled();
    });

    test('handleFusion gracefully handles fusionIndex unlock exception', async () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.fusionIndex.customAgents['A,B'] = true;

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        fusionLab.fusionIndex.unlock.mockImplementation(() => {
            throw new Error('Unlock failure');
        });

        const fusedAgent = { name: 'C' };
        fusionLab.compiler.fuse.mockReturnValue(fusedAgent);

        fusionLab.animation = { runAnimation: jest.fn() };
        fusionLab.renderFusionResult = jest.fn();

        await fusionLab.handleFusion();

        expect(consoleSpy).toHaveBeenCalledWith("FusionLab: Failed to unlock index", expect.any(Error));
        expect(fusionLab.renderFusionResult).toHaveBeenCalledWith(fusedAgent);
        expect(fusionLab.animation.runAnimation).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('handleShelfSelection updates visually and shows result without animation', () => {
        const agentA = { name: 'A' };
        const agentB = { name: 'B' };
        fusionLab.agentMap.set('A', agentA);
        fusionLab.agentMap.set('B', agentB);

        const fusedResult = { name: 'C' };
        fusionLab.compiler.fuse.mockReturnValue(fusedResult);

        fusionLab.renderSlots = jest.fn();
        fusionLab.clearError = jest.fn();
        fusionLab.renderFusionResult = jest.fn();
        fusionLab.showResult = jest.fn();

        fusionLab.handleShelfSelection('A,B');

        expect(fusionLab.state.slotA).toBe(agentA);
        expect(fusionLab.state.slotB).toBe(agentB);
        expect(fusionLab.renderSlots).toHaveBeenCalled();
        expect(fusionLab.clearError).toHaveBeenCalled();
        expect(fusionLab.renderFusionResult).toHaveBeenCalledWith(fusedResult);
        expect(fusionLab.showResult).toHaveBeenCalled();
    });

    test('handleShelfSelection bails out securely on malformed key', () => {
        fusionLab.handleShelfSelection('MalformedKeyWithoutComma');
        expect(fusionLab.state.slotA).toBeNull();
    });

    test('handleShelfSelection bails out securely if agents are not found in map', () => {
        fusionLab.handleShelfSelection('Missing,Agents');
        expect(fusionLab.state.slotA).toBeNull();
    });

    test('renderFusionResult manages container state and appending custom agent card', () => {
        const result = { name: 'CustomResult' };
        fusionLab.compiler.customAgentsMap = {
            'customKey123': { name: 'CustomResult' }
        };

        fusionLab.renderFusionResult(result);

        expect(mockElements.fusionResultContainer.classList.add).toHaveBeenCalledWith("hidden");
        expect(mockElements.fusionResultContainer.classList.remove).toHaveBeenCalledWith("fusion-revealed");
        expect(global.AgentCard.create).toHaveBeenCalledWith(result, 'customKey123', 0);
        expect(mockElements.fusionResultContainer.appendChild).toHaveBeenCalled();
    });

    test('resetLab clears state and resets UI elements', () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.renderSlots = jest.fn();

        fusionLab.resetLab();

        expect(fusionLab.state.slotA).toBeNull();
        expect(fusionLab.state.slotB).toBeNull();
        expect(mockElements.fusionResultContainer.classList.add).toHaveBeenCalledWith("hidden");
        expect(mockElements.resetLabBtn.classList.add).toHaveBeenCalledWith("hidden");
        expect(mockElements.labContent.classList.remove).toHaveBeenCalledWith("hidden");
        expect(fusionLab.renderSlots).toHaveBeenCalled();
    });

    test('showResult configures UI for revealed state and focuses element', () => {
        const mockTitle = mockElements.fusionResultContainer.querySelector();

        fusionLab.showResult();

        expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(mockElements.fuseBtn, "ready", "Ignite Fusion Protocol");
        expect(mockElements.fusionResultContainer.classList.remove).toHaveBeenCalledWith("hidden");
        expect(mockElements.fusionResultContainer.classList.add).toHaveBeenCalledWith("fusion-revealed");
        expect(mockElements.resetLabBtn.classList.remove).toHaveBeenCalledWith("hidden");
        expect(mockTitle.focus).toHaveBeenCalled();
        expect(mockTitle.scrollIntoView).toHaveBeenCalled();
    });
});

describe('FusionLab Initialization and Bindings', () => {
    let fusionLab;
    let mockElements;

    // Mock classes for instantiation
    class MockFusionCompiler { constructor() { this.fusionMatrixMap = {}; this.customAgentsMap = {}; this.baseAgents = []; } }
    class MockFusionIndex { constructor() { this.init = jest.fn(); } }
    class MockAgentPicker { constructor() { this.openPicker = jest.fn(); } }
    class MockFusionAnimation { constructor() {} }

    beforeEach(() => {
        fusionLab = new FusionLab();

        // Restore globals
        global.FusionCompiler = MockFusionCompiler;
        global.FusionIndex = MockFusionIndex;
        global.AgentPicker = MockAgentPicker;
        global.FusionAnimation = MockFusionAnimation;

        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            const el = {
                id,
                addEventListener: jest.fn(),
                classList: { remove: jest.fn(), add: jest.fn() },
                setAttribute: jest.fn(),
                removeAttribute: jest.fn(),
                querySelector: jest.fn().mockReturnValue({ innerHTML: '' })
            };
            return el;
        });

        // Mock window properties if used in bindings
        global.window.rosterApp = { showToast: jest.fn() };
        global.ClipboardUtils = { copyText: jest.fn().mockResolvedValue(), animateButtonSuccess: jest.fn() };
    });

    afterEach(() => {
        delete global.FusionCompiler;
        delete global.FusionIndex;
        delete global.AgentPicker;
        delete global.FusionAnimation;
        delete global.ClipboardUtils;
        delete global.window.rosterApp;
        jest.clearAllMocks();
    });

    test('init sets up dependencies correctly', () => {
        const agents = [{ name: 'Agent1' }, { name: 'Agent2' }];
        const customAgents = { 'Agent1,Agent2': 'FusedAgent' };
        const fusionMatrix = { 'Agent1,Agent2': 'FusedAgent' };

        fusionLab.bindEvents = jest.fn();
        fusionLab.renderSlots = jest.fn();

        fusionLab.init(agents, customAgents, fusionMatrix);

        expect(fusionLab.agents).toBe(agents);
        expect(fusionLab.agentMap.get('Agent1')).toEqual({ name: 'Agent1' });
        expect(fusionLab.compiler).toBeInstanceOf(MockFusionCompiler);
        expect(fusionLab.fusionIndex).toBeInstanceOf(MockFusionIndex);
        expect(fusionLab.picker).toBeInstanceOf(MockAgentPicker);
        expect(fusionLab.fusionIndex.init).toHaveBeenCalled();
        expect(fusionLab.bindEvents).toHaveBeenCalled();
        expect(fusionLab.renderSlots).toHaveBeenCalled();
    });

    test('bindEvents attaches click listeners correctly', async () => {
        fusionLab.init([], {}, {}); // Run init to populate this.elements

        const mockEvent = { currentTarget: 'btn' };

        // Trigger slotACard click
        const slotAHandler = fusionLab.elements.slotACard.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        slotAHandler();
        expect(fusionLab.picker.openPicker).toHaveBeenCalledWith('slotA', fusionLab.state.slotA);

        // Trigger slotBCard click
        const slotBHandler = fusionLab.elements.slotBCard.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        slotBHandler();
        expect(fusionLab.picker.openPicker).toHaveBeenCalledWith('slotB', fusionLab.state.slotB);

        // Trigger fuseBtn click
        fusionLab.handleFusion = jest.fn();
        const fuseBtnHandler = fusionLab.elements.fuseBtn.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        fuseBtnHandler();
        expect(fusionLab.handleFusion).toHaveBeenCalled();

        // Trigger resetLabBtn click
        fusionLab.resetLab = jest.fn();
        const resetBtnHandler = fusionLab.elements.resetLabBtn.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        resetBtnHandler();
        expect(fusionLab.resetLab).toHaveBeenCalled();

        // Trigger copyFusionBtn click
        fusionLab.lastFusionResult = { prompt: 'Sample Prompt' };
        const copyBtnHandler = fusionLab.elements.copyFusionBtn.addEventListener.mock.calls.find(c => c[0] === 'click')[1];
        await copyBtnHandler(mockEvent);
        expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('Sample Prompt');
        expect(global.window.rosterApp.showToast).toHaveBeenCalledWith("Fusion copied to clipboard");
        expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith('btn', "Copied!");
    });
});
