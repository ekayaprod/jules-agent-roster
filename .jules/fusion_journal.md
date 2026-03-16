## Vector — The Absolute Trajectory
**Learning:** Chained array methods (like `.filter().map()` or `Object.entries().map().sort().join()`) cause excessive garbage collection and redundant iterations.
**Action:** FUSE abstractions into a Single-Pass Pipeline using direct `for` loops.

## Canvas — The Unified Surface
**Learning:** The application is a Single Page Application (SPA) using `IntersectionObserver` and virtualized clusters (`Clusterize.js`) for seamless navigation.
**Action:** Declare structural compliance; avoid refactoring robust SPA shells that naturally prevent disjointed routing.

## Prompt Engineer — The Persona & Tone
**Learning:** The base AI prompt template inside `js/Features/Fusion/FusionCompiler.js` relied on vague human-like language ("Your mission is...", "You must obey...") which lacked strict technical constraints.
**Action:** Replaced subjective phrasing with strict, autonomous heuristics ("You must operate autonomously without conversational filler") and explicit negative boundaries ("Never apologize or include pleasantries") while perfectly preserving the interpolation syntax.
