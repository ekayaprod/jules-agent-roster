/**
 * Custom DOM-node based Markdown Renderer.
 * Prioritizes safety over code brevity by using pure DOM methods to prevent XSS vulnerabilities.
 */
class MarkdownRenderer {
    /**
     * Parses raw markdown text into a structured HTMLElement tree.
     * Maps markdown blocks to the native design system.
     * @param {string} rawMarkdown - The raw markdown text to parse.
     * @returns {HTMLElement} A constructed container node containing the parsed blocks.
     */
    static renderToDOM(rawMarkdown) {
        const container = document.createElement('div');
        container.className = 'details-content';
        container.style.transition = 'all 0.3s ease';

        if (!rawMarkdown) {
            container.textContent = 'No protocol data available.';
            return container;
        }

        const lines = rawMarkdown.split('\n');
        let currentList = null;
        let inCodeBlock = false;
        let codeContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Code Blocks
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    const pre = document.createElement('pre');
                    const code = document.createElement('code');
                    code.textContent = codeContent.join('\n');
                    pre.appendChild(code);
                    container.appendChild(pre);
                    inCodeBlock = false;
                    codeContent = [];
                } else {
                    inCodeBlock = true;
                    if (currentList) {
                        currentList = null; // Close active list
                    }
                }
                continue;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                continue;
            }

            // Headers
            const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
            if (headerMatch) {
                if (currentList) currentList = null;
                const level = headerMatch[1].length;
                const heading = document.createElement(`h${level}`);
                MarkdownRenderer._parseInline(headerMatch[2], heading);
                container.appendChild(heading);
                continue;
            }

            // Lists (Unordered)
            const listMatch = line.match(/^[\*\-]\s+(.*)/);
            if (listMatch) {
                if (!currentList || currentList.tagName !== 'UL') {
                    currentList = document.createElement('ul');
                    container.appendChild(currentList);
                }
                const li = document.createElement('li');
                MarkdownRenderer._parseInline(listMatch[1], li);
                currentList.appendChild(li);
                continue;
            }

            // Ordered Lists
            const olMatch = line.match(/^\d+\.\s+(.*)/);
            if (olMatch) {
                if (!currentList || currentList.tagName !== 'OL') {
                    currentList = document.createElement('ol');
                    container.appendChild(currentList);
                }
                const li = document.createElement('li');
                MarkdownRenderer._parseInline(olMatch[1], li);
                currentList.appendChild(li);
                continue;
            }

            // Paragraphs
            if (line.trim() !== '') {
                if (currentList) currentList = null;
                const p = document.createElement('p');
                MarkdownRenderer._parseInline(line, p);
                container.appendChild(p);
            } else {
                if (currentList) currentList = null;
            }
        }

        return container;
    }

    /**
     * Parses inline formatting (bold, italic, code) and appends nodes safely.
     * @param {string} text - The line of text to parse.
     * @param {HTMLElement} parent - The parent element to append nodes to.
     */
    static _parseInline(text, parent) {
        // Simple regex-based inline parser
        let remaining = text;
        const inlineRules = [
            { regex: /^\*\*(.*?)\*\*/, tag: 'strong' }, // Bold
            { regex: /^\*(.*?)\*/, tag: 'em' },         // Italic
            { regex: /^`(.*?)`/, tag: 'code' }          // Inline Code
        ];

        while (remaining.length > 0) {
            let matched = false;

            for (const rule of inlineRules) {
                const match = remaining.match(rule.regex);
                if (match) {
                    const el = document.createElement(rule.tag);
                    el.textContent = match[1];
                    parent.appendChild(el);
                    remaining = remaining.substring(match[0].length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // If no formatting match at the start, consume one character
                // To be more efficient, let's find the next formatting mark
                const nextMatch = remaining.search(/[\*`]/);
                if (nextMatch > 0) {
                    parent.appendChild(document.createTextNode(remaining.substring(0, nextMatch)));
                    remaining = remaining.substring(nextMatch);
                } else {
                    parent.appendChild(document.createTextNode(remaining));
                    remaining = '';
                }
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
