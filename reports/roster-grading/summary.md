# Roster Grader Summary

## 1. Headline
Tiers: Top (83), Middle (82), Bottom (85), Unstable (0)

Top 10 Most Unstable Files:

## 2. Coverage
Found: 250
Parsed & Scored: 250
Excluded: 12
- prompts/README.md: README file
- prompts/fusions/README.md: README file
- prompts/system/DATA_FLOW.md: In prompts/system/
- prompts/system/Master-Forge.md: In prompts/system/
- prompts/system/Auto-Forge.md: In prompts/system/
- prompts/system/Forge-Procedure.md: In prompts/system/
- prompts/system/3passcleaner.md: In prompts/system/
- prompts/system/Audit-Procedure.md: In prompts/system/
- prompts/system/Core-Agents-Matrix.md: In prompts/system/
- prompts/system/Scheduled-Auto-Run.md: In prompts/system/
- prompts/system/Creative-Procedure.md: In prompts/system/
- prompts/system/Auto-Build.md: In prompts/system/

## 3. Method & Weights
Saturated Dimensions: None
Final Weights: {"A": 20, "B": 10, "C": 15, "D": 15, "E": 10, "F": 15, "H": 10}

## 4. Validation & Correlations
Length Correlation (before): {"A": -0.14, "B": -0.21, "C": 0.24, "D": 0.14, "E": 0.46, "H": -0.28, "Composite": -0.1}
Length Correlation (after): {"A": -0.14, "B": -0.21, "C": 0.24, "D": 0.14, "E": 0.46, "H": -0.28}

Dimension Correlation Matrix:
| | A | B | C | D | E | F | H |
|---|---|---|---|---|---|---|---|
| A | 1.00 | 0.45 | -0.11 | -0.12 | -0.12 | -0.01 | 0.56 |
| B | 0.45 | 1.00 | -0.20 | -0.10 | -0.31 | 0.16 | 0.36 |
| C | -0.11 | -0.20 | 1.00 | 0.23 | 0.43 | -0.23 | -0.27 |
| D | -0.12 | -0.10 | 0.23 | 1.00 | 0.13 | -0.12 | -0.18 |
| E | -0.12 | -0.31 | 0.43 | 0.13 | 1.00 | -0.49 | -0.27 |
| F | -0.01 | 0.16 | -0.23 | -0.12 | -0.49 | 1.00 | 0.18 |
| H | 0.56 | 0.36 | -0.27 | -0.18 | -0.27 | 0.18 | 1.00 |

## 5. Top 25 and Bottom 25

### Top 25
- **prompts/fusions/Sanitizer.md**: Rank 1 (p10-p90: 1-1)
  - Strengths: C (87.0), E (81.2), B (77.8)
  - Issues: H (39.8), D (67.9), A (72.5)
- **prompts/fusions/Narrator.md**: Rank 2 (p10-p90: 2-3)
  - Strengths: C (81.1), E (77.6), A (71.9)
  - Issues: H (49.1), D (51.5), B (59.1)
- **prompts/orphans/Choreographer.md**: Rank 3 (p10-p90: 2-5)
  - Strengths: A (95.9), H (80.7), C (59.4)
  - Issues: D (46.3), E (47.5), B (57.2)
- **prompts/fusions/Viewmorph.md**: Rank 4 (p10-p90: 3-6)
  - Strengths: B (87.9), A (79.4), C (74.4)
  - Issues: D (31.1), E (54.7), H (58.5)
- **prompts/fusions/Slipstream.md**: Rank 5 (p10-p90: 3-7)
  - Strengths: C (84.0), E (68.3), D (66.8)
  - Issues: H (45.2), B (57.2), A (57.6)
- **prompts/orphans/Janitor.md**: Rank 6 (p10-p90: 4-8)
  - Strengths: A (98.3), H (57.5), C (55.4)
  - Issues: D (45.0), B (49.8), C (55.4)
- **prompts/fusions/Groundskeeper.md**: Rank 7 (p10-p90: 6-9)
  - Strengths: A (85.4), E (68.3), H (65.7)
  - Issues: B (40.1), C (45.3), D (61.6)
- **prompts/fusions/Hazmat.md**: Rank 8 (p10-p90: 6-13)
  - Strengths: B (92.1), D (80.0), A (74.8)
  - Issues: E (18.6), H (41.8), C (69.7)
