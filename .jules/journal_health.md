## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.
8. [HYGIENE] Do not commit build artifacts (like `agents.generated.json`); verify exact diffs via `git diff HEAD` before review.
9. [ARCHITECTURE] Rely on semantic locators (`getByRole`) over structural DOM checks (`querySelector`) in UI tests.
10. [ARCHITECTURE] Centralize utility functions (like `fetchWithRetry` or `getCustomAgent`) into single-source-of-truth modules.
11. [STABILITY] Ensure environment-specific globals (like `module.exports`) are strictly guarded to prevent crashes in mixed contexts.
12. [ARCHITECTURE] Extract monolithic event delegation and polling loops into distinct, decoupled static helper classes.
13. [PERFORMANCE] Prevent massive garbage collection spikes by avoiding chained map/filter mutations on large datasets.
14. [UI/UX] Replace absolute pixel constraints with responsive fluid utility classes (e.g., `w-full`) and utilize universal pointer events.

# Historical Archive

**Learning:** Dynamic fusion agents were pinned using their generated name rather than their parent key string, and the chunked render loop categorized items based on their internal payload properties instead of honoring their structural list placement.
**Action:** Resolved fusion keys via `fusionMatrixMap` in `FusionLab.js` and injected `gridCategory` contextual caching during `flattenedAgents` construction to forcefully route cards to their appropriate DOM grid containers.
