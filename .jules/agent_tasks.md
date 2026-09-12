### Operational Directives
* **Semantic Domain Matching:** Tasks must map precisely to one of the 7 canonical Archetypes (e.g., `[PRUNER]`, `[REFACTORER]`).
* **Silent Rejection:** If a file cannot be processed due to environment constraints or unreadable formats, abort silently and do not flag it.
* **Atomic Deletion:** The task list serves as a self-consuming queue; process tasks directly and eliminate overhead.

### The [REFACTORER] Queue
* Refactor structural monolith exceeding 500 lines at `benchmark.js:1`.
* Refactor structural monolith exceeding 500 lines at `js/core/RosterApp.js:1`.
* Refactor structural monolith exceeding 500 lines at `js/Features/JulesTerminal/JulesTerminal.js:1`.
* Refactor structural monolith exceeding 500 lines at `css/main.css:1`.

### The [INSTRUMENTER] Queue
* Migrate `console.error` to telemetry logger at `js/core/events/handlers/GlobalEvents.js:351`.
* Migrate `console.error` to telemetry logger at `js/core/events/handlers/TerminalEvents.js:14`.
* Migrate `console.error` to telemetry logger at `js/core/events/handlers/TerminalEvents.js:19`.
* Migrate `console.error` to telemetry logger at `js/core/events/handlers/TerminalEvents.js:62`.
* Migrate `console.error` to telemetry logger at `js/Services/GithubAPI/GithubAPI.js:80`.
* Migrate `console.error` to telemetry logger at `js/Services/GithubAPI/GithubAPI.js:83`.
* Migrate `console.error` to telemetry logger at `js/Services/JulesAPI/JulesAPI.js:63`.
* Migrate `console.error` to telemetry logger at `js/Services/JulesAPI/JulesAPI.js:90`.
* Migrate `console.error` to telemetry logger at `js/Services/JulesAPI/JulesAPI.js:101`.
* Migrate `console.error` to telemetry logger at `js/Services/JulesAPI/JulesAPI.js:111`.

### The [PRUNER] Queue
* Remove hollow carapace at `js/Features/JulesTerminal/JulesTerminal.js:511`.