- **prompts/fusions/Retrofitter.md**: Rank 9 (p10-p90: 7-12)
  - Strengths: H (91.6), A (76.6), C (64.4)
  - Issues: D (25.5), E (56.0), B (60.9)
- **prompts/fusions/Millisecond.md**: Rank 10 (p10-p90: 9-13)
  - Strengths: D (77.5), C (74.0), E (63.7)
  - Issues: H (41.7), B (52.6), A (59.9)
- **prompts/Inspector.md**: Rank 11 (p10-p90: 7-16)
  - Strengths: D (92.4), E (82.7), B (77.0)
  - Issues: A (37.0), H (38.2), C (52.5)
- **prompts/fusions/Sculptor.md**: Rank 12 (p10-p90: 9-16)
  - Strengths: A (93.2), H (77.1), B (56.6)
  - Issues: D (31.1), E (45.1), C (50.3)
- **prompts/fusions/Terraformer.md**: Rank 13 (p10-p90: 10-15)
  - Strengths: C (83.0), H (72.7), D (62.0)
  - Issues: B (49.9), A (52.7), E (56.0)
- **prompts/fusions/Limiter.md**: Rank 14 (p10-p90: 10-19)
  - Strengths: E (99.2), C (76.0), H (61.8)
  - Issues: D (25.3), B (46.6), A (60.2)
- **prompts/fusions/Hyperloop.md**: Rank 15 (p10-p90: 13-17)
  - Strengths: E (80.1), C (78.2), B (73.7)
  - Issues: A (55.4), H (56.5), D (57.4)
- **prompts/fusions/Bastion.md**: Rank 16 (p10-p90: 10-29)
  - Strengths: A (94.2), C (85.9), E (80.8)
  - Issues: H (54.5), D (60.3), B (66.5)
- **prompts/Cortex.md**: Rank 17 (p10-p90: 15-21)
  - Strengths: E (89.2), B (73.5), A (56.6)
  - Issues: H (45.1), D (49.3), C (51.0)
- **prompts/fusions/Auditor.md**: Rank 18 (p10-p90: 14-21)
  - Strengths: D (80.4), A (75.3), B (54.4)
  - Issues: E (28.0), C (43.5), H (52.0)
- **prompts/fusions/Interrogator.md**: Rank 19 (p10-p90: 14-26)
  - Strengths: D (94.6), A (70.8), B (67.3)
  - Issues: H (41.4), C (58.7), E (63.0)
- **prompts/fusions/Helmsman.md**: Rank 20 (p10-p90: 18-24)
  - Strengths: E (81.5), A (69.4), B (63.0)
  - Issues: H (43.3), C (55.4), D (56.7)
- **prompts/fusions/Respawn.md**: Rank 21 (p10-p90: 18-26)
  - Strengths: C (72.0), D (70.7), B (60.5)
  - Issues: E (47.0), H (48.8), A (53.6)
- **prompts/fusions/Prophet.md**: Rank 22 (p10-p90: 17-27)
  - Strengths: A (80.9), B (78.5), C (58.1)
  - Issues: E (28.1), D (34.8), H (53.9)
- **prompts/Dispatch.md**: Rank 23 (p10-p90: 21-31)
  - Strengths: C (80.2), A (68.4), H (62.3)
  - Issues: E (28.1), B (46.0), D (52.2)
- **prompts/fusions/Ouija.md**: Rank 24 (p10-p90: 19-32)
  - Strengths: B (83.6), C (79.6), E (54.7)
  - Issues: D (28.4), A (52.0), H (52.1)
- **prompts/fusions/Echodrop.md**: Rank 25 (p10-p90: 20-33)
  - Strengths: A (84.1), H (68.1), D (63.9)
  - Issues: E (27.4), C (32.7), B (46.0)

### Bottom 25
- **prompts/fusions/Espresso.md**: Rank 226 (p10-p90: 220-229)
  - Strengths: H (52.4), E (45.9), C (39.7)
  - Issues: A (4.9), D (26.2), B (35.1)
- **prompts/fusions/Occam.md**: Rank 227 (p10-p90: 223-230)
  - Strengths: C (60.9), E (45.9), D (33.0)
  - Issues: A (3.2), B (28.7), H (31.1)
- **prompts/fusions/Checkpoint.md**: Rank 228 (p10-p90: 222-235)
  - Strengths: E (80.8), D (76.1), C (28.0)
  - Issues: A (3.0), B (8.2), H (13.6)
