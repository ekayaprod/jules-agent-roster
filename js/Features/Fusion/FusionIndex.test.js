/**
 * @jest-environment jsdom
 */

const FusionIndex = require('./FusionIndex');
const { screen } = require('@testing-library/dom');
const userEvent = require('@testing-library/user-event').default;
require('@testing-library/jest-dom');

describe('FusionIndex', () => {
    let fusionIndex;
    let mockStorageUtils;
    let mockFormatUtils;

    beforeEach(() => {
        jest.useFakeTimers();
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
        const { AgentUtils } = require('../../Utils');
global.AgentUtils = AgentUtils;

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
        expect(screen.getByText('Fusion Index')).toBeVisible();

        const unlockedSlot = screen.getByRole('button', { name: /Load SuperAgent Protocol/i });
        expect(unlockedSlot).toBeVisible();
        expect(unlockedSlot).toHaveAttribute('data-key', 'AgentA,AgentB');
        expect(unlockedSlot).toHaveAttribute('title', 'SuperAgent');

        const lockedSlots = screen.getAllByTitle('Locked Protocol');
        expect(lockedSlots[0]).toBeVisible();
        expect(lockedSlots[0]).toHaveAttribute('data-key', 'Bad"Key\\');

        expect(screen.getByText('1 / 3 Protocols Discovered')).toBeVisible();
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
        const slot = screen.getByRole('button', { name: /Load LameAgent Protocol/i });
        expect(slot).toBeVisible();
        expect(slot).toHaveAttribute('title', 'LameAgent');
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

    it('handles interaction events for unlocked slots safely', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        const unlockedSlot = screen.getByRole('button', { name: /Load SuperAgent Protocol/i });

        // Trigger click
        await user.click(unlockedSlot);
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledWith('AgentA,AgentB');

        // Trigger keyboard Enter
        unlockedSlot.focus();
        await user.keyboard('{Enter}');
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(2);

        // Trigger keyboard Space
        await user.keyboard(' ');
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(3);

        // Ignore other keys
        await user.keyboard('{Escape}');
        expect(fusionIndex.onSelectCallback).toHaveBeenCalledTimes(3);
    });

    it('executes without crashing when callback is undefined on interaction', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        fusionIndex = new FusionIndex('fusion-container', { 'AgentA,AgentB': { name: 'A' } }, undefined);
        mockStorageUtils.getJsonArrayItem.mockReturnValue(['AgentA,AgentB']);
        fusionIndex.init();

        const unlockedSlot = screen.getByRole('button', { name: /Load A Protocol/i });
        await user.click(unlockedSlot); // Just assert it doesn't throw
    });

    it('safely handles missing customAgents entirely', () => {
        fusionIndex = new FusionIndex('fusion-container', null, jest.fn());
        fusionIndex.unlockedKeys = new Set(['A,B']);
        expect(() => fusionIndex.render()).not.toThrow();

        const progressElement = screen.getByText('1 / 0 Protocols Discovered');
        expect(progressElement).toBeVisible();
    });

    it('removes animation class after unlock via timeout boundary', () => {
        jest.useFakeTimers();
        fusionIndex.init();
        fusionIndex.unlock('AgentC,AgentD');

        const slot = screen.getByRole('button', { name: /Load LameAgent Protocol/i });
        expect(slot).toHaveClass('just-unlocked');

        jest.runAllTimers();
        expect(slot).not.toHaveClass('just-unlocked');

        jest.clearAllTimers();
        jest.useRealTimers();
    });

    /**
     * Enforces the Selector Sanitization Doctrine:
     * Discovered fusion keys must not be able to break out of CSS attribute selectors and cause fatal syntax exceptions when unlocking state.
     * @mock {string} 'Bad"Key\\' - Simulates an adversary injecting unescaped quotes and slashes directly into the key.
     * @expected {void} - Expects DOM mutation procedures (CSS.escape) to neutralize the injection without throwing DOMExceptions.
     */
    it('handles malicious string injections in updateSlot query selectors', () => {
        fusionIndex.init();

        // Exploit boundary
        expect(() => fusionIndex.unlock('Bad"Key\\')).not.toThrow();
        const slot = screen.getByRole('button', { name: /Load Hacker Protocol/i });
        expect(slot).toBeVisible();
    });
});

    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Features/Fusion/FusionIndex.js', 'utf8');

        // Assert exports assign successfully in Node-like environment
        let isExported = false;
        let moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        expect(() => {
            new Function('module', code)(moduleMock);
        }).not.toThrow();
        expect(isExported).toBe(true);

        // Assert safe bypass when module lacks exports property
        expect(() => {
            new Function('module', code)({});
        }).not.toThrow();

        // Assert safe bypass when module is strictly undefined (browser-like)
        expect(() => {
            new Function('module', code)(undefined);
        }).not.toThrow();
    });
