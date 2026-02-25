/**
 * Handles toast notifications for the application.
 */
class ToastNotification {
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
            this.element.addEventListener('mouseenter', this.handleMouseEnter);
            this.element.addEventListener('mouseleave', this.handleMouseLeave);

            // Delegate click for close button
            this.element.addEventListener('click', (e) => {
                if (e.target.closest('.toast-close-btn')) {
                    this.dismiss();
                }
            });
        }
    }

    /**
     * Displays a toast notification with a message and type.
     * Clears any existing toast timeout to prevent race conditions.
     * @param {string} [message="Copied to clipboard"] - The message to display.
     * @param {string} [type="success"] - The type of toast ('success', 'error', 'info').
     * @param {number} [duration=3000] - Duration in milliseconds before auto-dismiss.
     */
    show(message, type = 'success', duration = 3000) {
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
     * Starts the auto-dismiss timer.
     * @param {number} duration
     */
    startTimer(duration) {
        this.timeout = setTimeout(() => {
            if (!this.isHovered) {
                this.dismiss();
            }
        }, duration);
    }

    /**
     * Handles mouse enter event to pause dismissal.
     */
    handleMouseEnter() {
        this.isHovered = true;
        if (this.timeout) clearTimeout(this.timeout);
    }

    /**
     * Handles mouse leave event to resume dismissal.
     */
    handleMouseLeave() {
        this.isHovered = false;
        // Resume with a short delay (2s) to allow user to read before it disappears
        this.startTimer(2000);
    }

    /**
     * Dismisses the toast immediately.
     */
    dismiss() {
        if (this.element) {
            this.element.classList.remove("show");
            // Optional: Clear content after transition for screen readers?
            // Better to leave it until next show or keep it hidden via CSS.
        }
    }
}
