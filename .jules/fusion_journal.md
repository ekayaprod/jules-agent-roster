## Vector — The Absolute Trajectory
**Learning:** When executing array transformations containing multiple phases (like `.filter()` then `.map()`) or chaining heavily mutated string manipulations (like `Object.entries(data).map().map().sort().join()`), chained methods cause massive garbage collection spikes and redundant O(N) iterations.
**Action:** FUSE the abstractions into a Single-Pass Pipeline utilizing direct `for` loops and localized string manipulation to prevent overhead.

## Canvas — The Unified Surface
**Learning:** The application implements a single-page architecture (`RosterApp.js`) leveraging `IntersectionObserver` and virtualized clusters (`Clusterize.js`) for seamless intra-page navigation, eliminating the need for hard HTML anchor transitions or fragmented layouts.
**Action:** Declare structural compliance; avoid artificially refactoring robust Single Page Application (SPA) shells that already natively support context-retention without disjointed routing.

## Vibe — The Flow State Hacker
**Learning:** Semantic gaps in documented feature trajectories (e.g. `Needs Input` API polling without a corresponding UI modal) create dead-end UX flows.
**Action:** Autonomously bridge these gaps by generating robust UI implementations that connect background logic directly to interactive foreground elements without waiting for human intervention.

## Vector — Object Map Iteration Bloat Bypass
**Learning:** Converting standard dictionaries or arrays using `Object.values(data).filter(...)`, `Array.from(data).map(...)`, or `new Set(data.map(...))` allocates massive intermediate wrapper arrays, significantly inflating garbage collection when traversing large data structures.
**Action:** Bypass the intermediate tuple and array wrapper creation by using direct single-pass `for...in`, `for...of`, or standard `for` loops, pushing or adding elements directly to the final collection.
