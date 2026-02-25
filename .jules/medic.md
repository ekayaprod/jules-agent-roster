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
