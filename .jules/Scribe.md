## Scribe — The Zero Index Constraint
**Learning:** The UI layer passes zero-based array indices as unique identifiers for pinning agents. Standard JavaScript falsy checks (`!key`) unintentionally swallow the `0` index, requiring a strict `key !== 0` override.
**Action:** Always document falsy overrides in boundary APIs that handle both string IDs and numerical array indices to prevent accidental strict-equality refactors that break the first item.
