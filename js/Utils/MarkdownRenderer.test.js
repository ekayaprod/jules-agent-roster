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
});
