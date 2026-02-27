/**
 * PromptRenderer
 * Renders parsed prompt objects into structured HTML.
 * Shared utility to ensure consistent rendering of XML-based prompts across AgentCard and FusionLab.
 */
class PromptRenderer {
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
              <div class="prompt-section prompt-section--${sec.tag}">
                  <div class="prompt-section-label">${label}</div>
                  <div class="prompt-section-body">${sec.content}</div>
              </div>
            `;
        }).join('');

        return `<div class="prompt-structured">${sections}</div>`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptRenderer;
}
