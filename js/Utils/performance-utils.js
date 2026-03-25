/**
 * Utility class for performance optimizations.
 * Centralizes common patterns like debouncing and throttling to prevent layout thrashing and excessive computations.
 * @see ../../docs/architecture/Utils/README.md#performanceutils-architecture for details on how this mitigates layout thrashing.
 */
class PerformanceUtils {
  /**
   * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
   * since the last time the debounced function was invoked.
   * Implemented to fulfill ROADMAP [Performance] Idea: "Implement debounce pattern".
   * Reduces layout thrashing and computational overhead during rapid events (like search input or scroll)
   * by delaying execution until the user pauses.
   * @see ../../docs/architecture/Utils/README.md#performanceutils-architecture
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceUtils;
}
