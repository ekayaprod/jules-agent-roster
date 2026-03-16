/**
 * Custom DOM-node based Markdown Renderer.
 * Ensures complete protection against XSS vulnerabilities by avoiding innerHTML.
 * @see README.md#markdownrenderer-architecture
 */
class MarkdownRenderer {

    /**
     * Creates a DOM element from a matched inline markdown string.
     * @param {string} matchedString - The matched markdown string (e.g. **text**).
     * @returns {HTMLElement|null} The created DOM element.
     * @see README.md#markdownrenderer-architecture
     */
    static _createInlineElement(matchedString) {
        if (matchedString.startsWith('**') && matchedString.endsWith('**')) {
            const strong = document.createElement('strong');
            strong.textContent = matchedString.substring(2, matchedString.length - 2);
            return strong;
        }
        if (matchedString.startsWith('*') && matchedString.endsWith('*')) {
            const em = document.createElement('em');
            em.textContent = matchedString.substring(1, matchedString.length - 1);
            return em;
        }
        if (matchedString.startsWith('`') && matchedString.endsWith('`')) {
            const code = document.createElement('code');
            code.textContent = matchedString.substring(1, matchedString.length - 1);
            return code;
        }
        return null;
    }

    /**
     * Parses a single line for basic inline markdown (**, *, `) and appends to the target element.
     * @param {HTMLElement} element - The target DOM element.
     * @param {string} text - The line of text to parse.
     * @see README.md#markdownrenderer-architecture
     */
    static _parseInline(element, text) {
        // Simple regex to match **bold**, *italic*, `code`
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Append preceding text
            if (match.index > lastIndex) {
                element.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }

            const inlineElement = MarkdownRenderer._createInlineElement(match[0]);
            if (inlineElement) {
                element.appendChild(inlineElement);
            }

            lastIndex = regex.lastIndex;
        }

        // Append remaining text
        if (lastIndex < text.length) {
            element.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
    }

    /**
     * Parses raw markdown text and renders it into a DOM container using pure DOM methods.
     * @param {string} text - The raw markdown text.
     * @returns {HTMLElement} A DOM element containing the parsed and styled content.
     * @see README.md#markdownrenderer-architecture
     */
    static render(text) {
        const container = document.createElement("div");
        container.className = "details-content";
        container.style.transition = "all 0.3s ease-in-out";

        if (!text) {
            container.textContent = "No protocol data available.";
            return container;
        }

        const lines = text.split('\n');

        let currentList = null;
        let inCodeBlock = false;
        let codeBlockPre = null;
        let codeBlockCode = null;
        let inTable = false;
        let tableElement = null;
        let tbodyElement = null;

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (inCodeBlock) {
                if (trimmedLine.startsWith('```')) {
                    inCodeBlock = false;
                } else {
                    codeBlockCode.appendChild(document.createTextNode(line + '\n'));
                }
                return;
            }

            if (trimmedLine.startsWith('```')) {
                inCodeBlock = true;
                inTable = false;
                currentList = null;
                codeBlockPre = document.createElement("pre");
                codeBlockPre.className = "markdown-code";
                codeBlockPre.style.transition = "all 0.3s ease-in-out";
                codeBlockPre.setAttribute("role", "figure");
                codeBlockPre.setAttribute("aria-label", "Code block");
                codeBlockCode = document.createElement("code");
                codeBlockPre.appendChild(codeBlockCode);
                container.appendChild(codeBlockPre);
                return;
            }

            if (!trimmedLine) {
                inTable = false;
                currentList = null;
                return; // Skip empty lines
            }

            // Tables
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                currentList = null;
                // Basic extraction of cells
                const cells = line.split('|').slice(1, -1).map(c => c.trim());

                // Check if it's a separator row (e.g. |---|---|)
                const isSeparator = cells.every(c => /^:?-+:?$/.test(c));

                if (isSeparator) {
                    return; // Skip rendering separator
                }

                if (!inTable) {
                    inTable = true;
                    tableElement = document.createElement("table");
                    tableElement.className = "markdown-table";
                    tableElement.style.transition = "all 0.3s ease-in-out";
                    tableElement.setAttribute("role", "table");
                    tableElement.setAttribute("aria-label", "Data table");

                    const thead = document.createElement("thead");
                    thead.setAttribute("role", "rowgroup");

                    const headerRow = document.createElement("tr");
                    headerRow.setAttribute("role", "row");

                    cells.forEach(cell => {
                        const th = document.createElement("th");
                        th.setAttribute("role", "columnheader");
                        MarkdownRenderer._parseInline(th, cell);
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    tableElement.appendChild(thead);

                    tbodyElement = document.createElement("tbody");
                    tbodyElement.setAttribute("role", "rowgroup");
                    tableElement.appendChild(tbodyElement);
                    container.appendChild(tableElement);
                } else {
                    const row = document.createElement("tr");
                    row.setAttribute("role", "row");
                    cells.forEach(cell => {
                        const td = document.createElement("td");
                        td.setAttribute("role", "cell");
                        MarkdownRenderer._parseInline(td, cell);
                        row.appendChild(td);
                    });
                    tbodyElement.appendChild(row);
                }
                return;
            } else {
                inTable = false;
            }

            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                if (!currentList) {
                    currentList = document.createElement("ul");
                    currentList.className = "markdown-list";
                    currentList.setAttribute("role", "list");
                    container.appendChild(currentList);
                }
                const li = document.createElement("li");
                li.setAttribute("role", "listitem");
                MarkdownRenderer._parseInline(li, trimmedLine.substring(2));
                currentList.appendChild(li);
                return;
            }

            if (trimmedLine.startsWith('> ')) {
                currentList = null;
                let lastChild = container.lastElementChild;
                if (lastChild && lastChild.className === "markdown-blockquote") {
                    lastChild.appendChild(document.createElement("br"));
                    MarkdownRenderer._parseInline(lastChild, trimmedLine.substring(2));
                } else {
                    const bq = document.createElement("blockquote");
                    bq.className = "markdown-blockquote";
                    bq.style.transition = "all 0.3s ease-in-out";
                    MarkdownRenderer._parseInline(bq, trimmedLine.substring(2));
                    container.appendChild(bq);
                }
                return;
            }

            if (trimmedLine.startsWith('### ')) {
                currentList = null;
                const h3 = document.createElement("h3");
                h3.className = "markdown-h3";
                MarkdownRenderer._parseInline(h3, trimmedLine.substring(4));
                container.appendChild(h3);
                return;
            }

            if (trimmedLine.startsWith('## ')) {
                currentList = null;
                const h2 = document.createElement("h2");
                h2.className = "markdown-h2";
                MarkdownRenderer._parseInline(h2, trimmedLine.substring(3));
                container.appendChild(h2);
                return;
            }

            if (trimmedLine.startsWith('# ')) {
                currentList = null;
                const h1 = document.createElement("h1");
                h1.className = "markdown-h1";
                MarkdownRenderer._parseInline(h1, trimmedLine.substring(2));
                container.appendChild(h1);
                return;
            }

            currentList = null;
            const p = document.createElement("p");
            p.className = "markdown-p";
            MarkdownRenderer._parseInline(p, trimmedLine);
            container.appendChild(p);
        });

        return container;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
