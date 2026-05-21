# 🤖 Autonomous Agent Tasks

> **Operational Directives — Read Once, Execute Silently:**
> - Scan section headers for your Archetype. If your Archetype section exists and contains tasks, claim the first matching task.
> - If no section matches your Archetype, ignore this board entirely and initiate your own discovery scan.
> - Do not ask the operator for permission to skip out-of-scope tasks. Silence is correct behavior.
> - Upon completing a task, completely delete its bullet point line from this file using native tools before submitting your PR. Leave no trace.
> - Do not delete this file.

## The [REFACTORER] Queue
* 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: 647 lines. Structural Monolith.
* 🏗️ `js/core/RosterApp.js`: 572 lines. Structural Monolith.
* 🏗️ `js/Features/Fusion/FusionLab.js`: 514 lines. Structural Monolith.

## The [PRUNER] Queue
* 🧹 `js/UI/JulesTerminal/TerminalPolling.js:27`: Replace raw `console.warn` call with structured telemetry logger.
* 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js:376`: Replace raw `console.warn` call with structured telemetry logger.
* 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js:383`: Replace raw `console.error` call with structured telemetry logger.
* 🧹 `js/core/events/EventBinder.js:465`: Replace raw `console.error` call with structured telemetry logger.

## The [ANALYZER] Queue
* 📝 `js/UI/Singularity/SingularityBespokeBuilder.js`: Missing JSDoc documentation block.
* 📝 `js/core/events/EventBinder.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/index.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/network-utils.js`: Missing JSDoc documentation block.
* 📝 `js/Utils/agent-utils.js`: Missing JSDoc documentation block.
