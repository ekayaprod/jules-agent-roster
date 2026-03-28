## The Highlander — The Custom Agent Resolution Equilibrium

**Learning:** Found multiple scattered implementations of `getCustomAgent` across `RosterApp.js` and `FusionIndex.js`, causing redundant lookups and fracturing the repository's single-source-of-truth.
**Action:** Eradicated the scattered pretenders and rewired all consumers (including `SearchController.js` and test suites) to explicitly use the absolute source: `AgentUtils.getCustomAgent(customAgents, key)`. When adding new utilities or dependencies that are required during runtime tests, always remember to instantiate them in `benchmark.js` using the custom `loadClass` pattern.

## The Highlander — The Fusion Key Convergence

**Learning:** Discovered scattered `split(",")` and `sort().join(",")` loops across `FusionLab.js`, `FusionCompiler.js`, and `AgentRepository.js` used to parse and combine agent names, violating the single-source-of-truth.
**Action:** Extracted the core logic into two supreme utilities `AgentUtils.getFusionKey` and `AgentUtils.splitFusionKey`, eradicated the redundant pretenders, and rewired all consumers.
