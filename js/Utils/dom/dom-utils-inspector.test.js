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
});