- **prompts/fusions/Pacemaker.md**: Rank 229 (p10-p90: 224-233)
  - Strengths: E (80.1), C (54.0), D (45.7)
  - Issues: A (3.2), B (3.7), H (10.0)
- **prompts/fusions/Archivist.md**: Rank 230 (p10-p90: 222-240)
  - Strengths: E (86.1), H (62.6), C (41.8)
  - Issues: D (14.4), A (39.0), B (41.0)
- **prompts/fusions/Canvas.md**: Rank 231 (p10-p90: 228-236)
  - Strengths: E (53.5), D (51.6), H (48.8)
  - Issues: B (5.5), A (9.5), C (26.4)
- **prompts/fusions/Typesetter.md**: Rank 232 (p10-p90: 230-237)
  - Strengths: D (54.8), C (47.4), E (45.9)
  - Issues: B (6.5), A (6.9), H (37.2)
- **prompts/Sentinel+.md**: Rank 233 (p10-p90: 228-238)
  - Strengths: B (61.1), C (46.6), D (36.0)
  - Issues: A (27.6), E (30.4), H (31.0)
- **prompts/fusions/Cataloger.md**: Rank 234 (p10-p90: 230-239)
  - Strengths: E (77.6), C (57.2), H (23.9)
  - Issues: B (16.4), D (18.5), A (19.4)
- **prompts/fusions/REST Enforcer.md**: Rank 235 (p10-p90: 228-239)
  - Strengths: B (46.5), C (40.0), E (36.9)
  - Issues: A (0.4), D (24.0), H (27.9)
- **prompts/fusions/Mulligan.md**: Rank 236 (p10-p90: 228-239)
  - Strengths: B (58.3), C (35.4), E (27.4)
  - Issues: A (12.0), H (14.9), D (20.1)
- **prompts/fusions/Illuminator.md**: Rank 237 (p10-p90: 231-240)
  - Strengths: H (63.3), E (45.9), D (35.3)
  - Issues: C (15.2), B (16.4), A (25.3)
- **prompts/fusions/Expediter.md**: Rank 238 (p10-p90: 232-240)
  - Strengths: D (67.8), C (42.2), E (36.9)
  - Issues: A (3.4), B (8.6), H (17.0)
- **prompts/micro/Nomenclator.md**: Rank 239 (p10-p90: 235-241)
  - Strengths: E (55.4), B (46.7), C (38.0)
  - Issues: D (9.7), H (10.5), A (15.3)
- **prompts/orphans/Virtuoso.md**: Rank 240 (p10-p90: 232-242)
  - Strengths: B (65.6), A (44.5), H (41.7)
  - Issues: C (4.0), E (6.3), D (24.0)
- **prompts/fusions/Examiner.md**: Rank 241 (p10-p90: 233-242)
  - Strengths: D (74.7), C (53.1), E (45.9)
  - Issues: A (2.6), H (16.1), B (30.6)
- **prompts/fusions/Foreman.md**: Rank 242 (p10-p90: 240-243)
  - Strengths: H (34.2), B (32.3), E (30.4)
  - Issues: A (4.3), C (26.5), D (28.4)
- **prompts/fusions/Logician.md**: Rank 243 (p10-p90: 243-244)
  - Strengths: E (53.5), H (39.4), C (25.6)
  - Issues: D (15.9), A (16.4), B (20.0)
- **prompts/fusions/Pruner.md**: Rank 244 (p10-p90: 242-245)
  - Strengths: E (73.1), H (35.8), C (32.2)
  - Issues: B (11.6), A (13.9), D (17.2)
- **prompts/fusions/Upgrader.md**: Rank 245 (p10-p90: 243-245)
  - Strengths: B (61.2), D (35.3), H (27.7)
  - Issues: A (7.3), E (12.6), C (14.2)
- **prompts/fusions/Cartographer.md**: Rank 246 (p10-p90: 246-248)
  - Strengths: E (77.6), H (52.0), B (33.0)
  - Issues: D (15.6), C (23.3), A (25.4)
- **prompts/micro/Echo.md**: Rank 247 (p10-p90: 247-249)
  - Strengths: E (72.6), C (39.4), A (28.1)
  - Issues: D (6.9), B (16.4), H (20.3)
