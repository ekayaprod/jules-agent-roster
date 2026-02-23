/**
 * Handles toast notifications for the application.
 */
class ToastNotification {
    constructor(elementSelector) {
        this.element = document.querySelector(elementSelector);
        this.timeout = null;
    }

    /**
     * Displays a toast notification with a message.
     * Clears any existing toast timeout to prevent race conditions.
     * @param {string} [message="Copied to clipboard"] - The message to display.
     */
    show(message) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.element) {
            this.element.textContent = message || "Copied to clipboard";
            this.element.classList.add("show");
            this.timeout = setTimeout(() => {
                this.element.classList.remove("show");
            }, 2000);
        }
    }
}
