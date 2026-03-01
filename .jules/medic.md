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
