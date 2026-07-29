/**
 * @jest-environment jsdom
 */

const DOMUtils = require('./dom-utils');

describe('DOMUtils Boundary Stress-Tests', () => {
    describe('setElementsDisplay', () => {
        it('should handle display="" without crashing', () => {
            document.body.innerHTML = '<div class="test"></div>';
            DOMUtils.setElementsDisplay('.test', '');
            expect(document.querySelector('.test').style.display).toBe('');
            document.body.innerHTML = '';
        });
    });

    describe('getTerminalSessionHTML', () => {
        it('should handle escapedEmoji with unsafe characters', () => {
            const html = DOMUtils.getTerminalSessionHTML('<script>alert("XSS")</script>', 'Jules', 'Processing');
            expect(html).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
            expect(html).not.toContain('<script>');
        });
    });
});
