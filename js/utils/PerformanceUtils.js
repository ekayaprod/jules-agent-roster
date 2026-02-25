/**
 * Utility class for performance optimizations.
 * Centralizes common patterns like debouncing and throttling to prevent layout thrashing and excessive computations.
 */
class PerformanceUtils {
  /**
   * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.
   * Useful for search inputs to prevent filtering on every keystroke.
   *
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The number of milliseconds to delay.
   * @returns {Function} - The new debounced function.
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
