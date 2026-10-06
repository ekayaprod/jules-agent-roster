# Roster Grader Summary (Run 2)

## 1. Coverage
- Files discovered and scored: 248
- Files excluded: 13
  - `prompts/README.md`: Matches README*.md
  - `prompts/fusions/README.md`: Matches README*.md
  - `prompts/system/DATA_FLOW.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Master-Forge.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Auto-Forge.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Forge-Procedure.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/3passcleaner.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Audit-Procedure.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Core-Agents-Matrix.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Scheduled-Auto-Run.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Creative-Procedure.md`: Inside excluded directory (prompts/system/)
  - `prompts/system/Auto-Build.md`: Inside excluded directory (prompts/system/)
  - `prompts/orphans/orphans.md`: Contains 3 or more '- role:' lines (28)

## 2. Method and Judgments
Weights used: {"A": 20, "B": 10, "C": 15, "D": 15, "E": 10, "F": 15, "G": 5, "H": 10}
Judgment Calls: Opposing modalities require matching verb stem and object, avoiding self-comparison. Dangling refs ignore fences/inline code and Vue/React template syntax.

## 3. Validation Results
### Test Output
```
All tests passed.
..........
----------------------------------------------------------------------
Ran 10 tests in 0.075s

OK

```
### Length Correlations
- **A**: 0.32
- **B**: -0.10
- **C**: 0.21
- **D**: 0.11
- **E**: 0.35
- **F**: -0.20
- **G**: 0.13
- **H**: 0.78 ⚠️ FLAG
- **composite**: 0.45

### Dimension Correlations (>0.5 shown)


## 4. Rankings
### Top 25
- **1. Collider** (prompts/fusions/Collider.md) - Comp: 89.33
  - *Strengths*: A (98.8), F (100.0), G (100.0)
  - *Issues*: B (32.7), D (86.7), E (92.3)
- **2. Adversary** (prompts/fusions/Adversary.md) - Comp: 88.57
  - *Strengths*: D (98.0), F (100.0), G (100.0)
  - *Issues*: B (46.0), A (80.2), E (92.3)
- **3. Paramedic** (prompts/Paramedic.md) - Comp: 88.45
  - *Strengths*: C (99.6), F (100.0), G (100.0)
  - *Issues*: E (54.8), B (78.2), A (83.5)
- **4. Hazmat** (prompts/fusions/Hazmat.md) - Comp: 85.12
  - *Strengths*: C (97.6), F (100.0), G (100.0)
  - *Issues*: E (35.9), H (64.1), A (83.9)
- **5. Interrogator** (prompts/fusions/Interrogator.md) - Comp: 82.90
  - *Strengths*: A (94.4), F (100.0), G (100.0)
  - *Issues*: B (60.1), E (66.1), C (67.7)
- **6. Foresight** (prompts/fusions/Foresight.md) - Comp: 82.46
  - *Strengths*: A (95.6), F (100.0), G (100.0)
  - *Issues*: B (14.9), E (79.0), H (81.9)
- **7. Zealot** (prompts/fusions/Zealot.md) - Comp: 81.92
  - *Strengths*: C (98.4), F (100.0), G (100.0)
  - *Issues*: E (47.2), B (52.8), H (71.0)
- **8. Temporal Loom** (prompts/fusions/Temporal Loom.md) - Comp: 81.61
  - *Strengths*: A (97.2), F (100.0), G (100.0)
  - *Issues*: B (17.7), D (65.3), C (82.3)
- **9. Pedant** (prompts/Pedant.md) - Comp: 81.49
  - *Strengths*: E (99.6), F (100.0), G (100.0)
  - *Issues*: D (37.5), B (50.8), C (77.0)
- **10. Flourish** (prompts/fusions/Flourish.md) - Comp: 80.58
  - *Strengths*: E (93.5), F (100.0), G (100.0)
  - *Issues*: D (43.1), C (72.6), H (76.6)
- **11. Quarantine** (prompts/fusions/Quarantine.md) - Comp: 80.50
  - *Strengths*: C (98.0), F (100.0), G (100.0)
  - *Issues*: B (36.3), H (62.5), A (71.0)
- **12. Scavenger** (prompts/Scavenger.md) - Comp: 79.64
  - *Strengths*: H (93.1), F (100.0), G (100.0)
  - *Issues*: B (46.4), D (46.4), C (73.8)
- **13. Construct** (prompts/fusions/Construct.md) - Comp: 79.50
  - *Strengths*: H (98.8), F (100.0), G (100.0)
  - *Issues*: B (22.2), C (53.6), D (79.8)
- **14. Redirector** (prompts/fusions/Redirector.md) - Comp: 78.21
  - *Strengths*: E (96.4), F (100.0), G (100.0)
  - *Issues*: B (3.6), D (61.3), C (76.2)
- **15. Coroner** (prompts/fusions/Coroner.md) - Comp: 78.15
  - *Strengths*: A (91.9), F (100.0), G (100.0)
  - *Issues*: C (20.2), B (63.3), H (77.8)
- **16. Watchtower** (prompts/fusions/Watchtower.md) - Comp: 76.88
  - *Strengths*: A (98.0), F (100.0), G (100.0)
  - *Issues*: B (24.6), H (43.1), D (69.8)
- **17. Acetone** (prompts/fusions/Acetone.md) - Comp: 76.11
  - *Strengths*: E (99.2), F (100.0), G (100.0)
  - *Issues*: B (19.8), C (47.6), D (56.9)
- **18. Cerberus** (prompts/fusions/Cerberus.md) - Comp: 76.01
  - *Strengths*: A (96.8), H (99.2), G (100.0)
  - *Issues*: F (3.2 - [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 56) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 67)), C (71.4), B (72.6)
- **19. Bulwark** (prompts/fusions/Bulwark.md) - Comp: 75.34
  - *Strengths*: C (93.1), F (100.0), G (100.0)
  - *Issues*: B (27.4), E (54.8), A (57.7)
- **20. Inspector** (prompts/Inspector.md) - Comp: 74.64
  - *Strengths*: D (99.2), F (100.0), G (100.0)
  - *Issues*: E (40.3), C (54.0), H (60.1)
- **21. Overdrive** (prompts/fusions/Overdrive.md) - Comp: 74.58
  - *Strengths*: D (89.9), F (100.0), G (100.0)
  - *Issues*: E (36.7), A (59.3), B (61.3)
- **22. Reroll** (prompts/fusions/Reroll.md) - Comp: 74.21
  - *Strengths*: D (89.1), F (100.0), G (100.0)
  - *Issues*: C (29.8), B (66.1), E (66.1)
- **23. Revoker** (prompts/fusions/Revoker.md) - Comp: 73.83
  - *Strengths*: D (81.9), F (100.0), G (100.0)
  - *Issues*: B (37.5), C (57.7), H (63.3)
- **24. Architect** (prompts/Architect.md) - Comp: 73.13
  - *Strengths*: A (89.1), F (100.0), G (100.0)
  - *Issues*: E (19.4), D (35.1), H (72.6)
