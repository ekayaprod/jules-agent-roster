# Roster Grader Summary

## 1. Headline
Tiers: Top (84), Middle (83), Bottom (86), Unstable (0)

Top 10 Most Unstable Files:

## 2. Coverage
Found: 253
Parsed & Scored: 253
Excluded: 13
- prompts/README.md: README file
- prompts/fusions/README.md: README file
- prompts/system/DATA_FLOW.md: In prompts/system/
- prompts/system/Master-Forge.md: In prompts/system/
- prompts/system/Auto-Forge.md: In prompts/system/
- prompts/system/Forge-Procedure.md: In prompts/system/
- prompts/system/3passcleaner.md: In prompts/system/
- prompts/system/Auto-Remediation.md: In prompts/system/
- prompts/system/Audit-Procedure.md: In prompts/system/
- prompts/system/Core-Agents-Matrix.md: In prompts/system/
- prompts/system/Scheduled-Auto-Run.md: In prompts/system/
- prompts/system/Creative-Procedure.md: In prompts/system/
- prompts/system/Auto-Build.md: In prompts/system/

## 3. Method & Weights
Saturated Dimensions: None
Final Weights: {"A": 15, "B": 10, "C": 15, "D": 15, "E": 15, "H": 10, "I": 10, "L": 5, "M": 5}

## 4. Validation & Correlations
Length Correlation (before): {"A": 0.05, "B": -0.08, "C": 0.23, "D": 0.14, "E": 0.44, "H": -0.32, "I": -0.14, "L": -0.0, "Composite": 0.24}
Length Correlation (after): {"A": 0.05, "B": -0.08, "C": 0.23, "D": 0.14, "E": 0.44, "H": -0.32, "I": -0.14, "L": -0.0}

Dimension Correlation Matrix:
| | A | B | C | D | E | H | I | L |
|---|---|---|---|---|---|---|---|---|
| A | 1.00 | 0.47 | -0.23 | -0.09 | -0.22 | 0.46 | 0.10 | -0.06 |
| B | 0.47 | 1.00 | -0.26 | -0.06 | -0.36 | 0.31 | 0.09 | -0.04 |
| C | -0.23 | -0.26 | 1.00 | 0.23 | 0.37 | -0.30 | -0.11 | -0.02 |
| D | -0.09 | -0.06 | 0.23 | 1.00 | 0.16 | -0.15 | -0.13 | 0.05 |
| E | -0.22 | -0.36 | 0.37 | 0.16 | 1.00 | -0.32 | -0.25 | -0.01 |
| H | 0.46 | 0.31 | -0.30 | -0.15 | -0.32 | 1.00 | 0.12 | -0.00 |
| I | 0.10 | 0.09 | -0.11 | -0.13 | -0.25 | 0.12 | 1.00 | 0.05 |
| L | -0.06 | -0.04 | -0.02 | 0.05 | -0.01 | -0.00 | 0.05 | 1.00 |

## 5. Top 25 and Bottom 25

### Top 25
- **prompts/orphans/Historian.md**: Rank 1 (p10-p90: 5-10)
  - Strengths: E (97.5), D (85.4), I (64.7)
  - Issues: L (11.5), H (14.3), A (22.0)
- **prompts/fusions/Surveyor.md**: Rank 2 (p10-p90: 3-4)
  - Strengths: D (82.1), E (68.3), B (68.2)
  - Issues: A (30.8), H (32.7), C (51.7)
- **prompts/fusions/Bastion.md**: Rank 3 (p10-p90: 6-10)
  - Strengths: C (85.9), E (80.8), I (80.6)
  - Issues: L (11.5), A (19.3), B (20.8)
- **prompts/fusions/Adversary.md**: Rank 4 (p10-p90: 15-33)
  - Strengths: E (95.2), D (85.6), I (62.3)
  - Issues: A (6.6), H (27.3), C (27.8)
- **prompts/fusions/Groundskeeper.md**: Rank 5 (p10-p90: 3-6)
  - Strengths: I (98.8), B (80.8), L (71.0)
  - Issues: A (12.8), H (43.0), C (45.3)
