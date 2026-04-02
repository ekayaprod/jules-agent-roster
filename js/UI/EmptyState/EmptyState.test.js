/**
 * @jest-environment jsdom
 */

const { getByRole, getByText } = require('@testing-library/dom');
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

        expect(getByText(container, 'No Protocols Found')).not.toBeNull();
        expect(getByText(container, 'Please try another search.')).not.toBeNull();
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

        const btn = getByRole(container, 'button', { name: /Refresh the page/i });
        expect(btn).not.toBeNull();
        expect(btn.textContent).toBe('Refresh');
        expect(btn.getAttribute('onclick')).toBe('location.reload()');
        expect(btn.className).toBe('refresh-btn');
    });

    test('should use default values for action button', () => {
        const container = EmptyState.create({
            title: 'Title',
            description: 'Description',
            action: {
                text: 'Retry'
            }
        });

        const btn = getByRole(container, 'button', { name: /Retry/i });
        expect(btn.className).toBe('mt-6');
    });

    test('should escape HTML in title and description using textContent', () => {
        const container = EmptyState.create({
            title: '<script>alert("xss")</script>',
            description: '<b>bold</b>'
        });

        const titleEl = getByText(container, '<script>alert("xss")</script>');
        const descEl = getByText(container, 'bold', { exact: false });

        expect(titleEl.innerHTML).not.toContain('<script>');
        expect(descEl.innerHTML).not.toContain('<b>');
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

        const btn = getByRole(container, 'button', { name: /Retry/i });
        btn.click();
        expect(mockFn).toHaveBeenCalled();
    });

    describe('ICONS', () => {
        it('should return a structurally valid object containing SVG and HTML configurations', () => {
            const icons = EmptyState.ICONS;
            expect(icons).toBeDefined();
            expect(icons.ERROR).toContain('<svg');
            expect(icons.ERROR).toContain('class="empty-icon"');
            expect(icons.SEARCH).toContain('<div class="empty-icon">');
        });
    });
});
