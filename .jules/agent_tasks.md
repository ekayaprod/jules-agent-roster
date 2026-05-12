# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. **DNA Matching:** Scan the board for your specific Archetype (e.g., `[Extractor]`, `[Sentinel]`) or Mechanical Verb (e.g., `SPLICE`, `REMOVE`). If a task matches your mechanical capabilities, claim it.
> 2. **The Out-of-Scope Fallback:** If you review this board and find ZERO tasks that match your specific domain, DO NOT mark out-of-scope tasks as "Blocked" or "False Positive". Instead, ignore this board entirely and initiate your own native discovery scan across the repository to find valid targets.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## 🧱 Structural Monoliths (Target: [Maker] / EXCAVATE)
- [ ] 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: 646 lines. Requires domain splitting and colocation.
- [ ] 🏗️ `js/core/RosterApp.js`: 565 lines. Requires domain splitting and colocation.
- [ ] 🏗️ `js/Features/Fusion/FusionLab.js`: 549 lines. Requires domain splitting and colocation.

## 🛡️ Resilience Boundaries (Target: [Sentinel] / FORTIFY)
- [ ] ⚠️ `js/Services/LLMRouter/LLMRouter.js`: Line 99. Empty catch block is swallowing errors silently. Needs mapped error handling.

## 🎨 Rigid Presentation States (Target: [UI] / STYLIZE)
- [x] 🎨 `js/Features/Fusion/Fusion.css`: Contains hardcoded hex colors instead of CSS variables (e.g., `#a855f7`, `#ec4899`, `#fff`). Needs WCAG scaffolding.
- [x] 🎨 `js/UI/Singularity/styles/SingularityBespokeBuilder.css`: Contains hardcoded hex colors instead of CSS variables (e.g., `#60a5fa`, `#f87171`). Needs WCAG scaffolding.

## 🗑️ Semantic Dust & Hygiene (Target: [AST] / REPLACE)
- [ ] 🧹 Raw `console` wrappers: Replace numerous raw `console.warn` and `console.error` instances throughout `js/` with the structured JSON telemetry logger (`js/Utils/telemetry-utils.js`).
