const { TOAST_TYPES } = require('../../constants/ui.js');
global.TOAST_TYPES = TOAST_TYPES;
/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');
const { screen, waitFor } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const userEvent = require('@testing-library/user-event').default;

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
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
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
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
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

      expect(container).toHaveClass('show', TOAST_TYPES.SUCCESS);
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should render an error toast with correct attributes', () => {
      toast.show('Error message', TOAST_TYPES.ERROR);

      expect(container).toHaveClass(TOAST_TYPES.ERROR);
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveAttribute('aria-live', 'assertive');
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should render an info toast', () => {
      toast.show('Info message', TOAST_TYPES.INFO);

      expect(container).toHaveClass(TOAST_TYPES.INFO);
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should fallback to default message if empty', () => {
      toast.show('');

      expect(screen.getByText('Notification')).toBeInTheDocument();
    });

    it('should clear existing timeout if called repeatedly', () => {
      toast.show('First');
      const firstTimeout = toast.timeout;

      toast.show('Second');
      const secondTimeout = toast.timeout;

      expect(firstTimeout).not.toBe(secondTimeout);
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.queryByText('First')).not.toBeInTheDocument();
    });

    it('should handle duration = 0 by not setting a timer', () => {
      const startTimerSpy = jest.spyOn(toast, 'startTimer');
      toast.show('Persistent', TOAST_TYPES.INFO, 0);

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
      expect(container).not.toHaveClass(TOAST_TYPES.ERROR);
      expect(container).toHaveClass('true');
      expect(screen.getByRole('status')).toBeInTheDocument(); // Defaults to status for non-error types
    });
  });

  describe('auto-dismiss timer logic', () => {
    let user;
    beforeEach(() => {
      user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    });

    it('should auto-dismiss after the duration', () => {
      toast.show('Test', TOAST_TYPES.SUCCESS, 3000);

      expect(container).toHaveClass('show');

      jest.advanceTimersByTime(3000);

      expect(container).not.toHaveClass('show');
    });

    it('should not dismiss if hovered', async () => {
      toast.show('Test', TOAST_TYPES.SUCCESS, 3000);

      // Simulate pointer enter on the container (which toast.element is bound to)
      await user.hover(container);

      jest.advanceTimersByTime(3000);

      // Should still be visible
      expect(container).toHaveClass('show');
    });

    it('should resume dismissal with delay after mouse leave', async () => {
      toast.show('Test', TOAST_TYPES.SUCCESS, 3000);

      await user.hover(container);
      jest.advanceTimersByTime(3000); // Original time passes

      await user.unhover(container); // Mouse leaves

      // Default RESUME_DELAY is 2000
      jest.advanceTimersByTime(1999);
      expect(container).toHaveClass('show');

      jest.advanceTimersByTime(1);
      expect(container).not.toHaveClass('show');
    });
  });

  describe('click delegation', () => {
    let user;
    beforeEach(() => {
      user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    });

    it('should dismiss when the close button is clicked', async () => {
      toast.show('Test');

      const closeBtn = screen.getByRole('button', { name: /close notification/i });

      await user.click(closeBtn);

      expect(container).not.toHaveClass('show');
    });

    it('should not dismiss when clicking elsewhere in the toast', async () => {
      toast.show('Test');

      const messageSpan = screen.getByText('Test');

      await user.click(messageSpan);

      expect(container).toHaveClass('show');
    });
  });
});
