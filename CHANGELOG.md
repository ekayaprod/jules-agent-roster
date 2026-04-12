# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 0.9.0 - 2026-04-12

### 🚀 Features
- **Agent Roster Expansion**: Promoted Vibe to base roster, updated master forge schemas for multiple agents, and added the Canvas fusion agent.
- **UI & Workflows**: Added 'Download Fusions' and 'Download Parent Fusions' buttons to agent card dropdowns. Redesigned terminal UI to defer API calls behind a manual toggle and implemented a PR modal with merge and close actions.
- **Architecture**: Migrated agents to V8 Single-Pass standard. Synchronized agent markdown files and registries with a new sync script. Migrated heavy search logic to a background Web Worker.

### 💅 Polish
- **Visuals**: Polished Fusion Lab interactions and transitions. Redesigned the splay indicator as a bottom card stack and allowed child fusions to splay out on core agent cards.
- **Microcopy & Documentation**: Extracted magic numbers and enforced UI timings. Centralized terminal indicator logic and updated various agent documentation for clarity.

### ⚡ Performance
- **DOM & Execution**: Minified roster payload JSON. Offloaded fuse.js searches to background workers. Optimized StorageUtils prototype pollution stripping. Bypassed React optimizations in the Vanilla JS stack.
- **Telemetry**: Injected execution timing and token usage telemetry around the AI invocation boundary. Swept legacy telemetry JSON data payload.

### 🛡️ Security & Stability
- **Network Boundaries**: Fortified network payload and session boundary validations. Enforced type safety on options.body to prevent fatal payload crashes.
- **Error Handling**: Resuscitated global variable redeclaration boot failures. Enforced environment export boundary testing and interrogated error boundaries across modules.

## 0.8.0 - 2026-03-12

### 🚀 Features

- **Jules Integration**: Combined Jules execution and GitHub PR UI, added an open pull requests panel, and included GitHub Token configuration in the API settings. Limited the task dashboard to 5 items and allowed click-to-dismiss.
- **Fusion Lab**: Rebuilt the Fusion Index as a Pokedex-style categorized grid with silhouettes for locked agents and restored the grid layout. Removed filter search from the protocol component picker and decoupled crafting rarity into a centralized engine (`RarityEngine`).
- **New Agents**: Introduced the Mythic rarity tier, added the new 'Hitman' (Scavenger+Scavenger) custom agent, and the 'Zealot' (Pedant+Pedant) custom agent. Enabled Yggdrasil paradigm mutation for PinnedManager.
- **Security**: Mitigated a high-severity DOM-based XSS vulnerability via innerHTML in `FusionAnimation`.

### 💅 Polish

- **UI & Accessibility**: Refactored raw error states to accessible DOM components with keyboard fluidity. Enforced modal focus trapping for better accessibility, provided inline API Key modal validation, and refined empty states.
- **Visuals & Layouts**: Polished mobile UX for the Jules dashboard, fixed agent card shines and flip animations, and modernized Fusion Index syntax while maintaining a responsive paradigm.
- **Microcopy**: Polished UX copy for Jules API error states and HTTP status codes, and standardized data payload vocabulary (e.g., `agentsData` to `agents`).
- **Documentation**: Synthesized macro and micro documentation for AgentCard, RarityEngine, Fusion Module, SearchController, ExportController, Core RosterApp, and JulesManager.

### ⚡ Performance

- **DOM Optimization**: Minimized DOM querying overhead in global click handlers, `AgentPicker`, polling loops, and dropdowns. Cached redundant DOM lookups in search loops.
- **Algorithmic Efficiency**: Optimized IntersectionObserver key lookup in RosterApp, algorithmic flattening for Rarity System lookups, and ISO date sorting logic to improve overall stability.

### 🐛 Fixed

- **Resilience**: Fixed fatal uninitialized boot crashes in FusionIndex, cured a dynamic parsing hazard, fixed RarityEngine uninitialized state bug, and resolved a boot race condition in AgentRepository. Added retry implementation for API resilience.
- **UI Interactions**: Resuscitated the Fusion Lab Agent Picker system and resolved overlapping/visual rendering anomalies in the Fusion Index grid.

