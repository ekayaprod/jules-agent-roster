# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
>
> 1. **Problem Categories are agnostic.** Scan the board; if a task matches your mechanical capabilities, claim it and execute. Problem types do not belong to specific agents.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🧱 Structural Monoliths (Size & Architecture)
- [ ] 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: Large core class (1063 lines). Requires domain splitting and colocation.
- [ ] 🏗️ `js/UI/JulesTerminal/JulesTerminal.Core.test.js`: Large test file (927 lines). Consider splitting.
- [ ] 🏗️ `js/Features/Jules/JulesManager/tests/JulesManager.Core.test.js`: Large test file (923 lines). Consider splitting.
- [ ] 🏗️ `js/UI/JulesTerminal/JulesTerminal.Modal.test.js`: Large test file (904 lines). Consider splitting.
- [ ] 🏗️ `js/Features/Jules/JulesManager/tests/JulesManager.Modal.test.js`: Large test file (900 lines). Consider splitting.

- [x] (Blocked / False Positive) 🏗️ `js/Features/Fusion/AgentPicker.test.js`: Large test file (538 lines). Consider splitting or restructuring.

- [x] 🏗️ `js/Features/Jules/JulesManager/JulesManager.test.js`: Extremely large test file (2025 lines). Consider splitting into smaller test suites for better maintainability.
- [x] 🏗️ `js/Services/JulesService.test.js`: Large test file (693 lines). Consider splitting or restructuring.
- [x] (Blocked / False Positive) 🏗️ `js/Features/Fusion/FusionLab.test.js`: Large test file (639 lines). Consider splitting or restructuring.
- [x] 🏗️ `js/Features/Jules/JulesManager/JulesManager.js`: Large class file (573 lines). Consider extracting some responsibilities.
- [x] 🏗️ `js/core/RosterApp.js`: Large core class (536 lines). Needs domain splitting and colocation.

## 🕸️ Logic Tangles (Complexity & Dead Code)
- [ ] 🧶 `js/UI/JulesTerminal/JulesTerminal.js`: Deep nesting up to 28 spaces.
- [ ] 🧶 `js/Services/LLMRouter/LLMRouter.js`: Deep nesting up to 28 spaces.

- [x] (Blocked / False Positive) 🧶 `js/Features/Search/SearchController.js`: Deep nesting up to 25 spaces.
- [x] (Blocked / False Positive) 🧶 `js/Services/AgentRepository.js`: Deep nesting up to 28 spaces.
- [x] (Blocked / False Positive) 🧶 `scripts/build-roster.js`: Deep nesting up to 28 spaces.
- [x] (Blocked / False Positive) 🧶 `js/Features/Search/SearchController.test.js`: Deep nesting up to 32 spaces.

- [x] (Blocked / False Positive) 🧶 `js/UI/AgentCard/AgentCard.test.js`: Nested logic reaches 7 levels deep, increasing cyclomatic complexity.
- [x] 🧶 `js/UI/AgentCard/AgentCard.js`: Deep nesting up to 36 spaces.
- [x] (Blocked / False Positive) 🧶 `js/Features/Jules/JulesManager/JulesManager.js`: Deep nesting up to 32 spaces.

## 🕵️ Boundary Interrogation (Coverage Expansion & Edge Cases)
- [ ] 🕵️ `js/UI/JulesTerminal/JulesTerminal.js`: Missing test file.
- [x] 🕵️ `js/Utils/markdown-renderer.js`: Missing test file.
- [ ] 🕵️ `js/Features/Jules/JulesManager/JulesManager.js`: Missing test file.



## 🚨 Fatal Boot Sequences (Bleeding Environment)

- [x] `js/Services/JulesAPI/JulesAPI.js`: Fix createSession "Invalid JSON payload received" mismatch against swagger.yaml.



## 🎨 Visual Polish



- [x] 🧪 `js/Utils/network-utils.js`: Re-routed swallowed exception black holes in `fetchWithRetry` JSON and text parsers to explicit `TelemetryUtils` dispatch.

- [x] 🧪 `js/Utils/network-utils.js`: Re-routed swallowed exception black holes in `fetchWithRetry` JSON and text parsers to explicit `TelemetryUtils` dispatch.
- [x] 🕵️ `js/core/events/EventBinder.js`: Expanded test coverage for global click event delegation.
- [x] 🕵️ `js/Services/LLMRouter/LLMRouter.js`: Expanded test coverage for retry loops, validation errors, and module export structure.
