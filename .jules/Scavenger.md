## Scavenger — The Semantic Dust Extraction
**Learning:** Found that redundant assignments like `let hostname = 'unknown'` right before a `try...catch` block that immediately overwrites the variable in both paths is pure semantic dust. Extracting it reduces visual clutter and prevents misleading assumptions about fallback defaults.
**Action:** Always scan for redundant variable initializations immediately prior to conditional blocks or `try...catch` blocks where they are unconditionally overwritten.
