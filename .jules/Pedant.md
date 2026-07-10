## Pedant — Truthiness, Coercion, Unsorted Lists, Missing Types
**Learning:** Hardcoded literal values, implicit coercion `!!`, truthiness based on lengths, unsorted object literals and missing function return types create stylistic entropy and mathematical unpredictability.
**Action:** Enforced absolute structural predictability by:
1) Sorting UI config constants in `js/constants/ui.js` alphabetically.
2) Injecting explicit `/** @returns {...} */` into `AgentPicker.js`, `ExportController.js`, `FusionIndex.js`, and `FusionLab.js` docblocks to eliminate implicit typological uncertainty.
