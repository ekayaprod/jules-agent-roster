## 2025-05-24 - Systemic Search Debounce
**Learning:** Frequent DOM manipulations triggered by 'input' events (like filtering a grid of cards) can cause severe layout thrashing and performance degradation, especially on lower-end devices.
**Action:** Always wrap search input event handlers with a `debounce` utility (standard 300ms delay) to batch UI updates and ensure smooth user interaction. Implemented `PerformanceUtils.debounce` as a shared utility.
