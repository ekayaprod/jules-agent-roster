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

## Assessor — The Test Upgrader
**Edge Case:** Glass Mirror CSS locators in pinning UI tests | **Assertion:** Upgraded brittle structural DOM checks and string matching logic to use semantic user-centric `getByRole` locators in `AgentCard.test.js`.
**Edge Case:** Synchronous synthetic events in UI tests | **Assertion:** Upgraded `fireEvent` to asynchronous, realistic `userEvent` interactions in `ToastNotification.test.js`.
**Edge Case:** Glass Mirror CSS locators in UI tests | **Assertion:** Upgraded `querySelector` and structural tests to semantic `getByRole` and `getByTitle` user-centric validations in `FusionIndex.test.js`.

## Guardian — The Boundary Hardener
**Edge Case:** Malformed JSON in network error responses | **Assertion:** Hardened `JSON.parse` boundary in `NetworkUtils.fetchWithRetry` with a try/catch block to prevent catastrophic failures, verified by simulating invalid JSON payloads.
## Examiner — The Assertion Standardizer
**Edge Case:** [Superficial querySelector evaluating textContent] | **Assertion:** [Upgraded to semantic screen.getByText and injected toBeVisible()] | **Status:** [Resilient]

## Adversary — The Mutation Engine
**Edge Case:** Empty exception tests in JulesManager.test.js | **Assertion:** Replaced pass-through with strict consoleSpy assertion for 'JULES_POLLING_ERROR'. | **Status:** Resilient
**Edge Case:** EmptyState ICONS returning strings | **Assertion:** Replaced toBeDefined with specific SVGs properties assertion. | **Status:** Resilient
**Edge Case:** AgentUtils Export Block | **Assertion:** Object Property Verification | **Status:** Resilient
**Edge Case:** SearchWorker Initialization | **Assertion:** Instance Evaluation | **Status:** Resilient
**Edge Case:** FusionCompiler Export Structure | **Assertion:** Interface Verification | **Status:** Resilient
**Edge Case:** AgentRepository Dictionary Storage | **Assertion:** Strict Property Evaluation | **Status:** Resilient
