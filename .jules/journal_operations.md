## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.

# Historical Archive

**Instability:** The Jest test runner dumped 35 lines of framework internals and babel transformer configuration suggestions. | **Fortification:** Extracted the failure into `ci-failure-summary.md` pointing exactly to `playwright/tests/fusion-lab.spec.ts` line 1 (`SyntaxError: Cannot use import statement outside a module`).
**Learning:** `fetchWithRetry` duplicates in `AgentRepository` and custom fetch retries in `JulesService` create fragmented error handling. | **Action:** Distilled network timeouts, 5xx backoff logic, and JSON parsing fallbacks into `NetworkUtils.fetchWithRetry` to centralize resilience. | **Status:** [Distilled]
**Instability:** Missing formatting configuration leading to chaotic code styles. | **Fortification:** Enforced `.prettierrc` with strict, deterministic rules and synchronized `benchmark.js`.
**Knowledge Gap:** Vague test names "works without window.matchMedia" and "works without a callback" do not describe the expected behavior. | **Clarity:** Rewrote tests to explicitly state they execute the animation sequence and clear the active overlay state.
**Edge Case:** Empty catch block in JulesManager.launchSession swallowed API failure | **Assertion:** Upgraded to explicit telemetry log with sourceName context
- Refactored `JulesAPI.js` to conform to `swagger.yaml` for `createSession` payload arguments and shape, eliminating 'Invalid JSON payload received' crashes on boot sequence.

Edge Case: Swallowed exceptions inside JSON/text parsing block in `NetworkUtils.fetchWithRetry`. | Assertion: Enforced telemetry dispatch `NETWORK_ERROR_PARSING_FAILED` and `NETWORK_ERROR_TEXT_FAILED` to centralize failure visibility.

Edge Case: Swallowed exceptions inside JSON/text parsing block in `NetworkUtils.fetchWithRetry`. | Assertion: Enforced telemetry dispatch `NETWORK_ERROR_PARSING_FAILED` and `NETWORK_ERROR_TEXT_FAILED` to centralize failure visibility.
