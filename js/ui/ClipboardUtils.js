/**
 * Utility class for handling clipboard operations and button success animations.
 * Centralizes logic previously duplicated in RosterApp and FusionLab.
 */
class ClipboardUtils {
  /**
   * Copies text to the clipboard using the Clipboard API or a fallback.
   * @param {string} text - The text to copy.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  static async copyText(text) {
    // 1. Try Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API failed, attempting fallback', err);
      }
    }

    // 2. Fallback: execCommand('copy')
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    } finally {
      document.body.removeChild(el);
    }

    return success;
  }

  /**
   * Animates a button to indicate success.
   * Temporarily changes the button style and text, and toggles icons.
   * @param {HTMLElement} btn - The button element.
   * @param {string} successMessage - The text to display during the success state.
   * @param {number} [duration=2000] - Duration of the success state in ms.
   */
  static animateButtonSuccess(btn, successMessage, duration = 2000) {
    if (!btn) return;

    const span = btn.querySelector('span');
    // Support both .copy-icon (FusionLab) and generic primary icon (RosterApp)
    const primaryIcon =
      btn.querySelector('.copy-icon') ||
      btn.querySelector('svg:not(.check-icon)');
    const checkIcon = btn.querySelector('.check-icon');

    if (!span) return;

    const originalText = span.innerText;

    btn.classList.add('success-state');
    span.innerText = successMessage;

    if (primaryIcon) primaryIcon.style.display = 'none';
    if (checkIcon) {
      checkIcon.style.display = 'block';
      checkIcon.classList.add('animate');
    }

    setTimeout(() => {
      btn.classList.remove('success-state');
      span.innerText = originalText;

      if (primaryIcon) primaryIcon.style.display = 'block';
      if (checkIcon) {
        checkIcon.style.display = 'none';
        checkIcon.classList.remove('animate');
      }
    }, duration);
  }
}
