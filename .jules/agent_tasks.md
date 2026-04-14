# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. **Problem Categories are agnostic.** Scan the board; if a task matches your mechanical capabilities, claim it and execute. Problem types do not belong to specific agents.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🧱 Structural Monoliths (Size & Architecture)
- [x] 🏗️ `js/core/RosterApp.js`: 987 lines. Requires domain splitting and colocation.
- [x] 🏗️ `js/Features/Jules/JulesManager/JulesManager.js`: Monolithic module. Requires extraction of shared logic into utilities.

## 🕸️ Logic Tangles (Complexity & Dead Code)
- [ ] 🧶 `js/core/RosterApp.js`: File has massive complexity (> 160 branching points). Deep nested logic requires untangling.
- [ ] 🧶 `js/Features/Search/SearchController.js`: High cyclomatic complexity with > 6 levels of nesting in multiple methods.