- **25. Plumbline** (prompts/fusions/Plumbline.md) - Comp: 73.04
  - *Strengths*: B (94.0), F (100.0), G (100.0)
  - *Issues*: H (23.0), E (33.5), D (63.3)

### Bottom 25
- **224. Standardizer** (prompts/fusions/Standardizer.md) - Comp: 44.66
  - *Strengths*: B (70.2), F (100.0), G (100.0)
  - *Issues*: H (4.8), E (23.8), C (27.8)
- **225. Tachyon** (prompts/fusions/Tachyon.md) - Comp: 44.46
  - *Strengths*: E (75.8), F (100.0), G (100.0)
  - *Issues*: H (2.0), A (5.2), D (24.2)
- **226. Sunsetter** (prompts/fusions/Sunsetter.md) - Comp: 43.71
  - *Strengths*: E (55.6), F (100.0), G (100.0)
  - *Issues*: A (8.5), C (15.3), H (23.8)
- **227. Overclock** (prompts/fusions/Overclock.md) - Comp: 43.51
  - *Strengths*: B (69.0), D (94.8), G (100.0)
  - *Issues*: F (6.5 - [near_duplicate] '**Testing Doctrine:** * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' approx equals '* Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' (line 35)), C (8.5), E (21.4)
- **228. Accountant** (prompts/fusions/Accountant.md) - Comp: 43.02
  - *Strengths*: B (81.5), D (82.3), G (100.0)
  - *Issues*: F (1.2 - [near_duplicate] 'Your mission is to ENFORCE strict build-time failure thresholds to halt bundle bloat before it ever hits production.' approx equals 'ENFORCE strict build-time failure thresholds to halt bundle bloat before it ever hits production.' (line 4)), E (6.9), A (21.0)
- **229. Few-Shot Forger** (prompts/fusions/Few-Shot Forger.md) - Comp: 42.14
  - *Strengths*: B (60.5), F (100.0), G (100.0)
  - *Issues*: A (1.2), C (11.7), H (30.6)
- **230. Stylist** (prompts/fusions/Stylist.md) - Comp: 42.10
  - *Strengths*: A (48.0), F (100.0), G (100.0)
  - *Issues*: H (3.2), D (14.1), E (25.8)
- **231. Prompt Engineer** (prompts/fusions/Prompt Engineer.md) - Comp: 41.90
  - *Strengths*: B (99.6), F (100.0), G (100.0)
  - *Issues*: C (0.8), D (1.6), E (14.1)
- **232. Terraformer** (prompts/fusions/Terraformer.md) - Comp: 41.75
  - *Strengths*: C (53.2), F (100.0), G (100.0)
  - *Issues*: A (4.0), B (5.2), H (5.2)
- **233. Hyperloop** (prompts/fusions/Hyperloop.md) - Comp: 41.13
  - *Strengths*: E (66.1), C (78.2), G (100.0)
  - *Issues*: F (0.4 - [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 47) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 59)), A (16.5), B (33.5)
- **234. Speed Camera** (prompts/orphans/Speed Camera.md) - Comp: 40.95
  - *Strengths*: E (59.7), B (80.2), F (100.0)
  - *Issues*: G (0.0), A (2.0), H (2.4)
- **235. Logician** (prompts/fusions/Logician.md) - Comp: 40.73
  - *Strengths*: E (64.1), H (84.7), G (100.0)
  - *Issues*: B (7.3), F (14.5 - [near_duplicate] '* | false   | false   | true      | true   |' approx equals '* | false   | true    | *         | true   |' (line 22)), A (20.2)
- **236. Janitor** (prompts/orphans/Janitor.md) - Comp: 40.34
  - *Strengths*: E (47.2), F (100.0), G (100.0)
  - *Issues*: H (8.5), B (11.7), C (13.7)
- **237. Information Architect** (prompts/orphans/Information Architect.md) - Comp: 40.28
  - *Strengths*: B (82.7), F (100.0), G (100.0)
  - *Issues*: H (4.0), A (5.6), D (10.1)
- **238. Safety Inspector** (prompts/fusions/Safety Inspector.md) - Comp: 39.98
  - *Strengths*: E (83.9), D (88.3), G (100.0)
  - *Issues*: A (6.0), F (11.3 - [near_duplicate] '**Testing Doctrine:** * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' approx equals '* **Domain Anchor (Testing):** Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' (line 30)), C (16.1)
- **239. Swatch** (prompts/fusions/Swatch.md) - Comp: 39.50
  - *Strengths*: B (55.2), F (100.0), G (100.0)
  - *Issues*: D (9.3), H (10.5), A (15.3)
- **240. Mulligan** (prompts/fusions/Mulligan.md) - Comp: 39.21
  - *Strengths*: A (75.0), B (98.8), G (100.0)
  - *Issues*: E (2.0), C (4.4), F (4.4 - [near_duplicate] '* 🎱 Folding a claustrophobic, div-heavy dashboard and dealing out a sweeping, CSS Grid masterpiece without dropping a single React state hook.' approx equals '* 🃏 Folding a claustrophobic, div-heavy dashboard and dealing out a sweeping, CSS Grid masterpiece without dropping a single React state hook.' (line 8))
- **241. Ratchet** (prompts/fusions/Ratchet.md) - Comp: 39.17
  - *Strengths*: E (49.6), F (100.0), G (100.0)
  - *Issues*: H (12.9), A (13.7), B (22.6)
- **242. Lexicon** (prompts/fusions/Lexicon.md) - Comp: 38.67
  - *Strengths*: B (54.4), F (100.0), G (100.0)
  - *Issues*: A (8.1), H (8.9), E (14.1)
- **243. Virtuoso** (prompts/orphans/Virtuoso.md) - Comp: 38.65
  - *Strengths*: B (95.2), F (100.0), G (100.0)
  - *Issues*: A (2.4), D (7.3), C (10.9)
- **244. Tokenizer** (prompts/orphans/Tokenizer.md) - Comp: 34.13
  - *Strengths*: B (38.3), F (100.0), G (100.0)
  - *Issues*: A (3.2), H (10.1), C (15.3)
- **245. Synchronizer** (prompts/fusions/Synchronizer.md) - Comp: 32.26
  - *Strengths*: C (31.0), F (100.0), G (100.0)
  - *Issues*: A (0.0), B (9.3), E (12.1)
- **246. Media Pipeline** (prompts/orphans/Media Pipeline.md) - Comp: 27.66
  - *Strengths*: A (41.5), B (71.8), G (100.0)
  - *Issues*: F (4.0 - [near_duplicate] '<img src="/hero.jpg" alt="Hero" />' approx equals '<img src="/hero.jpg" alt="Hero" loading="lazy" />' (line 26)), C (6.5), E (6.5)
- **247. Upgrader** (prompts/fusions/Upgrader.md) - Comp: 26.61
  - *Strengths*: H (37.5), B (85.5), G (100.0)
  - *Issues*: A (3.6), C (6.9), F (8.1 - [near_duplicate] '3. Fetch external GitHub release notes, parse explicitly for breaking changes, synthesize raw noise into high-signal actionable bullet points, and validate notes against lockfile version diffs.' approx equals '3. ⚙️ **BROADCAST** — Fetch external GitHub release notes, parse explicitly for breaking changes, synthesize raw noise into high-signal actionable bullet points, and validate notes against lockfile version diffs.' (line 47))
