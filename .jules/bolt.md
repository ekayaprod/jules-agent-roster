## 2025-05-24 - Systemic Search Debounce
**Learning:** Frequent DOM manipulations triggered by 'input' events (like filtering a grid of cards) can cause severe layout thrashing and performance degradation, especially on lower-end devices.
**Action:** Always wrap search input event handlers with a `debounce` utility (standard 300ms delay) to batch UI updates and ensure smooth user interaction. Implemented `PerformanceUtils.debounce` as a shared utility.

## 2025-05-25 - Virtualization for Large DOM Lists
**Learning:** Appending large fragments of DOM elements (e.g. 50+ Agent Cards) simultaneously blocks the main thread and causes severe layout thrashing, even if chunked via DocumentFragments.
**Action:** Implemented `Clusterize.js` to virtualize DOM rendering, injecting an array of outerHTML strings instead of real DOM nodes, drastically cutting down DOM manipulation overhead while maintaining visual scroll performance and zero-build-step requirements.

## 2025-05-26 - Static Search HTML Memoization
**Learning:** Virtualizing the DOM is good, but reconstructing complex HTML strings (like parsing prompts for UI components) on every single keystroke filter during a search still causes CPU bottleneck and lag.
**Action:** Implemented an aggressive HTML string caching layer (`_cardHtmlCache` via Map) specifically keyed to individual items. To maintain dynamic visual aspects (like staggered CSS `animation-delay` based on `visibleCount`), use rapid Regex string replacement on the cached string (`renderedHtml = cardHtml.replace(/animation-delay:\s*0ms;?/, ...)`) prior to rendering. Ensure that state changes (like favoriting an item) explicitly `.delete()` the specific key from the cache to prevent stale UI bugs.

## 2025-05-27 - Centralized Modal Virtualization
**Learning:** Modals that dynamically render large lists of options (like the AgentPicker) can cause noticeable layout thrashing when toggled and filtered, even if the main roster view is optimized.
**Action:** Extended the `Clusterize.js` virtualization pattern to the `AgentPicker` modal. Replaced DocumentFragment manipulation with cached HTML string arrays mapped to `Fuse.js` results. Wrapped the modal's internal grid with a `clusterize-scroll` container to ensure smooth rendering and zero jank during modal interactions.

## 2025-05-28 - ⚡ Bolt+ - [Startup Promise.all Concurrency]
**Learning:** Initial application bootstrapping triggers multiple independent async fetches (`#loadStandardAgents`, `#loadCustomAgents`) that shouldn't block each other.
**Action:** Refactored sequential `await` calls in `AgentRepository.fetchAgents` into a concurrent `Promise.all()` to drastically reduce total network/I/O execution time on startup.

## 2025-05-29 - ⚡ Bolt+ - [Redundant DOM Lookup Caching]
**Learning:** In Vanilla JS architectures, redundant DOM queries (like `document.getElementById`) inside loops or critical render paths (like `renderSkeletons` and `renderAgents`) can cause severe layout thrashing and unnecessary CPU overhead.
**Action:** Always extract top-level container queries (e.g., mapping category elements) outside of render loops and cache their references on initialization (`cacheElements()`). Never cache dynamic child components using array indices as keys to avoid stale UI bugs and encapsulation violations.

## 2025-05-30 - ⚡ Bolt+ - [Initial Page Loading: Defer Scripts & Concurrent API Calls]
**Learning:** Initial page loading can be heavily blocked by sequential async calls and render-blocking `<script>` tags without `defer`.
**Action:** Added `defer` to all `<script>` tags in `index.html` to prevent render blocking, allowing HTML parsing to complete faster. Also refactored sequential `await` calls in `RosterApp.init()` (where `this.julesManager.init()` and `this.agentRepo.fetchAgents()` were executed sequentially) into a concurrent `Promise.all()` to drastically reduce time-to-interactive.

## 2026-03-06 - ⚡ Bolt+ - [Redundant DOM Lookup Caching in FusionAnimation]
**Learning:** During high-frequency UI interactions like triggering a fusion animation, repeated deep DOM queries (e.g., `querySelector(".anim-particles")` or `getElementById("fusionAnimationOverlay")`) cause unnecessary CPU overhead and layout thrashing.
**Action:** Implemented a lazy `cacheElements()` pattern in `FusionAnimation.js` to store references to static DOM nodes on the first run, preventing redundant DOM queries on subsequent animation triggers.

## 2026-03-07 - ⚡ Bolt+ - [Algorithmic Efficiency & DOM Query Minimization in RosterApp]
**Learning:** O(N log N) sorting algorithms that perform Set lookups on every comparison can significantly delay main thread execution, and running `document.querySelectorAll` on every global `pointerdown` event triggers wasteful NodeList allocations and DOM traversals.
**Action:** Implemented a Schwartzian transform to pre-calculate Set lookups in O(N) time before sorting. Replaced `document.querySelectorAll` with `document.querySelector` in the global pointerdown listener to strictly fetch the single active dropdown, saving cycles on every document click.

## 2026-03-07 - ⚡ Bolt+ - [Polished Optimization]
**Learning:** Returning shallow clones `{ ...item }` during a Schwartzian sort transform destroys object reference equality, breaking state mutations downstream. Global `querySelector` cleanup logic must handle edge cases where multiple sub-menus might be orphaned open simultaneously.
**Action:** Restored object references by strictly using `{ original: item, metric }` mapped patterns, and safely replaced looped `.querySelector` lookups in polling intervals with O(1) `document.getElementById`.

## 2026-03-08 - ⚡ Bolt+ - [DOM Query Optimization for Singular States]
**Learning:** Using `document.querySelectorAll(...).forEach(...)` to find and manipulate elements that have a mutually exclusive singular state (like `.is-focused` within a grid) is inefficient. It forces the browser to traverse the entire subtree and allocate memory for a NodeList, resulting in an O(N) operation instead of O(1).
**Action:** Replaced `document.querySelectorAll` with a single `document.querySelector` call when searching for mutually exclusive states. This halts the DOM traversal early once the element is found and prevents unnecessary memory allocations, which is especially important during rapid repetitive triggers like keyboard navigation (`handleGridKeydown`).
## 2026-03-09 - ⚡ Bolt+ - [Algorithmic Efficiency: High-Frequency Date Sorting]
**Learning:** During high-frequency polling functions (e.g., refreshing active sessions every 3 seconds), performing `.sort((a, b) => new Date(a.date) - new Date(b.date))` on arrays creates massive O(N log N) instantiation and parsing overhead, causing severe memory allocation spikes and main-thread blockage.
**Action:** When sorting standard ISO 8601 date strings, completely eliminate the `new Date()` parsing by relying on native string comparison operators (e.g., `a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)`). This achieves mathematically identical chronological sorting with zero allocation overhead.
