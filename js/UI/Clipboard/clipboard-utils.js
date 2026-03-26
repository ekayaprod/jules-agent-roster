const DEFAULT_SUCCESS_DURATION = 2000;

/**
 * Utility class for handling clipboard operations and button success animations.
 * Centralizes logic previously duplicated in RosterApp and FusionLab.
 * @see ../../../docs/architecture/UI/Clipboard.md#clipboardutils-architecture for implementation details.
 */
class ClipboardUtils {
    /**
     * Copies text to the clipboard using the modern Clipboard API,
     * seamlessly dropping down to `execCommand('copy')` for older browser compatibility.
     * @param {string} text - The raw text payload to inject into the clipboard.
     * @returns {Promise<boolean>} True if the operation was completely successful.
     * @see ../../../docs/architecture/UI/Clipboard.md#1-clipboard-operations for the fallback mechanics details.
     */
    static async copyText(text) {
        // 1. Try Modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn("Clipboard API failed, attempting fallback", err);
            }
        }

        // 2. Fallback: execCommand('copy')
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();

        let success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
            console.error("Fallback copy failed", err);
        } finally {
            document.body.removeChild(el);
        }

        return success;
    }

    /**
     * Executes a temporary visual state transition on a target button to indicate success.
     * Swaps the default icon for a checkmark and temporarily updates the text span.
     * Automatically reverts to the original state via a timeout.
     * @param {HTMLElement} btn - The DOM button element to target.
     * @param {string} successMessage - The temporary text string to render.
     * @param {number} [duration=DEFAULT_SUCCESS_DURATION] - The timeout duration in milliseconds before resetting.
     * @returns {void}
     * @see ../../../docs/architecture/UI/Clipboard.md#2-temporal-ui-states for visual rollback logic and styling interactions.
     */
    static animateButtonSuccess(btn, successMessage, duration = DEFAULT_SUCCESS_DURATION) {
        if (!btn) return;

        const span = btn.querySelector("span");
        // Support both .copy-icon (FusionLab) and generic primary icon (RosterApp)
        const primaryIcon = btn.querySelector(".copy-icon") || btn.querySelector("svg:not(.check-icon)");
        const checkIcon = btn.querySelector(".check-icon");

        if (!span) return;

        const originalText = span.innerText;

        btn.classList.add("success-state");
        span.innerText = successMessage;

        if (primaryIcon) primaryIcon.style.display = "none";
        if (checkIcon) {
            checkIcon.style.display = "block";
            checkIcon.classList.add("animate");
        }

        setTimeout(() => {
            btn.classList.remove("success-state");
            span.innerText = originalText;

            if (primaryIcon) primaryIcon.style.display = "block";
            if (checkIcon) {
                checkIcon.style.display = "none";
                checkIcon.classList.remove("animate");
            }
        }, duration);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardUtils;
}