- **prompts/fusions/Discharge.md**: Rank 6 (p10-p90: 8-16)
  - Strengths: I (86.1), E (77.6), D (76.4)
  - Issues: A (6.0), H (7.3), B (28.6)
- **prompts/fusions/Cerberus.md**: Rank 7 (p10-p90: 1-2)
  - Strengths: L (98.8), C (91.2), E (81.2)
  - Issues: A (13.5), H (23.7), D (47.1)
- **prompts/fusions/Slipstream.md**: Rank 8 (p10-p90: 3-7)
  - Strengths: C (84.0), B (71.0), E (68.3)
  - Issues: I (8.9), L (30.6), A (34.2)
- **prompts/fusions/Press Secretary.md**: Rank 9 (p10-p90: 12-27)
  - Strengths: B (95.6), I (94.4), H (57.6)
  - Issues: L (11.5), A (15.0), C (36.2)
- **prompts/fusions/Catalyst.md**: Rank 10 (p10-p90: 25-35)
  - Strengths: E (73.1), B (67.0), D (63.8)
  - Issues: L (11.5), I (19.8), H (29.1)
- **prompts/Scribe.md**: Rank 11 (p10-p90: 12-22)
  - Strengths: L (85.7), I (85.3), E (65.5)
  - Issues: A (22.3), H (31.9), D (42.5)
- **prompts/Inspector.md**: Rank 12 (p10-p90: 14-28)
  - Strengths: D (92.4), B (78.0), E (63.1)
  - Issues: A (4.8), H (22.0), L (23.8)
- **prompts/fusions/Hyperloop.md**: Rank 13 (p10-p90: 1-2)
  - Strengths: L (89.3), B (80.6), C (78.2)
  - Issues: A (10.2), H (37.6), I (45.2)
- **prompts/fusions/Collider.md**: Rank 14 (p10-p90: 14-32)
  - Strengths: E (96.1), D (90.8), C (71.1)
  - Issues: A (2.0), H (17.6), I (18.7)
- **prompts/fusions/Overclock.md**: Rank 15 (p10-p90: 28-39)
  - Strengths: D (91.3), E (68.3), B (64.8)
  - Issues: A (10.9), L (11.5), I (23.8)
- **prompts/fusions/Hitman.md**: Rank 16 (p10-p90: 8-16)
  - Strengths: B (92.2), L (77.0), I (60.3)
  - Issues: A (19.1), H (39.2), D (48.3)
- **prompts/fusions/Zealot.md**: Rank 17 (p10-p90: 33-41)
  - Strengths: E (86.1), C (71.3), D (71.2)
  - Issues: A (3.6), L (11.5), B (18.0)
- **prompts/Paramedic.md**: Rank 18 (p10-p90: 8-20)
  - Strengths: D (93.5), L (84.5), B (78.8)
  - Issues: A (6.1), H (21.7), I (33.7)
- **prompts/orphans/Choreographer.md**: Rank 19 (p10-p90: 23-33)
  - Strengths: I (72.6), H (62.8), C (59.4)
  - Issues: A (22.8), L (43.3), E (45.1)
- **prompts/fusions/Temporal Loom.md**: Rank 20 (p10-p90: 36-47)
  - Strengths: E (80.8), L (76.2), I (69.4)
  - Issues: A (12.4), B (28.8), C (32.0)
- **prompts/fusions/Terraformer.md**: Rank 21 (p10-p90: 10-19)
  - Strengths: C (83.0), I (73.8), H (65.1)
  - Issues: A (6.8), L (35.7), B (36.8)
- **prompts/fusions/Payload.md**: Rank 22 (p10-p90: 8-22)
  - Strengths: C (93.6), E (82.7), L (80.6)
  - Issues: A (0.6), B (7.6), H (26.2)
- **prompts/fusions/Switchboard.md**: Rank 23 (p10-p90: 32-43)
  - Strengths: I (95.6), C (64.5), H (58.7)
  - Issues: L (11.5), A (13.1), E (30.4)
