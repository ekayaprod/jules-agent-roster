# 🚑 Medic's Journal

## Recurring Patterns of Fragility
- **Unsafe JSON Parsing**: `agents.json` and prompt files are parsed without validation, leading to potential runtime errors if data is malformed.
- **Brittle Fetch Calls**: Network requests lack retry logic or exponential backoff, making the application susceptible to transient network failures.

## Treatments Applied
- **Schema Validation**: Implemented `validateAgentsData` to ensure `agents.json` has the correct structure before processing.
- **Resilient Fetching**: Added `fetchWithRetry` with exponential backoff to handle transient network errors gracefully.

## 2026-02-25 - [Fetch Retry Logic]
**Learning:** `fetchWithRetry` must not retry on 404 (Not Found) errors, as these are typically permanent and retrying delays failure unnecessarily.
**Action:** Implement status checks in retry wrappers to distinguish transient (5xx) from permanent (4xx) errors.

## 2025-05-25 - [LocalStorage Parsing Fragility]
**Learning:** `JSON.parse` is extremely fragile when reading data from untrusted sources like `localStorage`, which can be corrupted or malformed. Previously, `FusionIndex` silently caught errors with `console.warn` without sufficient context, masking the potential issue of a corrupt save state.
**Action:** Wrap parsing logic of `localStorage` items in a `try/catch` block. Use structured error logging with actionable context (e.g., `event`, the `stored` string that failed, and the specific `error.message`). Ensure the application gracefully degrades by returning safe default state representations (like `new Set()`).
## 2026-03-01 - [DOM Manipulations with Implicit Mismatched Elements]
**Learning:** Hardcoded DOM hierarchy assumptions (like `output.insertBefore(desc, fusionCode)`) fail fatally if the underlying HTML structure contains mismatched closing tags that force the browser to auto-close parent elements early. This causes the target element to not be a direct child of the expected parent.
**Action:** Always wrap risky DOM insertions (`insertBefore`, `replaceChild`) in `try/catch` blocks. Log the structured error event, and provide safe fallbacks, such as checking `element.parentNode` before inserting or gracefully appending to a top-level container to prevent the main thread from crashing.
