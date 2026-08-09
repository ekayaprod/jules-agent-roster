### Operational Directives
* **Semantic Domain Matching:** Tasks must map precisely to one of the 7 canonical Archetypes (e.g., `[PRUNER]`, `[REFACTORER]`).
* **Silent Rejection:** If a file cannot be processed due to environment constraints or unreadable formats, abort silently and do not flag it.
* **Atomic Deletion:** The task list serves as a self-consuming queue; process tasks directly and eliminate overhead.

- [REFACTORER] `js/Features/JulesTerminal/JulesTerminal.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (617 lines).
- [REFACTORER] `js/Features/JulesTerminal/JulesModals.test.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (578 lines).
- [REFACTORER] `js/core/RosterApp.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (564 lines).
- [REFACTORER] `js/Features/Fusion/AgentPicker.test.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (545 lines).
- [REFACTORER] `benchmark.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (536 lines).
- [REFACTORER] `js/core/events/EventBinder.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (526 lines).
- [INSTRUMENTER] `js/Utils/network/network-utils.js`: Naked execution wrapper blocks and complex URL handling that require better type-guards.
