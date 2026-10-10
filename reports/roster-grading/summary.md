# Roster Grader Summary

## 1. Headline
Tiers: Top (83), Middle (83), Bottom (85), Unstable (0)

Top 10 Most Unstable Files:

## 2. Coverage
Found: 251
Parsed & Scored: 251
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
Final Weights: {"A": 15, "B": 10, "C": 15, "D": 15, "E": 15, "H": 10, "I": 10, "L": 5, "M": 5}

## 4. Validation & Correlations
Length Correlation (before): {"A": 0.03, "B": -0.08, "C": 0.24, "D": 0.14, "E": 0.46, "H": -0.33, "I": -0.15, "L": -0.02, "Composite": 0.25}
Length Correlation (after): {"A": 0.03, "B": -0.08, "C": 0.24, "D": 0.14, "E": 0.46, "H": -0.33, "I": -0.15, "L": -0.02}

Dimension Correlation Matrix:
| | A | B | C | D | E | H | I | L | M |
|---|---|---|---|---|---|---|---|---|---|
| A | 1.00 | 0.46 | -0.26 | -0.11 | -0.23 | 0.48 | 0.06 | -0.05 | 0.00 |
| B | 0.46 | 1.00 | -0.25 | -0.06 | -0.34 | 0.33 | 0.10 | -0.02 | 0.00 |
| C | -0.26 | -0.25 | 1.00 | 0.24 | 0.39 | -0.31 | -0.12 | -0.02 | 0.00 |
| D | -0.11 | -0.06 | 0.24 | 1.00 | 0.15 | -0.14 | -0.14 | 0.04 | 0.00 |
| E | -0.23 | -0.34 | 0.39 | 0.15 | 1.00 | -0.32 | -0.26 | -0.03 | 0.00 |
| H | 0.48 | 0.33 | -0.31 | -0.14 | -0.32 | 1.00 | 0.11 | 0.00 | 0.00 |
| I | 0.06 | 0.10 | -0.12 | -0.14 | -0.26 | 0.11 | 1.00 | 0.05 | 0.00 |
| L | -0.05 | -0.02 | -0.02 | 0.04 | -0.03 | 0.00 | 0.05 | 1.00 | 0.00 |
| M | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 |

## 5. Top 25 and Bottom 25

### Top 25
- **prompts/fusions/Cerberus.md**: Rank 1 (p10-p90: 1-2)
  - Strengths: L (98.8), C (91.2), E (81.2)
  - Issues: A (12.1), H (23.7), D (47.1)
- **prompts/fusions/Hyperloop.md**: Rank 2 (p10-p90: 1-2)
  - Strengths: L (89.2), B (82.4), C (78.2)
  - Issues: A (10.2), H (37.6), I (45.6)
- **prompts/fusions/Surveyor.md**: Rank 3 (p10-p90: 3-3)
  - Strengths: D (82.1), B (70.8), E (68.3)
  - Issues: A (30.0), H (32.7), C (51.7)
- **prompts/fusions/Slipstream.md**: Rank 4 (p10-p90: 4-6)
  - Strengths: C (84.0), E (68.3), B (67.6)
  - Issues: I (8.8), L (30.8), A (34.2)
- **prompts/fusions/Bastion.md**: Rank 5 (p10-p90: 4-8)
  - Strengths: C (85.9), E (80.8), I (80.4)
  - Issues: L (11.6), A (19.3), B (22.8)
- **prompts/fusions/Groundskeeper.md**: Rank 6 (p10-p90: 4-8)
  - Strengths: I (98.8), B (78.3), L (70.8)
  - Issues: A (4.3), H (39.5), C (45.3)
- **prompts/fusions/Hitman.md**: Rank 7 (p10-p90: 7-14)
  - Strengths: B (93.2), L (76.8), I (60.0)
  - Issues: A (19.1), H (39.2), D (48.3)
- **prompts/fusions/Discharge.md**: Rank 8 (p10-p90: 7-15)
  - Strengths: I (86.0), E (77.6), D (76.4)
  - Issues: A (4.0), H (5.7), B (30.8)
- **prompts/fusions/Antibody.md**: Rank 9 (p10-p90: 8-17)
  - Strengths: D (86.9), L (84.0), E (78.4)
  - Issues: A (8.1), H (29.1), I (39.2)
- **prompts/orphans/Seawall.md**: Rank 10 (p10-p90: 6-22)
  - Strengths: L (95.0), C (81.7), I (77.2)
  - Issues: D (21.8), E (28.1), A (29.3)
