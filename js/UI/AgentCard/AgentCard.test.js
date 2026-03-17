/**
 * @jest-environment jsdom
 */
const AgentCard = require('./AgentCard');
const FormatUtils = require('../../Utils/format-utils');
const MarkdownRenderer = require('../../Utils/markdown-renderer');

describe('AgentCard', () => {
    let mockAgent;

    beforeEach(() => {
        // Set up global mocks that AgentCard might need
        global.FormatUtils = FormatUtils;
        global.MarkdownRenderer = MarkdownRenderer;

        // Mock DOM elements that AgentCard queries
        const repoPicker = document.createElement('input');
        repoPicker.id = 'julesRepoPicker';
        repoPicker.value = '';
        document.body.appendChild(repoPicker);

        // Mock window.rosterApp
        window.rosterApp = {
            pinnedManager: {
                isPinned: jest.fn().mockReturnValue(false)
            }
        };

        mockAgent = {
            name: 'Test Agent',
            prompt: 'Test prompt content',
            type: 'plus',
            scope: 'Small',
            tier: 'epic',
            emoji: '🚀',
            role: 'Tester',
            short_description: 'A test agent',
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('getPromptNode', () => {
        it('should generate escaped prompt DOM nodes correctly', () => {
            const agent = { prompt: '<script>alert("xss")</script>' };
            const node = AgentCard.getPromptNode(agent);
            expect(node.innerHTML).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
            expect(node.className).toContain('details-content');
        });

        it('should handle missing prompt data', () => {
            const node = AgentCard.getPromptNode({});
            expect(node.textContent).toContain('No protocol data available.');
        });
    });

    describe('create', () => {
        it('should handle empty childKeys safely', () => {
            window.rosterApp.fusionLab = {
                fusionIndex: {
                    unlockedKeys: new Set(['Different Agent+Other']) // does not include agent.name
                },
                compiler: {
                    customAgentsMap: {}
                }
            };

            const card = AgentCard.create(mockAgent, 1, 0);

            // Should not generate a splay menu because no child keys matched
            expect(card.innerHTML).not.toContain('splay-btn');
            expect(card.innerHTML).not.toContain('splay-menu');
        });

        it('should skip child agents that evaluate to falsy', () => {
            window.rosterApp.fusionLab = {
                fusionIndex: {
                    unlockedKeys: new Set(['Test Agent+Ghost']) // includes agent.name
                },
                compiler: {
                    customAgentsMap: {} // Missing from compiler map
                }
            };
            // Mock getCustomAgent to return null
            window.rosterApp.getCustomAgent = jest.fn().mockReturnValue(null);

            const card = AgentCard.create(mockAgent, 1, 0);

            // Should render the splay menu outer shell, but no child buttons inside it
            expect(card.innerHTML).toContain('splay-btn');
            expect(card.innerHTML).toContain('splay-menu-1');
            expect(card.innerHTML).not.toContain('splayed-card'); // No item rendered
            expect(card.innerHTML).not.toContain('data-index="Test Agent+Ghost"');
        });

        it('should generate splay html for unlocked fusion children from compiler or rosterApp', () => {
            window.rosterApp.fusionLab = {
                fusionIndex: {
                    unlockedKeys: new Set(['Test Agent+Other', 'Test Agent+Another'])
                },
                compiler: {
                    customAgentsMap: {
                        'Test Agent+Other': {
                            name: 'Test Agent+Other',
                            emoji: '✨',
                            tier: 'legendary'
                        }
                    }
                }
            };
            window.rosterApp.getCustomAgent = jest.fn().mockImplementation((key) => {
                if (key === 'Test Agent+Another') {
                    return {
                        name: 'Test Agent+Another',
                        emoji: '🔥',
                        tier: 'epic'
                    };
                }
                return null;
            });

            const card = AgentCard.create(mockAgent, 1, 0);

            expect(card.innerHTML).toContain('splay-btn');
            expect(card.innerHTML).toContain('data-action="toggle-splay"');
            expect(card.innerHTML).toContain('splay-menu-1');
            expect(card.innerHTML).toContain('data-index="Test Agent+Other"');
            expect(card.innerHTML).toContain('data-index="Test Agent+Another"');
            expect(card.innerHTML).toContain('✨');
            expect(card.innerHTML).toContain('🔥');
        });

        it('should create a basic agent card DOM element', () => {
            const card = AgentCard.create(mockAgent, 1, 0);
            expect(card).toBeInstanceOf(HTMLElement);
            expect(card.className).toContain('card flip-card pop-in');
            expect(card.classList.contains('plus-agent')).toBe(true);
            expect(card.classList.contains('tier-epic')).toBe(true);

            // Check HTML structure
            expect(card.innerHTML).toContain('Test Agent');
            expect(card.innerHTML).toContain('🚀');
            expect(card.innerHTML).toContain('Tester');
            expect(card.innerHTML).toContain('Small');
            expect(card.innerHTML).toContain('epic');
            expect(card.innerHTML).toContain('A test agent');
        });

        it('should apply fallback for missing role and descriptions', () => {
            const minimalAgent = { name: 'Minimal' };
            const card = AgentCard.create(minimalAgent, 2, 0);

            expect(card.innerHTML).toContain('Fusion Protocol');
        });

        it('should apply correct CSS classes based on agent type and scope', () => {
             const agent = {
                 name: 'Test',
                 type: 'monthly',
                 scope: 'Large Project',
                 tier: 'Legendary'
             };
             const card = AgentCard.create(agent, 1, 0);

             expect(card.classList.contains('monthly-agent')).toBe(true);
             expect(card.classList.contains('tier-legendary')).toBe(true);
             expect(card.innerHTML).toContain('scope-large');
        });

        it('should render correct pin status', () => {
            window.rosterApp.pinnedManager.isPinned.mockReturnValue(true);
            const card = AgentCard.create(mockAgent, 'custom_agent_id', 0);
            expect(card.innerHTML).toContain('pin-btn pinned');
        });

        it('should toggle omni-button actions when julesRepoPicker has a value', () => {
             // Mock repo picker selection
             document.getElementById('julesRepoPicker').value = 'github/repo/test';

             const card = AgentCard.create(mockAgent, 1, 0);

             // Primary action should now be launch-jules
             expect(card.innerHTML).toContain('data-action="launch-jules"');
             expect(card.innerHTML).toContain('Launch agent via Jules API');

             // Dropdown action should now be copy-agent
             expect(card.innerHTML).toContain('data-action="copy-agent"');
        });

        it('should limit animation delay to 600ms', () => {
             // 100 * 30ms = 3000ms, should cap at 600ms
             const card = AgentCard.create(mockAgent, 1, 100);
             expect(card.style.animationDelay).toBe('600ms');
        });

        it('should fallback tags cleanly if undefined', () => {
             const agent = { name: 'Test' };
             const card = AgentCard.create(agent, 1, 0);

             // Should not throw or generate undefined text tags
             expect(card.innerHTML).not.toContain('undefined');
        });

        it('should handle missing julesRepoPicker gracefully', () => {
             document.body.innerHTML = ''; // Remove mock
             const card = AgentCard.create(mockAgent, 1, 0);

             // Defaults to copy-agent when picker is missing
             expect(card.innerHTML).toContain('data-action="copy-agent"');
        });
    });
});