- **prompts/fusions/Bulwark.md**: Rank 24 (p10-p90: 15-27)
  - Strengths: C (87.4), D (78.2), L (73.0)
  - Issues: A (1.0), B (13.4), H (26.5)
- **prompts/fusions/Sonar.md**: Rank 25 (p10-p90: 50-70)
  - Strengths: E (70.6), I (51.6), H (49.5)
  - Issues: D (26.1), A (32.8), L (36.5)

### Bottom 25
- **prompts/Palette+.md**: Rank 229 (p10-p90: 160-195)
  - Strengths: L (81.0), B (80.2), I (52.8)
  - Issues: D (3.9), A (6.2), E (27.4)
- **prompts/fusions/Wayfinder.md**: Rank 230 (p10-p90: 160-190)
  - Strengths: L (82.3), C (70.6), D (56.1)
  - Issues: A (1.6), E (8.6), B (24.4)
- **prompts/fusions/Restorer.md**: Rank 231 (p10-p90: 231-239)
  - Strengths: B (46.8), H (44.2), C (38.0)
  - Issues: A (7.3), L (11.5), E (19.0)
- **prompts/Sentinel+.md**: Rank 232 (p10-p90: 216-226)
  - Strengths: L (74.6), C (46.6), I (38.1)
  - Issues: A (0.6), H (12.4), E (30.4)
- **prompts/fusions/Lumberjack.md**: Rank 233 (p10-p90: 196-222)
  - Strengths: C (73.8), E (47.5), H (35.5)
  - Issues: A (0.4), I (8.9), B (11.6)
- **prompts/fusions/Reclaimer.md**: Rank 234 (p10-p90: 215-231)
  - Strengths: C (59.0), L (57.1), I (38.5)
  - Issues: A (8.3), E (12.6), H (14.9)
- **prompts/orphans/Virtuoso.md**: Rank 235 (p10-p90: 232-242)
  - Strengths: L (89.3), B (63.4), H (41.7)
  - Issues: C (4.0), E (6.3), A (21.7)
- **prompts/fusions/Espresso.md**: Rank 236 (p10-p90: 189-206)
  - Strengths: L (74.6), H (50.1), B (47.2)
  - Issues: A (0.3), I (23.2), D (26.2)
- **prompts/fusions/Occam.md**: Rank 237 (p10-p90: 221-234)
  - Strengths: C (60.9), L (53.6), E (36.4)
  - Issues: A (0.2), B (9.2), I (25.8)
- **prompts/fusions/Spellchecker.md**: Rank 238 (p10-p90: 229-241)
  - Strengths: B (90.4), I (66.7), L (31.2)
  - Issues: A (4.0), E (10.2), D (13.7)
- **prompts/fusions/Registrar.md**: Rank 239 (p10-p90: 213-231)
  - Strengths: L (96.8), B (87.4), D (33.0)
  - Issues: A (1.6), H (8.3), I (22.2)
- **prompts/fusions/Prompt Engineer.md**: Rank 240 (p10-p90: 216-237)
  - Strengths: B (99.4), L (88.5), I (61.1)
  - Issues: A (0.0), C (5.4), D (13.7)
- **prompts/fusions/Upgrader.md**: Rank 241 (p10-p90: 245-251)
  - Strengths: I (85.7), L (60.7), C (31.5)
  - Issues: A (0.2), B (2.0), D (8.9)
- **prompts/fusions/Proton Pack.md**: Rank 242 (p10-p90: 228-239)
  - Strengths: C (57.0), L (53.2), E (36.4)
  - Issues: A (0.6), I (8.9), H (18.7)
- **prompts/fusions/Renovator.md**: Rank 243 (p10-p90: 195-225)
  - Strengths: L (86.1), C (79.3), E (36.4)
  - Issues: A (0.2), I (8.9), H (12.9)
- **prompts/fusions/Foreman.md**: Rank 244 (p10-p90: 245-250)
  - Strengths: E (37.5), B (34.6), H (33.5)
  - Issues: A (0.6), I (8.9), L (11.5)
