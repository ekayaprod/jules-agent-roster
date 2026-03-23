## 2026-03-06 - 🧠 Cortex - [API Resilience: Timeout Added]\n**Learning:** Raw fetch calls without timeouts are brittle and can lead to hanging requests.\n**Action:** Implemented a 15-second AbortController timeout for all JulesAPI.js requests to ensure graceful degradation and error handling.
## 2026-03-08 - 🧠 Cortex - [API Resilience: Timeout Added]
**Learning:** Raw fetch calls in `fetchWithRetry` without explicit timeouts can hang indefinitely if the server stalls, stalling the UI and blocking the event loop.
**Action:** Injected a strict 10-second `AbortController` timeout into `AgentRepository.js`'s `fetchWithRetry` function, matching the resilience strategy in `JulesAPI.js`, to ensure graceful degradation and error handling.

2026-03-08
**Title**: API Resilience: Retry Logic Added
**Learning**: Transient network issues and 5xx server errors cause brittle fetches leading to UX failures.
**Action**: Implemented an exponential backoff retry mechanism (3 retries, initial backoff 300ms) within `JulesAPI.js#_fetch` to ensure resilient connectivity.

2026-03-08
**Title**: API Resilience: getPullRequests Timeout Injection
**Learning**: Raw `fetch` calls in `JulesAPI.js#getPullRequests` lacked explicit timeouts, risking infinite application hangs if the GitHub API stalled or throttled connections.
**Action**: Hardened the synapse by injecting a strict 15-second `AbortController` timeout and ensuring exceptions are cleanly caught and degraded to safe fallback states (`[]`).
