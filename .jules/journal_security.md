## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.

# Historical Archive

**Instability/Edge Case:** Payload bypass via prototype pollution and API path traversal in session strings. | **Fortification:** Injected strict string typing and boundary schema checks in `NetworkUtils` and `JulesService` endpoints.

**Vulnerability Mitigation:** Eliminated unsafe `eval()` executions in `benchmark.js` and local JS component test environments by enforcing standard `module.exports` boundaries across the repository, transitioning dynamically loaded Node modules to use safe `require()` patterns.
