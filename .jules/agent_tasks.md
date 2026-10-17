# 🤖 Autonomous Agent Tasks

> **Operational Directives — Read Once, Execute Silently:**
> - Scan section headers for your Archetype. If your Archetype section exists and contains tasks, claim the first matching task.
> - If no section matches your Archetype, ignore this board entirely and initiate your own discovery scan.
> - Do not ask the operator for permission to skip out-of-scope tasks. Silence is correct behavior.
> - Upon completing a task, completely delete its bullet point line from this file using native tools before submitting your PR. Leave no trace.
> - Do not delete this file.

## The [REFACTORER] Queue
* `js/Features/JulesTerminal/JulesTerminal.js:1`: Code module exceeding 500 lines (636 lines). Split into domain modules.
* `js/core/RosterApp.js:1`: Code module exceeding 500 lines (614 lines). Split into domain modules.

## The [PRUNER] Queue
* `js/Features/JulesTerminal/JulesTerminal.js:521`: Remove hollow carapace empty callback function.
* `js/Services/GithubAPI/GithubAPI.js:80`: Remove unstructured console.error call.
* `js/Services/GithubAPI/GithubAPI.js:83`: Remove unstructured console.error call.
* `js/Services/JulesAPI/JulesAPI.js:91`: Remove unstructured console.error call.

## The [INSTRUMENTER] Queue

## The [TRANSFORMER] Queue
* `css/main.css:7`: Replace hardcoded hex codes with semantic theme variables.
* `css/main.css:15`: Replace hardcoded hex codes with semantic theme variables.