### 🔧 Chores

- **Architecture**: Executed broad structural reinforcement blueprints across JulesManager, UI, Fusion, Utils, and Core App domains by extracting controllers (Search/Export) and enforcing utility file kebab-case conventions.
- **Code Maintenance**: Untangled and flattened complex logic blocks (`loadActiveSessionsForRepo`, `_parseInline`), purged orphaned barrel exports, dead benchmark code, and dead CSS wrappers.
- **Testing**: Added focused test coverage suites for RarityEngine, JulesManager, FusionCompiler, and JulesAPI boundary defenses.
- **Tooling**: Created target dossiers for macro decay tracking, synchronized the roadmap, and standardized package.json script configurations.

## 0.7.0 - 2026-03-07

### 🚀 Features

- **Jules Integration**: Implemented polling active tasks for selected Jules repos, including a "Needs Input" status in the execution interface dashboard, and added the ability to dismiss completed tasks.
- **Fusion Lab**: Registered the new "Yggdrasil" paradigm-mutating agent to the Custom Agents catalog and removed meta-agents from the Fusion Lab menu.
- **Core UI**: Redesigned the back of the agent card layout and action buttons, including displaying raw markdown in agent card previews.

### 💅 Polish

- **Generative UI**: Deployed fluid generative UI polish across Agent Card protocol previews and the execution interface dashboard, utilizing native DOM nodes over innerHTML.
- **Visuals & Layouts**: Restored critical Card Rarity shine and foil effects, and injected fluid transitions for the Jules Repo picker. Standardized spatial rhythm and typography across `index.html` and fusion CSS.
- **Microcopy & Accessibility**: Enforced ARIA compliance for omni-button actions and polished microcopy for action buttons across the app.

### ⚡ Performance

- **DOM Optimization**: Implemented widespread caching of redundant DOM lookups across JulesManager, FusionAnimation, RosterApp, and FusionLab to eliminate layout thrashing.
- **Algorithmic Efficiency**: Minimized structural DOM query costs, improving perceived startup execution and Agent Card rendering speeds.
- **Deduplication**: Abstracted and standardized HTML generation templates into structured local helpers for terminal lines, status badges, PR link creation, and dashboard items.

### 🐛 Fixed

- **UI Interactions**: Corrected the inline display styling logic upon search reset to safely preserve CSS grid integrity without overriding global resets. Fixed dynamic agent emojis in the active session terminal feed.
- **Mobile Experience**: Applied deep responsive layout updates for core UI elements and Fusion interactions to handle varied device dimensions and scroll contexts.
- **Resilience**: Fixed Omni-button dropdown error propagation and safely decoupled its state tracking.

### 🔧 Chores

- **Architecture**: Enforced "Feature-Based Colocation" directory structures by restructuring domain logic for `js/ui/` and Jules integrations.
- **Documentation**: Generated high-level structural Macro and Micro documentation for JulesManager, Root components, UI directories, and features.
- **Code Maintenance**: Purged dead UI code including markdown renderers, outdated Fusion Lab styling structures, and old PromptRenderer logic. Flattened deeply nested logic loops in JulesManager.
- **Testing**: Injected focused code coverage suites for `PinnedManager` and `js/ui/` components.

## 0.6.0 - 2026-03-06

### 🚀 Features

- **UI & State**: Added comprehensive interactive states globally, new surface foil effects with outward particle emission, and dynamic border colors/effects based on rarity tiers.
- **Fusion Lab**: Updated layout and reveal logic, made categories start inline, and added pseudo-element headers on desktop.
- **AI Infrastructure**: Upgraded JulesAPI with timeouts, injected stream-state architecture, and replaced unsafe HTML rendering in the terminal feed with DOM nodes.
- **Personalization**: Materialized 'Recently Used' and 'Favorites Persistence' features.
- **UX**: Enhanced the AgentPicker Modal navigation context and added memoization to AgentCard HTML rendering to optimize search filtering.

### 💅 Polish

