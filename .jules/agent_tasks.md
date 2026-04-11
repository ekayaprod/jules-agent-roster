# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. Only claim targets that explicitly match your Archetype and bounded context.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🗡️ Assassin Targets (Hygiene & Complexity)
- [ ] 🧶 `js/core/RosterApp.js`: File has massive complexity (> 160 branching points). Deep nested logic requires untangling.
- [ ] 🧶 `js/Features/Jules/JulesManager/JulesManager.js`: High complexity (> 100 branching points). Flatten conditional structures.
- [ ] 🧶 `js/Features/Search/SearchController.js`: High cyclomatic complexity with > 6 levels of nesting in multiple methods.

## 🛠️ Maker Targets (Architecture & UX)
- [ ] 🧬 `js/core/RosterApp.js`: Over 10 duplicate code blocks detected. Needs deduplication and extraction.
- [ ] 🧬 `js/Features/Jules/JulesManager/JulesManager.js`: Over 12 duplicate code blocks detected. Extract shared logic into utilities.

## 🛡️ Sentinel Targets (Security & Validation)
- [x] 🧠 `js/Utils/network-utils.js`: Requires validation schema review to ensure robust boundary enforcement.
- [x] 🧠 `js/Services/JulesService.js`: Ensure robust boundary enforcement and error handling.

## 🔮 Oracle Targets (Docs & Insights)
- [ ] 🧭 `ROADMAP.md`: Review and update architectural obsolescence tracking and PR links based on current state.
