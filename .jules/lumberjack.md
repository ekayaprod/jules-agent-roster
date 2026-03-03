## 2026-03-03 - 🪓 Lumberjack - [Dead Execution Tree Cleared: isCustom]
**Learning:** Found and analyzed `isCustom` UI logic flags that were rendered dead by centralized logic in `AgentRepository.js` and `FormatUtils.extractIcon()`.
**Action:** Removed hardcoded boolean assignments from `FusionCompiler.js` and flattened the standard/custom execution branch in `FusionLab.js`, eliminating dead Emoji Kitchen scaffolding logic that was confusing developers.
