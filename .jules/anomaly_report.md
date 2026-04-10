> **Rules of Engagement for Downstream Agents:**
> 1. Only claim targets that explicitly match your Archetype and bounded context.
> 2. **False Positive Protocol:** If you investigate a target and determine it is a false positive or unfixable, check it off (`- [x]`) and continue your own discovery phase. Do not abort or waste a PR.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🗡️ Assassin Targets (Hygiene & Complexity)
- [ ] 🧶 `js/core/RosterApp.js`: File exceeds 900 lines. Extreme cyclomatic complexity and monolithic responsibilities.

## 🛠️ Maker Targets (Architecture & UX)
- [ ] 📘 `js/Services/JulesService.js`: Hardcoded network boundaries could be refactored into modular API boundaries.

## 🛡️ Sentinel Targets (Testing & Resilience)
- [ ] 🩺 `js/Features/Jules/JulesManager/JulesManager.test.js`: File exceeds 2000 lines. Highly dense monolith testing block. Needs segmentation or Surveyor extraction.

## 🔮 Oracle Targets (Data & Metrics)
- [ ] 📊 `telemetry.json`: Extensive legacy metrics payloads mapped.
