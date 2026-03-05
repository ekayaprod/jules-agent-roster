# Scavenger's Log

## 2025-05-24 - Dead Code in FusionCompiler

**Learning:** Discovered `FusionCompiler.validateFusionOutput` was fully implemented but never called by the application logic. It was only used by a dedicated verification script `verify_polygraph.py`. This is a classic example of "Speculative Generality" or "Ghost Code" where a feature is built and tested but never wired up.

**Action:** When auditing files, always check if exported methods are actually imported and used by the main application, not just by tests.

## 2026-02-25 - Outdated Verification Scripts

**Learning:** Discovered that existing Playwright verification scripts (e.g., `verify_fusion.py`, `verify_polished_fusion.py`) are outdated and fail because they expect `<select>` elements for Fusion Lab slots, which have been replaced by a custom visual UI (`.fusion-visual-slots`).

**Action:** When working on Fusion Lab, do not rely on existing verification scripts without first checking if they align with the current DOM structure. Create custom verification scripts or update existing ones to interact with the new UI components.

## 2026-05-25 - Purged Outdated Fusion Verification Scripts

**Learning:** Removed `verify_fusion.py`, `verify_polished_fusion.py`, and `capture_fusion_ui.py`. These scripts were identified as "dead code" because they targeted a legacy UI structure (HTML `<select>` elements) that no longer exists in `index.html`. Keeping broken tests creates false negatives and confusion.

**Action:** Regularly audit the `verification/` folder to ensure tests match the current UI. If a feature is refactored, its associated verification scripts must be updated or deleted immediately to prevent debt accumulation.

## 2026-06-15 - Purged Root Test Scratchpads

**Learning:** The root directory was cluttered with `test_*.py` files (e.g., `test_script.py`, `test_regex.py`) that were being used as temporary scratchpads rather than a formal, automated test suite.

**Action:** Always prioritize keeping the repository root clean. Scratchpad and experimental test scripts should be strictly ephemeral and deleted before merging.

## 2026-06-25 - Dead Extracted Ghost Class

**Learning:** Discovered `FusionAnimation.js` was created to handle the fusion animation sequence, likely by the Sculptor persona extracting logic from `FusionLab.js`. However, `FusionLab.js` was never actually modified to call the extracted `animation.play()` method, instead keeping and using its own monolith `runAnimation` function. This created an entirely dead class that was instantiated but never invoked.

**Action:** Always verify that newly extracted classes are not just instantiated, but actually *used* in place of the original monolith code.

## 2026-07-02 - Purged Root Level Scratchpads and Generated Image Artifacts

**Learning:** Found temporary python scripts like `analyze_pass7.py` and generated screenshot files floating in the repository root. Static analysis tools initially flagged `.test.js` files as unused because test files are typically unimported by runtime logic, highlighting a flaw in purely relying on AST parsers for test structures.

**Action:** Ensure temporary execution scripts or image artifacts are strictly ephemeral and do not persist in the main codebase. Do not delete test suite entry files (`.test.js`) just because they lack runtime imports; use dedicated test-runner configurations to audit active test paths.
## 2024-03-04 - 🦅 Scavenger - Major Code Purge: Recently Used Section
**Learning:** The "Recently Used" feature, consisting of UI grid rendering logic and local storage caching, was unused and marked as obsolete debris in the Overseer report.
**Action:** Removed the `RecentlyUsedManager.js`, associated HTML elements, and references across `RosterApp.js` and `benchmark.js`. The benchmark tests and the core functionality logic continue to perform optimally within standard tolerances.

## 2026-08-01 - 🦅 Scavenger - Purged Root Level Orphaned Scripts and Test Scratchpads

**Learning:** Discovered several orphaned node scripts (`parse_all.js`, `get_type.js`), root-level test scratchpads (`test_card.js`), generated image artifacts (`custom_agents_ui.png`, `verification1.png`), and temporary markdown files (`emojiaudit.md`) polluting the repository root. These files were either one-off utilities or temporary scratchpads that were never cleaned up.

**Action:** Consistently purge root-level generated artifacts, orphaned utility scripts, and test scratchpads that are not part of the active core project functionality or test suite execution to maintain a clean workspace.