- **prompts/fusions/Lumen.md**: Rank 248 (p10-p90: 246-249)
  - Strengths: E (63.7), D (27.6), C (21.6)
  - Issues: B (4.7), A (8.2), H (13.7)
- **prompts/fusions/Prompt Engineer.md**: Rank 249 (p10-p90: 247-249)
  - Strengths: B (95.6), H (28.1), E (15.1)
  - Issues: A (3.6), C (5.4), D (13.7)
- **prompts/fusions/Sherpa.md**: Rank 250 (p10-p90: 250-250)
  - Strengths: C (52.8), B (42.8), E (21.4)
  - Issues: A (0.0), D (1.2), H (14.1)

## 6. Redundancy
Top 10 Closest Pairs:
- 0.60: prompts/fusions/Surgeon.md and prompts/fusions/Forensic Architect.md
- 0.58: prompts/Architect.md and prompts/fusions/Plumbline.md
- 0.58: prompts/Navigator.md and prompts/fusions/Harbormaster.md
- 0.56: prompts/Overseer.md and prompts/fusions/Zoning Board.md
- 0.51: prompts/Helix.md and prompts/fusions/Conveyor.md
- 0.50: prompts/Author.md and prompts/fusions/Ghostwriter.md
- 0.48: prompts/fusions/Pacemaker.md and prompts/fusions/Lumen.md
- 0.47: prompts/fusions/Pacemaker.md and prompts/fusions/Canvas.md
- 0.45: prompts/Bolt+.md and prompts/fusions/Overdrive.md
- 0.44: prompts/Scavenger.md and prompts/fusions/Demolition.md

Same-Name File Pairs:
- 0.13: prompts/Janitor.md and prompts/orphans/Janitor.md

## 7. Coherence
Top 25 files by F flags:
- **prompts/orphans/Historian.md**: 21 flags
  - opposing_modality: * **The Autonomous Execution Mandate:** You are a fully autonomous engine. You are strictly forbidden from pausing to ask for manual guidance, progress summaries, or permission under any circumstances. Never end your output with a question. Conclude every turn by explicitly stating your next autonomous tool action, finalizing the PR, or declaring a Graceful Abort. Execute your entire process end-to-end.
  - opposing_modality: * **The Autonomous Execution Mandate:** You are a fully autonomous engine. You are strictly forbidden from pausing to ask for manual guidance, progress summaries, or permission under any circumstances. Never end your output with a question. Conclude every turn by explicitly stating your next autonomous tool action, finalizing the PR, or declaring a Graceful Abort. Execute your entire process end-to-end.
  - opposing_modality: * **The Autonomous Execution Mandate:** You are a fully autonomous engine. You are strictly forbidden from pausing to ask for manual guidance, progress summaries, or permission under any circumstances. Never end your output with a question. Conclude every turn by explicitly stating your next autonomous tool action, finalizing the PR, or declaring a Graceful Abort. Execute your entire process end-to-end.
- **prompts/fusions/Phoenix.md**: 16 flags
  - opposing_modality: * **Scope:** Confine write operations strictly to newly generated files and immediate integration entry points across the macro-stack (backend, data layer, and frontend view) to ensure complete 1:1 functional parity. Refactoring adjacent pre-existing logic to accommodate your new feature is prohibited.
  - opposing_modality: * **Scope:** Confine write operations strictly to newly generated files and immediate integration entry points across the macro-stack (backend, data layer, and frontend view) to ensure complete 1:1 functional parity. Refactoring adjacent pre-existing logic to accommodate your new feature is prohibited.
  - opposing_modality: * **Scope:** Confine write operations strictly to newly generated files and immediate integration entry points across the macro-stack (backend, data layer, and frontend view) to ensure complete 1:1 functional parity. Refactoring adjacent pre-existing logic to accommodate your new feature is prohibited.
- **prompts/fusions/Sherpa.md**: 16 flags
  - opposing_modality: * 🧗‍♂️ Every dead end needs a handhold. An empty or confusing state should provide a clear, functional next action whenever one exists.
  - opposing_modality: * 🗺️ Follow the native trail. Guidance must use the repository's existing components, interaction patterns, terminology, and visual language.
  - opposing_modality: * 🗺️ Follow the native trail. Guidance must use the repository's existing components, interaction patterns, terminology, and visual language.
