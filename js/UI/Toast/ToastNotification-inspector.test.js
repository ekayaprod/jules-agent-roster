const { TOAST_TYPES } = require("../../constants/ui.js");
global.TOAST_TYPES = TOAST_TYPES;
/**
 * @jest-environment jsdom
 */
const { screen, waitFor } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const userEvent = require('@testing-library/user-event').default;

const ToastNotification = require('./ToastNotification');

describe('ToastNotification interactions', () => {
    let container;
    let toast;

    beforeEach(() => {
        document.body.innerHTML = '<div id="toast"></div>';
        container = document.getElementById('toast');
        toast = new ToastNotification('#toast');
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllTimers();
        document.body.innerHTML = '';
    });

    it('pauses and resumes auto-dismiss timer on mouse enter and leave', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        toast.show('Test Hover', 'info', 3000);
        expect(container).toHaveClass('show');

        // Mouse enters
        await user.hover(container);
        expect(toast.isHovered).toBe(true);

        jest.advanceTimersByTime(3000);
        expect(container).toHaveClass('show');

        // Mouse leaves
        await user.unhover(container);
        expect(toast.isHovered).toBe(false);

        // Advance slightly less than resume delay
        jest.advanceTimersByTime(1999);
        expect(container).toHaveClass('show');

        // Advance rest of resume delay
        jest.advanceTimersByTime(1);
        expect(container).not.toHaveClass('show');
    });
});
