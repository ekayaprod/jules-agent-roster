/**
 * @jest-environment jsdom
 */
const MarkdownRenderer = require('./MarkdownRenderer');

describe('MarkdownRenderer', () => {
    it('should render "No protocol data available" if text is empty', () => {
        const result = MarkdownRenderer.render('');
        expect(result.textContent).toBe('No protocol data available.');
    });

    it('should render paragraphs correctly', () => {
        const result = MarkdownRenderer.render('Hello World\nThis is a paragraph');
        const paragraphs = result.querySelectorAll('.markdown-p');
        expect(paragraphs.length).toBe(2);
        expect(paragraphs[0].textContent).toBe('Hello World');
        expect(paragraphs[1].textContent).toBe('This is a paragraph');
    });

    it('should render h1, h2, h3 correctly', () => {
        const result = MarkdownRenderer.render('# Heading 1\n## Heading 2\n### Heading 3');
        const h1 = result.querySelector('.markdown-h1');
        const h2 = result.querySelector('.markdown-h2');
        const h3 = result.querySelector('.markdown-h3');
        expect(h1.textContent).toBe('Heading 1');
        expect(h2.textContent).toBe('Heading 2');
        expect(h3.textContent).toBe('Heading 3');
    });

    it('should render bullet lists correctly', () => {
        const result = MarkdownRenderer.render('- Item 1\n* Item 2');
        const list = result.querySelector('ul.markdown-list');
        expect(list).not.toBeNull();
        const items = list.querySelectorAll('li');
        expect(items.length).toBe(2);
        expect(items[0].textContent).toBe('Item 1');
        expect(items[1].textContent).toBe('Item 2');
    });

    it('should handle empty lines gracefully', () => {
        const result = MarkdownRenderer.render('Hello\n\nWorld');
        const paragraphs = result.querySelectorAll('.markdown-p');
        expect(paragraphs.length).toBe(2);
    });

    it('should parse inline markdown (**bold**, *italic*, `code`) correctly', () => {
        const result = MarkdownRenderer.render('Here is **bold**, *italic*, and `code` text.');
        const p = result.querySelector('.markdown-p');
        expect(p).not.toBeNull();
        expect(p.innerHTML).toContain('Here is <strong>bold</strong>, <em>italic</em>, and <code>code</code> text.');

        // Test edge cases with no surrounding text
        const result2 = MarkdownRenderer.render('**bold** *italic* `code`');
        const p2 = result2.querySelector('.markdown-p');
        expect(p2.innerHTML).toContain('<strong>bold</strong> <em>italic</em> <code>code</code>');
    });

    it('should render blockquotes correctly, including multiple lines', () => {
        const result = MarkdownRenderer.render('> First line\n> Second line\nSome other text');
        const bq = result.querySelector('.markdown-blockquote');
        expect(bq).not.toBeNull();
        expect(bq.innerHTML).toContain('First line');
        expect(bq.innerHTML).toContain('<br>');
        expect(bq.innerHTML).toContain('Second line');

        const p = result.querySelector('.markdown-p');
        expect(p).not.toBeNull();
        expect(p.textContent).toBe('Some other text');
    });

    it('should render code blocks correctly', () => {
        const result = MarkdownRenderer.render('```\nconst x = 1;\nconsole.log(x);\n```\nAfter code');
        const pre = result.querySelector('.markdown-code');
        expect(pre).not.toBeNull();
        const code = pre.querySelector('code');
        expect(code).not.toBeNull();
        expect(code.textContent).toBe('const x = 1;\nconsole.log(x);\n');

        const p = result.querySelector('.markdown-p');
        expect(p).not.toBeNull();
        expect(p.textContent).toBe('After code');
    });

    it('should render tables correctly, ignoring separator lines', () => {
        const tableMarkdown = `
| Header 1 | Header 2 |
|---|:---:|
| Cell 1 | Cell 2 |
| Cell 3 | Cell 4 |
`;
        const result = MarkdownRenderer.render(tableMarkdown);
        const table = result.querySelector('.markdown-table');
        expect(table).not.toBeNull();

        const ths = table.querySelectorAll('thead th');
        expect(ths.length).toBe(2);
        expect(ths[0].textContent).toBe('Header 1');
        expect(ths[1].textContent).toBe('Header 2');

        const trs = table.querySelectorAll('tbody tr');
        expect(trs.length).toBe(2);

        const tds1 = trs[0].querySelectorAll('td');
        expect(tds1.length).toBe(2);
        expect(tds1[0].textContent).toBe('Cell 1');
        expect(tds1[1].textContent).toBe('Cell 2');

        const tds2 = trs[1].querySelectorAll('td');
        expect(tds2.length).toBe(2);
        expect(tds2[0].textContent).toBe('Cell 3');
        expect(tds2[1].textContent).toBe('Cell 4');
    });
});
