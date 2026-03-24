/**
 * @jest-environment jsdom
 */

const EmptyState = require('./EmptyState');

describe('EmptyState Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should create a container with "empty-state visible" class', () => {
        const container = EmptyState.create({
            title: 'Test Title',
            description: 'Test Description'
        });

        expect(container.tagName).toBe('DIV');
        expect(container.classList.contains('empty-state')).toBe(true);
        expect(container.classList.contains('visible')).toBe(true);
    });

    test('should render title and description', () => {
        const container = EmptyState.create({
            title: 'No Protocols Found',
            description: 'Please try another search.'
        });

        const titleEl = container.querySelector('.empty-title');
        const descEl = container.querySelector('.empty-desc');

        expect(titleEl.textContent).toBe('No Protocols Found');
        expect(descEl.textContent).toBe('Please try another search.');
    });

    test('should render icon if provided', () => {
        const svgIcon = '<svg class="test-icon"></svg>';
        const container = EmptyState.create({
            title: 'Title',
            description: 'Description',
            icon: svgIcon
        });

        expect(container.querySelector('.test-icon')).not.toBeNull();
    });

    test('should render action button if provided', () => {
        const container = EmptyState.create({
            title: 'Title',
            description: 'Description',
            action: {
                text: 'Refresh',
                onClick: 'location.reload()',
                className: 'refresh-btn',
                ariaLabel: 'Refresh the page'
            }
        });

        const btn = container.querySelector('button');
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe('Refresh');
        expect(btn.getAttribute('onclick')).toBe('location.reload()');
        expect(btn.className).toBe('refresh-btn');
        expect(btn.getAttribute('aria-label')).toBe('Refresh the page');
    });

    test('should use default values for action button', () => {
        const container = EmptyState.create({
            title: 'Title',
            description: 'Description',
            action: {
                text: 'Retry'
            }
        });

        const btn = container.querySelector('button');
        expect(btn.className).toBe('mt-6');
        expect(btn.getAttribute('aria-label')).toBe('Retry');
    });

    test('should escape HTML in title and description using textContent', () => {
        const container = EmptyState.create({
            title: '<script>alert("xss")</script>',
            description: '<b>bold</b>'
        });

        const titleEl = container.querySelector('.empty-title');
        const descEl = container.querySelector('.empty-desc');

        expect(titleEl.innerHTML).not.toContain('<script>');
        expect(descEl.innerHTML).not.toContain('<b>');
        expect(titleEl.textContent).toBe('<script>alert("xss")</script>');
    });

    test('should support function onClick handler', () => {
        const mockFn = jest.fn();
        const container = EmptyState.create({
            title: 'Title',
            description: 'Description',
            action: {
                text: 'Retry',
                onClick: mockFn
            }
        });

        const btn = container.querySelector('button');
        btn.click();
        expect(mockFn).toHaveBeenCalled();
    });
});
