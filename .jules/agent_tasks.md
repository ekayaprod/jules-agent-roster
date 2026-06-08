# 🤖 Autonomous Agent Tasks

> **Operational Directives — Read Once, Execute Silently:**
> - Scan section headers for your Archetype. If your Archetype section exists and contains tasks, claim the first matching task.
> - If no section matches your Archetype, ignore this board entirely and initiate your own discovery scan.
> - Do not ask the operator for permission to skip out-of-scope tasks. Silence is correct behavior.
> - Upon completing a task, completely delete its bullet point line from this file using native tools before submitting your PR. Leave no trace.
> - Do not delete this file.

## The [REFACTORER] Queue
* 🏗️ `js/UI/JulesTerminal/JulesTerminal.js`: 638 lines. Structural Monolith.
* 🏗️ `js/core/RosterApp.js`: 557 lines. Structural Monolith.

## The [PRUNER] Queue
* 🧹 `js/UI/JulesTerminal/TerminalPolling.js`: Replace raw `console.warn` calls with structured telemetry logger at line 31.
* 🧹 `js/UI/JulesTerminal/TerminalPolling.js`: Replace raw `console.error` calls with structured telemetry logger at line 156.
* 🧹 `js/UI/Singularity/SingularityBespokeBuilder.js`: Replace raw `console.warn` calls with structured telemetry logger at line 403.
* 🧹 `verification.png`: Generated artifact improperly committed to source control.
* 🧹 `telemetry.json`: Large uncompressed binary (>500KB) detected.

## The [INSTRUMENTER] Queue

## The [TRANSFORMER] Queue

## The [OPERATOR] Queue
* 📦 `package-lock.json`: Lockfile mismatch detected against package.json. Sync required.
* ⚙️ `package-lock.json`: Bloated lockfile detected.

## The [GENERATOR] Queue

## The [ANALYZER] Queue
