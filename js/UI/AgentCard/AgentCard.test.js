const AgentCard = require('./AgentCard');

describe('AgentCard Security', () => {
    // Setup globals that AgentCard uses
    beforeAll(() => {
        global.FormatUtils = {
            escapeHTML: jest.requireActual('../../Utils/format-utils').escapeHTML,
            extractIcon: jest.requireActual('../../Utils/format-utils').extractIcon,
            extractDisplayName: jest.requireActual('../../Utils/format-utils').extractDisplayName
        };
        global.DOMUtils = {
            createMarkdownPreBlock: () => document.createElement('div')
        };
        global.PromptParser = { stripFrontmatter: () => '' };
    });

    it('AgentCard injection test', () => {
        const agent = { name: "Agent", emoji: '<script>alert("XSS")</script>' };
        const card = AgentCard.create(agent, 0, 0);
        expect(card.innerHTML).not.toContain('<script>alert("XSS")</script>');
        expect(card.innerHTML).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
});
