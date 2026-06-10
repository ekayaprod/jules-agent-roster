const { screen } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const FusionLabRenderer = require('./FusionLabRenderer');

describe('FusionLabRenderer', () => {
    let mockLab;
    let renderer;

    beforeEach(() => {
        // Mock global dependencies
        global.FormatUtils = {
            escapeHTML: jest.fn(str => str),
            extractIcon: jest.fn((res, fallback) => fallback),
            extractDisplayName: jest.fn(res => res.name)
        };

        global.AgentUtils = {
            getFusionKey: jest.fn((name1, name2) => `${name1}+${name2}`)
        };

        global.AgentCard = {
            create: jest.fn((result, key, delay) => {
                const el = document.createElement('div');
                el.classList.add('agent-card', 'pop-in');
                return el;
            })
        };

        global.DOMUtils = {
            setButtonState: jest.fn()
        };

        document.body.innerHTML = `
            <div id="slotA">
                <div class="slot-content"></div>
            </div>
            <div id="slotB">
                <div class="slot-content"></div>
            </div>
            <div id="fusionResultContainer">
                <h3 class="agent-title"></h3>
            </div>
            <button id="fuseBtn"></button>
            <button id="resetLabBtn" class="hidden"></button>
        `;

        const slotACard = document.getElementById('slotA');
        const slotBCard = document.getElementById('slotB');
        const fusionResultContainer = document.getElementById('fusionResultContainer');
        const fuseBtn = document.getElementById('fuseBtn');
        const resetLabBtn = document.getElementById('resetLabBtn');

        mockLab = {
            elements: {
                slotACard,
                slotBCard,
                fusionResultContainer,
                fuseBtn,
                resetLabBtn
            },
            state: {
                slotA: null,
                slotB: null
            },
            updateState: jest.fn(),
            compiler: {
                fuse: jest.fn((agentA, agentB) => ({ name: 'FusedAgent' })),
                fusionMatrixMap: {
                    'Agent1+Agent2': 'FusedAgent'
                }
            },
            fusionIndex: {
                isUnlocked: jest.fn().mockReturnValue(false)
            },
            picker: {
                activePickerSlot: null
            },
            unlockMatrix: jest.fn(),
            adversaryClickCount: 0,
            lastAdversaryClickTime: 0
        };

        renderer = new FusionLabRenderer(mockLab);
    });

    afterEach(() => {
        delete global.FormatUtils;
        delete global.AgentUtils;
        delete global.AgentCard;
        delete global.DOMUtils;
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('renderSlots', () => {
        it('renders empty slots correctly', () => {
            renderer.renderSlots();

            const slotA = mockLab.elements.slotACard;
            const slotB = mockLab.elements.slotBCard;

            expect(slotA.classList.contains('empty')).toBe(true);
            expect(slotA.classList.contains('filled')).toBe(false);
            expect(slotA.hasAttribute('aria-label')).toBe(false);

            expect(slotB.classList.contains('empty')).toBe(true);
            expect(slotB.classList.contains('filled')).toBe(false);
            expect(slotB.hasAttribute('aria-label')).toBe(false);

            expect(slotA.querySelector('.slot-content').innerHTML).toContain('Select Agent A');
            expect(slotB.querySelector('.slot-content').innerHTML).toContain('Select Agent B');
            expect(mockLab.updateState).toHaveBeenCalled();
        });

        it('renders filled slots correctly', () => {
            mockLab.state.slotA = { name: 'Agent1', emoji: '🤖' };
            mockLab.state.slotB = { name: 'Agent2', emoji: '👽' };

            renderer.renderSlots();

            const slotA = mockLab.elements.slotACard;
            const slotB = mockLab.elements.slotBCard;

            expect(slotA.classList.contains('filled')).toBe(true);
            expect(slotA.classList.contains('empty')).toBe(false);
            expect(slotA.getAttribute('aria-label')).toBe('Selected: Agent1. Click to change.');

            expect(slotB.classList.contains('filled')).toBe(true);
            expect(slotB.classList.contains('empty')).toBe(false);
            expect(slotB.getAttribute('aria-label')).toBe('Selected: Agent2. Click to change.');

            const slotAContent = slotA.querySelector('.slot-content').innerHTML;
            expect(slotAContent).toContain('🤖');
            expect(slotAContent).toContain('Agent1');

            const slotBContent = slotB.querySelector('.slot-content').innerHTML;
            expect(slotBContent).toContain('👽');
            expect(slotBContent).toContain('Agent2');

            expect(mockLab.updateState).toHaveBeenCalled();
        });

        it('handles missing card elements safely', () => {
            mockLab.elements.slotACard = null;
            expect(() => renderer.renderSlots()).not.toThrow();
        });
    });

    describe('getPreMergePreviewHTML', () => {
        it('returns null if either agent is missing', () => {
            mockLab.state.slotA = { name: 'Agent1' };
            mockLab.state.slotB = null;
            expect(renderer.getPreMergePreviewHTML({ name: 'Agent2' })).toBeNull();
        });

        it('returns null if agents have the same name', () => {
            mockLab.state.slotA = { name: 'Agent1' };
            mockLab.state.slotB = { name: 'Agent1' };
            expect(renderer.getPreMergePreviewHTML(null)).toBeNull();
        });

        it('returns null if fusion is not unlocked', () => {
            mockLab.state.slotA = { name: 'Agent1', emoji: '🤖' };
            mockLab.state.slotB = { name: 'Agent2', emoji: '👽' };
            mockLab.fusionIndex.isUnlocked.mockReturnValue(false);

            expect(renderer.getPreMergePreviewHTML(null)).toBeNull();
        });

        it('returns preview HTML if fusion is unlocked', () => {
            mockLab.state.slotA = { name: 'Agent1', emoji: 'A' };
            mockLab.state.slotB = { name: 'Agent2', emoji: 'B' };
            mockLab.fusionIndex.isUnlocked.mockReturnValue(true);

            const html = renderer.getPreMergePreviewHTML(null);
            expect(html).toContain('Already Discovered');
            expect(html).toContain('AB'); // fallback emoji from extractIcon mock
            expect(html).toContain('FusedAgent'); // extracted name
        });

        it('uses selectedAgent from picker if active', () => {
            mockLab.state.slotA = null;
            mockLab.state.slotB = { name: 'Agent2', emoji: 'B' };
            mockLab.picker.activePickerSlot = 'slotA';
            mockLab.fusionIndex.isUnlocked.mockReturnValue(true);

            const html = renderer.getPreMergePreviewHTML({ name: 'Agent1', emoji: 'A' });
            expect(html).toContain('Already Discovered');
        });
    });

    describe('renderFusionResult', () => {
        it('hides and clears result container early on Singularity', () => {
            const container = mockLab.elements.fusionResultContainer;
            container.innerHTML = 'old content';
            container.classList.add('fusion-revealed');

            renderer.renderFusionResult({ name: 'Singularity' });

            expect(container.classList.contains('hidden')).toBe(true);
            expect(container.classList.contains('fusion-revealed')).toBe(false);
            expect(container.innerHTML).toBe('');
            expect(global.AgentCard.create).not.toHaveBeenCalled();
            expect(mockLab.lastFusionResult).toEqual({ name: 'Singularity' });
        });

        it('creates and appends AgentCard for normal result', () => {
            const container = mockLab.elements.fusionResultContainer;
            const result = { name: 'FusedAgent' };

            renderer.renderFusionResult(result);

            expect(container.classList.contains('hidden')).toBe(true);
            expect(global.AgentCard.create).toHaveBeenCalledWith(result, 'Agent1+Agent2', 0);

            const card = container.querySelector('.agent-card');
            expect(card).not.toBeNull();
            expect(card.classList.contains('pop-in')).toBe(false); // Should be removed
        });

        it('handles Adversary special interactions', () => {
            jest.useFakeTimers();
            const container = mockLab.elements.fusionResultContainer;
            const result = { name: 'Adversary' };

            renderer.renderFusionResult(result);

            const card = container.querySelector('.agent-card');

            // Simulate clicks on Adversary
            for (let i = 0; i < 7; i++) {
                card.dispatchEvent(new Event('click'));
                jest.advanceTimersByTime(100); // Wait 100ms between clicks
            }

            expect(mockLab.unlockMatrix).toHaveBeenCalled();
            expect(mockLab.adversaryClickCount).toBe(0);

            jest.useRealTimers();
        });

        it('handles missing container gracefully', () => {
            mockLab.elements.fusionResultContainer = null;
            expect(() => renderer.renderFusionResult({ name: 'ValidAgent' })).not.toThrow();
        });
    });

    describe('showResult', () => {
        it('reveals result and focuses title', () => {
            const container = mockLab.elements.fusionResultContainer;
            const resetBtn = mockLab.elements.resetLabBtn;

            // Mock element focus and scrollIntoView
            const title = container.querySelector('.agent-title');
            title.focus = jest.fn();
            title.scrollIntoView = jest.fn();

            renderer.showResult();

            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(
                mockLab.elements.fuseBtn,
                "ready",
                "Ignite Fusion Protocol"
            );

            expect(container.classList.contains('hidden')).toBe(false);
            expect(container.classList.contains('fusion-revealed')).toBe(true);
            expect(resetBtn.classList.contains('hidden')).toBe(false);

            expect(title.getAttribute('tabindex')).toBe('-1');
            expect(title.focus).toHaveBeenCalled();
            expect(title.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });
        });

        it('handles missing elements safely', () => {
            mockLab.elements.fuseBtn = null;
            mockLab.elements.fusionResultContainer = null;
            mockLab.elements.resetLabBtn = null;

            expect(() => renderer.showResult()).not.toThrow();
        });
    });
});