- **prompts/fusions/Payload.md**: Rank 11 (p10-p90: 7-21)
  - Strengths: C (93.6), E (82.7), L (80.4)
  - Issues: A (0.4), B (7.2), H (25.5)
- **prompts/orphans/Historian.md**: Rank 12 (p10-p90: 8-22)
  - Strengths: E (97.5), D (85.4), I (64.4)
  - Issues: A (8.5), L (11.6), H (11.7)
- **prompts/fusions/Respawn.md**: Rank 13 (p10-p90: 9-22)
  - Strengths: I (89.2), L (79.2), C (72.0)
  - Issues: A (0.6), E (27.4), H (31.9)
- **prompts/fusions/Bulwark.md**: Rank 14 (p10-p90: 10-20)
  - Strengths: C (87.4), D (78.2), L (72.8)
  - Issues: A (1.0), B (20.8), H (26.5)
- **prompts/fusions/Retrofitter.md**: Rank 15 (p10-p90: 9-26)
  - Strengths: L (87.6), B (83.8), H (80.3)
  - Issues: D (25.5), A (26.9), E (36.4)
- **prompts/fusions/Demolition.md**: Rank 16 (p10-p90: 11-28)
  - Strengths: I (95.2), C (90.7), L (86.4)
  - Issues: A (17.3), B (24.6), E (28.1)
- **prompts/Paramedic.md**: Rank 17 (p10-p90: 13-26)
  - Strengths: D (93.5), L (84.4), B (73.4)
  - Issues: A (4.6), H (18.7), I (34.4)
- **prompts/Scavenger.md**: Rank 18 (p10-p90: 10-27)
  - Strengths: C (88.4), E (86.1), B (46.8)
  - Issues: A (19.4), L (25.2), D (28.7)
- **prompts/fusions/Vector.md**: Rank 19 (p10-p90: 16-24)
  - Strengths: C (75.3), E (68.3), I (64.0)
  - Issues: A (3.4), B (37.6), L (50.8)
- **prompts/fusions/Adversary.md**: Rank 20 (p10-p90: 12-30)
  - Strengths: E (95.2), D (85.6), I (62.0)
  - Issues: A (6.6), H (27.3), C (27.8)
- **prompts/fusions/First Responder.md**: Rank 21 (p10-p90: 16-26)
  - Strengths: L (98.0), B (72.4), D (67.3)
  - Issues: A (2.8), H (40.1), I (40.2)
- **prompts/fusions/Collider.md**: Rank 22 (p10-p90: 13-30)
  - Strengths: E (96.1), D (90.8), C (71.1)
  - Issues: A (2.0), H (17.6), I (18.8)
- **prompts/fusions/Terraformer.md**: Rank 23 (p10-p90: 18-30)
  - Strengths: C (83.0), I (73.6), H (64.4)
  - Issues: A (3.8), B (26.4), L (36.0)
- **prompts/fusions/Annotator.md**: Rank 24 (p10-p90: 18-32)
  - Strengths: L (96.0), C (88.3), E (86.1)
  - Issues: A (1.6), B (2.2), H (28.1)
- **prompts/Dispatch.md**: Rank 25 (p10-p90: 19-34)
  - Strengths: L (94.4), I (93.8), C (80.2)
  - Issues: A (2.0), E (18.6), H (42.6)

### Bottom 25
- **prompts/fusions/Occam.md**: Rank 227 (p10-p90: 218-231)
  - Strengths: C (60.9), L (53.6), E (36.4)
  - Issues: A (0.2), B (9.0), I (26.8)
- **prompts/fusions/Prompt Engineer.md**: Rank 228 (p10-p90: 214-236)
  - Strengths: B (99.4), L (88.4), I (60.8)
  - Issues: A (0.0), C (5.4), D (13.7)
- **prompts/fusions/Proton Pack.md**: Rank 229 (p10-p90: 225-237)
  - Strengths: C (57.0), L (53.2), E (36.4)
  - Issues: A (0.6), I (8.8), H (18.7)
- **prompts/Architect.md**: Rank 230 (p10-p90: 225-238)
  - Strengths: C (56.4), E (53.5), L (35.0)
  - Issues: A (1.6), I (8.8), H (10.7)
- **prompts/micro/Echo.md**: Rank 231 (p10-p90: 222-238)
  - Strengths: I (84.8), E (63.1), C (39.4)
  - Issues: A (0.4), D (6.9), H (9.8)
