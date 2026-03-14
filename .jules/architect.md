YYYY-MM-DD
**Title**: 🏗️ Blueprint: [Fusion] structural reinforcement
**Learning**: Fractured import corridors can be safely unified by erecting load-bearing barrel files that export a cohesive domain foundation. While AST tools are preferred, direct replacement of static \`require\` boundaries to the new \`index.js\` achieves safe structural alignment without modifying execution logic.
**Action**: Always verify downstream execution (via Jest test suites) after shifting load-bearing import structures to ensure the functional facade remains intact.
## 2025-03-12
**Title**: [UI] structural reinforcement
**Learning**: Grouping domain components without a unified entry point creates fragmented consumption.
**Action**: [Excavate] Erected `js/UI/index.js` to serve as a cohesive load-bearing node for the UI domain, properly routing `AgentCard`, `ClipboardUtils`, `ExportController`, `SearchController`, and `ToastNotification` through a single barrel file to simplify imports for test scaffolding.

YYYY-MM-DD
**Title**: [JulesManager] structural reinforcement
**Learning**: Discovered `JulesManager` sitting as an isolated module within `js/Features/Jules/`, violating the barrel export pattern used elsewhere.
**Action**: Executed `[Excavate]`. Moved `JulesManager.js` and `JulesManager.test.js` to `js/Features/Jules/JulesManager/`, creating a cohesive domain foundation capped with an `index.js` barrel file. Rewired DOM `<script>` imports natively.

YYYY-MM-DD
**Title**: [Excavate] Extracted domain classification logic from custom_agents.json
**Learning**: Domain classification logic for custom fusions (e.g., Glitch, Paradox) was previously coupled with the structural layout of `custom_agents.json`. This made the JSON file harder to parse programmatically and mixed data definition with business logic.
**Action**: Flattened `custom_agents.json` to act strictly as a dictionary mapping fusion coordinates to agent definitions. Extracted the domain classification logic into a new `getFusionDomain` function within `RarityEngine.js`, centralizing all domain and rarity calculation in one authoritative module.
