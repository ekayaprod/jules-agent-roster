## 2025-05-24 - Artifact Accumulation
**Learning:** The `verification/` directory is accumulating binary image artifacts (20+ PNG/WEBP files), which significantly increases repository size and clone times without adding source value.
**Action:** Recommend implementing a `.gitignore` policy for `verification/*.png` or a CI step to clean artifacts after successful runs.

## 2025-05-24 - 👁️ Overseer - [Structural Analysis]
**Learning:** The frontend heavily relies on `.innerHTML` for rendering, creating tight coupling and potential XSS vectors. The `js/RosterApp.js` continues to act as a God-file (>500 lines) taking on too many responsibilities.
**Action:** Flagged for Architect/Mason to fragment `RosterApp.js` and implement safer DOM manipulation patterns.

## 2025-05-24 - 👁️ Overseer - [Testing & Coverage Analysis]
**Learning:** Core application modules (`js/RosterApp.js`, `js/features/fusion/FusionLab.js`) are completely lacking test coverage files, increasing regression risk during refactors.
**Action:** Flagged for Inspector to build test suites for core application modules.
