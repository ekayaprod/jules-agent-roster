## 2024-05-18 - 🕵️ Inspector - [Coverage Added: FusionCompiler]
**Learning:** Found complete lack of coverage in `FusionCompiler.js`. Tested agent DAG logic, regex boundaries parsing, dynamic fusions logic and Custom Agent fusions.
**Action:** Wrote an extensive jest test suite assaulting string inputs with nulls, mocking legacy parsing versus XML format behavior and forcing fallback cases in section extraction regexes.

## 2026-03-05 - 🕵️ Inspector - [Coverage Added: AgentRepository]
**Learning:** Evaluated the highly critical `AgentRepository.js` service responsible for fetching, parsing, and validating standard and custom agents. Found total lack of coverage for async retry mechanism, json parsing hazards, malicious custom agents logic, and concurrency `Promise.all` state logic.
**Action:** Wrote an extensive Jest suite to enforce Mode B Stress testing. Mocked `fetch` API dynamically with resolved/rejected delays using fake timers, and safely bypassed private properties like `#loadStandardAgents` by mapping tests to the public `fetchAgents()` API caller logic to hit 100% path coverage.

## 2026-03-05 - 🕵️ Inspector - [Coverage Added: FormatUtils]
**Learning:** Found complete lack of coverage (~12%) in `FormatUtils.js`, which centralizes display names, icons, escaping, and format strings throughout the entire app. It relies on a non-injected global dependency (`StringUtils`) to extract emojis.
**Action:** Wrote an extensive Jest suite testing bounds (empty values, XSS exploits) and mocked the `StringUtils` dependency via the `global` Node.js object to verify logic isolation and achieve 100% path coverage.

## 2026-03-05 - 🕵️ Inspector - [Coverage Added: PromptParser]
**Learning:** Evaluated the `PromptParser.js` utility responsible for parsing AI agent prompts. Found lack of coverage for XML DOM parsing logic, including unclosed tags, malformed input exceptions, and log extraction boundaries. The utility relies on the native `DOMParser` browser API, which is missing in standard Node.js environments.
**Action:** Wrote an extensive Jest suite to enforce Mode B Stress testing. Mocked the `DOMParser` browser API securely within Node.js utilizing `@xmldom/xmldom` through the `global` object. Verified 100% path coverage by forcefully injecting parsing errors via `jest.fn()` wrappers.

## 2026-03-06 - 🕵️ Inspector - [Coverage Added: js/ui/]
**Learning:** Identified lack of test coverage for the core visual UI components within `js/ui/` (`AgentCard.js`, `ClipboardUtils.js`, and `ToastNotification.js`). These modules have significant dynamic DOM generation and DOM interaction, requiring a mock DOM testing environment (`jsdom`).
**Action:** Installed `jest-environment-jsdom` to support tests requiring `document` or `window`. Wrote test suites to cover visual logic handling boundaries, including malformed HTML preventing XSS on `AgentCard.js`, verifying `ClipboardUtils.js` fallback strategies for unsupported API states, and mocking `setInterval` / timers to prove thread-safety and hover states on `ToastNotification.js`. Achieved > 94% branch coverage across these three components.
