## 2026-03-01 - [Fusion Lab Restructure]
**Learning:** Shared styles and UI states for `aria-busy` opacity transitions were previously difficult to implement cleanly without a structured container and a dedicated lifecycle.
**Action:** Always verify DOM IDs against the source file (e.g. `#fusionOutput` instead of assumed `#fusionOutputWrapper`) before making CSS/JS modifications, and ensure all references in `index.html` and tests (`test_fusion_index.js`) are updated synchronously when files are moved to feature folders.
