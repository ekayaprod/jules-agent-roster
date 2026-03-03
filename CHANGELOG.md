# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
