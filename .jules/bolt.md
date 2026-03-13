2026-03-12
**Title**: [Polling DOM Query Optimization]
**Learning**: Repetitive `document.querySelectorAll()` traversals inside global event listeners (like document clicks) or high-frequency polling loops cause massive CPU overhead and layout thrashing.
**Action**: Replaced the expensive N-time `document.querySelectorAll('.dropdown-menu.visible')` lookup with a localized, in-memory `Set` (`this.activeDropdowns`) and used `this.renderedSessionIds` for active sessions, allowing for efficient $O(k)$ iteration. Fallback to `document.getElementById` only when a specific element needs removal.

2026-03-12
**Title**: [Safe DOM Querying in Loops]
**Learning**: Replacing a `document.querySelectorAll(...).forEach(...)` loop with a `while (el = document.querySelector(...))` loop without removing the matched selector class from the element guarantees an infinite loop that hangs the browser, as `querySelector` always returns the first matching element.
**Action**: Reverted fragile `while` loops back to `querySelectorAll().forEach()` when traversing and closing dropdown menus to prevent application lockup.

2026-03-12
**Title**: [Concurrent Repository Fetch Optimization]
**Learning**: When fetching data for a selected repository in `JulesManager.js`, independent async calls like `loadPullRequestsForRepo` and `loadActiveSessionsForRepo` sequentially cause unnecessary blocking.
**Action**: Refactored independent sequential `await` calls in `loadSources` into a parallel `Promise.all()` to drastically reduce total network time.