- **prompts/fusions/Pruner.md**: Rank 245 (p10-p90: 249-252)
  - Strengths: E (53.5), L (37.7), C (32.2)
  - Issues: A (0.2), B (6.4), I (8.9)
- **prompts/fusions/Amputator.md**: Rank 246 (p10-p90: 230-241)
  - Strengths: C (65.6), L (62.7), H (47.9)
  - Issues: A (0.6), B (4.8), I (8.9)
- **prompts/fusions/Mulligan.md**: Rank 247 (p10-p90: 246-249)
  - Strengths: L (69.0), C (32.7), E (30.4)
  - Issues: A (0.2), H (14.3), D (18.5)
- **prompts/orphans/Canon.md**: Rank 248 (p10-p90: 240-243)
  - Strengths: L (69.8), C (59.0), I (32.9)
  - Issues: A (1.4), E (12.6), H (12.8)
- **prompts/fusions/Grammarian.md**: Rank 249 (p10-p90: 245-248)
  - Strengths: C (51.2), L (32.1), D (30.8)
  - Issues: A (0.4), E (12.6), B (16.4)
- **prompts/fusions/Acetone.md**: Rank 250 (p10-p90: 253-253)
  - Strengths: C (43.0), E (39.9), H (21.9)
  - Issues: A (1.7), I (8.9), L (11.5)
- **prompts/orphans/Caliper.md**: Rank 251 (p10-p90: 245-251)
  - Strengths: C (52.9), B (51.6), D (26.2)
  - Issues: A (2.0), I (8.9), L (11.5)
- **prompts/fusions/WorldGen.md**: Rank 252 (p10-p90: 249-252)
  - Strengths: L (59.9), B (46.0), H (27.9)
  - Issues: A (0.2), D (15.6), E (21.4)
- **prompts/fusions/Sherpa.md**: Rank 253 (p10-p90: 245-251)
  - Strengths: L (99.2), C (52.8), B (36.2)
  - Issues: A (0.0), D (1.2), I (8.9)

## 6. Redundancy
Top 10 Closest Pairs:
- 0.70: prompts/Architect.md and prompts/fusions/Plumbline.md
- 0.69: prompts/fusions/Calligrapher.md and prompts/fusions/Telemetrist.md
- 0.69: prompts/fusions/Archivist.md and prompts/fusions/Automata.md
- 0.68: prompts/fusions/Calligrapher.md and prompts/fusions/Automata.md
- 0.68: prompts/fusions/Threat Modeler.md and prompts/fusions/Calligrapher.md
- 0.68: prompts/fusions/Threat Modeler.md and prompts/fusions/Canner.md
- 0.67: prompts/fusions/Transfusion.md and prompts/fusions/Telepath.md
- 0.67: prompts/Overseer.md and prompts/fusions/Sonar.md
- 0.66: prompts/fusions/Ghost Hunter.md and prompts/fusions/Calligrapher.md
- 0.66: prompts/fusions/Firewall.md and prompts/fusions/Keymaster.md

Same-Name File Pairs:

## 7. Coherence
Top 25 files by F flags:
- **prompts/Overseer.md**: 2 flags
  - opposing_modality: * **The Agent Tasks Board (`.jules/agent_tasks.md`):** Read this file for situational awareness only — do not claim tasks. <-> * **Omniscient Categorization:** Synthesize raw bash output into scoped problem groupings mapped strictly to the canonical Forge Archetypes (e.g., `The [PRUNER] Queue`, `The [REFACTORER] Queue`). Ensure tasks specify exact file paths and line numbers to eliminate downstream search tax.
  - opposing_modality: 1. 🔍 **DISCOVER** — Priority Triage using asynchronous tools. Read `.jules/agent_tasks.md` for situational awareness before initiating your scan. Do not claim tasks. A single empty pass is not conclusive; before declaring zero targets, return to Repo Recon, reconsider whether the domain exists in a form the first pass didn't recognize, and search again; only declare zero targets after that reconsideration genuinely finds nothing. <-> * **Omniscient Categorization:** Synthesize raw bash output into scoped problem groupings mapped strictly to the canonical Forge Archetypes (e.g., `The [PRUNER] Queue`, `The [REFACTORER] Queue`). Ensure tasks specify exact file paths and line numbers to eliminate downstream search tax.
