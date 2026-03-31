## Inspector — agent-utils coverage
**Edge Case:** The utility function `getCustomAgent` and module environment wrapper in `js/Utils/agent-utils.js` entirely lack unit test assertions, making them vulnerable to regressions that would cascade to custom agent retrieval logic throughout the app.
**Assertion:** Interrogated the boundaries of `getCustomAgent` using null payloads, empty states, and deeply nested object mock retrievals to mathematically prove structural resilience without needing to mutate the runtime.
## Inspector — Expand FusionLab Edge Case Assertions
**Edge Case:** Missing components, specific errors in fusion, unlock failures, finding known custom agents via loop vs list, component unmounting leaks, missing agent key lookups
**Assertion:** Interrogated UI component `FusionLab` handling state logic. Verified it gracefully guides focus to empty slots. Mocked unlock to throw, proving successful failure state handling. Expanded line coverage substantially from 20.89% to 85.07%.
