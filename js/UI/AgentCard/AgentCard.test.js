const AgentCard = require('./AgentCard');

describe('AgentCard Security', () => {
    // Setup globals that AgentCard uses
    beforeAll(() => {
        global.FormatUtils = jest.requireActual('../../Utils/format/format-utils');
        global.DOMUtils = {
            createMarkdownPreBlock: () => document.createElement('div')
        };
        global.PromptParser = { stripFrontmatter: () => '' };
    });

    it('AgentCard injection test', () => {
        const agent = { name: "Agent", emoji: '<script>alert("XSS")</script>' };
        const card = AgentCard.create(agent, 0, 0);
        expect(card.innerHTML).not.toContain('<script>alert("XSS")</script>');
        expect(card.innerHTML).toContain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });
});

describe('AgentCard Logic & Edge Cases', () => {
    let originalWindow;
    let originalDocument;

    beforeEach(() => {
        originalWindow = global.window;
        originalDocument = global.document;

        global.window = {
            rosterApp: {
                pinnedManager: {
                    isPinned: jest.fn().mockReturnValue(false)
                },
                fusionLab: {
                    fusionIndex: {
                        unlockedAgents: new Set(),
                        unlockedKeys: []
                    }
                }
            }
        };

        // Use a more complete mock for document to avoid jestdom issues if any
        global.document = {
            ...originalDocument,
            createElement: jest.fn().mockImplementation((tag) => {
                // A mock element that has outerHTML
                const el = {
                    tagName: tag.toUpperCase(),
                    className: '',
                    _classList: new Set(),
                    get classList() {
                        const cl = {
                            add: (cls) => this._classList.add(cls),
                            remove: (cls) => this._classList.delete(cls),
                            contains: (cls) => this._classList.has(cls)
                        };
                        return cl;
                    },
                    style: {
                        setProperty: jest.fn()
                    },
                    innerHTML: '',
                    get outerHTML() {
                        const classStr = Array.from(this._classList).join(' ') || this.className;
                        return `<${tag} class="${classStr}">${this.innerHTML}</${tag}>`;
                    }
                };
                return el;
            }),
            getElementById: jest.fn().mockReturnValue(null)
        };
        global.FormatUtils = {
            escapeHTML: jest.fn((str) => str),
            extractIcon: jest.fn(() => '🤖'),
            extractDisplayName: jest.fn(() => 'Test Agent')
        };
        global.DOMUtils = {
            createMarkdownPreBlock: jest.fn().mockReturnValue('mocked-pre-block')
        };
        global.PromptParser = {
            stripFrontmatter: jest.fn((str) => str)
        };
    });

    afterEach(() => {
        global.window = originalWindow;
        global.document = originalDocument;
        jest.clearAllMocks();
    });

    describe('_hasChildFusions', () => {
        it('returns false when fusionIndex is null', () => {
            expect(AgentCard._hasChildFusions('TestAgent', null)).toBe(false);
        });

        it('uses unlockedAgents Set when available', () => {
            const index = { unlockedAgents: new Set(['TestAgent']) };
            expect(AgentCard._hasChildFusions('TestAgent', index)).toBe(true);
            expect(AgentCard._hasChildFusions('OtherAgent', index)).toBe(false);
        });

        it('falls back to unlockedKeys array correctly (prefix)', () => {
            const index = { unlockedKeys: ['TestAgent,OtherAgent'] };
            expect(AgentCard._hasChildFusions('TestAgent', index)).toBe(true);
        });

        it('falls back to unlockedKeys array correctly (suffix)', () => {
            const index = { unlockedKeys: ['OtherAgent,TestAgent'] };
            expect(AgentCard._hasChildFusions('TestAgent', index)).toBe(true);
        });

        it('falls back to unlockedKeys array correctly (exact match)', () => {
            const index = { unlockedKeys: ['TestAgent'] };
            expect(AgentCard._hasChildFusions('TestAgent', index)).toBe(true);
        });

        it('returns false for partial non-boundary matches in unlockedKeys', () => {
            const index = { unlockedKeys: ['NotTestAgentButSimilar'] };
            expect(AgentCard._hasChildFusions('TestAgent', index)).toBe(false);
        });
    });

    describe('getPromptNode', () => {
        it('handles null prompt gracefully', () => {
            const node = AgentCard.getPromptNode({});
            expect(global.PromptParser.stripFrontmatter).toHaveBeenCalledWith('No protocol data available.');
            expect(node).toBe('mocked-pre-block');
        });

        it('passes prompt to PromptParser and DOMUtils', () => {
            AgentCard.getPromptNode({ prompt: 'test prompt' });
            expect(global.PromptParser.stripFrontmatter).toHaveBeenCalledWith('test prompt');
        });
    });

    describe('create', () => {
        it('handles missing tier, scope, and role gracefully', () => {
            const agent = { name: 'BasicAgent' };
            const card = AgentCard.create(agent, 'index1', 0);

            // Check that defaults were applied without throwing
            expect(global.FormatUtils.escapeHTML).toHaveBeenCalledWith('Fusion Protocol');
            expect(card.innerHTML).not.toContain('undefined');
        });

        it('applies type-specific classes', () => {
            const cardPlus = AgentCard.create({ type: 'plus' }, '1', 0);
            expect(cardPlus.outerHTML).toContain('plus-agent');

            const cardMonthly = AgentCard.create({ type: 'monthly' }, '2', 0);
            expect(cardMonthly.outerHTML).toContain('monthly-agent');
        });

        it('renders repo picker alternate UI when selected', () => {
            global.document.getElementById = jest.fn().mockReturnValue({ value: 'owner/repo' });
            const card = AgentCard.create({ name: 'Agent' }, '1', 0);
            expect(card.innerHTML).toContain('Launch in Jules');
            expect(card.innerHTML).toContain('launch-jules');
        });

        it('escapes tier and scope properties', () => {
             const agent = { name: 'Agent', tier: '<script>', scope: '<script>' };
             const card = AgentCard.create(agent, '1', 0);
             expect(global.FormatUtils.escapeHTML).toHaveBeenCalledWith('<script>');
        });
    });
});
