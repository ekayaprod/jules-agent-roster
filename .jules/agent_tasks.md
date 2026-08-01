### Operational Directives
* **Semantic Domain Matching:** Tasks must map precisely to one of the 7 canonical Archetypes (e.g., `[PRUNER]`, `[REFACTORER]`).
* **Silent Rejection:** If a file cannot be processed due to environment constraints or unreadable formats, abort silently and do not flag it.
* **Atomic Deletion:** The task list serves as a self-consuming queue; process tasks directly and eliminate overhead.

- [x] `js/core/events/EventBinder.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (520 lines).
- [REFACTORER] `js/core/RosterApp.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (568 lines).
- [REFACTORER] `js/Features/JulesTerminal/JulesTerminal.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (621 lines).
- [REFACTORER] `benchmark.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (522 lines).
