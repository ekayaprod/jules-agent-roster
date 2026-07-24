# Operational Directives
* Semantic Domain Matching: Agents must only process tasks within their assigned domain.
* Silent Rejection: Unhandled tasks must be silently ignored without logging.
* Atomic Deletion: Agents must delete completed tasks from this queue upon successful verification.

## The [REFACTORER] Queue
* Reduce cyclomatic complexity and decouple routing in `./js/UI/JulesTerminal/JulesTerminal.js`
* Reduce cyclomatic complexity and decouple routing in `./js/core/RosterApp.js`
* Reduce cyclomatic complexity and decouple routing in `./js/core/events/EventBinder.js`

## The [PRUNER] Queue
* Remove hollow carapace (empty structural brackets) at `./js/Features/Fusion/FusionLab.js:25`

## The [INSTRUMENTER] Queue
* Add missing error-handling in empty catch block at `./js/Services/AgentRepository.js:36`
* Add missing error-handling in empty catch block at `./js/core/RosterApp.js:54`

## The [TRANSFORMER] Queue
* Migrate hardcoded hex code to CSS variable at `./js/UI/Toast/ToastNotification.js:51`

## The [OPERATOR] Queue
* Optimize DevOps manifests to resolve I/O wait bottlenecks in `./Dockerfile`
* Optimize DevOps manifests to resolve I/O wait bottlenecks in `./package.json`
* Resolve bloated dependency mappings in `./package-lock.json`
