## Inspector — NetworkUtils fetchWithRetry Error Handling
**Edge Case:** The network utility lacked explicit edge-case coverage for 4xx HTTP responses, specifically how it extracted and parsed fallback error messages from malformed or unstructured JSON payloads. Falsy response handling was also untested.
**Assertion:** Interrogated the error boundary by mocking 400 and 401 status codes with distinct JSON structures, verifying proper message extraction. Assessed parse failure fallbacks with invalid JSON strings, and mathematically proved the null-response guard prevented runtime crashes.

## Inspector — EmptyState Module Export Boundary
**Edge Case:** The component `EmptyState.js` lacked test coverage verifying the conditional CommonJS module export syntax (`if (typeof module !== 'undefined' && module.exports)`). If `module` is defined but lacks `exports` it would error out, but coverage requires asserting truthy and falsy states of this export block explicitly.
**Assertion:** Interrogated the module export logic using dynamic `Function` constructors to mock isolated environments. Checked both the successful export when `module.exports` is present, and gracefully bypassing when `module.exports` is absent or `module` is undefined.

## Inspector — AgentCard Pin Rendering Boundaries
**Edge Case:** The UI component `AgentCard.js` handles pin button rendering but lacked comprehensive boundary tests for invalid keys, numerical identifiers (which are base agents and shouldn't have pins), string identifiers (which are fusion agents and should have pins), and missing global state dependencies.
**Assertion:** Interrogated the pin generation boundary with an array of invalid and numerical keys to verify omission, and explicitly verified rendering and CSS state toggling for fusion agents. Proved graceful degradation when `rosterApp` or `pinnedManager` are undefined via a Sabotage Check (mutating the type-check).