- **prompts/orphans/Redliner.md**: Rank 232 (p10-p90: 218-237)
  - Strengths: I (92.0), B (58.8), H (57.7)
  - Issues: C (3.8), E (6.3), D (9.9)
- **prompts/orphans/Diplomat.md**: Rank 233 (p10-p90: 219-237)
  - Strengths: B (60.0), L (51.8), A (41.8)
  - Issues: E (6.3), C (9.6), D (25.2)
- **prompts/fusions/Restorer.md**: Rank 234 (p10-p90: 228-236)
  - Strengths: B (47.7), H (44.2), C (38.0)
  - Issues: A (7.3), L (11.6), E (19.0)
- **prompts/Sentinel+.md**: Rank 235 (p10-p90: 229-238)
  - Strengths: L (74.4), C (46.6), I (38.8)
  - Issues: A (0.0), H (10.5), B (18.0)
- **prompts/fusions/Spellchecker.md**: Rank 236 (p10-p90: 226-239)
  - Strengths: B (91.0), I (66.4), L (31.4)
  - Issues: A (4.0), E (10.2), D (13.7)
- **prompts/orphans/emptyslots.md**: Rank 237 (p10-p90: 224-240)
  - Strengths: L (100.0), I (97.2), H (64.5)
  - Issues: A (0.0), D (0.5), C (0.6)
- **prompts/orphans/Virtuoso.md**: Rank 238 (p10-p90: 230-241)
  - Strengths: L (89.2), B (63.2), H (41.7)
  - Issues: C (4.0), E (6.3), A (21.7)
- **prompts/fusions/Forensic Architect.md**: Rank 239 (p10-p90: 233-241)
  - Strengths: I (84.4), L (61.4), D (44.8)
  - Issues: A (0.5), E (10.2), C (16.7)
- **prompts/fusions/Lumen.md**: Rank 240 (p10-p90: 233-241)
  - Strengths: L (79.6), E (63.7), I (40.2)
  - Issues: A (0.6), B (3.8), H (9.5)
- **prompts/Author.md**: Rank 241 (p10-p90: 239-242)
  - Strengths: I (88.8), E (47.5), C (31.1)
  - Issues: A (0.0), B (0.8), H (9.8)
- **prompts/orphans/Canon.md**: Rank 242 (p10-p90: 239-242)
  - Strengths: L (69.6), C (59.0), I (33.6)
  - Issues: A (1.4), E (12.6), H (12.8)
- **prompts/fusions/Keymaster.md**: Rank 243 (p10-p90: 243-245)
  - Strengths: I (57.6), H (47.2), D (36.9)
  - Issues: A (0.2), B (0.8), L (11.6)
- **prompts/fusions/Grammarian.md**: Rank 244 (p10-p90: 243-245)
  - Strengths: C (51.2), L (32.4), D (30.8)
  - Issues: A (0.4), E (12.6), B (19.0)
- **prompts/fusions/Upgrader.md**: Rank 245 (p10-p90: 244-247)
  - Strengths: I (85.6), L (60.4), C (31.5)
  - Issues: A (0.2), B (2.0), D (8.9)
- **prompts/fusions/Sherpa.md**: Rank 246 (p10-p90: 245-248)
  - Strengths: L (99.2), C (52.8), B (34.2)
  - Issues: A (0.0), D (1.2), I (8.8)
- **prompts/fusions/Pruner.md**: Rank 247 (p10-p90: 246-248)
  - Strengths: E (53.5), L (38.0), C (32.2)
  - Issues: A (0.2), B (5.8), I (8.8)
- **prompts/fusions/WorldGen.md**: Rank 248 (p10-p90: 249-250)
  - Strengths: L (59.6), B (32.6), H (27.9)
  - Issues: A (0.0), D (15.6), E (21.4)
- **prompts/fusions/Foreman.md**: Rank 249 (p10-p90: 250-250)
  - Strengths: E (37.5), H (32.8), D (28.4)
  - Issues: A (0.2), I (8.8), B (9.0)
- **prompts/fusions/Mulligan.md**: Rank 250 (p10-p90: 251-251)
  - Strengths: L (68.8), C (35.4), E (21.4)
  - Issues: A (0.0), B (6.4), I (8.8)
- **prompts/orphans/Caliper.md**: Rank 251 (p10-p90: 245-248)
  - Strengths: C (52.9), B (49.0), D (26.2)
  - Issues: A (2.0), I (8.8), L (11.6)