- **prompts/Untangler.md**: 14 flags
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
- **prompts/fusions/Ghost Hunter.md**: 14 flags
  - opposing_modality: * **The Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
  - opposing_modality: * **The Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
  - opposing_modality: * **The Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
- **prompts/fusions/Cerberus.md**: 13 flags
  - opposing_modality: * **The Execution Rule:** Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * **The Execution Rule:** Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * **The Execution:** Execute global or integration test suites to mathematically prove injected type-guards do not block valid data flow. You MUST execute the Sad Path test block to prove boundary resilience. If your defense breaks an existing logic test, fix the instrumentation.
- **prompts/fusions/Adversary.md**: 12 flags
  - opposing_modality: * 🥷 I do not test the code; I test the environment that tests the code, leaving a hardened boundary that strictly traps deterministic runner failures.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 3 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 3 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/Vibe Check.md**: 11 flags
  - opposing_modality: * **The Workspace Validator:** Before classifying any import or interface as orphaned or hallucinated, explicitly traverse upward to verify root-level monorepo manifests, hoisted lockfiles, and `workspace:*` symlinks to ensure the dependency is not inherited from a parent configuration.
  - opposing_modality: * **The Re-evaluation Mandate:** If you execute a `git restore` or `git checkout -- .` to recover from a `SyntaxError`, you must re-evaluate your target from scratch, as previous successful AST mutations will have been wiped. Preserve `.jules/` memory files.
  - opposing_modality: * **The Re-evaluation Mandate:** If you execute a `git restore` or `git checkout -- .` to recover from a `SyntaxError`, you must re-evaluate your target from scratch, as previous successful AST mutations will have been wiped. Preserve `.jules/` memory files.
- **prompts/fusions/Amputator.md**: 11 flags
  - opposing_modality: * **The Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
  - opposing_modality: * **The Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 3 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Smith.md**: 11 flags
  - opposing_modality: * ⚙️ Execution must be cold and localized; surgically eradicate the targeted anomaly without expanding the blast radius or negotiating with the operator.
  - opposing_modality: * **Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
  - opposing_modality: * **Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
- **prompts/fusions/Yggdrasil.md**: 11 flags
  - opposing_modality: * 🌳 Never force an unnatural graft; paradigm mutations must align organically with the target language's native ecosystem and idiomatic best practices.
  - opposing_modality: * 🌳 Never force an unnatural graft; paradigm mutations must align organically with the target language's native ecosystem and idiomatic best practices.
  - opposing_modality: * 🌳 Never force an unnatural graft; paradigm mutations must align organically with the target language's native ecosystem and idiomatic best practices.
- **prompts/fusions/Zealot.md**: 10 flags
  - opposing_modality: * **The Boundary Scope:** Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Collider.md**: 10 flags
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
- **prompts/fusions/Payload.md**: 10 flags
  - opposing_modality: * Treat test files as immutable and read-only. If a mutation breaks a test, do not modify the test to pass. Either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert.
  - opposing_modality: * **The Infrastructure Rule:** You are strictly forbidden from implementing or bootstrapping complex Redis or Memcached infrastructure. You must utilize native in-memory caching or aggressive HTTP edge headers exclusively.
  - opposing_modality: * **The Infrastructure Rule:** You are strictly forbidden from implementing or bootstrapping complex Redis or Memcached infrastructure. You must utilize native in-memory caching or aggressive HTTP edge headers exclusively.
- **prompts/Scavenger.md**: 9 flags
  - opposing_modality: * 🪲 The code is the bone, the dead syntax is the flesh. You do not stop when a single meal is found; you swarm the target file and feed persistently until the living architecture is immaculate.
  - opposing_modality: * 🪲 The code is the bone, the dead syntax is the flesh. You do not stop when a single meal is found; you swarm the target file and feed persistently until the living architecture is immaculate.
  - opposing_modality: * **Scope:** Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
- **prompts/fusions/Policy Maker.md**: 9 flags
  - opposing_modality: * **Recurring Review Trigger:** Invoke the platform code reviewer (`request_code_review`) on a recurring basis during execution — approximately every 15 tool calls — not only at session end or between targets. Do not tell the reviewer how to do its job or what to check; only specify that it runs, and that you must act on what it reports (revert what it flags as out of scope) before continuing.
  - opposing_modality: * **Recurring Review Trigger:** Invoke the platform code reviewer (`request_code_review`) on a recurring basis during execution — approximately every 15 tool calls — not only at session end or between targets. Do not tell the reviewer how to do its job or what to check; only specify that it runs, and that you must act on what it reports (revert what it flags as out of scope) before continuing.
  - opposing_modality: * **Recurring Review Trigger:** Invoke the platform code reviewer (`request_code_review`) on a recurring basis during execution — approximately every 15 tool calls — not only at session end or between targets. Do not tell the reviewer how to do its job or what to check; only specify that it runs, and that you must act on what it reports (revert what it flags as out of scope) before continuing.
