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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
}
