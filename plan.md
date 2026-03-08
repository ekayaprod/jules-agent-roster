Plan:
1. Target: `js/core` domain (which contains `RosterApp.js`).
2. Discover: The `js/core/` domain currently lacks a high-level `README.md` (which should explain the RosterApp's orchestration, state management, UI rendering loops, and dependencies like `Fuse`, `Clusterize`, etc). While `RosterApp.js` has some minimal JSDoc, it is missing meticulous, strictly typed documentation for all major exported functions (e.g. `init`, `bindEvents`, `renderGrid`, `handleSearch`, `toggleCard`, etc).
3. Synthesize:
   - Create `js/core/README.md`. It will document the core lifecycle (Boot -> Fetch -> Render -> Listen), Search mechanisms, Event Delegation strategy, and integrations (Jules API, Fusion Lab).
   - Update `js/core/RosterApp.js` JSDoc to be strictly typed and cross-link exactly to sections in `README.md` using `@see`.
4. Run markdown linter and update as needed.
5. Create a journal entry for the `Scholar` persona detailing what was documented.
