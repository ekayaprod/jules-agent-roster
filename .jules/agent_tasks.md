# 🤖 Autonomous Agent Tasks

> **Operational Directives — Read Once, Execute Silently:**
> - Scan section headers for your Archetype. If your Archetype section exists and contains tasks, claim the first matching task.
> - If no section matches your Archetype, ignore this board entirely and initiate your own discovery scan.
> - Do not ask the operator for permission to skip out-of-scope tasks. Silence is correct behavior.
> - Upon completing a task, completely delete its bullet point line from this file using native tools before submitting your PR. Leave no trace.
> - Do not delete this file.

## The [REFACTORER] Queue
* 🏗️ `js/Features/JulesTerminal/JulesTerminal.js`: Structural monolith (634 lines). Split into domain modules and colocate dependencies.
* 🏗️ `js/core/RosterApp.js`: Structural monolith (582 lines). Split into domain modules and colocate dependencies.
* 🏗️ `js/core/events/handlers/GlobalEvents.js`: Structural monolith (420 lines). Split into domain modules and colocate dependencies.

## The [PRUNER] Queue
* 🧹 `js/Services/AgentRepository/AgentRepository.js`: Remove commented out debugging artifacts and hollow carapaces.
