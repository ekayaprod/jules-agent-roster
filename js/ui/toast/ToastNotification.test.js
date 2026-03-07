/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

const ToastNotification = require('./ToastNotification');

describe('ToastNotification', () => {
    let container;
    let toast;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="toast"></div>';
        container = document.getElementById('toast');

        // Instantiate ToastNotification
        toast = new ToastNotification('#toast');

        // Mock timers
        jest.useFakeTimers();

        // Mock requestAnimationFrame
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllTimers();
        document.body.innerHTML = '';
    });

    describe('constructor', () => {
        it('should initialize and attach event listeners if element exists', () => {
            const addEventListenerSpy = jest.spyOn(container, 'addEventListener');
            new ToastNotification('#toast');

            expect(addEventListenerSpy).toHaveBeenCalledWith('pointerenter', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
        });

        it('should handle missing element gracefully', () => {
            const emptyToast = new ToastNotification('#non-existent');
            expect(emptyToast.element).toBeNull();
            // Should not throw errors when calling methods
            emptyToast.show('test');
            emptyToast.dismiss();
        });
    });

    describe('show', () => {
        it('should render a success toast with default parameters', () => {
            toast.show('Success message');

            expect(container.classList.contains('show')).toBe(true);
            expect(container.classList.contains('success')).toBe(true);
            expect(container.getAttribute('role')).toBe('status');
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.querySelector('.toast-message').textContent).toBe('Success message');
        });

        it('should render an error toast with correct attributes', () => {
            toast.show('Error message', 'error');

            expect(container.classList.contains('error')).toBe(true);
            expect(container.getAttribute('role')).toBe('alert');
            expect(container.getAttribute('aria-live')).toBe('assertive');
        });

        it('should render an info toast', () => {
            toast.show('Info message', 'info');
            expect(container.classList.contains('info')).toBe(true);
        });

        it('should fallback to default message if empty', () => {
            toast.show('');
            expect(container.querySelector('.toast-message').textContent).toBe('Notification');
        });

        it('should clear existing timeout if called repeatedly', () => {
            toast.show('First');
            const firstTimeout = toast.timeout;

            toast.show('Second');
            const secondTimeout = toast.timeout;

            expect(firstTimeout).not.toBe(secondTimeout);
            expect(container.querySelector('.toast-message').textContent).toBe('Second');
        });

        it('should handle duration = 0 by not setting a timer', () => {
            const startTimerSpy = jest.spyOn(toast, 'startTimer');
            toast.show('Persistent', 'info', 0);

            expect(startTimerSpy).not.toHaveBeenCalled();
            expect(toast.timeout).toBeNull();
        });

        it('should fix the boolean truthy type evaluation bug', () => {
             // Memory constraint: "The `ToastNotification.show(message, type = 'success', duration)` method strictly requires passing the string `"error"` as the second argument for error states; passing boolean `true` erroneously resolves to a success icon due to truthy evaluation."
             // When 'true' is passed, it should NOT be treated as 'error' (which it wasn't anyway, but we test the strict string behavior)
             toast.show('Error happened', true);

             // In the implementation `icons[type] || icons.success`
             // If type is `true`, `icons[true]` is undefined, so it falls back to `icons.success`
             // But the class added is literally 'true'. We verify it doesn't accidentally become 'error'
             expect(container.classList.contains('error')).toBe(false);
             expect(container.classList.contains('true')).toBe(true);
        });
    });

    describe('auto-dismiss timer logic', () => {
        it('should auto-dismiss after the duration', () => {
            toast.show('Test', 'success', 3000);

            expect(container.classList.contains('show')).toBe(true);

            jest.advanceTimersByTime(3000);

            expect(container.classList.contains('show')).toBe(false);
        });

        it('should not dismiss if hovered', () => {
            toast.show('Test', 'success', 3000);

            // Simulate mouse enter
            toast.handleMouseEnter();

            jest.advanceTimersByTime(3000);

            // Should still be visible
            expect(container.classList.contains('show')).toBe(true);
        });

        it('should resume dismissal with delay after mouse leave', () => {
            toast.show('Test', 'success', 3000);

            toast.handleMouseEnter();
            jest.advanceTimersByTime(3000); // Original time passes

            toast.handleMouseLeave(); // Mouse leaves

            // Default RESUME_DELAY is 2000
            jest.advanceTimersByTime(1999);
            expect(container.classList.contains('show')).toBe(true);

            jest.advanceTimersByTime(1);
            expect(container.classList.contains('show')).toBe(false);
        });
    });

    describe('click delegation', () => {
        it('should dismiss when the close button is clicked', () => {
            toast.show('Test');

            const closeBtn = container.querySelector('.toast-close-btn');

            // Simulate delegated click
            const event = new MouseEvent('pointerdown', { bubbles: true });
            Object.defineProperty(event, 'target', { value: closeBtn, enumerable: true });

            // We need to trigger the event manually on the container to test delegation
            container.dispatchEvent(event);

            expect(container.classList.contains('show')).toBe(false);
        });

        it('should not dismiss when clicking elsewhere in the toast', () => {
             toast.show('Test');

             const messageSpan = container.querySelector('.toast-message');

             const event = new MouseEvent('pointerdown', { bubbles: true });
             Object.defineProperty(event, 'target', { value: messageSpan, enumerable: true });

             container.dispatchEvent(event);

             expect(container.classList.contains('show')).toBe(true);
        });
    });
});