## 6. Redundancy
Top 10 Closest Pairs:
- 0.68: prompts/fusions/Transfusion.md and prompts/fusions/Telepath.md
- 0.68: prompts/fusions/Calligrapher.md and prompts/fusions/Automata.md
- 0.68: prompts/fusions/Calligrapher.md and prompts/fusions/Telemetrist.md
- 0.67: prompts/fusions/Archivist.md and prompts/fusions/Automata.md
- 0.67: prompts/fusions/Threat Modeler.md and prompts/fusions/Calligrapher.md
- 0.67: prompts/fusions/Threat Modeler.md and prompts/fusions/Canner.md
- 0.66: prompts/fusions/Firewall.md and prompts/fusions/Keymaster.md
- 0.65: prompts/Overseer.md and prompts/fusions/Sonar.md
- 0.65: prompts/fusions/Ghost Hunter.md and prompts/fusions/Calligrapher.md
- 0.63: prompts/Helix.md and prompts/fusions/Conveyor.md

Same-Name File Pairs:

## 7. Coherence
Top 25 files by F flags:
- **prompts/Overseer.md**: 2 flags
  - opposing_modality: * **The Agent Tasks Board (`.jules/agent_tasks.md`):** Read this file for situational awareness only — do not claim tasks.
  - opposing_modality: 1. 🔍 **DISCOVER** — Priority Triage using asynchronous tools. Read `.jules/agent_tasks.md` for situational awareness before initiating your scan. Do not claim tasks. A single empty pass is not conclusive; before declaring zero targets, return to Repo Recon, reconsider whether the domain exists in a form the first pass didn't recognize, and search again; only declare zero targets after that reconsideration genuinely finds nothing.
- **prompts/fusions/Sonar.md**: 2 flags
  - opposing_modality: * **The Agent Tasks Board (`.jules/agent_tasks.md`):** Read this file for situational awareness only — do not claim tasks.
  - opposing_modality: 1. 🔍 **DISCOVER** — Priority Triage using asynchronous tools. Read `.jules/agent_tasks.md` for situational awareness before initiating your scan. Do not claim tasks. A single empty pass is not conclusive; before declaring zero targets, return to Repo Recon, reconsider whether the domain exists in a form the first pass didn't recognize, and search again; only declare zero targets after that reconsideration genuinely finds nothing.
- **prompts/fusions/Vector.md**: 2 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets according to declared priority weighting up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 25.
  - opposing_modality: 5. Ensure identical output shapes are maintained.
- **prompts/Scavenger.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Polygraph.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Town Crier.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.62
- **prompts/fusions/Sylar.md**: 1 flags
  - near_duplicate: * **Incremental Scope Lock:** Continue executing within your locked scope up to a maximum of 3. Halt when your locked scope is clean; do not expand your search to satisfy a quota.
- **prompts/fusions/Forensic Architect.md**: 1 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets arbitrarily up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 3.
- **prompts/fusions/Chameleon.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.75
- **prompts/fusions/Sculptor.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.71
- **prompts/fusions/Wordsmith.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.75
- **prompts/fusions/Discharge.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Canvas.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.75
- **prompts/fusions/Swatch.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.78
- **prompts/fusions/Cataloger.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Quarantine.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.75
- **prompts/orphans/Aegis.md**: 1 flags
  - opposing_modality: 2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Do not output findings or pause. Lock onto targets arbitrarily up to your limit. Log unhandled targets into your journal, but never submit a PR solely to say no targets were found. Journals exist exclusively to record critical architectural context for future runs, not execution history or non-important details. Target Limit: 1.
- **prompts/orphans/Sprinter.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.71

## 8. Recurring Tensions

## 9. Spot Check Sample
- prompts/fusions/Cerberus.md (Rank 1)
- prompts/fusions/Hyperloop.md (Rank 2)
- prompts/fusions/Surveyor.md (Rank 3)
- prompts/fusions/Slipstream.md (Rank 4)
- prompts/fusions/Bastion.md (Rank 5)
- prompts/fusions/Pruner.md (Rank 247)
- prompts/fusions/WorldGen.md (Rank 248)
- prompts/fusions/Foreman.md (Rank 249)
- prompts/fusions/Mulligan.md (Rank 250)
- prompts/orphans/Caliper.md (Rank 251)

## 10. Tool Lexicon & Inventory
Top Tools:

Missing Tools:

## 11. Effect Report

## 12. Reference Check and Human Anchors
Hazmat: 51
Paramedic: 17
Virtuoso: 238
Tokenizer: 92
Synchronizer: 199
Speed Camera: 146
Upgrader: 245

## 13. Blind Spots
The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
