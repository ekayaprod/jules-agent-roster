# 🤖 Autonomous Agent Tasks

> **Rules of Engagement for Downstream Agents:**
> 1. **DNA Matching:** Scan the board for your specific Archetype or Mechanical Verb. If a task matches, claim it.
> 2. **The Out-of-Scope Fallback:** If you review this board and find ZERO tasks that match your specific domain, DO NOT mark out-of-scope tasks as "Blocked". Initiate your own native discovery scan across the repository.
> 3. Do not delete this file. Sweep resolved `[x]` items on execution.

## The [REFACTORER] Queue
- [ ] 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: 638 lines. Structural Monolith.
- [ ] 🏗️ `js/core/RosterApp.js`: 557 lines. Structural Monolith.
- [x] 🏗️ `js/core/events/EventBinder.js`: 534 lines. Structural Monolith.

## The [PRUNER] Queue
## The [INSTRUMENTER] Queue

- [ ] 🧹 `js/Utils/telemetry-utils.js`: Replace raw `console.error` calls with structured telemetry logger at lines 19, 23.
- [ ] 🧹 `js/Services/GithubAPI/GithubAPI.js`: Replace raw `console.error` calls with structured telemetry logger at lines 71, 74.
- [ ] 🧹 `js/Services/JulesAPI/JulesAPI.js`: Replace raw `console.error` calls with structured telemetry logger at lines 57, 83, 86, 96.
- [ ] 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js`: Replace raw `console.warn` calls with structured telemetry logger at line 139.
- [ ] 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js`: Replace raw `console.error` calls with structured telemetry logger at line 150.
- [ ] 🧹 `js/UI/JulesTerminal/TerminalPolling.js`: Replace raw `console.warn` calls with structured telemetry logger at line 31.
- [ ] 🧹 `js/UI/JulesTerminal/TerminalPolling.js`: Replace raw `console.error` calls with structured telemetry logger at line 156.
- [ ] 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js`: Replace raw `console.warn` calls with structured telemetry logger at line 403.
- [ ] 🧹 `js/Services/JulesAPI/JulesAPI.js`: Replace raw `console.error` calls with structured telemetry logger at line 150.
- [ ] 🧹 `js/Services/LLMRouter/LLMRouter.js`: Replace raw `console.warn` calls with structured telemetry logger at line 100.
- [ ] 🧹 `js/Services/LLMRouter/LLMRouter.js`: Replace raw `console.warn` calls with structured telemetry logger at line 108.
- [ ] 🧹 `js/Services/LLMRouter/LLMRouter.js`: Replace raw `console.error` calls with structured telemetry logger at line 138.

## The [TRANSFORMER] Queue

## The [OPERATOR] Queue
- [x] 📦 `package-lock.json`: Lockfile mismatch detected against package.json. Sync required.
- [x] ⚙️ `package-lock.json`: Bloated lockfile detected.

## The [GENERATOR] Queue

## The [ANALYZER] Queue

## The [UI / STYLIZE] Queue
- [x] 🎨 `js/UI/JulesTerminal/JulesModals.js`: Rigid inline CSS mutations detected (style.borderColor) across lines 41-233. Extract to semantic CSS classes.
- [x] 🎨 `js/UI/AgentCard/AgentCard.js`: Rigid inline CSS mutations detected (style.animationDelay) at line 35. Extract to semantic CSS classes.
- [x] 🎨 `js/UI/EmptyState/EmptyState.js`: Rigid inline CSS mutations detected (style.animation) at line 36. Extract to semantic CSS classes.
- [x] 🎨 `js/UI/Clipboard/clipboard-utils.js`: Rigid inline CSS mutations detected (style.position, style.opacity) at lines 34-89. Extract to semantic CSS classes.
- [x] 🎨 `js/core/events/EventBinder.js`: Rigid inline CSS mutations detected (style.display) at lines 165-170. Extract to semantic CSS classes.

## The [AST / MODERNIZE] Queue
- [x] 🧲 `js/UI/Clipboard/clipboard-utils.js`: Fossilized syntax pattern (`var`) at line 2. Upgrade to const/let.
- [x] 🧲 `js/Utils/storage-utils.js`: Fossilized syntax pattern (`var`) at line 2. Upgrade to const/let.
- [x] 🧲 `js/Features/Fusion/AgentPicker.js`: Fossilized syntax pattern (`var`) at line 1. Upgrade to const/let.

## The [REFACTORER / UNKNOT] Queue
- [x] (Blocked / False Positive) 🏗️ `index.html`: 905 lines. Structural Monolith. Requires domain splitting and colocation.

## The [RESILIENCE / SAFEGUARD] Queue
- [x] 🛡️ `js/Services/GithubAPI/GithubAPI.js`: Missing error-handling catch block logic detected at line 61. Ensure graceful degradation.
- [x] (Blocked / False Positive) 🛡️ `js/UI/JulesTerminal/JulesTerminal.js`: Empty catch block mapped at line 245. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/JulesTerminal/JulesTerminal.js`: Empty catch block mapped at line 541. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/JulesTerminal/JulesTerminal.js`: Empty catch block mapped at line 579. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/JulesTerminal/JulesModals.js`: Empty catch block mapped at line 206. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/JulesTerminal/TerminalPolling.js`: Empty catch block mapped at line 25. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/Clipboard/clipboard-utils.js`: Empty catch block mapped at line 23. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/UI/Clipboard/clipboard-utils.js`: Empty catch block mapped at line 39. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/core/events/EventBinder.js`: Empty catch block mapped at line 475. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/core/RosterApp.js`: Empty catch block mapped at line 108. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/Utils/telemetry-utils.js`: Empty catch block mapped at line 20. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/Utils/network-utils.js`: Empty catch block mapped at line 53. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/Utils/network-utils.js`: Empty catch block mapped at line 75. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/Utils/network-utils.js`: Empty catch block mapped at line 79. Ensure resilient fallback.
- [x] (Blocked / False Positive) 🛡️ `js/Utils/network-utils.js`: Empty catch block mapped at line 95. Ensure resilient fallback.
