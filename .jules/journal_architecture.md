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

## Vector — The Single-Pass Pipeline Optimization
**Learning:** Flattening multi-pass array iterations (`.filter().reverse().slice()`) into a single bare-metal backward loop with early exit mechanisms eliminates unnecessary intermediate memory allocations and loop overhead in high-throughput data processing paths.
**Action:** Always scrutinize chained Array prototype methods on high-value data paths. Replace winding logic with a simple, direct `for` loop that implements filtering and data limitations concurrently.

## Information Architect — The Layout Narrator
**Learning:** Identified that generic `div` soup in the layout reduces hierarchical semantic meaning, especially in nested structural blocks like modals.
**Action:** Replaced the generic `<div id="julesPRModal">` container and its nested `.modal-content` wrapper with semantic `<section>` and `<article>` tags respectively to improve document outline and screen reader accessibility within the isolated modal layout.

## Coroner — The Dead Investigator
**Learning:** A legacy class `fusion-slot` used in older layouts was lingering in tests (`benchmark.js`) and CSS (`Fusion.css`), acting as a ghost constraint after the source changed to `fusion-item`.
**Action:** Always unify class names between source code, tests, and style sheets during architectural refactors to prevent dead selectors from causing test or build failures.
