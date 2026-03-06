/**
 * MarkdownRenderer
 * A pure Vanilla JS markdown parser that converts text streams into structured DOM nodes.
 * Strictly avoids innerHTML to prevent XSS vulnerabilities when rendering AI outputs.
 * Injects CSS transitions to ensure fluid, organic growth as tokens arrive.
 */
class MarkdownRenderer {
    /**
     * Renders a markdown string into a DocumentFragment containing styled DOM nodes.
     * @param {string} text - The raw markdown text to parse.
     * @returns {DocumentFragment} A safe DOM fragment ready to be appended to the UI.
     */
    static render(text) {
        const fragment = document.createDocumentFragment();
        if (!text) return fragment;

        const lines = text.split('\n');

        let state = {
            inList: false,
            listNode: null,
            inCodeBlock: false,
            codeNode: null,
            inBlockquote: false,
            blockquoteNode: null,
            inTable: false,
            tableNode: null
        };

        const resetList = () => {
            if (state.inList) {
                state.inList = false;
                state.listNode = null;
            }
        };

        const resetBlockquote = () => {
            if (state.inBlockquote) {
                state.inBlockquote = false;
                state.blockquoteNode = null;
            }
        };

        const resetTable = () => {
            if (state.inTable) {
                state.inTable = false;
                state.tableNode = null;
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();

            // 1. Code Blocks
            if (trimmed.startsWith('```')) {
                if (state.inCodeBlock) {
                    // Close code block
                    state.inCodeBlock = false;
                    state.codeNode = null;
                } else {
                    // Start code block
                    resetList();
                    resetBlockquote();
                    resetTable();

                    state.inCodeBlock = true;

                    const container = document.createElement('div');
                    container.style.background = "rgba(15, 23, 42, 0.5)";
                    container.style.border = "1px solid var(--border)";
                    container.style.borderRadius = "0.5rem";
                    container.style.padding = "0.75rem";
                    container.style.marginTop = "0.5rem";
                    container.style.marginBottom = "0.5rem";
                    container.style.fontFamily = "monospace";
                    container.style.fontSize = "var(--text-xs)";
                    container.style.whiteSpace = "pre-wrap";
                    container.style.transition = "all 0.3s ease";
                    container.style.color = "var(--text-primary)";
                    container.style.overflowX = "auto";

                    const codeLang = trimmed.substring(3).trim();
                    if (codeLang) {
                        const langTag = document.createElement('div');
                        langTag.style.fontSize = "var(--text-3xs)";
                        langTag.style.color = "var(--text-secondary)";
                        langTag.style.marginBottom = "0.25rem";
                        langTag.style.textTransform = "uppercase";
                        langTag.textContent = codeLang;
                        container.appendChild(langTag);
                    }

                    state.codeNode = document.createElement('code');
                    container.appendChild(state.codeNode);
                    fragment.appendChild(container);
                }
                return;
            }

            if (state.inCodeBlock) {
                state.codeNode.appendChild(document.createTextNode(line + '\n'));
                return;
            }

            // 2. Blockquotes
            if (trimmed.startsWith('>')) {
                resetList();
                resetTable();
                if (!state.inBlockquote) {
                    state.inBlockquote = true;
                    state.blockquoteNode = document.createElement('blockquote');
                    state.blockquoteNode.style.borderLeft = "4px solid var(--accent)";
                    state.blockquoteNode.style.paddingLeft = "1rem";
                    state.blockquoteNode.style.marginLeft = "0";
                    state.blockquoteNode.style.marginRight = "0";
                    state.blockquoteNode.style.color = "var(--text-secondary)";
                    state.blockquoteNode.style.fontStyle = "italic";
                    state.blockquoteNode.style.transition = "all 0.3s ease";
                    fragment.appendChild(state.blockquoteNode);
                }
                const p = document.createElement('div');
                this._parseInline(trimmed.substring(1).trim(), p);
                state.blockquoteNode.appendChild(p);
                return;
            } else {
                resetBlockquote();
            }

            // 3. Tables
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                resetList();
                if (!state.inTable) {
                    state.inTable = true;
                    state.tableNode = document.createElement('table');
                    state.tableNode.style.width = "100%";
                    state.tableNode.style.borderCollapse = "collapse";
                    state.tableNode.style.marginTop = "0.5rem";
                    state.tableNode.style.marginBottom = "0.5rem";
                    state.tableNode.style.fontSize = "var(--text-xs)";
                    fragment.appendChild(state.tableNode);
                }

                // Skip separator rows (e.g. |---|---|)
                if (trimmed.match(/^\|[\s-:]+\|/)) return;

                const tr = document.createElement('tr');
                const cells = trimmed.split('|').slice(1, -1);

                // If it's the first row and we haven't added a header yet, make it a th
                const isHeader = state.tableNode.childElementCount === 0;

                cells.forEach(cell => {
                    const td = document.createElement(isHeader ? 'th' : 'td');
                    td.style.border = "1px solid var(--border)";
                    td.style.padding = "0.5rem";
                    td.style.textAlign = "left";
                    if (isHeader) {
                        td.style.background = "rgba(15, 23, 42, 0.5)";
                        td.style.color = "var(--text-primary)";
                    } else {
                        td.style.color = "var(--text-secondary)";
                    }
                    this._parseInline(cell.trim(), td);
                    tr.appendChild(td);
                });
                state.tableNode.appendChild(tr);
                return;
            } else {
                resetTable();
            }

            // 4. Lists
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (!state.inList) {
                    state.inList = true;
                    state.listNode = document.createElement('ul');
                    state.listNode.style.marginTop = '0.5rem';
                    state.listNode.style.marginBottom = '0.5rem';
                    state.listNode.style.paddingLeft = '1.5rem';
                    fragment.appendChild(state.listNode);
                }
                const li = document.createElement('li');
                li.style.transition = "all 0.3s ease";
                li.style.lineHeight = "var(--leading-relaxed)";
                li.style.marginTop = "0.25rem";
                this._parseInline(trimmed.substring(2).trim(), li);
                state.listNode.appendChild(li);
                return;
            } else {
                resetList();
            }

            // 5. Paragraphs / Spacers
            if (trimmed === '') {
                const spacer = document.createElement('div');
                spacer.style.height = '0.5rem';
                spacer.style.transition = "all 0.3s ease";
                fragment.appendChild(spacer);
            } else {
                const p = document.createElement('div');
                p.style.transition = "all 0.3s ease";
                p.style.lineHeight = "var(--leading-relaxed)";
                p.style.marginTop = "0.25rem";
                this._parseInline(line, p); // pass original line to preserve internal spaces
                fragment.appendChild(p);
            }
        });

        return fragment;
    }

    /**
     * Parses inline markdown (like **bold** and `code`) within a given text block.
     * @param {string} text - The line of text to parse.
     * @param {HTMLElement} container - The container to append the resulting DOM nodes to.
     * @private
     */
    static _parseInline(text, container) {
        // Regex to split by bold (**text**) or inline code (`text`)
        const regex = /(\*\*.*?\*\*|`.*?`)/g;
        const parts = text.split(regex);

        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.style.color = "var(--text-primary)";
                strong.style.fontWeight = "600";
                strong.textContent = part.slice(2, -2);
                container.appendChild(strong);
            } else if (part.startsWith('\`') && part.endsWith('\`')) {
                const code = document.createElement('code');
                code.style.background = "rgba(15, 23, 42, 0.5)";
                code.style.padding = "0.1rem 0.3rem";
                code.style.borderRadius = "0.25rem";
                code.style.fontFamily = "monospace";
                code.style.color = "var(--accent)";
                code.textContent = part.slice(1, -1);
                container.appendChild(code);
            } else if (part) {
                container.appendChild(document.createTextNode(part));
            }
        });
    }
}

// Export for Node.js environment (Jest/Benchmark tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