- **248. Iconographer** (prompts/micro/Iconographer.md) - Comp: 23.19
  - *Strengths*: B (54.0), E (73.0), G (100.0)
  - *Issues*: C (1.2), A (1.6), F (2.0 - [near_duplicate] '# You are "Iconographer" 🔣 - The Symbology Curator.' approx equals 'You are "Iconographer" 🔣 - Symbology Curator.' (line 3))

## 5. Redundancy
No cluster reaches 0.85. Maximum similarity is 0.81.

### 10 Closest Pairs:
- prompts/Janitor.md <-> prompts/fusions/Superintendent.md (Sim: 0.81)
- prompts/fusions/Superintendent.md <-> prompts/Janitor.md (Sim: 0.81)
- prompts/fusions/Surgeon.md <-> prompts/fusions/Forensic Architect.md (Sim: 0.64)
- prompts/fusions/Forensic Architect.md <-> prompts/fusions/Surgeon.md (Sim: 0.64)
- prompts/Architect.md <-> prompts/fusions/Plumbline.md (Sim: 0.62)
- prompts/fusions/Plumbline.md <-> prompts/Architect.md (Sim: 0.62)
- prompts/fusions/Harbormaster.md <-> prompts/Navigator.md (Sim: 0.62)
- prompts/Navigator.md <-> prompts/fusions/Harbormaster.md (Sim: 0.62)
- prompts/fusions/Zoning Board.md <-> prompts/Overseer.md (Sim: 0.56)
- prompts/Overseer.md <-> prompts/fusions/Zoning Board.md (Sim: 0.56)

