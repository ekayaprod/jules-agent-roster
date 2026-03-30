/**
 * Utility for parsing AI agent prompts into structured sections or legacy text.
 * Handles both the new strict XML format and the legacy Markdown format.
 * @see ../../docs/architecture/Utils/README.md#promptparser-architecture
 */
const PromptParser = {
  /**
   * Parses a raw prompt string into a structured object containing format metadata and sections.
   * It attempts to detect XML boundaries ('<system>', '<task>', '<step>', '<output>') and
   * uses the native DOMParser to extract valid nodes. If parsing fails, malformed XML is detected,
   * or the input lacks XML tags, it cleanly falls back to rendering the payload as a legacy string.
   *
   * @param {string} rawText - The raw prompt text from the repository or agent definition.
   * @returns {{ format: 'xml'|'legacy', sections?: Array<{tag: string, content: string, id: string|null, name: string|null}>, raw?: string }} The parsed structured result.
   * @see ../../docs/architecture/Utils/README.md#promptparser-architecture
   */
  stripFrontmatter(rawText) {
    if (!rawText || typeof rawText !== 'string') return rawText;
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    return rawText.replace(yamlRegex, '');
  },

  parsePrompt(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { format: 'legacy', raw: rawText || '' };
    }
    rawText = this.stripFrontmatter(rawText);

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

      // ↗️ VECTORIZE: The Single-Pass Pipeline.
      // We ignore the heavily abstracted layers and execute the calculation in one direct, zero-allocation pass.
      const sections = [];
      for (let i = 0; i < root.childNodes.length; i++) {
        const node = root.childNodes[i];
        if (node.nodeType === 1) { // Node.ELEMENT_NODE
          const tag = node.tagName.toLowerCase();
          if (validTags.includes(tag)) {
            sections.push({
              tag,
              content: node.textContent.trim(),
              id: node.getAttribute('id') || null,
              name: node.getAttribute('name') || null
            });
          }
        }
      }

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
