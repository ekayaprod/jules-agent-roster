## Inspector — Universal Axioms
**The Sabotage Check:** A generated test that passes without first mathematically proving the failure by mutating the source code is structurally useless. Validate strictly by temporarily sabotaging the target implementation before finalizing.
**The Blast Radius:** Limit interrogations strictly to isolated, bounded contexts to prevent context collapse. Generate focused tests that verify behavior under concurrency stress and malformed edge cases without mutating surrounding infrastructure or untested feature components.
**The Prune Protocol:** Consolidate historical entries into universal axioms.
**Global Initialization Failure Resilience:** When executing `Promise.all` across multiple concurrent systems, explicit boundaries must handle network rejections (e.g. `JulesManager.init`, `AgentRepository.fetchAgents`) mapping graceful degradation states without throwing unhandled exceptions.
**Cross-Environment Module Export Integrity:** Structural testing of isomorphic modules requires dynamic execution via `new Function()` to verify defensive `typeof module !== 'undefined'` mappings and safe DOM attachment fallbacks (e.g., `window.TelemetryUtils`), validating that neither Node nor browser execution contexts cause fatal application boot crashes.
**Telemetry Payload Schema Validation:** Error boundaries must intercept corrupted or oversized native data (e.g., `JSON.parse` failures on `localStorage`) and successfully destructure/serialize those errors and stack properties to avoid dropping critical observability signals.
## Inspector — Universal Module Export Vulnerabilities
**Edge Case:** Codebase lacked comprehensive coverage on environment-specific module exports (e.g., `if (typeof module !== 'undefined')`). This "Happy Path Illusion" ignored scenarios where `module` is defined but lacks `exports`, or where browser globals mask node logic, causing runtime crashes or module load failures in diverse contexts.
**Assertion:** Employed dynamic `Function` constructor sandboxes across the entire `js/Utils/` architecture, `js/constants/ui.js`, `EmptyState.js`, and `Fusion/` components. Mathematically proved via structural evaluation that every block correctly bypasses falsy export paths or safely assigns to `window`/`global` alternatives.

## Inspector — Rate Limiter & Network Boundaries
**Edge Case:** The network utility lacked explicit edge-case coverage for 4xx HTTP responses, rate limiter (429) window resets, and fallback error message extraction from malformed or unstructured JSON payloads.
**Assertion:** Interrogated error boundaries by mocking 400, 401, and 429 status codes. Verified proper message extraction, assessed parse failure fallbacks with invalid JSON, proved null-response guard prevented runtime crashes, and mathematically proved the rate limit window reset clears buckets after exactly 60 seconds by manipulating fake timers.

## Inspector — AgentCard Pin Rendering Boundaries
**Edge Case:** The UI component `AgentCard.js` handles pin button rendering but lacked comprehensive boundary tests for invalid keys, numerical identifiers (which are base agents and shouldn't have pins), string identifiers (which are fusion agents and should have pins), and missing global state dependencies.
**Assertion:** Interrogated the pin generation boundary with an array of invalid and numerical keys to verify omission, and explicitly verified rendering and CSS state toggling for fusion agents. Proved graceful degradation when `rosterApp` or `pinnedManager` are undefined via a Sabotage Check (mutating the type-check).
