/**
 * Custom DOM-node based Markdown Renderer.
 * Ensures complete protection against XSS vulnerabilities by avoiding innerHTML.
 */
class MarkdownRenderer {
    /**
     * Parses raw markdown text and renders it into a DOM container using pure DOM methods.
     * @param {string} text - The raw markdown text.
     * @returns {HTMLElement} A DOM element containing the parsed and styled content.
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

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return; // Skip empty lines

            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                if (!currentList) {
                    currentList = document.createElement("ul");
                    currentList.className = "markdown-list";
                    container.appendChild(currentList);
                }
                const li = document.createElement("li");
                li.textContent = trimmedLine.substring(2);
                currentList.appendChild(li);
            } else if (trimmedLine.startsWith('# ')) {
                currentList = null;
                const h1 = document.createElement("h1");
                h1.className = "markdown-h1";
                h1.textContent = trimmedLine.substring(2);
                container.appendChild(h1);
            } else if (trimmedLine.startsWith('## ')) {
                currentList = null;
                const h2 = document.createElement("h2");
                h2.className = "markdown-h2";
                h2.textContent = trimmedLine.substring(3);
                container.appendChild(h2);
            } else if (trimmedLine.startsWith('### ')) {
                currentList = null;
                const h3 = document.createElement("h3");
                h3.className = "markdown-h3";
                h3.textContent = trimmedLine.substring(4);
                container.appendChild(h3);
            } else {
                currentList = null;
                const p = document.createElement("p");
                p.className = "markdown-p";
                p.textContent = trimmedLine;
                container.appendChild(p);
            }
        });

        return container;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