- **Perceived Performance**: Improved performance for RosterApp Skeletons, FusionAnimation, and AgentPicker.
- **UI Aesthetics**: Polished AgentCard theming and card shine effects.
- **Responsive Layouts**: Enforced responsive design across the core layout and Fusion Lab.
- **UX & Tooling**: Added contextual FTUE (First-Time User Experience) and help UI for the Agent Picker Modal.

### 🐛 Fixed

- **UI & Animations**: Smoothed continuous animation for rainbow foil, prevented UI freezes when picking agents in the Fusion Lab, balanced agent card content and pin corner icons, and shifted content up to prevent description cutoffs.
- **Data & Parsing**: Correctly registered the Mobilizer agent and correctly parsed agent names containing a plus sign.
- **Resilience**: Treated fragility in LocalStorage parsing and safeJsonParse error swallowing.
- **Rendering**: Synchronously rendered loading skeletons before data fetch.

### 🔧 Chores

- **Performance**: Optimized redundant DOM queries in FusionLab, virtualized AgentPicker, and improved startup execution times.
- **Documentation**: Synthesized Macro/Micro documentation for the Jules API Swagger, Main App Core, FavoritesManager, and generated an `emojiaudit.md` report.
- **Code Maintenance**: Purged obsolete components (`PromptRenderer.renderMarkdown`, `FusionAnimation` ghost class, recently used section, and dead scripts). Enforced typographic hierarchy and polished microcopy across the app.
- **Testing Integration**: Added coverage for `FusionCompiler.js` and `AgentRepository`. Updated core agent categories and custom agent emojis.

## 0.5.0 - 2026-03-03

### 🚀 Features

- **Performance & Search**: Implemented virtualization for search results to significantly improve performance, added fuzzy search capabilities, and included unlocked fusion agents in search results.
- **Agent Data Standardization**: Standardized `agents.json` and `custom_agents.json` schemas.
- **Testing Integration**: Added comprehensive tests for `PromptParser.parsePrompt` and spawned "Singularity: Test Pilot" for improved test coverage.
- **UI Tweaks**: Redesigned Agent Card layout to a one-third/two-thirds split, and updated locked fusion slots to display solid black emoji silhouettes.

### 💅 Polish

- **Responsive Layout Enforcement**: Ensured responsive layouts across the Fusion Lab and Category Navigation.
- **UX & Tooling**: Restructured and polished the Fusion UI, added contextual FTUE (First-Time User Experience) & help UI for global search empty states, and standardized spatial rhythm across `index.html` and `AgentCard`.
- **Interaction Flow**: Refined the interaction flow for Fusion Lab card integration and polished the tooltip icon UI.

### 🐛 Fixed

- **Layout & Visual Fixes**: Resolved Fusion Lab card layout collapse, correctly styled the fusion agent picker modal for dark themes, and reduced flip card height.
- **Animation Integrity**: Restored the complex Fusion Lab animation sequence, ensured animations are correctly scoped, and fixed animation loading by applying eager loading to images.
- **Mobile Experience**: Fixed mobile keyboard auto-focus issues on search inputs.
- **Data & Rendering**: Standardized custom agent data mapping, fixed DOM ID escaping in `AgentCard.js` for composite keys, and centralized fusion icon extraction logic.

### 🔧 Chores

- **Code Refactoring & Cleanup**: Extracted and centralized JS utilities, refactored `runAnimation` and `fetchAgents` to use flat `async/await` structures, and eliminated redundant DOM wrappers.
- **Documentation Overhaul**: Injected cognitive heuristics into fusion agent prompts, generated a master audit report, and revised documentation for various core and fusion agents to improve clarity, detail, and formatting.
- **System Maintenance**: Purged orphaned python scripts and unused Javascript variables to reduce codebase bloat.

## 0.4.0 - 2026-03-01

### 🚀 Features

- **Energy-based Rarity System**: Implemented a comprehensive TCG standard rarity system and pre-merge preview for Fusion Agents.
- **Light Mode Theming**: Refactored CSS into an external file and added full support for Light Mode theming.
- **Fusion Enhancements**: Restructured the Fusion Lab UI with modular visual slots, interactive states, and injected a complete visual skeleton during initial fetch.
- **Agent Expansion**: Upgraded standard core agents, updated Custom Agents configurations, and replaced legacy fusions with new "Customs", "Transfusion", and "Speed Camera" agents.
- **Media Optimization**: Implemented premium lazy loading for fusion result images and added an optimized hero banner.