- **prompts/fusions/Calligrapher.md**: 9 flags
  - opposing_modality: ⚡ The Flash Mitigator: We ensure text is immediately visible during web font loading using asynchronous paths and swap constraints.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 3 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 3 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Antibody.md**: 9 flags
  - opposing_modality: * 🔥 True resuscitation requires extreme stress; a test must be broken forcefully and repeatedly in a controlled local loop before it can be healed permanently.
  - opposing_modality: * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).
  - opposing_modality: * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).
- **prompts/fusions/Bastion.md**: 9 flags
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Archivist.md**: 9 flags
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Automata.md**: 9 flags
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
  - opposing_modality: * Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly 7 targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.
- **prompts/fusions/Bulwark.md**: 8 flags
  - opposing_modality: * **The Scope:** Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.
  - opposing_modality: * **The Scope:** Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.
  - opposing_modality: * **The Verification Procedure:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
- **prompts/fusions/Cartographer.md**: 8 flags
  - opposing_modality: * ⚖️ Accuracy vs. Noise—Never map every single 1-line utility file into a global diagram to prevent unreadable visual spaghetti; map the core domain modules.
  - opposing_modality: * **The Noise Reduction Protocol:** Ingest all data within radius, filter noise, and map the systemic state. Ensure the blast radius targets exactly ONE scope context.
  - opposing_modality: * **The Noise Reduction Protocol:** Ingest all data within radius, filter noise, and map the systemic state. Ensure the blast radius targets exactly ONE scope context.
- **prompts/fusions/Surveyor.md**: 8 flags
  - opposing_modality: * ⛏️ Structural Isolation: Global mocks must be decentralized to the specific test files that require them.
  - opposing_modality: * Bounded-sweep posture: traverse the repository to locate targets, then abort execution upon mutating exactly 5 targets. Never exceed this quota. Submit PR immediately upon reaching the ceiling.
  - opposing_modality: * **The Decisiveness Rule:** Silently identify all AST nodes violating the target structural pattern. Do not pause to ask the operator for stylistic preferences or metadata definitions. Lock onto the targets according to declared priority weighting up to your limit, execute the batch transformation natively, log the remaining unhandled files, and proceed.
- **prompts/fusions/Marshal.md**: 8 flags
  - opposing_modality: * **Immutable Tests:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **Immutable Tests:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.
  - opposing_modality: * **Immutable Tests:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.

## 8. Recurring Tensions
- ('treat all test files as immutable and read-only. if a structural mutation causes a test failure, do not modify the test file to accommodate your change. you must either prove the test was already failing on the main branch, or execute an immediate graceful abort and full revert.', '✅ **verify** — **the reporter protocol:** * verify your mutations incrementally. you may test sequentially due to the complexity of your domain, but you have a maximum of 3 verification attempts per target. do not treat changing error messages as forward progress. if you cannot cleanly verify the target within 3 attempts due to flaky test runners or environmental opacity, do not panic and do not abort the entire session. treat verification as a reporter, not a gatekeeper. accept that the environment is hostile, retain your successful ast mutations, and proceed.'): 5 files

## 9. Spot Check Sample
- prompts/fusions/Sanitizer.md (Rank 1)
- prompts/fusions/Narrator.md (Rank 2)
- prompts/orphans/Choreographer.md (Rank 3)
- prompts/fusions/Viewmorph.md (Rank 4)
- prompts/fusions/Slipstream.md (Rank 5)
- prompts/fusions/Cartographer.md (Rank 246)
- prompts/micro/Echo.md (Rank 247)
- prompts/fusions/Lumen.md (Rank 248)
- prompts/fusions/Prompt Engineer.md (Rank 249)
- prompts/fusions/Sherpa.md (Rank 250)

