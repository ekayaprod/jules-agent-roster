# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. Only claim targets that explicitly match your Archetype and bounded context.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🗡️ Assassin Targets (Hygiene & Complexity)
- [ ] 🧶 `js/core/events/EventBinder.js`: Event delegation handler exceeds complexity thresholds (max nesting 9).
- [ ] 🧶 `js/core/RosterApp.js`: Core logic block exceeds complexity thresholds (max nesting 10, >60 branching points).
- [ ] 🧶 `js/Utils/network-utils.js`: `network-utils` has high logic nesting (max nesting 7), likely missing error handling boundaries.
- [ ] 🧶 `js/Features/Search/SearchController.js`: Search methods exceed cyclomatic complexity (max nesting 8, >30 branches).
- [ ] 🧶 `js/Features/Jules/JulesManager/JulesManager.js`: Monolithic logic exceeds complexity thresholds (max nesting 8, >100 branching points).

## 🛠️ Maker Targets (Architecture & UX)
- [ ] 🏗️ `js/core/RosterApp.js`: 525 lines. Requires domain splitting and colocation.
- [ ] 🏗️ `js/Features/Jules/JulesManager/JulesManager.js`: 545 lines. Requires extraction of shared logic into utilities.
- [ ] 🏗️ `js/Features/Fusion/FusionLab.js`: 464 lines. Monolithic module requires domain splitting.
- [ ] 🏗️ `js/Features/Fusion/AgentPicker.js`: 321 lines. Monolithic module requires splitting.

## 🛡️ Sentinel Targets (Security & Validation)
- [ ] 🧱 `js/Utils/network-utils.js`: Missing strict payload validation in fetch wrappers.

## 🔮 Oracle Targets (Docs & Observability)
- [ ] 📘 `js/Services/JulesService.js`: Missing structural documentation for error boundaries.
