## 2026-03-12 - ⚡ Bolt+ - [Polling DOM Query Optimization]
**Learning:** During high-frequency polling intervals (e.g., refreshing active sessions every 3 seconds), performing `document.querySelectorAll()` to locate and remove obsolete DOM elements forces the browser to traverse the DOM tree repeatedly, causing unnecessary CPU overhead and potential layout thrashing.
**Action:** Replaced the expensive `terminal.querySelectorAll('.dashboard-item')` DOM traversal during polling with an O(1) iteration over the in-memory `this.renderedSessionIds` Set. Fallback to `document.getElementById` only when a specific element needs to be removed.

## 2026-03-12 - ⚡ Bolt+ - [Safe DOM Querying in Loops]
**Learning:** When optimizing DOM queries, never replace a `document.querySelectorAll(...).forEach(...)` loop with a `while (el = document.querySelector(...))` loop if the logic conditionally skips or breaks without removing the matched selector class from the element. Because `querySelector` always returns the first matching element in the DOM tree, failing to mutate it guarantees an infinite loop that hangs the browser.
**Action:** Reverted fragile `while` loops back to `querySelectorAll().forEach()` when traversing and closing dropdown menus to prevent application lockup.
2026-03-12
**Title**: [Dropdown DOM Query Optimization]
**Learning**: Repetitive `document.querySelectorAll()` traversals inside global event listeners (like document clicks) cause massive CPU overhead during interaction loops.
**Action**: Replaced the expensive global N-time `document.querySelectorAll('.dropdown-menu.visible')` lookup with a localized, in-memory `Set` (`this.activeDropdowns`) to track explicitly opened dropdowns, allowing for efficient $O(k)$ iteration when toggling and closing active dropdown menus.
