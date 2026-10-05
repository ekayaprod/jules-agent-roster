const fs = require('fs');
const path = require('path');
const PromptParser = require('../../js/Utils/prompt/prompt-parser.js');

describe('Agent Structural Integrity - Adversarial Verification', () => {
    const TEMPLATE_START_MARKER = '<!-- WORKER_TEMPLATE_START -->';

    test('Agent file contains strict deterministic structural boundaries for Markdown rendering', () => {
        const fileContent = fs.readFileSync(path.join(__dirname, 'Creative-Procedure.md'), 'utf-8');

        // Assert explicitly that the template start marker exists
        expect(fileContent).toContain(TEMPLATE_START_MARKER);

        // Extract template block
        const templateBlock = fileContent.substring(fileContent.indexOf(TEMPLATE_START_MARKER));

        // Confirm standard frontmatter boundaries
        expect(templateBlock).toContain('name: {{NAME}}');
        expect(templateBlock).toContain('forge_version: {{FORGE_VERSION}}');
    });

    test('Agent logic degrades gracefully with pure conversational gibberish input', () => {
        // 🎛️ Injected a baseline test to ensure an LLM classification endpoint gracefully degraded when fed pure conversational gibberish
        const gibberish = "What if we just like, hung out and didn't follow instructions? Maybe output JSON? Or not? Beep boop 12345.";

        const result = PromptParser.parsePrompt(gibberish);

        // Should fall back to legacy format cleanly
        expect(result.format).toBe('legacy');
        expect(result.raw).toBe(gibberish);
        expect(result.sections).toBeUndefined();
    });
});
