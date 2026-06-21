- Out of Scope — Requires Net-New Code: The [INSTRUMENTER] Queue tasks (Replace X with Y).

## Excised Targets
* `js/UI/JulesTerminal/TerminalPolling.js` | Tier 1 (Diagnostic Droppings) | `console.warn("Session polling cycle encountered an error:", error);`
* `js/core/RosterApp.js` | Tier 1 (Diagnostic Droppings) | `console.warn("[RosterApp] Failed to pre-fetch prompt for ${agent.name}:", err);`
* `js/Utils/network-utils.js` | Tier 1 (Diagnostic Droppings) | `console.warn("Retrying ${url} (${retries} left)...");`
* `js/Services/LLMRouter/LLMRouter.js` | Tier 1 (Diagnostic Droppings) | `console.warn("[LLMRouter] Failed to parse error response from ${provider}:", e2);`
* `js/Services/LLMRouter/LLMRouter.js` | Tier 1 (Diagnostic Droppings) | `console.warn("[LLMRouter] ${provider} error ${response.status}. Retrying...");`

## Coupled - Abandoned
* `js/Utils/storage-utils.js` | Tier 1 (Coupled)
* `js/Utils/network-utils.js` | Tier 1 (Coupled)
* `js/Utils/markdown-renderer.js` | Tier 1 (Coupled)
* `js/UI/Singularity/SingularityBespokeBuilder.js` | Tier 1 (Coupled)
* `js/Utils/index.js` | Tier 5 (Knip) (Coupled)
* `js/constants/ui.js` | Tier 5 (Knip) (Coupled)
* `js/Services/AgentRepository.js` | Tier 5 (Knip) (Coupled)
* `js/core/RosterApp.js` | Tier 1 (Diagnostic Droppings) | `console.warn("IntersectionObserver not supported, skipping pill observer initialization.");`
* `js/UI/Singularity/SingularityBespokeBuilder.js` | Tier 1 (Coupled)
* `js/Utils/network-utils.js` | Tier 1 (Coupled)
* `js/Utils/storage-utils.js` | Tier 1 (Coupled)
* `js/Utils/markdown-renderer.js` | Tier 1 (Coupled)
