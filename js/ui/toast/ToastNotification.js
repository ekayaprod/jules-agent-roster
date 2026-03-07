const DEFAULT_DURATION = 3000;
const RESUME_DELAY = 2000;

/**
 * Class representing an accessible Toast Notification system.
 * Handles queuing and display logic, rendering semantic DOM roles to support screen readers.
 * @see README.md#toastnotification-architecture for accessibility patterns.
 */
class ToastNotification {
    /**
     * Initializes a Toast instance bound to a specific DOM element.
     * Starts listening for pointer interactions to pause auto-dismiss timers.
     * @param {string} elementSelector - The CSS selector of the base toast container.
     * @see README.md#toastnotification-architecture
     */
    constructor(elementSelector) {
        this.element = document.querySelector(elementSelector);
        this.timeout = null;
        this.isHovered = false;

        // Bind methods for event listeners
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.dismiss = this.dismiss.bind(this);

        if (this.element) {
            // Pause auto-dismiss on hover
            this.element.addEventListener('pointerenter', this.handleMouseEnter);
            this.element.addEventListener('pointerleave', this.handleMouseLeave);

            // Delegate click for close button
            this.element.addEventListener('click', (e) => {
                if (e.target.closest('.toast-close-btn')) {
                    this.dismiss();
                }
            });
        }
    }

    /**
     * Renders a toast notification into the DOM.
     * If a toast is currently active, clears the internal timeout to prevent overlaps,
     * immediately overwriting the state with the new payload.
     *
     * Handles accessibility roles depending on the notification type
     * (e.g., alert/assertive for errors vs status/polite for success).
     * @param {string} message - The primary message to display. Default behavior expects valid strings.
     * @param {string} [type="success"] - The status class representing the visual layout ('success', 'error', 'info').
     * @param {number} [duration=DEFAULT_DURATION] - Duration in milliseconds before auto-dismissing. Set to 0 to disable auto-dismiss.
     * @returns {void}
     * @see README.md#toastnotification-architecture
     */
    show(message, type = 'success', duration = DEFAULT_DURATION) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (!this.element) return;

        // Set default message if empty
        const msgText = message || "Notification";

        // Icons for different types
        const icons = {
            success: `<svg aria-hidden="true" class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
            error: `<svg aria-hidden="true" class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
            info: `<svg aria-hidden="true" class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        };

        // Construct HTML
        this.element.innerHTML = `
            <div class="toast-content">
                ${icons[type] || icons.success}
                <span class="toast-message"></span>
            </div>
            <button class="toast-close-btn" aria-label="Close notification">
                <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;

        // Set message securely
        this.element.querySelector('.toast-message').textContent = msgText;

        // Reset classes
        this.element.className = 'toast';
        this.element.classList.add(type);

        // Accessibility Management
        if (type === 'error') {
            this.element.setAttribute('role', 'alert');
            this.element.setAttribute('aria-live', 'assertive');
        } else {
            this.element.setAttribute('role', 'status');
            this.element.setAttribute('aria-live', 'polite');
        }

        // Show the toast
        // Use requestAnimationFrame to ensure the class is added after DOM update for transition
        requestAnimationFrame(() => {
            this.element.classList.add("show");
        });

        // Start auto-dismiss timer if duration is positive
        if (duration > 0) {
            this.startTimer(duration);
        }
    }

    /**
     * Initializes the asynchronous timeout for auto-dismissal.
     * Aborts execution if the element is currently hovered by the user.
     * @param {number} duration - The millisecond delay before triggering dismissal.
     * @returns {void}
     * @see README.md#toastnotification-architecture
     */
    startTimer(duration) {
        this.timeout = setTimeout(() => {
            if (!this.isHovered) {
                this.dismiss();
            }
        }, duration);
    }

    /**
     * Listener callback attached to `pointerenter` events.
     * Pauses the auto-dismiss timer logic to prevent the toast from disappearing while a user reads it.
     * @returns {void}
     * @see README.md#toastnotification-architecture
     */
    handleMouseEnter() {
        this.isHovered = true;
        if (this.timeout) clearTimeout(this.timeout);
    }

    /**
     * Listener callback attached to `pointerleave` events.
     * Resumes the dismissal behavior with a shortened grace period instead of the full original duration.
     * @returns {void}
     * @see README.md#toastnotification-architecture
     */
    handleMouseLeave() {
        this.isHovered = false;
        // Resume with a short delay (2s) to allow user to read before it disappears
        this.startTimer(RESUME_DELAY);
    }

    /**
     * Forces immediate dismissal of the toast notification by removing visibility classes.
     * Used by internal timers or user-triggered close buttons.
     * @returns {void}
     * @see README.md#toastnotification-architecture
     */
    dismiss() {
        if (this.element) {
            this.element.classList.remove("show");
            // Optional: Clear content after transition for screen readers?
            // Better to leave it until next show or keep it hidden via CSS.
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastNotification;
}
