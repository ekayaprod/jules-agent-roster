# 🚑 Medic's Journal

## Recurring Patterns of Fragility
- **Unsafe JSON Parsing**: `agents.json` and prompt files are parsed without validation, leading to potential runtime errors if data is malformed.
- **Brittle Fetch Calls**: Network requests lack retry logic or exponential backoff, making the application susceptible to transient network failures.

## Treatments Applied
- **Schema Validation**: Implemented `validateAgentsData` to ensure `agents.json` has the correct structure before processing.
- **Resilient Fetching**: Added `fetchWithRetry` with exponential backoff to handle transient network errors gracefully.