## 6. Coherence Flags (Top 25 Files)
### prompts/fusions/Policy Maker.md (6 flags)
- Line 37: [opposing_modality] Must: '* **Always Execute:** Operate fully autonomously with binary decisions ([Govern] vs [Skip]).' (line 37) vs Never: '* **Never Execute:** Bootstrap a foreign package manager, modify package.json, or silently install new dependencies to force a test to pass.' (line 41)
- Line 37: [opposing_modality] Must: '* **Always Execute:** Operate fully autonomously with binary decisions ([Govern] vs [Skip]).' (line 37) vs Never: '* **Never Execute:** End an execution plan with a question, solicit feedback, or ask if the approach is correct.' (line 42)
- Line 37: [opposing_modality] Must: '* **Always Execute:** Operate fully autonomously with binary decisions ([Govern] vs [Skip]).' (line 37) vs Never: '* **Never Execute:** Invent net-new core assets (arbitrary hex codes, foreign patterns, unauthorized libraries).' (line 43)
### prompts/fusions/Hyperloop.md (3 flags)
- Line 47: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 47) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 59)
- Line 41: [near_duplicate] 'Validate every caching layer by executing a baseline benchmark versus the optimized time—if the response does not mathematically accelerate or if state breaks, the edge rewrite must be reverted.' approx equals '* ⏱️ Validate every caching layer by executing a baseline benchmark versus the optimized time—if the response does not mathematically accelerate or if state breaks, the edge rewrite must be reverted.' (line 12)
- Line 42: [near_duplicate] '* **The Handoff Rule:** Ignore rewriting actual database schemas or complex stateful mutations; caching and edge execution is your only jurisdiction.' approx equals 'Ignore rewriting actual database schemas or complex stateful mutations; caching and edge execution is your only jurisdiction.' (line 35)
### prompts/Vibe.md (2 flags)
- Line 62: [dangling_reference] * **Build:** Enter flow state. Build exactly ONE cohesive, self-contained feature or architectural bridge into production-ready completion using only packages present in the repository's existing manifest. Replace all mocks with real implementations. Handle edge cases, 5xx errors, timeouts, and malformed payloads natively. Apply strict typings to all authored functions, variables, and state definitions. Leave zero TODO or mock placeholder in any authored code.
- Line 67: [dangling_reference] * Do any TODO or mock data placeholders remain in any authored code block?
### prompts/fusions/Accountant.md (2 flags)
- Line 5: [near_duplicate] 'Your mission is to ENFORCE strict build-time failure thresholds to halt bundle bloat before it ever hits production.' approx equals 'ENFORCE strict build-time failure thresholds to halt bundle bloat before it ever hits production.' (line 4)
- Line 56: [near_duplicate] '3. ⚙️ **ENFORCE** — Execute precisely and immediately upon target acquisition. Halt when your locked scope is clean; do not expand your search to satisfy a quota.' approx equals 'Execute precisely and immediately upon target acquisition. Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 37)
### prompts/fusions/Catalyst.md (2 flags)
- Line 45: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 45) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 54)
- Line 46: [near_duplicate] '* **The Discovery Short-Circuit:** The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution. You are strictly forbidden from: running tests outside the immediate target file, updating adjacent scripts or configuration files not directly required by your change, performing repository-wide sweeps to find additional targets, or executing any verification step not directly caused by your specific mutation. Scope tunnel enforced: enter, execute, exit. Submit your PR the moment your single target is complete.' approx equals '* Your discovery posture is single-target. The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution. You are strictly forbidden from: running tests outside the immediate target file, updating adjacent scripts or configuration files not directly required by your change, performing repository-wide sweeps to find additional targets, or executing any verification step not directly caused by your specific mutation. Scope tunnel enforced: enter, execute, exit. Submit your PR the moment your single target is complete.' (line 30)
### prompts/fusions/Cerberus.md (2 flags)
- Line 56: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 56) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 67)
- Line 36: [near_duplicate] 'app.post('/api/login', (req, res) => {' approx equals 'app.post('/api/login', authLimiter, (req, res) => {' (line 21)
### prompts/fusions/Forensic Architect.md (2 flags)
- Line 55: [near_duplicate] '1. **Trauma Mapping:** Identify historical circular dependency chains causing stack overflow or boot deadlocks using the Forensic Evidence Rule.' approx equals '* **Trauma Mapping:** Identify historical circular dependency chains causing stack overflow or boot deadlocks using the Forensic Evidence Rule.' (line 50)
- Line 56: [near_duplicate] '2. **Colocation Audit:** Map files where logical dependencies no longer match physical locations, specifically targeting identified God Files.' approx equals '* **Colocation Audit:** Map files where logical dependencies no longer match physical locations, specifically targeting identified God Files.' (line 51)
### prompts/fusions/Medic.md (2 flags)
- Line 27: [dangling_reference] // TODO: Implement later
- Line 42: [dangling_reference] * **The Intent Preservation Rule:** If an unfinished stub contains explicit developer instructions (e.g., TODO or FIXME comments) indicating a complex, external system integration (like payment processing), gracefully abort and flag the task as out of scope rather than blindly bypassing it with an empty return value.
### prompts/fusions/Sylar.md (2 flags)
- Line 59: [near_duplicate] '4. **The Scoped Deletion Grant:** Authorizes the agent to explicitly delete/remove the legacy redundant logic blocks strictly after successfully extracting and routing their capabilities into the newly spliced master utility.' approx equals '* **The Scoped Deletion Grant:** Authorizes the agent to explicitly delete/remove the legacy redundant logic blocks strictly after successfully extracting and routing their capabilities into the newly spliced master utility.' (line 40)
- Line 60: [near_duplicate] '5. **Cyclomatic Boundary Verification:** Confirm the newly spliced utility does not require excessive dynamic parameters, deep nesting, or complex `if/else` branching to satisfy disparate edge-cases. Deem the logic structurally incompatible and gracefully abort if this boundary is breached.' approx equals '* **Cyclomatic Boundary Verification:** Confirm the newly spliced utility does not require excessive dynamic parameters, deep nesting, or complex `if/else` branching to satisfy disparate edge-cases. Deem the logic structurally incompatible and gracefully abort if this boundary is breached.' (line 38)
### prompts/micro/Iconographer.md (2 flags)
- Line 18: [near_duplicate] '# You are "Iconographer" 🔣 - The Symbology Curator.' approx equals 'You are "Iconographer" 🔣 - Symbology Curator.' (line 3)
- Line 54: [near_duplicate] '* 4. Execute a targeted replacement of the emoji exclusively within the designated markdown file headers.' approx equals '* **Workflow Execution:** Execute a targeted replacement of the emoji exclusively within the designated markdown file headers.' (line 34)
### prompts/Scribe.md (1 flags)
- Line 36: [near_duplicate] '* **The Scope:** Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is not permitted.' approx equals '* **Scope:** Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is prohibited.' (line 34)
### prompts/Untangler.md (1 flags)
- Line 50: [near_duplicate] '**The Action Bias (Anti-Paralysis):** Limit your DISCOVER phase to a maximum of 3 exploratory native tool actions (e.g., searching/reading files). Upon reaching this limit, you MUST immediately transition to mutating the codebase based on the best available context, or explicitly declare a Graceful Abort.' approx equals '* **The Action Bias (Anti-Paralysis):** You are an execution engine. Limit your DISCOVER phase to a maximum of 3 exploratory native tool actions (e.g., searching/reading files). Upon reaching this limit, you MUST immediately transition to mutating the codebase based on the best available context, or explicitly declare a Graceful Abort.' (line 41)
### prompts/fusions/Amputator.md (1 flags)
- Line 51: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/agent_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 51) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 60)
### prompts/fusions/Annotator.md (1 flags)
- Line 36: [near_duplicate] 'const response = await initiateTransfer(account, { amount: 1000 });' approx equals 'const response = await initiateTransfer(ledgerState, { amount: 1000 });' (line 26)
### prompts/fusions/Calligrapher.md (1 flags)
- Line 78: [near_duplicate] '* **Format Prioritization:** Prioritize `.woff2` formats and strip legacy `.eot`, `.svg`, or `.ttf` fallbacks unless explicitly required by a documented legacy browser support matrix.' approx equals '* **The Format Prioritization:** Prioritize `.woff2` formats and strip legacy `.eot`, `.svg`, or `.ttf` fallbacks unless explicitly required by a documented legacy browser support matrix.' (line 53)
### prompts/fusions/Canner.md (1 flags)
- Line 5: [near_duplicate] 'Your mission is to seal individual test suites by ripping out shared mutable state and brittle static fixtures, replacing them with hermetic dynamic factories.' approx equals 'SEAL INDIVIDUAL test suites by ripping out shared mutable state and brittle static fixtures, replacing them with hermetic dynamic factories.' (line 4)
### prompts/fusions/Dispatcher.md (1 flags)
- Line 47: [near_duplicate] '* **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` logic changes is a domain breach. Treat the application layer as an immutable black box.' approx equals '* **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` execution logic changes is a catastrophic domain breach. Treat the core application layer as an immutable black box.' (line 44)
### prompts/fusions/Examiner.md (1 flags)
- Line 53: [near_duplicate] '**Testing Doctrine:** * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' approx equals '* Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' (line 32)
### prompts/fusions/Hologram.md (1 flags)
- Line 47: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 47) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 57)
### prompts/fusions/Inoculator.md (1 flags)
- Line 49: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 49) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 59)
### prompts/fusions/Jeweler.md (1 flags)
- Line 42: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 42) vs Never: '⚙️ **POLISH** —  Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 52)
### prompts/fusions/Logician.md (1 flags)
- Line 23: [near_duplicate] '* | false   | false   | true      | true   |' approx equals '* | false   | true    | *         | true   |' (line 22)
### prompts/fusions/Lumen.md (1 flags)
- Line 45: [opposing_modality] Must: 'If you fail to find a valid target in `.jules/agent_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan.' (line 45) vs Never: 'Halt when your locked scope is clean; do not expand your search to satisfy a quota.' (line 56)
### prompts/fusions/Mulligan.md (1 flags)
- Line 60: [near_duplicate] '* 🎱 Folding a claustrophobic, div-heavy dashboard and dealing out a sweeping, CSS Grid masterpiece without dropping a single React state hook.' approx equals '* 🃏 Folding a claustrophobic, div-heavy dashboard and dealing out a sweeping, CSS Grid masterpiece without dropping a single React state hook.' (line 8)
### prompts/fusions/Narrator.md (1 flags)
- Line 59: [near_duplicate] '**Testing Doctrine:** * Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' approx equals '* Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).' (line 41)

## 7. Recurring Tensions
- MUST: 'if you fail to find a valid target in .jules/agent tasks.md , your job is not done; you must seamlessly transition to a repository-wide discovery scan.' VS NEVER: 'halt when your locked scope is clean; do not expand your search to satisfy a quota.' (Occurs in 9 files)

## 8. Spot-Check Sample
- Rank 169: Seawall (prompts/orphans/Seawall.md)
- Rank 34: Tectonic (prompts/fusions/Tectonic.md)
- Rank 12: Scavenger (prompts/Scavenger.md)
- Rank 195: Pruner (prompts/fusions/Pruner.md)
- Rank 76: Retrofit (prompts/fusions/Retrofit.md)
- Rank 68: Typesetter (prompts/fusions/Typesetter.md)
- Rank 63: Sanitizer (prompts/fusions/Sanitizer.md)
- Rank 41: Barricade (prompts/fusions/Barricade.md)
- Rank 194: Redliner (prompts/orphans/Redliner.md)
- Rank 32: LiveFeed (prompts/orphans/LiveFeed.md)
- Rank 1: Collider (prompts/fusions/Collider.md)
- Rank 2: Adversary (prompts/fusions/Adversary.md)
- Rank 3: Paramedic (prompts/Paramedic.md)
- Rank 4: Hazmat (prompts/fusions/Hazmat.md)
- Rank 5: Interrogator (prompts/fusions/Interrogator.md)
- Rank 244: Tokenizer (prompts/orphans/Tokenizer.md)
- Rank 245: Synchronizer (prompts/fusions/Synchronizer.md)
- Rank 246: Media Pipeline (prompts/orphans/Media Pipeline.md)
- Rank 247: Upgrader (prompts/fusions/Upgrader.md)
- Rank 248: Iconographer (prompts/micro/Iconographer.md)

