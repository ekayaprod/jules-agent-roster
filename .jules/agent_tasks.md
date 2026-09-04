### Operational Directives
* **Semantic Domain Matching:** Tasks must map precisely to one of the 7 canonical Archetypes (e.g., `[PRUNER]`, `[REFACTORER]`).
* **Silent Rejection:** If a file cannot be processed due to environment constraints or unreadable formats, abort silently and do not flag it.
* **Atomic Deletion:** The task list serves as a self-consuming queue; process tasks directly and eliminate overhead.

- [REFACTORER] `js/core/RosterApp.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (567 lines).
- [REFACTORER] `js/Features/JulesTerminal/JulesTerminal.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (617 lines).
- [REFACTORER] `css/main.css`: Monolithic file exceeding 500 lines mixing domain responsibilities (710 lines).
- [PRUNER] `js/core/RosterApp.js`: Unstructured console.error usage at line 154.
- [PRUNER] `js/Features/Search/SearchController.js`: Unstructured console.error usage at line 63.
- [PRUNER] `benchmark.js`: Unstructured console.error usage at lines 458, 497, 513.

### Persistence Log
* ⚡ Bolt+: Resolved I/O Waterfall in `JulesTerminal.js` (loadPullRequestsForRepo / loadActiveSessionsForRepo).
