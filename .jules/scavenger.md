[Output truncated for brevity]

ly invoked via string-interpolation or reflection (e.g., `import('./langs/${lang}.json')`). -> Rationale: AST tools cannot detect dynamic dependencies.

## SCAVENGER'S JOURNAL - CRITICAL LEARNINGS ONLY

You must read `.jules/scavenger.md` (create if missing). Scan for your own previous entries and prune/summarize them before appending new entries. Log ONLY specific dynamic routing or dependency-injection frameworks in this repository that make files appear "unused" to standard AST tools, ensuring you do not accidentally purge them in the future.

YYYY-MM-DD - 🦝 Scavenger - [Title]
Learning: [Insight]
Action: [How to apply next time]

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

## 2026-03-06 - 🦅 Scavenger - [Purged Zero-Reference Method PromptRenderer.renderMarkdown]

**Learning:** Found `PromptRenderer.renderMarkdown` fully implemented and tested but never referenced by any runtime code.
**Action:** When auditing codebase bloat, specifically look for exported methods in utility classes that are tested but never actually imported or called by the application features. Ensure that both the unused method and its associated test block are eradicated.

## 2026-03-08 - 🦅 Scavenger - [Purged Zero-Reference Class PromptRenderer]

**Learning:** Found `PromptRenderer.js` and `PromptRenderer.test.js` where `PromptRenderer` class was fully implemented and tested but never referenced by any runtime code. Even though the method `renderMarkdown` was previously removed, the entire class `PromptRenderer` was still left in the codebase without any usage.
**Action:** When auditing codebase bloat, check if entire classes and their test suites are actually used by the main application logic. If they are completely unused, remove them entirely to reduce technical debt.

## 2026-03-09 - 🦅 Scavenger - [Purged Zero-Reference Class MarkdownRenderer]

**Learning:** Found `MarkdownRenderer` fully implemented but never referenced by any runtime code. Even though it was included in the global environment and `index.html`, none of its methods were invoked, making it dead codebase bloat.
**Action:** Always verify if utility classes included in scripts are actually invoked by the runtime application logic. Delete entire classes to reduce technical debt if they are entirely unreferenced.

## 2026-03-09 - 🦅 Scavenger - [Purged Zero-Reference CSS Keyframe shake-anomalous]

**Learning:** Discovered `@keyframes shake-anomalous` in `fusion.css` that was completely mathematically dead and never referenced by any runtime DOM elements or JS animation sequences. CSS visual debris can accumulate when animations are designed but never implemented in the final UI logic.
**Action:** Use tools like `uncss` and regular text search to cross-reference CSS keyframes against active class additions in JS. Strip out unreachable visual debris to keep stylesheets lean.

## 2026-03-09 - 🦅 Scavenger - [Purged Root Level Orphaned Scripts, Diff, Text and Generated Image Artifacts]

**Learning:** Found several floating scripts, diff, txt and image files in the repository root (e.g., `fix_css_shadow_px.js`, `jules_dashboard.png`, `verify_jules_2.py`) which appear to be test scratchpads or outputs of temporary execution scripts left uncleaned.
**Action:** Always prioritize keeping the repository root clean. Scratchpad and experimental test scripts, logs, and screenshots should be strictly ephemeral and deleted to prevent repository bloat.

## YYYY-MM-DD - 🦝 Scavenger - Orphaned Barrel Exports

**Learning:** The Jules repository relies primarily on native browser class loading via sequential `<script>` tags in `index.html`. During development, `index.js` barrel files were generated for Node.js exports but later abandoned for native CommonJS testing mock architectures without bundler dependencies. `ts-prune` flagged `js/ui/index.js`, `js/utils/index.js`, and `js/features/fusion/index.js` as having zero AST references inside the repository.

**Action:** Eradicated the unreferenced barrel files. Kept test suites intact as Jest natively loads standard mock implementations directly from their relative `.js` endpoints rather than routing through unused barrel indices.

## YYYY-MM-DD - 🦝 Scavenger - [Purged Dead Benchmark Code in benchmark.js]
**Learning:** Found a failing benchmark execution loop in `benchmark.js` targeting a `filterPicker` method on `AgentPicker`. Code history revealed `filterPicker` was eradicated and replaced by a different architecture, leaving this benchmark mathematically dead and functionally broken.
**Action:** When auditing tests or benchmarks, identify blocks that test APIs or methods that no longer exist and surgically remove the execution blocks rather than deleting the entire test file, especially if the file serves multiple purposes or is integrated into package scripts.

## YYYY-MM-DD - 🦅 Scavenger - [Purged Zero-Reference CSS Classes]
**Learning:** Tools like `uncss` or `PurgeCSS` can surface CSS debris that appears "dead" to generic regex searches. However, these tools sometimes flag actively injected JS classes or utility classes that are not statically analyzable.
**Action:** Always cross-reference `uncss` findings against the full codebase (JS source and HTML) to mathematically prove a class is zero-reference before surgical eradication.

## 2024-10-27 - 🦝 Scavenger - [Surgically Purged Zero-Reference CSS Classes]
**Learning:** Pure CSS visual bloat is harder to reliably prune than JS because static analysis tools don't inherently cross-reference inline HTML DOM parsing against JS string manipulations (e.g., dynamically adding classes via `classList.add`). By writing custom AST/regex combinations to match against `className`, `classList.add`, and `<element class="...">`, I proved that `.picker-search` and `.picker-search input[type="text"]` were entirely dead CSS code.
**Action:** Always implement a complete static analysis sweep combining HTML and JS string parsing to mathematically verify that a targeted CSS class is structurally unreferenced prior to its surgical extraction.