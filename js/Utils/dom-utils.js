/**
 * Utility class for common DOM operations.
 * Centralizes duplicate UI logic such as generating CSS loading skeletons.
 * @see ../../docs/architecture/Utils/README.md#domutils-architecture
 */
class DOMUtils {
  /**
   * Creates a standardized CSS loading skeleton element.
   * Do NOT use this for actual content generation. This is strictly a placebo
   * element to mask network latency during data fetching or DOM generation.
   *
   * @param {string} className - The CSS class name(s) to apply to the skeleton.
   * @param {string} [minHeight] - Optional minimum height constraint (e.g., "4rem").
   * @returns {HTMLElement} The constructed skeleton DIV element with aria-hidden set.
   * @see ../../docs/architecture/Utils/README.md#domutils-architecture
   */
  static createSkeletonElement(className, minHeight = '') {
    const skeleton = document.createElement('div');
    skeleton.className = className;
    if (minHeight) {
      skeleton.style.minHeight = minHeight;
    }
    skeleton.setAttribute('aria-hidden', 'true');
    return skeleton;
  }

  /**
   * Sets the state of a button (e.g., loading, error, ready) and updates ARIA attributes.
   * Centralizes duplicated UI logic across multiple components.
   *
   * @param {HTMLElement} btn - The button element to update.
   * @param {string} state - The state to apply ('loading', 'error', 'ready', 'disabled').
   * @param {string} text - The text to display on the button.
   * @see ../../docs/architecture/Utils/README.md#domutils-architecture
   */
  static setButtonState(btn, state, text) {
    if (!btn) return;

    btn.innerText = text;
    btn.classList.remove(BUTTON_STATES.LOADING, BUTTON_STATES.ERROR);

    switch (state) {
      case BUTTON_STATES.LOADING:
        btn.classList.add(BUTTON_STATES.LOADING);
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('aria-busy', 'true');
        break;
      case BUTTON_STATES.ERROR:
        btn.classList.add(BUTTON_STATES.ERROR);
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
        btn.setAttribute('aria-busy', 'false');
        break;
      case BUTTON_STATES.READY:
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
        btn.setAttribute('aria-busy', 'false');
        break;
      case BUTTON_STATES.DISABLED:
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('aria-busy', 'false');
        break;
    }
  }

  /**
   * Bulk updates the display style of elements matching a selector, optionally excluding one by ID.
   * Centralizes duplicated NodeList iteration logic to reduce WET code.
   *
   * @param {string|Iterable<HTMLElement>} selectorOrElements - The CSS selector or an iterable of elements to update.
   * @param {string} display - The CSS display value to apply (e.g., 'none', 'flex', 'block').
   * @param {string} [excludeId=""] - An optional element ID to exclude from the styling.
   * @see ../../docs/architecture/Utils/README.md#domutils-architecture
   */
  static setElementsDisplay(selectorOrElements, display, excludeId = '') {
    // ⚡ Bolt+: Accepts pre-cached NodeLists/Iterables to bypass expensive document.querySelectorAll lookups
    const elements =
      typeof selectorOrElements === 'string'
        ? document.querySelectorAll(selectorOrElements)
        : selectorOrElements;

    if (!elements) return;

    elements.forEach((el) => {
      if (!excludeId || el.id !== excludeId) {
        el.style.display = display;
      }
    });
  }

  /**
   * Creates a preformatted block for markdown text content.
   * Centralizes duplicated UI logic across AgentCard and JulesManager.
   *
   * @param {string} text - The raw text content to display.
   * @returns {HTMLElement} The pre element.
   * @see ../../docs/architecture/Utils/README.md#domutils-architecture
   */
  static createMarkdownPreBlock(text) {
    const pre = document.createElement('pre');
    pre.className = 'markdown-raw details-content';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-word';
    pre.textContent = text;
    return pre;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}