### 💅 Polish

- **UI & Accessibility**: Polished Agent Picker states, interactions, and Fusion Index shelf with full keyboard accessibility. Injected comprehensive tactile feedback states across `index.html`.
- **Microcopy Centralization**: Standardized core UI buttons and empty states, and polished UX copy for RosterApp errors and noscript modes.
- **Typographic Integrity**: Enforced strict typographic hierarchy, spatial rhythm standardization (`<meta-tag>`), and reinforced `.slot-card` spatial integrity.

### 🐛 Fixed

- **Medic Rescues**: Addressed fragility in FusionLab DOM insertion and rendering logic, AgentRepository network retries, and FusionIndex storage parsing.
- **Fusion Bug Fixes**: Corrected fusion agent text overlap, file fetching with spaces in filenames, and handled InvalidStateError edge cases gracefully.
- **Roster & UI Fixes**: Fixed agent card centering, main search empty state rendering, and eradicated visual ghost references across index and buttons.

### 🔧 Chores

- **Code Refactoring**: Flattened nested promise structures (e.g., `fetchPrompt`), extracted shared utilities (`PromptRenderer`, `formatAgentPrompts`, `_bindSlotInteractions`), and introduced guard clauses in `getAgents`.
- **System Maintenance**: Purged obsolete CSS, dead verification artifact screenshots, and consolidated fusion agent JSON syncing scripts into robust automated tools.
- **Documentation Overhaul**: Generated comprehensive macro-documentation for JS architecture, updated prompt specifications, and synchronized the Roadmap with the actual shipped state.

## 0.3.1 - 2026-02-25

### 💅 Polish

- **UI Tweaks**: Reduced vertical padding and margins on agent cards for a more compact layout.
- **Typography**: Increased font size of agent titles and emojis for better readability.

## 0.3.0 - 2026-02-25

### 🚀 Features

- **Fusion System Expansion**: Deployed comprehensive prompt definitions for 50+ specialized U-Tier agents (including *The Catalyst*, *The Optimist*, *The Diplomat*, and *The Narrator*).

### ⚡ Performance

- **Bolt+ Optimization**: Implemented 300ms strict debouncing on the Agent Roster search to prevent layout thrashing and improve responsiveness.

### 🔧 Chores

- **Verification Suite**: Added comprehensive Python verification scripts for all fusion combinations and visual regression baselines.

## 0.2.0 - 2026-02-20

### 🧬 The Fusion System

- **Major**: Replaced static "Power Bundles" (Triads) with dynamic **Duo Fusions**.
- Select any two agents in the Fusion Lab to unlock specialized U-Tier agents like "The Guardian", "The Virtuoso", and "The Catalyst".

### ✅ New Agents

- Added **Spark** (💡): Innovation Strategist for high-level UX and library audits.

### 🗑️ Deprecated

- Retired **Blackbox** (✈️) and **Tutor** (🎓) as their functionality is now covered by Fusions and Spark.
- Removed legacy Triad documentation (Guardian, Virtuoso, Steward, Mechanic, Librarian) in favor of the new Fusion definitions.

### 📝 Documentation

- Overhauled README to reflect the new Fusion System and updated agent roster.

## 0.1.1 - 2026-02-19

### 🐛 Fixed

- Resolved mobile layout overflow and refined agent descriptions for better readability on small screens.
- Refined microcopy in header buttons and agent descriptions to improve clarity and tone.

### 🔧 Chores

- Removed deprecated 'diffs' mechanism and associated artifacts to clean up the codebase.
- Consolidated verification scripts and removed dead code to improve maintainability.

## 0.1.0 - 2026-02-18

### ✅ New

- Added "Herald" agent (Release Manager)
- Added "Wordsmith" agent (UX Writer)
- Added "Pedant" agent (Code Quality Enforcer)
- Added "Untangler" agent (Logic Simplifier)
