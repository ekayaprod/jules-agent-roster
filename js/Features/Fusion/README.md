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

1. **`FusionLab.js` (Orchestrator):** The primary controller. It holds the UI state (selected slots), coordinates the sub-components (`FusionIndex`, `AgentPicker`, `FusionAnimation`), and binds global event listeners to the `#fusionLabContent` DOM container.
2. **`FusionCompiler.js` (Neural Center):** The pure logic engine. It enforces a strict Directed Acyclic Graph (DAG) defined in `this.EXECUTION_PIPELINE` to determine the upstream/downstream order of fused agents, regardless of user selection order. It handles schema validation and string synthesis.
3. **`FusionIndex.js` (State Manager):** Manages the "collectible shelf". It handles persistence by directly interfacing with `localStorage` (key: `fusion_discovery_state`) and safely parsing JSON arrays to determine unlocked states.
4. **`AgentPicker.js` & `FusionAnimation.js` (UI Controllers):** Manage localized interaction logic. `AgentPicker` handles the modal overlay and search filtering for slot selection. `FusionAnimation` handles the CSS class toggling and timing required for the merge visualization.
5. **`fusion.css` & `index.js` (Colocation):** Styles specific to the fusion UI are colocated to prevent global CSS bloat. The `index.js` barrel file standardizes CommonJS exports for potential Node.js testing environments while protecting against browser `require` errors.
