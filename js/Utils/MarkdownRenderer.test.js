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

    describe('_parseInline', () => {
        it('should correctly parse inline bold markdown', () => {
            const el = document.createElement('div');
            MarkdownRenderer._parseInline(el, 'This is **bold** text');
            expect(el.innerHTML).toBe('This is <strong>bold</strong> text');
        });

        it('should correctly parse inline italic markdown', () => {
            const el = document.createElement('div');
            MarkdownRenderer._parseInline(el, 'This is *italic* text');
            expect(el.innerHTML).toBe('This is <em>italic</em> text');
        });

        it('should correctly parse inline code markdown', () => {
            const el = document.createElement('div');
            MarkdownRenderer._parseInline(el, 'This is `inline code` text');
            expect(el.innerHTML).toBe('This is <code>inline code</code> text');
        });

        it('should handle mixed inline markdown types', () => {
            const el = document.createElement('div');
            MarkdownRenderer._parseInline(el, 'Here is **bold**, *italic*, and `code` in one line.');
            expect(el.innerHTML).toBe('Here is <strong>bold</strong>, <em>italic</em>, and <code>code</code> in one line.');
        });

        it('should handle consecutive bold/italic markers correctly', () => {
            const el = document.createElement('div');
            MarkdownRenderer._parseInline(el, '**bold1** **bold2**');
            expect(el.innerHTML).toBe('<strong>bold1</strong> <strong>bold2</strong>');
        });
    });

    describe('Code Blocks', () => {
        it('should correctly render multiline code blocks', () => {
            const result = MarkdownRenderer.render('```\nconst x = 1;\nconsole.log(x);\n```');
            const pre = result.querySelector('pre.markdown-code');
            expect(pre).not.toBeNull();
            const code = pre.querySelector('code');
            expect(code).not.toBeNull();
            expect(code.textContent).toBe('const x = 1;\nconsole.log(x);\n');
        });

        it('should handle unclosed code blocks correctly', () => {
            const result = MarkdownRenderer.render('```\nconst x = 1;');
            const pre = result.querySelector('pre.markdown-code');
            expect(pre).not.toBeNull();
            const code = pre.querySelector('code');
            expect(code.textContent).toBe('const x = 1;\n');
        });
    });

    describe('Tables', () => {
        it('should render standard tables correctly', () => {
            const tableMarkdown = '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1 | Cell 2 |';
            const result = MarkdownRenderer.render(tableMarkdown);
            const table = result.querySelector('table.markdown-table');
            expect(table).not.toBeNull();

            const ths = table.querySelectorAll('th');
            expect(ths.length).toBe(2);
            expect(ths[0].textContent).toBe('Header 1');

            const tds = table.querySelectorAll('td');
            expect(tds.length).toBe(2);
            expect(tds[0].textContent).toBe('Cell 1');
        });

        it('should correctly ignore separator rows', () => {
            const tableMarkdown = '| A | B |\n| :--- | ---: |\n| 1 | 2 |';
            const result = MarkdownRenderer.render(tableMarkdown);
            const table = result.querySelector('table.markdown-table');
            const rows = table.querySelectorAll('tr');
            expect(rows.length).toBe(2); // Header row + 1 data row
        });
    });

    describe('Blockquotes', () => {
        it('should render single blockquote correctly', () => {
            const result = MarkdownRenderer.render('> This is a quote');
            const blockquote = result.querySelector('blockquote.markdown-blockquote');
            expect(blockquote).not.toBeNull();
            expect(blockquote.textContent).toBe('This is a quote');
        });

        it('should merge consecutive blockquotes into one element with linebreaks', () => {
            const result = MarkdownRenderer.render('> Line 1\n> Line 2');
            const blockquotes = result.querySelectorAll('blockquote.markdown-blockquote');
            expect(blockquotes.length).toBe(1);
            expect(blockquotes[0].innerHTML).toBe('Line 1<br>Line 2');
        });
    });
});
