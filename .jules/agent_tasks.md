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
- Refactor `FusionLab.js` (500+ lines, complex init and state handling)
- Refactor `JulesTerminal.js` (626 lines, complex logic)
- Refactor `RosterApp.js` (574 lines, complex routing layer)
- Refactor `AgentPicker.js` (340 lines, potentially complex component)