## 9. Tool Inventory (Missing on VM)
- **@/**: used by Architect, Ghost Hunter, Plumbline, Zoning Board
- **@/***: used by Architect, Plumbline
- **Architecture**: used by Architect, Fractal, Futurist, Groundskeeper, Hoister and more
- **⚠️**: used by Architect, Bolt+, Cortex, Dispatch, Modernizer and more
- **math/**: used by Architect, Plumbline
- **.jules/agent_tasks.md**: used by Architect, Bolt+, Cortex, Dispatch, Helix and more
- **/types**: used by Architect, Plumbline
- **index.ts**: used by Architect, City Clerk, Construct, Registrar, Renovator and more
- **types.ts**: used by Architect, Plumbline, Tectonic
- **../../**: used by Architect, Plumbline, Zoning Board
- **main**: used by Architect, Author, Cortex, Dispatch, Helix and more
- **string/**: used by Architect, Plumbline
- **__init__.py**: used by Architect, Plumbline
- **utils/**: used by Architect, Fractal, Plumbline, Zoning Board
- **<<<<<<<**: used by Author, Helix, Pedant, Scribe, Untangler and more
- **CONTRIBUTING.md**: used by Author, Cataloger, Ghostwriter, Steward
- **package.json**: used by Author, Dispatch, Janitor, Modernizer, Navigator and more
- **Makefile**: used by Author, Envoy, Ghostwriter, Janitor
- **docker-compose.yml**: used by Author, Bastion, Envoy, Ghostwriter, Marshal and more
- **README.md**: used by Author, Navigator, Overseer, Archivist, Cartographer and more
- **docker-compose**: used by Author, Ghostwriter, Janitor
- **.json**: used by Author, Navigator, Overseer, Cartographer, Cataloger and more
- **API.md**: used by Author, Ghostwriter
- **.jules/**: used by Author, Scavenger, Scribe, Untangler, Vibe Check and more
- **Promise.all**: used by Bolt+, Interrogator, Overdrive
- **.sh**: used by Bolt+, Untangler, Bulwark, Canvas, Cerberus and more
- **Map**: used by Bolt+, Overdrive
- **Set**: used by Bolt+, Overdrive
- **.js**: used by Bolt+, Untangler, Bulwark, Cerberus, Chameleon and more
- **gpt-4o**: used by Cortex, Firewall
- **Zod**: used by Cortex, Cerberus, Reroll, Scout
- **agent_tasks.md**: used by Cortex, Parallel, Scholar, Yggdrasil, Choreographer and more
- **AbortController**: used by Cortex, Electrician, Few-Shot Forger, Limiter, Tachyon
- **fetch**: used by Cortex, Bulwark, Limiter, Occam, Overclock and more
- **JSON.parse**: used by Cortex, Automata, Bulwark, Cerberus, Quarantine
- **Dockerfile**: used by Dispatch, Accountant, Bastion, Conveyor, Decommissioner and more
- **YAML**: used by Dispatch, Accountant, Bastion, Conveyor, Decommissioner and more
- **.mcp.json**: used by Dispatch, Decommissioner, Demolition, Echodrop, Retrofit and more
- **.dockerignore**: used by Dispatch, Decommissioner, Echodrop
- **dependabot.yml**: used by Dispatch, Echodrop, Groundskeeper
- **GITHUB_TOKEN**: used by Dispatch, Decommissioner, Retrofit
- **.github/workflows/ci.yml**: used by Dispatch, Adversary, Echodrop
- **.py**: used by Dispatch, Chronicle, Defibrillator, Dispatcher, Echodrop and more
- **actions/checkout@v2**: used by Dispatch, Decommissioner, Echodrop, Retrofit
- **.env.example**: used by Dispatch, Janitor, Sentinel+, Accountant, Bastion and more
- **for**: used by Helix, Limiter, Retrofitter, Slipstream, Temporal Loom and more
- **.reduce()**: used by Helix, Sylar, Sprinter
- **useEffect**: used by Helix, Flourish, Ouija, Proton Pack, Ratchet and more
- **while**: used by Helix, Hoister, Limiter, Sylar
- **if/else**: used by Helix, Modernizer, Scavenger, Untangler, Defuser and more
- **,**: used by Inspector, Illuminator, Purger, Restorer, Autopilot and more
- **.**: used by Inspector, Illuminator, Purger, Restorer, Spellchecker and more
- **typescript**: used by Inspector, Spellchecker, Fabricator, Performance Engineer, Stress Tester
- **).**: used by Inspector, Purger, Spellchecker, Autopilot, Blackbox and more
- *****: used by Inspector, Janitor, Scribe, Bastion, Press Secretary and more
- **to**: used by Inspector, Helmsman, Restorer, Spellchecker, Caliper and more
- **###**: used by Inspector, Hive, Phoenix, Press Secretary, Purger and more
- **)**: used by Inspector, Illuminator, Press Secretary, Purger, Transition Manager and more
- **patch_*.sh**: used by Janitor, Superintendent
- **.DS_Store**: used by Janitor, Superintendent
- **config/local.env**: used by Janitor, Superintendent
- **patches/**: used by Janitor, Superintendent
- **.diff**: used by Janitor, Untangler, Bulwark, Cerberus, Chameleon and more
- **.swp**: used by Janitor, Superintendent
- **.gitattributes**: used by Janitor, Superintendent
- **verification*.png**: used by Janitor, Superintendent
- **update_*.py**: used by Janitor, Superintendent
- **.gitignore**: used by Janitor, Decommissioner, Revoker, Superintendent
- **.patch**: used by Janitor, Superintendent
- **plan.md**: used by Janitor, Superintendent
- **__pycache__**: used by Janitor, Hazmat, Superintendent, Janitor
- **sk_live_**: used by Janitor, Keymaster, Superintendent
- **modify_*.py**: used by Janitor, Superintendent
- **fix_*.py**: used by Janitor, Superintendent
- **fix.diff**: used by Janitor, Superintendent
- **SEARCH/REPLACE**: used by Modernizer, Navigator, Overseer, Paramedic, Scavenger and more
- **async/await**: used by Modernizer, Catalyst, Collider, Inoculator, Refiner and more
- **require()**: used by Modernizer, Paramedic, Collider, Terraformer, Transition Manager
- **var**: used by Modernizer, Collider, Prefect, Refiner, Retrofitter and more
- **Object.assign({},**: used by Modernizer, Retrofitter
- **.then()**: used by Modernizer, Catalyst, Collider, Inoculator, Yggdrasil
- **let**: used by Modernizer, Untangler, Canner, Collider, Prefect and more
- **Object.assign**: used by Modernizer, Retrofitter
- **const**: used by Modernizer, Untangler, Auditor, Collider, Hoister and more
- **||**: used by Modernizer, Switchboard
- **%s**: used by Modernizer, Interpolator, Wordsmith
- **&&**: used by Modernizer, Sentinel+, Adversary, Annotator, Antibody and more
- **+**: used by Modernizer, Pedant, Interpolator, Cryptographer
- **Auth.js**: used by Navigator, Phoenix
- **Pydantic**: used by Navigator, Cerberus
- **date-fns**: used by Navigator, Liquidator
- **mtime**: used by Navigator, Scribe, Harbormaster
- **ROADMAP.md**: used by Navigator, Chronicler, Harbormaster, Strategist
- **f8a92b1**: used by Navigator, Harbormaster
- **payment.js**: used by Overseer, Zoning Board
- **[TRANSFORMER]**: used by Overseer, Zoning Board
- **/mock-data**: used by Overseer, Zoning Board
- **[REFACTORER]**: used by Overseer, Zoning Board
- **js/Services/AgentRepository.js**: used by Overseer, Zoning Board
- **src/core/RosterApp.js**: used by Overseer, Zoning Board
- **The**: used by Overseer, Zoning Board
- **@media**: used by Palette+, Sculptor, Stylist
- **transition-all**: used by Palette+, Hologram
- **focus-visible**: used by Palette+, Chameleon
- **aria-label**: used by Palette+, Grammarian, Wordsmith
- **<button>**: used by Palette+, Chameleon, Wordsmith
- **!important**: used by Palette+, Finesse
- **div**: used by Palette+, Viewmorph
- **<div>**: used by Palette+, Vibe, Millisecond, Information Architect
- **dist/**: used by Paramedic, Hazmat
- **build/**: used by Paramedic, Hazmat
- **tsc**: used by Paramedic, Oracle, Ratchet, Registrar, Whistleblower and more
- **.skip**: used by Paramedic, Canvas, Reroll, Respawn, Respec
- **enum**: used by Pedant, Auditor, PathCentralizer
- **margin**: used by Pedant, Flourish, Sculptor
- **any**: used by Pedant, Vibe, Cerberus, Glossary, Oracle and more
- **if**: used by Pedant, Scavenger, Amputator, Auditor, Automata and more
- **node_modules**: used by Pedant, Decoder, Foreman
- **{**: used by Scavenger, Auditor, Decoder, Millisecond, Retrofitter
- **catch**: used by Scavenger, Amputator, Cerberus, Inoculator, Toxicologist and more
- **//**: used by Scavenger, Amputator, Archivist, Exorcist, Revisionist and more
- **console.log()**: used by Scavenger, Zen
- **export**: used by Scavenger, Collider, Hyperloop, Scaffolder, Transition Manager
- **{}**: used by Scavenger, Millisecond
- **try/catch**: used by Scavenger, Vibe Check, Bulwark, Cerberus, Coroner and more
- **roster-payload.json**: used by Scavenger, Untangler, Hazmat, Launchpad, Smith and more
- **CHANGELOG.md**: used by Scribe, Retcon, Strategist
- **Security**: used by Sentinel+, Cerberus, Firewall, First Responder, Keymaster and more
- **;**: used by Sentinel+, Adversary, Annotator, Antibody, Canner and more
- **dangerouslySetInnerHTML**: used by Sentinel+, First Responder, Aegis
- **try/finally**: used by Sentinel+, Sanitizer
- **SELECT**: used by Sentinel+, Temporal Loom
- **process.env**: used by Sentinel+, Prophet, Revoker, Sandboxer
- **[x]**: used by Untangler, Chronicler, Futurist, Ghost Hunter, Interrogator and more
- **SyntaxError**: used by Untangler, Vibe Check, Vibe, Launchpad, Choreographer
- **switch**: used by Untangler, Defuser, Slipstream, Smith
- **workspace:***: used by Vibe Check, Ghostwriter, Plumbline
- **.d.ts**: used by Vibe Check, Overdrive, Plumbline
- **TODO**: used by Vibe, Prophet
- **requirements.txt**: used by Vibe, Marshal, Synchronizer, Watchtower
- **try/except**: used by Vibe, Temporal Loom
- **500**: used by Accountant, Quartermaster
- **<div**: used by Acetone, Hologram, Vice
- **.jules/journal_ux.md**: used by Acetone, Calligrapher, Canvas, Espresso, Grammarian and more
- **style**: used by Acetone, Restorer
- **.scss**: used by Acetone, Stylist, Vice
- **jest.setup.js**: used by Adversary, Overclock
- **.jules/journal_testing.md**: used by Adversary, Annotator, Antibody, Auditor, Canner and more
- **.deb**: used by Amputator, Antibody, Bulwark, Catalyst, Cerberus and more
- **try-catch**: used by Amputator, Automata
- **.jules/journal_operations.md**: used by Amputator, Inoculator, Launchpad, Limiter, Tokenizer
- **user.role**: used by Annotator, Gatekeeper
- **jest.spyOn**: used by Annotator, Sandboxer
- **beforeEach**: used by Annotator, Antibody, Canner, Overclock, Respec and more
- **await**: used by Antibody, Flourish, Inoculator, Ouija, Tachyon
- **.jules/journal_docs.md**: used by Archivist, Glossary, Logician, Marshal, Profiler and more
- **@param**: used by Archivist, Oracle, Revisionist
- **ARCHITECTURE.md**: used by Archivist, Cartographer, Cataloger, Steward
- **@throws**: used by Archivist, Oracle
- **@see**: used by Archivist, Chronicler, Sunsetter
- **constants.ts**: used by Auditor, Hoister
- **.jules/journal_strategy.md**: used by Automata, Hyperloop
- **functions**: used by Automata, Futurist
- **properties**: used by Automata, Caliper
- **/**: used by Automata, Restorer, Caliper, Captionist, Performance Engineer
- **tools**: used by Automata, Futurist
- **.jules/journal_security.md**: used by Barricade, Cerberus, Defuser, Firewall, First Responder and more
- **/health**: used by Barricade, Watchtower
- **.jules/journal_architecture.md**: used by Bastion, Bulwark, Fractal, Futurist, Groundskeeper and more
- **match**: used by Bastion, Defuser
- **axios**: used by Bulwark, Quarantine, Safety Inspector, Siren, Steward
- **.catch()**: used by Bulwark, Pantomime
- **JSON.parse()**: used by Bulwark, First Responder, Mitosis
- **fetch()**: used by Bulwark, Cerberus, Hyperloop, Liquidator, PathCentralizer and more
- **.svg**: used by Calligrapher, Terraformer
- **string**: used by Calligrapher, Whistleblower, Publicist
- **afterEach(()**: used by Canner, Sandboxer
- **setupTests.ts**: used by Canner, Sandboxer
- **jest.useFakeTimers()**: used by Canner, Overclock, Sandboxer
- **document.body**: used by Canner, Sandboxer
- **setTimeout**: used by Canner, Interrogator, Ouija, Overclock, Respec
- **expect()**: used by Canner, Interrogator, Narrator, Sandboxer
- **afterEach**: used by Canner, Respec, Sandboxer
- **buildMockDB(overrides)**: used by Canner, Sandboxer
- **xit**: used by Canvas, Reroll, Respawn, Respec
- **html/template**: used by Canvas, Flourish
- **.jules/journal_observability.md**: used by Cartographer, Telemetrist, Watchtower
- **.jules/worker_tasks.md**: used by Catalyst, Cerberus, Firewall, First Responder, Hologram and more
- **Intl**: used by Catalyst, Fractal
- **undefined**: used by Catalyst, Collider, Coroner, Decoder, Hoister and more
- **.jules/journal_performance.md**: used by Catalyst, Pacemaker, Vice
- **Record<string,**: used by Cerberus, Fractal
- **/login**: used by Cerberus, Customs
- **<a>**: used by Chameleon, Helmsman, Telepath, Wordsmith
- **onClick**: used by Chameleon, Mulligan, Viewmorph
- **opacity:**: used by Chameleon, Sculptor
- **transform:**: used by Chameleon, Sculptor, Vice
- **<input>**: used by Chameleon, Pathfinder
- **opacity**: used by Chameleon, Flourish, Sculptor, Vice
- **disabled**: used by Chameleon, LiveFeed
- **.jules/temp_backup/**: used by Chameleon, Customs, Logician, Medic, Overdrive and more
- **:hover**: used by Chameleon, Sculptor, Viewmorph
- **transform**: used by Chameleon, Flourish, Sculptor, Vice
- **:focus-visible**: used by Chameleon, Sculptor
- **transition**: used by Chameleon, Sculptor
- **v2**: used by Checkpoint, Retrofit
- **.txt**: used by Chronicle, Lumen, Retcon
- **.md**: used by Chronicle, Retcon, Strategist, Nomenclator
- **.ts**: used by Chronicle, Defibrillator, Dispatcher, Echodrop, Expediter and more
- **index.tsx**: used by City Clerk, Construct
- **utils.ts**: used by City Clerk, Hoister, Warden
- **.map()**: used by Collider, Profiler, Retrofitter, Sprinter
- **.then().catch()**: used by Collider, Temporal Loom, Transition Manager
- **module.exports**: used by Collider, Transition Manager
- **null**: used by Collider, Forensic Architect, Keymaster, Oracle, Quarantine and more
- **switch/case**: used by Collider, Sylar, Systematizer, Weaver, Yggdrasil
- **import**: used by Collider, Purger, Terraformer, Transition Manager
- **RUN**: used by Conveyor, Switchboard
- **.gitlab-ci.yml**: used by Conveyor, Expediter, Groundskeeper, Launchpad
- **urls.py**: used by Dead-Ender, Scaffolder
- **<Route>**: used by Dead-Ender, Redirector
- **App.tsx**: used by Dead-Ender, Temporal Loom
- **<Link>**: used by Dead-Ender, Helmsman, PathCentralizer, Telepath
- **📈**: used by Decoder, Prompt Engineer, Yggdrasil
- **⚙️**: used by Decoder, Prompt Engineer, Yggdrasil
- **KeyError**: used by Decoder, Toxicologist
- **✅**: used by Decoder, Prompt Engineer, Yggdrasil, Fabricator, Information Architect
- **📊**: used by Decoder, Mapper, Pruner, Registrar
- **.github/workflows/**: used by Decommissioner, Expediter, Greenlight, Groundskeeper, Launchpad
- **.github/workflows/deploy.yml**: used by Decommissioner, Temporal Loom
- **set**: used by Defibrillator, Prefect
- **yamllint**: used by Defibrillator, Respawn
- **-**: used by Defuser, Phoenix, Choreographer, Cryptographer, Historian and more
- **return**: used by Defuser, Inoculator, Proton Pack, Pruner, Slipstream
- **.github/workflows**: used by Discharge, Envoy, Harbormaster, Retrofit, Warden
- **v4**: used by Echodrop, Retrofit
- **system**: used by Electrician, Futurist
- **src/ai/**: used by Few-Shot Forger, Foresight
- **prompts/**: used by Few-Shot Forger, Iconographer
- **style={{}}**: used by Finesse, Typesetter
- **height**: used by Flourish, Sculptor, Vice
- **fatal**: used by Forensic Architect, Surgeon
- **crash**: used by Forensic Architect, Surgeon
- **.jules/journal_feature.md**: used by Foresight, Phoenix
- **.prompt**: used by Foresight, Lumen
- **<T>**: used by Fractal, Oracle
- **lib/**: used by Fractal, Greenlight
- **${var}**: used by Futurist, Wordsmith
- **Priority**: used by Gatekeeper, Quarantine
- **WHERE**: used by Gatekeeper, Aegis
- **tsconfig.json**: used by Ghost Hunter, Ratchet, Retcon, Rulemaker, Zealot
- **.jules/journal_hygiene.md**: used by Ghost Hunter, Helmsman, Hitman, Lexicon, Liquidator and more
- **Docs**: used by Glossary, Logician, Profiler
- **status**: used by Glossary, Diplomat
- **@description**: used by Glossary, Transition Manager
- **/****: used by Glossary, Keymaster, Ouija
- **[Skip]**: used by Grammarian, Groundskeeper, Lumberjack, Mapper, Millisecond and more
- **src/**: used by Greenlight, Organizer
- **throw**: used by Greenlight, Mapper, Pruner, Temporal Loom, Triage and more
- **[PLATFORM**: used by Groundskeeper, Lumberjack, Pathfinder, Pruner, Transfusion
- **package-lock.json**: used by Hazmat, Jeweler, Upgrader
- **href**: used by Helmsman, Redirector
- **301**: used by Helmsman, Redirector
- **<meta**: used by Helmsman, Prefect
- **<a**: used by Helmsman, Redirector
- **Hygiene**: used by Helmsman, Hitman, Lexicon, Lumberjack, Refiner and more
- **next.config.js**: used by Helmsman, Redirector, Scaffolder
- ****Learning:****: used by Hive, Prophet
- **new**: used by Hoister, Sanitizer, Vector
- **useCallback**: used by Hoister, Millisecond
- **formatDate**: used by Hoister, Propagator
- **UX**: used by Hologram, Sculptor
- **Cache-Control**: used by Hyperloop, Payload
- **getServerSideProps**: used by Hyperloop, PathCentralizer
- **but**: used by Illuminator, Restorer, Spellchecker
- **and**: used by Illuminator, Standardizer, Autopilot, Caliper, Canon and more
- **context.WithTimeout**: used by Inoculator, Liquidator
- **Operations**: used by Inoculator, Launchpad, Limiter
- **aria-***: used by Interrogator, Renovator
- **Testing**: used by Interrogator, Jeweler
- **aria-disabled="true"**: used by Jeweler, LiveFeed
- **<form>**: used by Jeweler, Streamliner
- **.env**: used by Keymaster, Launchpad, Quartermaster, Retcon, Revoker and more
- **🎯**: used by Launchpad, Overclock, Registrar, Watchtower, Yggdrasil and more
- **structuredClone**: used by Liquidator, Sylar
- **else**: used by Lumberjack, Slipstream
- **except**: used by Lumberjack, Toxicologist, Triage
- **<thinking>**: used by Mapper, Mitosis, Triage, Echo
- **onChange**: used by Millisecond, Mulligan
- **window**: used by Mitosis, Proton Pack
- **.test.ts**: used by Mixologist, Obituary Writer, Surveyor, Wordsmith, Sandboxer
- **.css**: used by Mulligan, Renovator, Scaffolder, Stylist
- **.tsx**: used by Mulligan, Renovator
- **onSubmit**: used by Mulligan, Pathfinder
- **@deprecated**: used by Obituary Writer, Parallel, Prophet, Revisionist, Sunsetter and more
- **request_code_review**: used by Overdrive, Policy Maker, Vector
- **finally**: used by Pantomime, Sanitizer, Triage
- **isLoading**: used by Pantomime, Renovator, Choreographer, LiveFeed
- **<Suspense>**: used by Pantomime, Renovator
- **<ErrorBoundary>**: used by Pantomime, Renovator
- **isSubmitting**: used by Pantomime, Choreographer
- **<Modal>**: used by Pathfinder, Streamliner
- **Hallucination**: used by Phoenix, Strategist
- **.create()**: used by Policy Maker, Tachyon
- **jest.mock**: used by Polygraph, Sandboxer
- **#**: used by Prefect, Revisionist
- **/***: used by Prefect, Shredder
- **Mandate**: used by Press Secretary, Purger, Restorer, Spellchecker, Autopilot and more
- **markdown**: used by Press Secretary, Fabricator, Information Architect
- **or**: used by Press Secretary, Purger, Autopilot, Blackbox, Caliper and more
- **file.**: used by Press Secretary, Autopilot, Blackbox
- **{{var}}**: used by Prompt Engineer, Wordsmith
- **clearInterval**: used by Proton Pack, Sanitizer
- **IntersectionObserver**: used by Proton Pack, Reroll, Streamliner, Telepath
- **setInterval**: used by Proton Pack, Sanitizer
- **break**: used by Pruner, Slipstream, Yggdrasil
- **files**: used by Purger, Redliner
- **directory.**: used by Purger, Restorer
- **error**: used by Purger, Ratchet, Zealot
- **),**: used by Purger, Autopilot, Blackbox, Caliper, Diplomat and more
- **javascript**: used by Purger, Autopilot, Blackbox, Diplomat, Orator and more
- **.png**: used by Purger, Terraformer, Media Pipeline
- **/public**: used by Purger, Terraformer
- **defer**: used by Quarantine, Sanitizer
- **exhaustive-deps**: used by Ratchet, Zealot
- **warn**: used by Ratchet, Zealot
- **useQuery**: used by Renovator, Steward
- **mechanics.**: used by Restorer, Redactor, Redliner
- **tag**: used by Restorer, Publicist
- **missing**: used by Restorer, Blackbox, Seawall
- **tags**: used by Restorer, Captionist, Information Architect, Polyglot, Publicist and more
- **attributes**: used by Restorer, Canon
- **html**: used by Restorer, Captionist, Information Architect, Publicist
- **where**: used by Restorer, Redactor
- **that**: used by Restorer, Autopilot, Caliper, Captionist
- **class**: used by Retrofitter, Transition Manager, Yggdrasil
- **function**: used by Retrofitter, Spellchecker
- **reduce**: used by Retrofitter, Vector
- **process.env.STRIPE_SECRET_KEY**: used by Revoker, Siren
- **key**: used by Revoker, Redliner
- **STYLEGUIDE.md**: used by Rulemaker, Swatch
- **react-router-dom**: used by Safety Inspector, Upgrader
- **lodash**: used by Safety Inspector, Vector
- **display:**: used by Sculptor, Streamliner
- **left**: used by Sculptor, Vice
- **continue**: used by Slipstream, Yggdrasil
- **err**: used by Slipstream, Temporal Loom
- **in**: used by Spellchecker, Caliper, Redliner
- **en.json**: used by Standardizer, Wordsmith
- **style={{**: used by Streamliner, Stylist
- **13px**: used by Stylist, Typesetter
- **rem**: used by Stylist, Viewmorph
- **tailwind.config.js**: used by Stylist, Swatch
- **performance.now()**: used by Telemetrist, Speed Camera
- **.jpg**: used by Terraformer, Media Pipeline
- **.webp**: used by Terraformer, Media Pipeline
- **_**: used by Toxicologist, Zealot
- **window.localStorage**: used by Transfusion, Sandboxer
- **componentDidMount**: used by Transition Manager, Yggdrasil
- **<picture>**: used by Vice, Media Pipeline
- **loading="lazy"**: used by Vice, Media Pipeline
- **framer-motion**: used by Viewmorph, Choreographer
- **<svg>**: used by Viewmorph, Media Pipeline, Tokenizer
- **useState**: used by Yggdrasil, LiveFeed
- **.jules/agents_journal.md**: used by Echo, Iconographer
- **prompts/fusions/**: used by Iconographer, Nomenclator
- **instead**: used by Autopilot, Information Architect
- **—**: used by Autopilot, Orator
- **calls**: used by Autopilot, Blackbox, Fabricator, Redactor
- **vs**: used by Blackbox, Fabricator, Orator
- **before**: used by Blackbox, Redactor
- **upon**: used by Caliper, Canon
- **tsx**: used by Canon, Polyglot
- **block.**: used by Captionist, Diplomat
- **<img>**: used by Choreographer, Media Pipeline
- **on**: used by Diplomat, Orator, Sprinter
- ****Path:****: used by Fabricator, Information Architect
- **❌**: used by Fabricator, Information Architect
- **calls,**: used by Fabricator, Orator
- **chains**: used by Information Architect, Performance Engineer
- **tags.**: used by Information Architect, Publicist
- **containing**: used by Orator, Redliner
- **);**: used by Orator, Performance Engineer, Speed Camera
- **nested**: used by Performance Engineer, Sprinter
- **dictionary**: used by Performance Engineer, Polyglot, Sprinter
- **into**: used by Performance Engineer, Sprinter
- **element**: used by Publicist, Virtuoso
- **keys**: used by Redactor, Redliner
- **loops**: used by Speed Camera, Sprinter
- **loop**: used by Speed Camera, Sprinter


## 10. Rank Stability
### Tiers
- **Top**: 79
- **Middle**: 69
- **Bottom**: 74
- **Unstable**: 26

### Top 10 Most Unstable
- Amputator (Range: 86 to 147)
- Hologram (Range: 136 to 197)
- Canner (Range: 141 to 202)
- Lumen (Range: 146 to 207)
- PathCentralizer (Range: 154 to 215)
- Jeweler (Range: 100 to 159)
- Vibe (Range: 138 to 197)
- Untangler (Range: 129 to 187)
- Inoculator (Range: 71 to 128)
- Catalyst (Range: 135 to 192)

## 11. Effect Report
Previous run scores not found. Skipping effect report.

## 12. Blind Spots
The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