## 10. Tool Lexicon & Inventory
Top Tools:
- main: 145
- git: 114
- package.json: 53
- if: 36
- npm: 25
- const: 25
- var: 20
- npx: 18
- catch: 17
- let: 17
- for: 17
- apt-get: 16
- any: 15
- null: 15
- aria-label: 14
- undefined: 14
- docker-compose.yml: 13
- docker: 13
- index.ts: 13
- throw: 12
- en.json: 10
- opacity: 9
- transform: 9
- grep: 8
- fetch: 8
- apt: 8
- finally: 8
- tsc: 7
- export: 7
- false: 7
- tsconfig.json: 7
- import: 7
- describe: 7
- roster-payload.json: 6
- while: 6
- focus-visible: 6
- agent_tasks.md: 6
- next.config.js: 6
- height: 6
- return: 6
- await: 6
- tailwind.config.js: 6
- tools: 6
- margin: 5
- switch: 5
- class: 5
- except: 5
- xit: 5
- functions: 5
- it: 5
- dependabot.yml: 4
- process.env: 4
- requirements.txt: 4
- axios: 4
- v2: 4
- error: 4
- req.body: 4
- transition: 4
- try-catch: 4
- href: 4

Missing Tools:
- subgraph (used by prompts/fusions/Cartographer.md)
- patch (used by prompts/fusions/Siren.md)
- node_modules (used by prompts/fusions/Foreman.md, prompts/fusions/Decoder.md, prompts/Pedant.md)
- app.scss (used by prompts/fusions/Purger.md)
- max-height (used by prompts/orphans/Choreographer.md)
- read_file (used by prompts/orphans/Caliper.md, prompts/orphans/Canon.md)
- variables.css (used by prompts/fusions/Stylist.md, prompts/orphans/Caliper.md)
- config (used by prompts/fusions/Expediter.md)
- dotenv (used by prompts/fusions/Steward.md)
- index.js (used by prompts/fusions/Registrar.md)
- theme.scss (used by prompts/fusions/Quartermaster.md)
- href (used by prompts/fusions/Helmsman.md, prompts/fusions/Redirector.md)
- preconnect (used by prompts/fusions/Calligrapher.md)
- stdout (used by prompts/fusions/Hitman.md)
- logger.error (used by prompts/fusions/Toxicologist.md)
- telemetry (used by prompts/orphans/Redactor.md)
- v4.3.1 (used by prompts/fusions/Manifest.md)
- eslint.config.js (used by prompts/fusions/Zealot.md)
- opts.age (used by prompts/fusions/Collider.md)
- async (used by prompts/fusions/Inoculator.md)
- title (used by prompts/orphans/orphans.md, prompts/orphans/Canon.md, prompts/orphans/Polyglot.md)
- to (used by prompts/fusions/Helmsman.md)
- package-lock.json (used by prompts/fusions/Upgrader.md, prompts/fusions/Jeweler.md, prompts/fusions/Hazmat.md)
- auth.json (used by prompts/orphans/orphans.md, prompts/orphans/Polyglot.md)
- date-fns (used by prompts/Navigator.md)
- err.message (used by prompts/orphans/Diplomat.md)
- ls (used by prompts/Navigator.md, prompts/fusions/Harbormaster.md, prompts/Scribe.md)
- performance.hints (used by prompts/fusions/Accountant.md)
- address_length (used by prompts/fusions/Spellchecker.md)
- vw (used by prompts/fusions/Viewmorph.md)
- key (used by prompts/fusions/Revoker.md)
- disallow_untyped_defs (used by prompts/fusions/Zealot.md)
- echo (used by prompts/Overseer.md)
- import (used by prompts/fusions/Purger.md, prompts/fusions/Transition Manager.md, prompts/fusions/Collider.md)
- access_key_id (used by prompts/fusions/Keymaster.md)
- requirements.txt (used by prompts/fusions/Marshal.md, prompts/fusions/Watchtower.md, prompts/Vibe.md)
- pg_restore (used by prompts/fusions/Marshal.md)
- terraform (used by prompts/fusions/Marshal.md)
- tail (used by prompts/fusions/Decoder.md)
- fix.diff (used by prompts/Janitor.md)

## 11. Effect Report

## 12. Reference Check and Human Anchors
Hazmat: 8
Paramedic: 115
Virtuoso: 240
Tokenizer: 176
Synchronizer: 216
Speed Camera: 91
Upgrader: 245

## 13. Blind Spots
The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
