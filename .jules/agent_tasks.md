# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. **Problem Categories are agnostic.** Scan the board; if a task matches your mechanical capabilities, claim it and execute. Problem types do not belong to specific agents.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🧱 Structural Monoliths (Size & Architecture)

- [ ] 🏗️ `js/Features/Jules/JulesManager/JulesManager.js`: 573 lines, 50 methods. Requires domain splitting and colocation.
- [ ] 🏗️ `js/core/RosterApp.js`: 539 lines, 50 methods. Massive class representing a monolith.
- [ ] 🏗️ `js/core/events/EventBinder.js`: 475 lines, 45 methods. Extremely large single responsibility violation.

## 🕸️ Logic Tangles (Complexity & Dead Code)

- [ ] 🧶 `js/core/events/EventBinder.js`: File has massive complexity (> 90 branching points). Deep nested logic requires untangling.
- [ ] 🧶 `js/Features/Jules/JulesManager/JulesManager.js`: High cyclomatic complexity (> 80 branching points).

## 🗑️ Dead Code & Cosmetic Error Boundaries

- [ ] 🗑️ `js/Features/Fusion/FusionLab.js`: Empty catch block at line 325 `catch (e) {}`. Requires Sabotage Check and removal.

## 🕵️ Boundary Interrogation (Coverage Expansion & Edge Cases)

- [ ] 🕵️ `js/Features/Fusion/FusionLab.js`: High method count (56 methods), requires testing for untested boundaries.
- [ ] 🕵️ `js/Features/Fusion/AgentPicker.js`: Evaluate state handling and edge cases.
