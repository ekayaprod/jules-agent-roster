/**
 * @jest-environment jsdom
 */

const FusionIndex = require('./FusionIndex');

describe('FusionIndex', () => {
    let fusionIndex;
    let mockStorageUtils;
    let mockFormatUtils;

    beforeEach(() => {
        // Mock dependencies
        mockStorageUtils = {
            getJsonArrayItem: jest.fn(),
            setJsonItem: jest.fn()
        };
        global.StorageUtils = mockStorageUtils;

        mockFormatUtils = {
            extractIcon: jest.fn().mockReturnValue('❓')
        };
        global.FormatUtils = mockFormatUtils;
        global.AgentUtils = require('../../Utils/agent-utils');

        // Setup DOM
        document.body.innerHTML = '<div id="fusion-container"></div>';

        const fusionMatrix = {
            'AgentA,AgentB': 'SuperAgent',
            'AgentC,AgentD': 'LameAgent',
            'Bad"Key\\': 'Hacker'
        };

        const customAgentsData = {
            'SuperAgent': { name: 'SuperAgent', tier: 'Epic', emoji: '🦸' },
            'LameAgent': { name: 'LameAgent', tier: 'Common', emoji: '🦥' },
            'Hacker': { name: 'Hacker', tier: 'Legendary', emoji: '💀' }
        };

        fusionIndex = new FusionIndex('fusion-container', fusionMatrix, jest.fn());
        fusionIndex.customAgents = fusionMatrix;
        fusionIndex.fullCustomAgents = customAgentsData;
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete global.StorageUtils;
        delete global.FormatUtils;
    });

    it('initializes and handles missing document gracefully', () => {
        const originalDoc = global.document;
        global.document = undefined;
        expect(() => fusionIndex.init()).not.toThrow();
        global.document = originalDoc;
    });

    it('loads state safely from storage utilities', () => {
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.loadState();
        expect(fusionIndex.unlockedKeys.has('AgentA,AgentB')).toBe(true);
        expect(mockStorageUtils.getJsonArrayItem).toHaveBeenCalledWith('fusion_discovery_state', "FUSION_INDEX_PARSE_FAILED");
    });

    it('defaults to an empty set if storage returns null or undefined', () => {
        mockStorageUtils.getJsonArrayItem.mockReturnValue(null);
        fusionIndex.loadState();
        expect(fusionIndex.unlockedKeys.size).toBe(0);
    });

    it('saves state safely to storage utilities', () => {
        fusionIndex.unlockedKeys = new Set(['AgentA,AgentB', 'AgentC,AgentD']);
        fusionIndex.saveState();
        expect(mockStorageUtils.setJsonItem).toHaveBeenCalledWith(
            'fusion_discovery_state',
            ['AgentA,AgentB', 'AgentC,AgentD'],
            'FusionIndex'
        );
    });

    it('renders the shelf and binds unlocked interactions', () => {
        // Pre-fill state BEFORE init to hit the isUnlocked true condition
        fusionIndex.unlockedKeys = new Set(['AgentA,AgentB']);
        // Need to make sure init uses our prefilled state instead of overwriting it with loadState() which mocks return undefined
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        const container = document.getElementById('fusion-container');
        expect(container.innerHTML).toContain('Fusion Index');

        const safeKeyA = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentA,AgentB') : 'AgentA,AgentB'.replace(/(["\\])/g, '\\$1');
        const unlockedSlot = container.querySelector(`.fusion-slot[data-key="${safeKeyA}"]`);
        expect(unlockedSlot).not.toBeNull();
        expect(unlockedSlot.getAttribute('data-key')).toBe('AgentA,AgentB');
        expect(unlockedSlot.getAttribute('title')).toBe('SuperAgent');
        expect(unlockedSlot.classList.contains('tier-epic')).toBe(true);
        expect(unlockedSlot.classList.contains('unlocked')).toBe(true);

        const safeKeyC = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentC,AgentD') : 'AgentC,AgentD'.replace(/(["\\])/g, '\\$1');
        const lockedSlot = container.querySelector(`.fusion-slot[data-key="${safeKeyC}"]`);
        expect(lockedSlot).not.toBeNull();
        expect(lockedSlot.getAttribute('data-key')).toBe('AgentC,AgentD');
        expect(lockedSlot.getAttribute('title')).toBe('Locked Protocol');

        // Assert progress text (innerText unsupported in jest, use textContent)
        expect(container.querySelector('.fusion-progress').textContent).toBe('1 / 3 Protocols Discovered');
    });

    it('handles rendering with missing DOM elements', () => {
        fusionIndex = new FusionIndex('invalid-container', {}, jest.fn());
        expect(() => fusionIndex.render()).not.toThrow();
    });

    it('unlocks a new key, saves state, and updates UI safely', () => {
        fusionIndex.init();
        fusionIndex.unlock('AgentC,AgentD');

        expect(fusionIndex.unlockedKeys.has('AgentC,AgentD')).toBe(true);
        expect(mockStorageUtils.setJsonItem).toHaveBeenCalled();

        // Verify slot update
        const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentC,AgentD') : 'AgentC,AgentD'.replace(/(["\\])/g, '\\$1');
        const slot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
        expect(slot.classList.contains('unlocked')).toBe(true);
        expect(slot.classList.contains('locked')).toBe(false);
        expect(slot.getAttribute('title')).toBe('LameAgent');
    });

    it('ignores unlocking of unknown keys', () => {
        fusionIndex.init();
        fusionIndex.unlock('Fake,Key');
        expect(fusionIndex.unlockedKeys.has('Fake,Key')).toBe(false);
        expect(mockStorageUtils.setJsonItem).not.toHaveBeenCalled();
    });

    it('is idempotent when unlocking an already unlocked key', () => {
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        // Clear mock from initial init() operations
        mockStorageUtils.setJsonItem.mockClear();

        // Call it again
        fusionIndex.unlock('AgentA,AgentB');

        // Assert set size hasn't changed and storage wasn't spammed
        expect(fusionIndex.unlockedKeys.size).toBe(1);
        expect(mockStorageUtils.setJsonItem).not.toHaveBeenCalled();
    });

    it('checks if a key is unlocked', () => {
        fusionIndex.unlockedKeys = new Set(['AgentA,AgentB']);
        expect(fusionIndex.isUnlocked('AgentA,AgentB')).toBe(true);
        expect(fusionIndex.isUnlocked('AgentC,AgentD')).toBe(false);
    });

    it('handles interaction events for unlocked slots safely', () => {
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentA,AgentB') : 'AgentA,AgentB'.replace(/(["\\])/g, '\\$1');
        const unlockedSlot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);

        // Trigger click
        unlockedSlot.click();
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledWith('AgentA,AgentB');

        // Trigger keyboard Enter
        const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' });
        enterEvent.preventDefault = jest.fn();
        unlockedSlot.dispatchEvent(enterEvent);
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(2);
        expect(enterEvent.preventDefault).toHaveBeenCalled();

        // Trigger keyboard Space
        const spaceEvent = new window.KeyboardEvent('keydown', { key: ' ' });
        spaceEvent.preventDefault = jest.fn();
        unlockedSlot.dispatchEvent(spaceEvent);
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(3);
        expect(spaceEvent.preventDefault).toHaveBeenCalled();

        // Ignore other keys
        const otherKeyEvent = new window.KeyboardEvent('keydown', { key: 'Escape' });
        unlockedSlot.dispatchEvent(otherKeyEvent);
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(3);
    });

    it('executes without crashing when callback is undefined on interaction', () => {
        fusionIndex = new FusionIndex('fusion-container', { 'AgentA,AgentB': { name: 'A' } }, undefined);
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentA,AgentB') : 'AgentA,AgentB'.replace(/(["\\])/g, '\\$1');
        const unlockedSlot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
        expect(() => unlockedSlot.click()).not.toThrow();
    });

    it('safely handles missing customAgents entirely', () => {
        fusionIndex = new FusionIndex('fusion-container', null, jest.fn());
        fusionIndex.unlockedKeys = new Set(['A,B']);
        expect(() => fusionIndex.render()).not.toThrow();

        const container = document.getElementById('fusion-container');
        expect(container.querySelector('.fusion-progress').textContent).toBe('1 / 0 Protocols Discovered');
    });

    it('removes animation class after unlock via timeout boundary', () => {
        jest.useFakeTimers();
        fusionIndex.init();
        fusionIndex.unlock('AgentC,AgentD');

        const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('AgentC,AgentD') : 'AgentC,AgentD'.replace(/(["\\])/g, '\\$1');
        const slot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
        expect(slot.classList.contains('just-unlocked')).toBe(true);

        jest.runAllTimers();
        expect(slot.classList.contains('just-unlocked')).toBe(false);
        jest.useRealTimers();
    });

    it('handles malicious string injections in updateSlot query selectors', () => {
        fusionIndex.init();

        // Exploit boundary
        expect(() => fusionIndex.unlock('Bad"Key\\')).not.toThrow();
        const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape('Bad"Key\\') : 'Bad"Key\\'.replace(/(["\\])/g, '\\$1');
        const slot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
        expect(slot.classList.contains('unlocked')).toBe(true);
    });
});
