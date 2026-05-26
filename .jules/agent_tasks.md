# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
>
> 1. **DNA Matching:** Scan the board for your specific Archetype or Mechanical Verb. If a task matches, claim it.
> 2. **The Out-of-Scope Fallback:** If you review this board and find ZERO tasks that match your specific domain, DO NOT mark out-of-scope tasks as "Blocked". Initiate your own native discovery scan across the repository.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## The [REFACTORER] Queue

* 🏗️ `telemetry.json`: High-density TODO/FIXME cluster (7 matches) detected.
* 🏗️ `prompts/fusions/Void.md`: Ambiguous merge conflict markers detected.
* 🏗️ `prompts/fusions/Weaver.md`: Ambiguous merge conflict markers detected.
* 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: 647 lines. Structural Monolith.
* 🏗️ `js/core/RosterApp.js`: 572 lines. Structural Monolith.
* 🏗️ `js/Features/Fusion/FusionLab.js`: 514 lines. Structural Monolith.

## The [PRUNER] Queue

- [x] 🧹 `verification_fusion.png`: Unreferenced media asset detected.
- [x] 🧹 `verification_picker.png`: Unreferenced media asset detected.
- [x] 🧹 `verification_card.png`: Unreferenced media asset detected.
- [x] 🧹 `verification_settings.png`: Unreferenced media asset detected.
* 🧹 `telemetry.json`: Large uncompressed binary (>500KB) detected.
- [x] 🧹 `js/UI/JulesTerminal/TerminalPolling.js:27`: Replace raw `console.warn` call with structured telemetry logger.
- [x] 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js:376`: Replace raw `console.warn` call with structured telemetry logger.
- [x] 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js:383`: Replace raw `console.error` call with structured telemetry logger.
- [x] 🧹 `js/core/events/EventBinder.js:465`: Replace raw `console.error` call with structured telemetry logger.

## The [ANALYZER] Queue

* 📝 `js/UI/Singularity/SingularityBespokeBuilder.js`: Missing JSDoc documentation block.
* 📝 `js/core/events/EventBinder.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/index.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/network-utils.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/agent-utils.js`: Missing JSDoc documentation block.

## 🎨 Rigid Presentation States ([UI / STYLIZE])

* [ ] 🎨 `index.html`: Hardcoded inline CSS styles detected on multiple elements (e.g., lines 549, 555, 621). Extract to stylesheets.

## 🧹 Semantic Dust & Hygiene ([AST / REMOVE])

* [ ] 🧹 `prompts/Superintendent.md`: Unresolved merge conflict markers (`<<<<<<< HEAD`) detected around line 37.

## 🧱 Resilience & Security Boundaries ([Security / FORTIFY])

* [x] 🛡️ `js/UI/JulesTerminal/JulesTerminal.js`: Raw token extraction from `localStorage` for `jules_api_key` without explicit type guards or secure wrappers.
