/**
 * Utility class for common DOM operations.
 * Centralizes duplicate UI logic such as generating CSS loading skeletons.
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
   */
  static createSkeletonElement(className, minHeight = "") {
    const skeleton = document.createElement("div");
    skeleton.className = className;
    if (minHeight) {
      skeleton.style.minHeight = minHeight;
    }
    skeleton.setAttribute("aria-hidden", "true");
    return skeleton;
  }

  /**
   * Sets the state of a button (e.g., loading, error, ready) and updates ARIA attributes.
   * Centralizes duplicated UI logic across multiple components.
   *
   * @param {HTMLElement} btn - The button element to update.
   * @param {string} state - The state to apply ('loading', 'error', 'ready', 'disabled').
   * @param {string} text - The text to display on the button.
   */
  static setButtonState(btn, state, text) {
    if (!btn) return;

    btn.innerText = text;
    btn.classList.remove("loading", "error");

    switch (state) {
      case "loading":
        btn.classList.add("loading");
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-busy", "true");
        break;
      case "error":
        btn.classList.add("error");
        btn.disabled = false;
        btn.setAttribute("aria-disabled", "false");
        btn.setAttribute("aria-busy", "false");
        break;
      case "ready":
        btn.disabled = false;
        btn.setAttribute("aria-disabled", "false");
        btn.setAttribute("aria-busy", "false");
        break;
      case "disabled":
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-busy", "false");
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
   */
  static setElementsDisplay(selectorOrElements, display, excludeId = "") {
    // ⚡ Bolt+: Accepts pre-cached NodeLists/Iterables to bypass expensive document.querySelectorAll lookups
    const elements = typeof selectorOrElements === 'string' ? document.querySelectorAll(selectorOrElements) : selectorOrElements;

    if (!elements) return;

    elements.forEach(el => {
      if (!excludeId || el.id !== excludeId) {
        el.style.display = display;
      }
    });
  }

  /**
   * Helper for generating PR link buttons.
   * Centralizes duplicated UI logic across JulesManager and RosterApp.
   *
   * @param {string} url - The pull request URL to link to.
   * @param {function} [onClick] - Optional click handler for the link.
   * @returns {HTMLElement} The constructed anchor tag.
   */
  static createPRLink(url, onClick) {
    const prLink = document.createElement("a");
    prLink.className = "pr-link-btn";
    prLink.href = url;
    prLink.target = "_blank";
    prLink.rel = "noopener noreferrer";
    prLink.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4h-4"/><path d="M12 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2"/><polyline points="15 8 18 5 21 8"/></svg>
        View PR
    `;
    if (onClick) {
        prLink.addEventListener("click", onClick);
    }
    return prLink;
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
}
