/**
 * @jest-environment jsdom
 */

const EmptyState = require('./EmptyState');

describe('EmptyState Fallback Path', () => {
    it('uses explicit textContent when window.DOMPurify is not available', () => {
        // Save and remove DOMPurify
        const originalDOMPurify = window.DOMPurify;
        delete window.DOMPurify;

        const testIconString = '<svg class="malicious">icon</svg>';

        const el = EmptyState.create({
            title: 'Test Title',
            description: 'Test Description',
            icon: testIconString
        });

        // The first child should be the iconWrapper since firstElementChild is null
        const iconNode = el.firstChild;

        expect(iconNode.tagName).toBe('DIV');
        expect(iconNode.innerHTML).toContain('&lt;svg class="malicious"&gt;icon&lt;/svg&gt;');
        expect(iconNode.textContent).toBe(testIconString);

        // Restore DOMPurify
        window.DOMPurify = originalDOMPurify;
    });
});
