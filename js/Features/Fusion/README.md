# Fusion Feature

## Purpose

This directory encapsulates the core business logic, UI orchestration, and collectible state management for the "Fusion Lab" feature. It isolates the complex interactions required to combine two discrete agent prompts into a single synthesized protocol, ensuring the logic remains decoupled from the main application roster.

## Quick Start

To initialize the complete Fusion Lab environment:

```javascript
// 1. Ensure a DOM element with ID 'fusionLabContent' exists.
// 2. Instantiate and inject the dependencies.
const compiler = new FusionCompiler(agents, customAgents);
const lab = new FusionLab();

// 3. Boot the lab with the required data sets.
lab.init(agents, customAgents);
```

To execute a headless fusion directly via the compiler:

```javascript
const compiler = new FusionCompiler(agents, customAgents);

// Fuse Agent A and Agent B (Order is automatically resolved via DAG pipeline)
const result = compiler.fuse(agentA, agentB);

console.log("Fused Agent Name:", result.name);
console.log("Fused Prompt Content:", result.prompt);
```

To parse the discovered fusion keys from storage:

```javascript
const index = new FusionIndex('containerId', customAgents, callback);
index.loadState();
console.log("Unlocked Fusions:", Array.from(index.unlockedKeys));
```

## Architecture

The Fusion feature adheres to a modular, vanilla JavaScript architecture without reliance on external frameworks. Components communicate via direct instantiation and callback delegation.

1. <a id="fusion-lab"></a>**`FusionLab.js` (Orchestrator):** The primary controller. It holds the UI state (selected slots), coordinates the sub-components (`FusionIndex`, `AgentPicker`, `FusionAnimation`), and binds global event listeners to the `#fusionLabContent` DOM container.
2. <a id="fusion-compiler"></a>**`FusionCompiler.js` (Neural Center):** The pure logic engine. It enforces a strict Directed Acyclic Graph (DAG) defined in `EXECUTION_PIPELINE` to determine the upstream/downstream order of fused agents, regardless of user selection order. It handles schema validation and string synthesis via a pure, composable functional pipeline.
3. <a id="fusion-index"></a>**`FusionIndex.js` (State Manager):** Manages the "collectible shelf". It handles persistence by directly interfacing with `localStorage` (key: `fusion_discovery_state`) and safely parsing JSON arrays to determine unlocked states.
4. <a id="agent-picker"></a>**`AgentPicker.js` & `FusionAnimation.js` (UI Controllers):** Manage localized interaction logic. `AgentPicker` handles the modal overlay and search filtering for slot selection. `FusionAnimation` handles the CSS class toggling and timing required for the merge visualization.
5. <a id="rarity-engine"></a>**`RarityEngine.js` (Categorizer):** Computes the rarity of a fused agent based purely on the domain types of the constituent agents.
6. **`Fusion.css` (Colocation):** Styles specific to the fusion UI are colocated to prevent global CSS bloat.

## <a id="rarity-system"></a>Rarity System

The <a href="#rarity-engine">`RarityEngine.js`</a> determines a fusion's output tier dynamically using a strictly defined interaction matrix. It assigns a "Super Domain" to constituent agents and matches them according to the following macro ruleset:

* **Tier 6: Mythic** - The Glitch. Result of combining any Agent with an exact duplicate of Itself.
* **Tier 5: Legendary** - The Paradox. A combination between a "Builder" (non-destructive) Agent and a "Destructive" Agent (`Scavenger`), or between `Architect` and `Pedant`.
* **Tier 4: Epic** - QA Bridge. Combining an `Integrity` Agent with a `Visible` or `Invisible` Agent.
* **Tier 3: Rare** - Full-Stack Bridge. Synergy between `Visible` and `Invisible` Agents.
* **Tier 2: Uncommon** - Frontend Synergy (`Visible` + `Visible`), Integrity Synergy (`Integrity` + `Integrity`), or a Plus Bridge (A Plus agent unmatched with its affinity domain).
* **Tier 1: Common** - Backend Synergy (`Invisible` + `Invisible`), identical sub-categories (e.g., Docs + Docs), Plus Affinities (a Plus agent combined with its matching domain), or multiple Plus agents.

**Domain Taxonomy mapping:**

* `Destructive`: Scavenger
* `Plus`: Bolt+, Palette+, Sentinel+
* `Integrity`: testing, hygiene
* `Visible`: ux, documentation, strategy
* `Invisible`: architecture, refactoring, operations, meta
