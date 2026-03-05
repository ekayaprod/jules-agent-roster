## 2024-05-18 - 🕵️ Inspector - [Coverage Added: FusionCompiler]
**Learning:** Found complete lack of coverage in `FusionCompiler.js`. Tested agent DAG logic, regex boundaries parsing, dynamic fusions logic and Custom Agent fusions.
**Action:** Wrote an extensive jest test suite assaulting string inputs with nulls, mocking legacy parsing versus XML format behavior and forcing fallback cases in section extraction regexes.

## 2026-03-05 - 🕵️ Inspector - [Coverage Added: AgentRepository]
**Learning:** Evaluated the highly critical `AgentRepository.js` service responsible for fetching, parsing, and validating standard and custom agents. Found total lack of coverage for async retry mechanism, json parsing hazards, malicious custom agents logic, and concurrency `Promise.all` state logic.
**Action:** Wrote an extensive Jest suite to enforce Mode B Stress testing. Mocked `fetch` API dynamically with resolved/rejected delays using fake timers, and safely bypassed private properties like `#loadStandardAgents` by mapping tests to the public `fetchAgents()` API caller logic to hit 100% path coverage.

## 2026-03-05 - 🕵️ Inspector - [Coverage Added: FormatUtils]
**Learning:** Found complete lack of coverage (~12%) in `FormatUtils.js`, which centralizes display names, icons, escaping, and format strings throughout the entire app. It relies on a non-injected global dependency (`StringUtils`) to extract emojis.
**Action:** Wrote an extensive Jest suite testing bounds (empty values, XSS exploits) and mocked the `StringUtils` dependency via the `global` Node.js object to verify logic isolation and achieve 100% path coverage.
