### Operational Directives
* **Semantic Domain Matching:** Tasks must map precisely to one of the 7 canonical Archetypes (e.g., `[PRUNER]`, `[REFACTORER]`).
* **Silent Rejection:** If a file cannot be processed due to environment constraints or unreadable formats, abort silently and do not flag it.
* **Atomic Deletion:** The task list serves as a self-consuming queue; process tasks directly and eliminate overhead.

- [REFACTORER] `js/core/events/EventBinder.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (541 lines).
- [REFACTORER] `js/core/RosterApp.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (567 lines).
- [REFACTORER] `js/Features/JulesTerminal/JulesTerminal.js`: Monolithic file exceeding 500 lines mixing domain responsibilities (617 lines).
- [REFACTORER] `css/main.css`: Monolithic file exceeding 500 lines mixing domain responsibilities (710 lines).
- [TRANSFORMER] `css/main.css`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/UI/Toast/ToastNotification.js`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/core/RosterApp.js`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/Utils/format/format-utils.js`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/Utils/network/network-utils.js`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/Utils/dom/dom-utils.js`: Rigid Presentation States (Hardcoded hex codes).
- [TRANSFORMER] `js/Features/JulesTerminal/TerminalPolling.js`: Rigid Presentation States (Hardcoded hex codes).
- [INSTRUMENTER] `js/Features/JulesTerminal/JulesTerminal.js`: Resilience & Security Boundaries (Empty catch blocks/Unmapped edge cases).
- [INSTRUMENTER] `js/Services/GithubAPI/GithubAPI.js`: Resilience & Security Boundaries (Empty catch blocks/Unmapped edge cases).
- [INSTRUMENTER] `js/Services/AgentRepository.js`: Resilience & Security Boundaries (Empty catch blocks/Unmapped edge cases).
- [INSTRUMENTER] `js/Services/LLMRouter/LLMRouter.js`: Resilience & Security Boundaries (Empty catch blocks/Unmapped edge cases).
