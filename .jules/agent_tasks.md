### Operational Directives
* Semantic Domain Matching, Silent Rejection, and the Atomic Deletion protocol strictly enforced.

### The [PRUNER] Queue
- Remove unstructured `console.error` calls from `js/Utils/telemetry/telemetry-utils.js` lines 19, 24, 31
- Remove unstructured `console.error` calls from `js/Services/GithubAPI/GithubAPI.js` lines 80, 83
- Remove unstructured `console.error` calls from `js/Services/JulesAPI/JulesAPI.js` lines 63, 90, 101, 111, 166, 192
- Remove unstructured `console.error` calls from `js/Services/LLMRouter/LLMRouter.js` line 155
- Remove unstructured `console.error` calls from `js/core/events/handlers/TerminalEvents.js` lines 14, 19, 62
- Remove unstructured `console.error` calls from `js/core/events/handlers/GlobalEvents.js` line 353

### The [REFACTORER] Queue
- Refactor `js/Features/Fusion/FusionLab.js` (500+ lines, complex init and state handling)
- Refactor `js/Features/JulesTerminal/JulesTerminal.js` (626 lines, complex logic)
- Refactor `js/core/RosterApp.js` (574 lines, complex routing layer)
- Refactor `js/Features/Fusion/AgentPicker.js` (340 lines, potentially complex component)

### The [INSTRUMENTER] Queue
- Add missing error-handling catch blocks for `ClipboardUtils.readText` in `js/UI/Clipboard/clipboard-utils.js`
- Add missing error-handling catch blocks for promises in `js/core/RosterApp.js`
- Add missing error-handling catch blocks for network fetch operations in `js/Utils/network/network-utils.js`
- Add type-guards or explicit error handling in `js/Features/JulesTerminal/JulesTerminal.js` line 179 and 201

### The [TRANSFORMER] Queue
- Migrate hardcoded hex code `card-bg: #1e293b` to centralized theme variable in `css/main.css` line 7
- Migrate hardcoded hex code `term-bg: #0d1117` to centralized theme variable in `css/main.css` line 15
