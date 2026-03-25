## Inspector — agent-utils coverage
**Edge Case:** The utility function `getCustomAgent` and module environment wrapper in `js/Utils/agent-utils.js` entirely lack unit test assertions, making them vulnerable to regressions that would cascade to custom agent retrieval logic throughout the app.
**Assertion:** Interrogated the boundaries of `getCustomAgent` using null payloads, empty states, and deeply nested object mock retrievals to mathematically prove structural resilience without needing to mutate the runtime.