- **prompts/fusions/Sonar.md**: 2 flags
  - opposing_modality: * **The Agent Tasks Board (`.jules/agent_tasks.md`):** Read this file for situational awareness only — do not claim tasks. <-> * **Omniscient Categorization:** Synthesize raw bash output into scoped problem groupings mapped strictly to the canonical Forge Archetypes (e.g., `The [UNTANGLER] Queue`). Ensure tasks specify exact file paths and line numbers to eliminate downstream search tax.
  - opposing_modality: 1. 🔍 **DISCOVER** — Priority Triage using asynchronous tools. Read `.jules/agent_tasks.md` for situational awareness before initiating your scan. Do not claim tasks. A single empty pass is not conclusive; before declaring zero targets, return to Repo Recon, reconsider whether the domain exists in a form the first pass didn't recognize, and search again; only declare zero targets after that reconsideration genuinely finds nothing. <-> * **Omniscient Categorization:** Synthesize raw bash output into scoped problem groupings mapped strictly to the canonical Forge Archetypes (e.g., `The [UNTANGLER] Queue`). Ensure tasks specify exact file paths and line numbers to eliminate downstream search tax.
- **prompts/fusions/Vector.md**: 2 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets according to declared priority weighting up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 25. <-> 5. Ensure identical output shapes are maintained.
  - opposing_modality: 5. Ensure identical output shapes are maintained. <-> * 📊 **Delta:** Lines before vs. Lines after (e.g., 3 custom classes collapsed into 1 native reduce function). If no targets are found, do not output a PR; instead, exit silently.
- **prompts/fusions/Sylar.md**: 1 flags
  - near_duplicate: * **Incremental Scope Lock:** Continue executing within your locked scope up to a maximum of 3. Halt when your locked scope is clean; do not expand your search to satisfy a quota. <-> 3. ⚙️ **SPLICE** — Execute Incrementally. Continue executing within your locked scope up to a maximum of 3. Halt when your locked scope is clean; do not expand your search to satisfy a quota.
- **prompts/fusions/Forensic Architect.md**: 1 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets arbitrarily up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 3. <-> 4. **Validation Pass:** Ensure the output reports are valid markdown and JSON formatting.
- **prompts/orphans/Aegis.md**: 1 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets arbitrarily up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 1. <-> 3. Ensure the output variable correctly receives the purified result without altering the surrounding business logic.

## 8. Recurring Tensions

## 9. Spot Check Sample
- prompts/orphans/Historian.md (Rank 1)
- prompts/fusions/Surveyor.md (Rank 2)
- prompts/fusions/Bastion.md (Rank 3)
- prompts/fusions/Adversary.md (Rank 4)
- prompts/fusions/Groundskeeper.md (Rank 5)
- prompts/fusions/Grammarian.md (Rank 249)
- prompts/fusions/Acetone.md (Rank 250)
- prompts/orphans/Caliper.md (Rank 251)
- prompts/fusions/WorldGen.md (Rank 252)
- prompts/fusions/Sherpa.md (Rank 253)

## 10. Tool Lexicon & Inventory
Top Tools:
- git: 113
- npm: 26
- npx: 18
- apt-get: 15
- docker: 13
- grep: 11
- apt: 8
- tsc: 7
- eslint: 4
- sed: 3
- awk: 3
- jest: 2
- docker-compose: 2

Missing Tools:

## 11. Effect Report

## 12. Reference Check and Human Anchors
Hazmat: 93
Paramedic: 18
Virtuoso: 235
Tokenizer: 88
Synchronizer: 209
Speed Camera: 149
Upgrader: 241

## 13. Blind Spots
The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
