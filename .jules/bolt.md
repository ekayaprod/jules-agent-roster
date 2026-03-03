## 2025-05-24 - Systemic Search Debounce
**Learning:** Frequent DOM manipulations triggered by 'input' events (like filtering a grid of cards) can cause severe layout thrashing and performance degradation, especially on lower-end devices.
**Action:** Always wrap search input event handlers with a `debounce` utility (standard 300ms delay) to batch UI updates and ensure smooth user interaction. Implemented `PerformanceUtils.debounce` as a shared utility.

## 2025-05-25 - Virtualization for Large DOM Lists
**Learning:** Appending large fragments of DOM elements (e.g. 50+ Agent Cards) simultaneously blocks the main thread and causes severe layout thrashing, even if chunked via DocumentFragments.
**Action:** Implemented `Clusterize.js` to virtualize DOM rendering, injecting an array of outerHTML strings instead of real DOM nodes, drastically cutting down DOM manipulation overhead while maintaining visual scroll performance and zero-build-step requirements.
