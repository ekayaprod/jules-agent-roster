# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
>
> 1. **Problem Categories are agnostic.** Scan the board; if a task matches your mechanical capabilities, claim it and execute. Problem types do not belong to specific agents.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🧱 Structural Monoliths (Size & Architecture)
- [ ] 🏗️ `js/Features/Fusion/AgentPicker.test.js`: Large test file (538 lines). Consider splitting or restructuring.

- [ ] 🏗️ `js/Features/Jules/JulesManager/JulesManager.test.js`: Extremely large test file (2025 lines). Consider splitting into smaller test suites for better maintainability.
- [ ] 🏗️ `js/Services/JulesService.test.js`: Large test file (693 lines). Consider splitting or restructuring.
- [ ] 🏗️ `js/Features/Fusion/FusionLab.test.js`: Large test file (639 lines). Consider splitting or restructuring.
- [ ] 🏗️ `js/Features/Jules/JulesManager/JulesManager.js`: Large class file (573 lines). Consider extracting some responsibilities.
- [ ] 🏗️ `js/core/RosterApp.js`: Large core class (536 lines). Needs domain splitting and colocation.

## 🕸️ Logic Tangles (Complexity & Dead Code)
- [ ] 🧶 `js/Features/Search/SearchController.js`: Deep nesting up to 25 spaces.
- [ ] 🧶 `js/Services/AgentRepository.js`: Deep nesting up to 28 spaces.
- [ ] 🧶 `scripts/build-roster.js`: Deep nesting up to 28 spaces.
- [ ] 🧶 `js/Features/Search/SearchController.test.js`: Deep nesting up to 32 spaces.

- [ ] 🧶 `js/UI/AgentCard/AgentCard.test.js`: Nested logic reaches 7 levels deep, increasing cyclomatic complexity.
- [x] 🧶 `js/Utils/network-utils.js`: Deep nesting up to 28 spaces, high cyclomatic complexity.
- [x] 🧶 `js/Utils/prompt-parser.js`: Nested logic reaches 7 levels deep, increasing cyclomatic complexity.
- [ ] 🧶 `js/UI/AgentCard/AgentCard.js`: Deep nesting up to 36 spaces.
- [x] 🧶 `js/Features/Fusion/RarityEngine.js`: Deep nesting up to 34 spaces.
- [ ] 🧶 `js/Features/Jules/JulesManager/JulesManager.js`: Deep nesting up to 32 spaces.

## 🕵️ Boundary Interrogation (Coverage Expansion & Edge Cases)

- [x] 🕵️ `js/Utils/agent-utils.test.js`: Expand `AgentUtils.getPromptUrl` boundary to prove null/undefined `TypeError` without mutating logic.

## 🚨 Fatal Boot Sequences (Bleeding Environment)

- [x] 🚨 `js/Features/Fusion/FusionLab.js`: Unhandled exception in `handleFusion` when `fusionIndex.unlock` fails is silently swallowed by an empty catch block without logging or formatting.

- [x] 🧶 `js/core/events/EventBinder.js`: Eradicated Arrow Code from click and mouseover delegation methods.
- [x] 🚨 `js/Utils/storage-utils.js`: Swallowed error in `getSafely` `catch` block returns `defaultValue` without logging.

## 🎨 Visual Polish

- [x] 🎨 `js/UI/EmptyState/EmptyState.js`: `empty-title` class was incorrectly set to `empty-title-mutated` breaking empty state styling.

- [x] 🕵️ `js/Features/Search/SearchWorker.test.js`: Added test cases for silently ignored messages with unknown types to bring branch/statement coverage to 100%.
- [x] 🕵️ `js/Utils/telemetry-utils.test.js`: Added isolated modules environment testing to achieve 100% test coverage across multiple global/window assignments without changing application source logic.
- [x] 🕵️ `js/Utils/storage-utils.test.js`: Assessed and covered branch where localStorage assignment returns empty/default when accessed across multiple definitions to reach 100% coverage map.