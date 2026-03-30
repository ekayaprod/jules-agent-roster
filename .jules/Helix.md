## Helix — The Global GitHub Path Centralization
**Learning:** `replyToSession` in `JulesAPI.js` was identified as a completely identical wrapper alias for `sendUserInput` within the same class context.
**Action:** Deduplicate such alias wrappers immediately if structurally identical to streamline the API DNA, rewriting any internal and external callers.

## Helix — The Global GitHub Path Centralization
**Learning:** `sourceName.replace('sources/github/', '')` was found duplicated identically across disparate UI manager classes and background service files.
**Action:** Always extract globally shared formatting routines out of UI controllers and into pure, tested domain-agnostic utilities (e.g. `FormatUtils`) to prevent fragmentation and drift.