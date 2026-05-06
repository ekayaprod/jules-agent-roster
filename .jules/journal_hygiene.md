## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.

# Historical Archive

* **Learning:** Cosmetic catch blocks that only execute `console.error(e)` swallow failures locally and block native framework error boundaries from tracking test and runtime failures. The UI and tests rely on the bubbling of error states. | **Action:** Always enforce the removal of passive error-swallowing structures to let standard global error boundaries manage the propagation flow.
