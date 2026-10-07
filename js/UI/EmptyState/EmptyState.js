/**
 * Component responsible for rendering standardized empty states across the application.
 * Centralizes duplicate UI logic for "No results found" or error states.
 * @see ../../../docs/architecture/UI/EmptyState.md#emptystate-architecture (future)
 */
class EmptyState {
  /**
   * Standard icons for common empty state scenarios.
   */
  static get ICONS() {
    return {
      ERROR: `<div class="empty-icon animate-float opacity-50">
                <svg aria-hidden="true" width="80" height="80" fill="none" stroke="var(--error)" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" opacity="0.5"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>`,
      SEARCH: `<div class="empty-icon animate-float opacity-50">
                 <svg aria-hidden="true" width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 21h4c4.418 0 8-3.582 8-8s-3.582-8-8-8H6a2 2 0 00-2 2v14m17-3l-4.5-4.5M10.5 15a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" opacity="0.5"></path>
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 18a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"></path>
                 </svg>
               </div>`,
    };
  }

  /**
   * Generates a complete HTML element for an empty state using safe DOM methods.
   *
   * @param {Object} options - Configuration options for the empty state.
   * @param {string} options.title - The main heading text.
   * @param {string} options.description - The supporting description text.
   * @param {string} [options.icon] - Optional HTML/SVG icon string. Use EmptyState.ICONS for standard ones.
   * @param {Object} [options.action] - Optional configuration for an action button.
   * @param {string} options.action.text - The button label.
   * @param {string|Function} [options.action.onClick] - The click handler (string or function).
   * @param {string} [options.action.className] - Optional CSS class(es) for the button.
   * @param {string} [options.action.ariaLabel] - Optional ARIA label for the button.
   * @returns {HTMLElement} The constructed DOM element for the empty state.
   */
  static create({ title, description, icon = '', action = null }) {
    const container = document.createElement('div');
    container.className = 'empty-state visible transition-all duration-500 ease-in-out animate-fade-in rounded-xl shadow-md hover:shadow-lg';

    if (icon) {
      const iconWrapper = document.createElement('div');

      // Use DOMPurify if available, otherwise fallback to explicit textContent
      if (typeof window !== 'undefined' && window.DOMPurify) {
        iconWrapper.innerHTML = window.DOMPurify.sanitize(icon);
      } else {
        iconWrapper.textContent = icon;
      }

      container.appendChild(iconWrapper.firstElementChild || iconWrapper);
    }

    const titleEl = document.createElement('p');
    titleEl.className = 'empty-title';
    titleEl.textContent = title;
    container.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'empty-desc';
    descEl.textContent = description;
    container.appendChild(descEl);

    if (action) {
      const btn = document.createElement('button');
      btn.className =
        action.className ||
        'mt-6 secondary transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 active:scale-95 hover:shadow-md rounded-xl';
      btn.textContent = action.text;
      btn.setAttribute('aria-label', action.ariaLabel || action.text);

      if (typeof action.onClick === 'function') {
        btn.onclick = action.onClick;
      } else if (typeof action.onClick === 'string') {
        btn.setAttribute('onclick', action.onClick);
      }

      container.appendChild(btn);
    }

    return container;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmptyState;
} else if (typeof window !== 'undefined') {
  window.EmptyState = EmptyState;
}
