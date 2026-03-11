# Cortex Journal

## 2026-03-08 - 🧠 Cortex - [API Resilience: Timeout Added]

**Learning:** Raw fetch calls without explicit timeouts (such as in `JulesAPI.js` and `AgentRepository.js`'s `fetchWithRetry`) are brittle and can hang indefinitely if the server stalls, stalling the UI and blocking the event loop.
**Action:** Injected strict 10-to-15-second `AbortController` timeouts into fetch calls across the services layer to ensure graceful degradation and error handling.

## 2026-03-11 - 🧠 Cortex - [Jurisdiction Enforcement: Skipped]

**Learning:** Evaluated the "Rarity system" task. The request pertains to domain logic, object combination matrices, and UI rendering rules.
**Action:** Executed the `[Skip]` protocol. Cortex strictly manages API infrastructure, SDK integrations, and deterministic connectivity boundaries. Application logic, such as a rarity classification system, falls outside this jurisdiction.
