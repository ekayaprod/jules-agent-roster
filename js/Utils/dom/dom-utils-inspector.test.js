/**
 * @jest-environment jsdom
 */

const DOMUtils = require('./dom-utils');

describe('DOMUtils Inspector Polygraph', () => {
    describe('getTerminalSessionHTML', () => {
        it('should handle null/undefined escapedEmoji gracefully', () => {
            const htmlNull = DOMUtils.getTerminalSessionHTML(null, 'Agent', 'Active');
            expect(htmlNull).toContain(' Agent');

            const htmlUndef = DOMUtils.getTerminalSessionHTML(undefined, 'Agent', 'Active');
            expect(htmlUndef).toContain(' Agent');
        });

        it('should handle empty string statusId', () => {
            const html = DOMUtils.getTerminalSessionHTML('emoji', 'Agent', 'Active', '');
            expect(html).not.toContain('id=');
            expect(html).toContain('<span class="term-status">Active</span>');
        });
    });

    describe('getTerminalIndicatorHTML', () => {
        it('should handle null/undefined message gracefully', () => {
            const htmlNull = DOMUtils.getTerminalIndicatorHTML(null);
            expect(htmlNull).toContain('[SYS] null');

            const htmlUndef = DOMUtils.getTerminalIndicatorHTML(undefined);
            expect(htmlUndef).toContain('[SYS] undefined');
        });
    });

    describe('createMarkdownPreBlock', () => {
        beforeEach(() => {
            window.MarkdownRenderer = undefined;
        });

        it('should fallback to createTextNode when MarkdownRenderer is missing', () => {
            const el = DOMUtils.createMarkdownPreBlock('test content');
            expect(el.innerHTML).toBe('test content');
        });

        it('should handle missing text when MarkdownRenderer is missing', () => {
            const elNull = DOMUtils.createMarkdownPreBlock(null);
            expect(elNull.innerHTML).toBe('');

            const elUndef = DOMUtils.createMarkdownPreBlock(undefined);
            expect(elUndef.innerHTML).toBe('');
        });

        it('should use MarkdownRenderer when available', () => {
            window.MarkdownRenderer = {
                render: jest.fn().mockImplementation((text) => {
                    const span = document.createElement('span');
                    span.textContent = `Rendered: ${text}`;
                    return span;
                })
            };

            const el = DOMUtils.createMarkdownPreBlock('test content');
            expect(el.innerHTML).toBe('<span>Rendered: test content</span>');
            expect(window.MarkdownRenderer.render).toHaveBeenCalledWith('test content');
        });
    });

    describe('setElementsDisplay Interrogation', () => {
        it('should not modify style.display if display parameter is an empty string', () => {
            const container = document.createElement('div');
            container.innerHTML = `<div class="target-class d-none" style="display: flex;"></div>`;
            const el = container.querySelector('.target-class');

            DOMUtils.setElementsDisplay(container.querySelectorAll('.target-class'), '');

            expect(el.classList.contains('d-none')).toBe(false);
            expect(el.style.display).toBe('flex');
        });
    });

    describe('getTerminalSessionHTML Interrogation', () => {
        it('should handle falsy escapedEmoji by returning an empty string for the emoji portion', () => {
            const result = DOMUtils.getTerminalSessionHTML(null, 'AgentSmith', 'Active');
            expect(result).toContain('AgentSmith');
            expect(result).not.toContain('null');
        });

        it('should properly escape potentially malicious characters in the escapedEmoji argument', () => {
            const maliciousEmoji = `<script>alert('xss')</script>&"'`;
            const result = DOMUtils.getTerminalSessionHTML(maliciousEmoji, 'AgentX', 'Idle');
            expect(result).toContain('&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;&amp;&quot;&#039;');
            expect(result).not.toContain('<script>');
        });
    });

    describe('createMarkdownPreBlock Interrogation', () => {
        it('should handle missing window.MarkdownRenderer by falling back to createTextNode', () => {
            const originalRenderer = window.MarkdownRenderer;
            delete window.MarkdownRenderer;

            const text = "Raw Text content";
            const result = DOMUtils.createMarkdownPreBlock(text);

            expect(result.textContent).toBe(text);
            expect(result.childNodes[0].nodeType).toBe(Node.TEXT_NODE);

            window.MarkdownRenderer = originalRenderer;
        });

        it('should handle missing window.MarkdownRenderer with null/empty text', () => {
            const originalRenderer = window.MarkdownRenderer;
            delete window.MarkdownRenderer;

            const result = DOMUtils.createMarkdownPreBlock(null);

            expect(result.textContent).toBe("");
            expect(result.childNodes[0].nodeType).toBe(Node.TEXT_NODE);

            window.MarkdownRenderer = originalRenderer;
        });
    });
});
