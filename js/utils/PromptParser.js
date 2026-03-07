/**
 * PromptParser
 * Parses AI agent prompts into structured sections or legacy text.
 * Handles both new XML format and legacy Markdown format.
 */
const PromptParser = {
  /**
   * Parses a raw prompt string into a structured object.
   * @param {string} rawText - The raw prompt text.
   * @returns {Object} Parsed result: { format: 'xml'|'legacy', sections: Array, raw: string }
   */
  parsePrompt(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { format: 'legacy', raw: rawText || '' };
    }

    // Check for XML markers to avoid unnecessary parsing attempt
    const hasXmlMarkers = /<(system|task|step|output)\b/i.test(rawText);

    if (!hasXmlMarkers) {
      return { format: 'legacy', raw: rawText };
    }

    try {
      // Use DOMParser to parse the XML structure
      const parser = new DOMParser();
      // Wrap in a root element to ensure we can parse multiple top-level siblings
      // and handle whitespace/text nodes gracefully.
      const wrappedText = `<root>${rawText}</root>`;
      const xmlDoc = parser.parseFromString(wrappedText, "text/xml");

      // Check for parsing errors
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        // Fallback to legacy if XML is malformed
        return { format: 'legacy', raw: rawText };
      }

      const root = xmlDoc.documentElement;
      const validTags = ['system', 'task', 'step', 'output'];

      const sections = Array.from(root.childNodes)
        .filter(node => node.nodeType === 1) // Node.ELEMENT_NODE
        .map(node => ({
          tag: node.tagName.toLowerCase(),
          node
        }))
        .filter(({ tag }) => validTags.includes(tag))
        .map(({ tag, node }) => ({
          tag,
          content: node.textContent.trim(),
          id: node.getAttribute('id') || null,
          name: node.getAttribute('name') || null
        }));

      if (sections.length === 0) {
         return { format: 'legacy', raw: rawText };
      }

      return { format: 'xml', sections };

    } catch (e) {
      console.error(
        JSON.stringify({
          event: 'PROMPT_PARSE_FAILED',
          input: rawText ? rawText.substring(0, 100) : null,
          error: e.message
        })
      );
      return { format: 'legacy', raw: rawText };
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptParser;
}
