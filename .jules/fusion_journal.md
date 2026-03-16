## Vector — The Absolute Trajectory
**Learning:** Chained array transformations cause excessive garbage collection and redundant iterations.
**Action:** FUSE into a Single-Pass Pipeline utilizing a direct `for` loop to prevent overhead.

## Canvas — The Unified Surface
**Learning:** The application implements a single-page architecture (`RosterApp.js`) leveraging `IntersectionObserver` and virtualized clusters.
**Action:** Declare structural compliance; avoid refactoring robust SPA shells.

## Illusionist — The Master of Perceived Performance
**Learning:** The application extensively utilizes optimistic state mutations (e.g. `JulesManager.js` session blocks), pure CSS `skeleton-pulse` loaders, and asynchronous chunking (`RosterApp.js`, `AgentPicker.js`) via `requestAnimationFrame` to mask DOM generation and network latency, preventing main-thread blocking.
**Action:** Maintain and enforce these established optimistic patterns for future asynchronous workflows, avoiding unnecessary refactoring when the perceived performance is already optimal.