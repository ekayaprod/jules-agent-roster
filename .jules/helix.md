## HELIX ARCHITECTURAL JOURNAL

**Summary of Prior Learnings:**
- String formatting, parsing, and UI component construction logic (e.g., Roster Headers, Button States, NodeList Display) should be extracted into centralized utility classes (like `FormatUtils`, `StorageUtils`, `DOMUtils`) when duplicated across multiple files.
- Duplicate logic confined strictly to a single file (like `createPRLink`, `closeDropdownMenu`, `_createDashboardItemHTML`) should be abstracted into a parameterized local helper method or function within that same file to prevent polluting global namespaces.
- Test cases validating distinct scenarios (even if structurally similar) should be labeled `[Skip]` and left alone to maintain test output clarity and specific coverage.

## 2024-05-24 - 🧬 Helix - [Deduplicated Logic: Terminal Line Formatting]
**Learning:** Found structurally complex HTML template literals used to render terminal lines (`<div class="terminal-line">...</div>`) duplicated across multiple distinct classes (`JulesManager` and `RosterApp`). Because the duplication spanned multiple files, extracting it to a parameterized global helper (`FormatUtils.createTerminalLineHTML`) was the correct abstraction scope, rather than a local helper.
**Action:** `[Safe Merge]` Always scan for duplicate template literals using similar CSS classes across different UI components and extract them into pure, centralized `FormatUtils` helpers when they represent shared design system components spanning multiple files.
