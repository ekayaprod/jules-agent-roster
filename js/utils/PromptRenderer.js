/**
 * PromptRenderer
 * Responsible for generating the final markdown prompt string from agent data.
 * Ensures consistent formatting, ordering, and spacing.
 * Also renders parsed prompt objects into structured HTML.
 * Shared utility to ensure consistent rendering of XML-based prompts across AgentCard and FusionLab.
 */
class PromptRenderer {
    /**
     * Renders a complete prompt string from a single agent or a fused agent.
     * @param {Object} agent - The agent data object.
     * @returns {string} The formatted markdown prompt.
     */
    static renderMarkdown(agent) {
        if (!agent) return '';

        const parts = [];

        if (agent.name) {
            parts.push(`# ${agent.name}`);
        }

        if (agent.description) {
            parts.push(`> ${agent.description}`);
        }

        if (agent.prompt) {
            parts.push(agent.prompt);
        }

        return parts.join('\n\n');
    }

    /**
     * Renders a parsed prompt object into an HTML string for XML formats.
     * @param {Object} parsedPrompt - The parsed prompt object from PromptParser.
     * @returns {string|null} The rendered HTML string, or null if format is not XML.
     */
    static renderXml(parsedPrompt) {
        if (!parsedPrompt || parsedPrompt.format !== 'xml' || !parsedPrompt.sections) {
            return '';
        }

        const sections = parsedPrompt.sections.map(sec => {
            let label = '';
            // Centralized label mapping
            if (sec.tag === 'system') label = 'System Role';
            else if (sec.tag === 'task') label = 'Mission';
            else if (sec.tag === 'step') label = `Step ${sec.id || '?'}: ${sec.name || ''}`;
            else if (sec.tag === 'output') label = 'Output Format';
            else label = sec.tag.toUpperCase();

            return `
              <div class="prompt-section prompt-section--${FormatUtils.escapeHTML(sec.tag)}">
                  <div class="prompt-section-label">${FormatUtils.escapeHTML(label)}</div>
                  <div class="prompt-section-body">${FormatUtils.escapeHTML(sec.content)}</div>
              </div>
            `;
        }).join('');

        return `<div class="prompt-structured">${sections}</div>`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptRenderer;
}
