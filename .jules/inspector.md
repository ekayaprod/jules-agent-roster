# Inspector's Journal

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

## 2024-05-19 - 🕵️ Inspector - Coverage Added: JulesAPI.js

**Learning:** The Jules API service is heavily dependent on the native `fetch` API, and features complex logic for `AbortController` timeouts (15000ms) and JSON fallback logic. When writing async tests involving `setTimeout` within promises that handle `AbortError`, using `jest.useFakeTimers()` in combination with a mocked `fetch` requires explicit manual triggering of the signal's `abort` event listener to properly simulate the timeout rejection, as simply advancing timers won't automatically trigger the mock's internal promise resolution without firing the native abort event.
**Action:** Always manually trigger `options.signal.addEventListener('abort', ...)` within mocked fetch promises when testing `AbortController` timeouts with fake timers in Jest to accurately replicate the browser's cancellation behavior.

## 2026-03-07 - 🕵️ Inspector - [Coverage Added: FusionCompiler Edge Cases Tested]

**Learning:** Found boundary edge cases around `undefined` initial states mapping in `FusionCompiler`, and fallback data structures for dynamically generated custom fusions.
**Action:** Always write boundary tests covering array and object inputs to functional compilers like `(agentsData || []).filter(...)` or custom descriptions mapping.

## 2026-03-08 - 🕵️ Inspector - [Coverage Added: MarkdownRenderer]

**Learning:** Identified lack of test coverage for inline parsing (`_parseInline`), code blocks, tables, and blockquotes in the custom `MarkdownRenderer`. It manually traverses DOM elements for rendering rather than using `innerHTML` to avoid XSS.
**Action:** Wrote a comprehensive unit test suite targeting structural boundaries and branch edge cases. Ensure to cover not just `innerHTML` content matching but also DOM structure mapping (like headers vs cells inside tables and `<br>` elements inside multi-line blockquotes) when dealing with custom DOM generation for markdown.
