const AgentCard = require('./AgentCard');

describe('AgentCard Security', () => {
    // Setup globals that AgentCard uses
    beforeAll(() => {
        global.FormatUtils = jest.requireActual('../../Utils/format-utils');
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
