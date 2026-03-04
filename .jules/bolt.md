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
