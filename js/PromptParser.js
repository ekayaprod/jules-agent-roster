/**
 * PromptParser
 * Parses AI agent prompts into structured sections or legacy text.
 * Handles both new XML format and legacy Markdown format.
 */
const PromptParser = {
  /**
   * Reusable DOMParser instance to avoid repeated instantiation.
   * @private
   */
  _parser: typeof DOMParser !== 'undefined' ? new DOMParser() : null,

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
      const parser = this._parser || new DOMParser();

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
      const sections = [];
      const validTags = ['system', 'task', 'step', 'output'];

      for (let i = 0; i < root.childNodes.length; i++) {
        const node = root.childNodes[i];

        // We only care about element nodes
        if (node.nodeType === 1) { // Node.ELEMENT_NODE
          const tag = node.tagName.toLowerCase();

          if (validTags.includes(tag)) {
            const section = {
              tag: tag,
              // textContent extracts text, but we might want to preserve inner structure
              // if we treated it as HTML? The requirements say "content: string".
              // For XML, textContent is appropriate.
              content: node.textContent.trim(),
              id: node.getAttribute('id') || null,
              name: node.getAttribute('name') || null
            };
            sections.push(section);
          }
        }
      }

      if (sections.length === 0) {
         return { format: 'legacy', raw: rawText };
      }

      return { format: 'xml', sections: sections };

    } catch (e) {
      console.warn("PromptParser encountered an error, falling back to legacy:", e);
      return { format: 'legacy', raw: rawText };
    }
  }
};
