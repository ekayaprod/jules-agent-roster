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

**Instability:** The core 'Fusion Lab' workflow lacks automated validation, risking silent dead ends where users cannot fuse agents if the integrated browser journey breaks. | **Fortification:** Generated a robust Playwright E2E test suite mapping the journey from entry point to the final state assertion, guaranteeing the fusion routing tree never breaks in production.
**Instability:** Core 'Search' and 'Settings' UI interactions lack automated validation, risking silent dead ends. | **Fortification:** Generated robust Playwright E2E test suites mapping the search and modal workflows with precise semantic assertions.
