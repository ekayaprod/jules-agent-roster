# Roster Grader Summary

## 1. Self-check
PASS: calibration matches code
PASS: every computed dimension has a weight or is advisory
WARN: D median 14.4 not between 25 and 75
WARN: F tied at min/max above 60%
WARN: F median 100.0 not between 25 and 75
WARN: D median 14.42307692307692 not between 25 and 75
WARN: F tied at min/max above 60%
WARN: F median 100 not between 25 and 75
PASS: frontmatter parse coverage (100.0%)
PASS: boilerplate stripping active
PASS: tools checked with shutil.which
PASS: unit tests pass

## 2. Coverage
Found: 273
Parsed: None found
Scored: 259
Excluded: 14
- prompts/README.md: readme file
- prompts/fusions/README.md: readme file
- prompts/system/3passcleaner.md: system part in path
- prompts/system/Audit-Procedure.md: system part in path
- prompts/system/Auto-Build.md: system part in path
- prompts/system/Auto-Forge.md: system part in path
- prompts/system/Auto-Remediation.md: system part in path
- prompts/system/Core-Agents-Matrix.md: system part in path
- prompts/system/Creative-Procedure.md: system part in path
- prompts/system/DATA_FLOW.md: system part in path
- prompts/system/Forge-Procedure.md: system part in path
- prompts/system/Improve-Prompt.md: system part in path
- prompts/system/Master-Forge.md: system part in path
- prompts/system/Scheduled-Auto-Run.md: system part in path

## 3. Method, weights, judgment calls
None found

## 4. Test results
None found

## 5. Length correlations
- C: 0.33
- H: -0.16
- I: 0.11
- A: -0.16
- D: 0.16
- B: 0.00
- E: 0.35
- F: -0.10
- composite: 0.17

## 6. Dimension correlation matrix
None found

Leave-one-dimension-out:
- A: 0.72
- B: 1.00
- C: 0.91
- D: 0.95
- E: 0.95
- F: 1.00
- H: 0.97
- I: 0.99

## 7. Top 25 and bottom 25
### Top 25
- **prompts/Navigator.md**: Rank 1.0 (p10-p90: 1.0-4.0)
  - Strengths: C [24.242424242424242] (89), I [5] (100)
  - Issues: None found
- **prompts/fusions/Payload.md**: Rank 2.0 (p10-p90: 1.0-9.0)
  - Strengths: C [22.5] (97)
  - Issues: None found
- **prompts/orphans/Historian.md**: Rank 3.0 (p10-p90: 1.0-24.0)
  - Strengths: C [25.0] (100), D [33.33333333333333] (86), E [4] (100)
  - Issues: H [2.3978952727983707] (19)
- **prompts/fusions/Triage.md**: Rank 4.0 (p10-p90: 2.0-11.0)
  - Strengths: A [4.284221525600835] (84), E [4] (100)
  - Issues: None found
- **prompts/fusions/Sanitizer.md**: Rank 5.0 (p10-p90: 3.0-16.0)
  - Strengths: C [22.58064516129032] (98), E [3] (88)
  - Issues: D [19.35483870967742] (18)
- **prompts/fusions/Bastion.md**: Rank 6.0 (p10-p90: 2.0-17.0)
  - Strengths: A [5.15695067264574] (94), C [18.91891891891892] (88), E [4] (88)
  - Issues: None found
- **prompts/fusions/Fractal.md**: Rank 7.0 (p10-p90: 5.0-15.0)
  - Strengths: E [4] (94)
  - Issues: None found
- **prompts/Paramedic.md**: Rank 8.0 (p10-p90: 3.0-30.0)
  - Strengths: C [23.25581395348837] (95), D [41.86046511627907] (91), E [3] (81)
  - Issues: None found
- **prompts/orphans/Choreographer.md**: Rank 9.0 (p10-p90: 2.0-20.0)
  - Strengths: A [5.947955390334572] (100), H [3.295836866004329] (84), I [4] (80)
  - Issues: D [18.421052631578945] (17)
- **prompts/fusions/Viewmorph.md**: Rank 10.0 (p10-p90: 3.0-19.0)
  - Strengths: A [5.027322404371585] (90), H [3.1354942159291497] (85)
  - Issues: None found
- **prompts/fusions/Narrator.md**: Rank 11.0 (p10-p90: 7.0-17.0)
  - Strengths: E [4] (100)
  - Issues: None found
- **prompts/fusions/Interrogator.md**: Rank 12.0 (p10-p90: 7.0-18.0)
  - Strengths: A [4.178814382896015] (83), E [3] (88)
  - Issues: None found
- **prompts/Modernizer.md**: Rank 13.0 (p10-p90: 5.0-20.0)
  - Strengths: A [4.87062404870624] (91), I [5] (100)
  - Issues: None found
- **prompts/fusions/Collider.md**: Rank 14.0 (p10-p90: 7.0-23.0)
  - Strengths: C [26.31578947368421] (96), E [4] (100)
  - Issues: None found
- **prompts/fusions/Surveyor.md**: Rank 15.0 (p10-p90: 12.0-21.0)
  - Strengths: E [3] (88)
  - Issues: None found
- **prompts/Inspector.md**: Rank 16.0 (p10-p90: 5.0-38.0)
  - Strengths: D [41.66666666666667] (96), I [4] (80)
  - Issues: None found
- **prompts/fusions/Retrofitter.md**: Rank 17.0 (p10-p90: 6.0-32.0)
  - Strengths: A [6.333739342265529] (100), H [3.295836866004329] (96)
  - Issues: D [10.0] (6)
- **prompts/fusions/Overclock.md**: Rank 18.0 (p10-p90: 14.0-29.0)
  - Strengths: E [3] (88)
  - Issues: None found
- **prompts/fusions/Sculptor.md**: Rank 19.0 (p10-p90: 7.0-36.0)
  - Strengths: A [6.294536817102138] (100), H [3.2188758248682006] (89), I [4] (80)
  - Issues: D [7.6923076923076925] (3)
- **prompts/fusions/Adversary.md**: Rank 20.0 (p10-p90: 7.0-50.0)
  - Strengths: D [52.5] (98), I [4] (80)
  - Issues: None found
- **prompts/fusions/Stylist.md**: Rank 21.0 (p10-p90: 13.0-31.0)
  - Strengths: A [5.421686746987952] (93)
  - Issues: D [17.391304347826086] (15)
- **prompts/fusions/Canner.md**: Rank 22.0 (p10-p90: 17.0-31.0)
  - Strengths: C [16.666666666666664] (83), E [3] (81)
  - Issues: None found
- **prompts/fusions/Hazmat.md**: Rank 23.0 (p10-p90: 17.0-31.0)
  - Strengths: A [4.4579533941236065] (84)
  - Issues: None found
- **prompts/fusions/Vice.md**: Rank 24.0 (p10-p90: 14.0-30.0)
  - Strengths: H [3.1354942159291497] (84), I [5] (100)
  - Issues: D [16.666666666666664] (14)
- **prompts/fusions/Limiter.md**: Rank 25.0 (p10-p90: 14.0-36.0)
  - Strengths: None found
  - Issues: I [1] (20)
### Bottom 25
- **prompts/fusions/Occam.md**: Rank 235.0 (p10-p90: 226.0-240.0)
  - Strengths: None found
  - Issues: A [1.4973262032085561] (8), D [9.090909090909092] (5)
- **prompts/fusions/Lumen.md**: Rank 236.0 (p10-p90: 223.0-244.0)
  - Strengths: I [4] (80)
  - Issues: A [1.6994633273703041] (8), D [9.30232558139535] (5)
- **prompts/fusions/WorldGen.md**: Rank 237.0 (p10-p90: 222.0-245.0)
  - Strengths: None found
  - Issues: C [7.5] (15), D [10.0] (6)
- **prompts/fusions/Logician.md**: Rank 238.0 (p10-p90: 230.0-243.0)
  - Strengths: I [4] (80)
  - Issues: A [2.3391812865497075] (15), D [4.444444444444445] (0)
- **prompts/fusions/Wayfinder.md**: Rank 239.0 (p10-p90: 225.0-246.0)
  - Strengths: None found
  - Issues: E [1] (19)
- **prompts/fusions/Lexicon.md**: Rank 240.0 (p10-p90: 230.0-245.0)
  - Strengths: None found
  - Issues: A [1.8276762402088773] (5), D [10.81081081081081] (7)
- **prompts/fusions/Firewall.md**: Rank 241.0 (p10-p90: 226.0-248.0)
  - Strengths: None found
  - Issues: A [1.4883720930232558] (3), D [5.88235294117647] (1)
- **prompts/fusions/Void.md**: Rank 242.0 (p10-p90: 231.0-247.0)
  - Strengths: None found
  - Issues: A [1.6233766233766231] (8), D [7.4074074074074066] (3)
- **prompts/fusions/Electrician.md**: Rank 243.0 (p10-p90: 232.0-245.0)
  - Strengths: None found
  - Issues: A [1.7045454545454544] (9), D [17.142857142857142] (15)
- **prompts/fusions/Foreman.md**: Rank 244.0 (p10-p90: 228.0-248.0)
  - Strengths: E [4] (88)
  - Issues: A [1.7957351290684627] (6), C [10.256410256410255] (17), D [17.94871794871795] (16)
- **prompts/fusions/Retcon.md**: Rank 245.0 (p10-p90: 233.0-246.0)
  - Strengths: None found
  - Issues: D [7.6923076923076925] (3)
- **prompts/orphans/Virtuoso.md**: Rank 246.0 (p10-p90: 217.0-254.0)
  - Strengths: I [4] (80)
  - Issues: C [5.555555555555555] (5), D [8.333333333333332] (4), E [0] (0)
- **prompts/fusions/Examiner.md**: Rank 247.0 (p10-p90: 229.0-254.0)
  - Strengths: None found
  - Issues: A [0.8325624421831638] (0), I [1] (20)
- **prompts/fusions/Tectonic.md**: Rank 248.0 (p10-p90: 241.0-252.0)
  - Strengths: None found
  - Issues: A [1.177730192719486] (0), D [10.256410256410255] (6)
- **prompts/fusions/Weaver.md**: Rank 249.0 (p10-p90: 245.0-254.0)
  - Strengths: None found
  - Issues: A [2.320887991927346] (16), D [10.869565217391305] (7)
- **prompts/fusions/Transmuter.md**: Rank 250.0 (p10-p90: 244.0-254.0)
  - Strengths: I [4] (80)
  - Issues: A [1.8888888888888888] (9), C [2.7027027027027026] (6)
- **prompts/micro/Nomenclator.md**: Rank 251.0 (p10-p90: 243.0-254.0)
  - Strengths: None found
  - Issues: D [2.857142857142857] (0), H [2.4849066497880004] (17)
- **prompts/fusions/Typesetter.md**: Rank 252.0 (p10-p90: 249.0-253.0)
  - Strengths: None found
  - Issues: A [2.067464635473341] (7), D [13.636363636363635] (11)
- **prompts/fusions/Greenlight.md**: Rank 253.0 (p10-p90: 241.0-255.0)
  - Strengths: None found
  - Issues: A [1.9337016574585635] (8), C [2.857142857142857] (7)
- **prompts/fusions/Upgrader.md**: Rank 254.0 (p10-p90: 248.0-256.0)
  - Strengths: I [4] (80)
  - Issues: A [2.05761316872428] (9), D [5.714285714285714] (0)
- **prompts/fusions/Honeypot.md**: Rank 255.0 (p10-p90: 252.0-257.0)
  - Strengths: None found
  - Issues: A [1.3651877133105803] (0), C [0.0] (11), D [16.666666666666664] (14)
- **prompts/fusions/Sherpa.md**: Rank 256.0 (p10-p90: 253.0-258.0)
  - Strengths: None found
  - Issues: A [0.7493755203996669] (0), D [4.3478260869565215] (0)
- **prompts/fusions/Mulligan.md**: Rank 257.0 (p10-p90: 255.0-258.0)
  - Strengths: None found
  - Issues: C [4.651162790697675] (7), D [13.953488372093023] (11)
- **prompts/fusions/Registrar.md**: Rank 258.0 (p10-p90: 255.0-258.0)
  - Strengths: I [4] (80)
  - Issues: A [1.9646365422396856] (20), C [4.0] (1), D [14.000000000000002] (11)
- **prompts/fusions/Prompt Engineer.md**: Rank 259.0 (p10-p90: 259.0-259.0)
  - Strengths: None found
  - Issues: A [2.083333333333333] (15), C [2.5] (0), D [10.0] (6), E [0] (0)

## 8. Redundancy
Clusters: None found
10 closest unique pairs:
- prompts/Scavenger.md and prompts/fusions/Gravedigger.md: 0.83
- prompts/Overseer.md and prompts/fusions/Sonar.md: 0.81
- prompts/Overseer.md and prompts/fusions/Aura.md: 0.80
- prompts/fusions/Lumen.md and prompts/fusions/Pacemaker.md: 0.73
- prompts/fusions/Dead-Ender.md and prompts/fusions/Examiner.md: 0.73
- prompts/fusions/Aura.md and prompts/fusions/Sonar.md: 0.72
- prompts/fusions/Medic.md and prompts/fusions/Quartermaster.md: 0.71
- prompts/Overseer.md and prompts/fusions/Zoning Board.md: 0.70
- prompts/fusions/Liquidator.md and prompts/fusions/Void.md: 0.70
- prompts/fusions/Pacemaker.md and prompts/fusions/Surgeon.md: 0.70
Same-name pairs: None found

## 9. Coherence
Top 25 files by flags:
- prompts/fusions/Bastion.md: 3 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: **The Scoped Security Grant:** Authorizes the agen
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/Architect.md: 2 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
  - dangling_reference: 🔍 **DISCOVER** — Native file system operations (`g
- prompts/fusions/Automata.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Calligrapher.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Canner.md: 2 flags
  - opposing_modality: **The Execution Rule:** Your discovery posture is
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Canvas.md: 2 flags
  - dangling_reference: The Scoped Generator Grant: Authorizes the agent t
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Examiner.md: 2 flags
  - opposing_modality: **The Orphan Protocol:** If the native test runner
  - dangling_reference: **The Scoped Pruner Grant:** Authorizes the agent
- prompts/fusions/Weaver.md: 2 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/orphans/LiveFeed.md: 2 flags
  - dangling_reference: **Step 1: Intercept:** Wrap the raw asynchronous p
  - dangling_reference: **Step 2: Bind the Illusion:**
- prompts/Scribe.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Acetone.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes safel
- prompts/fusions/Annotator.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Auditor.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes the a
- prompts/fusions/Cartographer.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Chameleon.md: 1 flags
  - near_duplicate: 5. Validation — Ensure `outline` was used for focu
- prompts/fusions/Collider.md: 1 flags
  - dangling_reference: **The Scoped Instrumenter Grant:** Authorizes the
- prompts/fusions/Foresight.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Hive.md: 1 flags
  - opposing_modality: **The Test Immunity Doctrine:** Treat all test fil
- prompts/fusions/Jeweler.md: 1 flags
  - dangling_reference: **The Scoped Refactorer Grant:** Authorizes adding
- prompts/fusions/Liquidator.md: 1 flags
  - dangling_reference: **The Scoped Refactorer Grant:** Authorizes the ag
- prompts/fusions/Mixologist.md: 1 flags
  - dangling_reference: **The Scoped Inspector Grant:** Authorize creating
- prompts/fusions/Obituary Writer.md: 1 flags
  - dangling_reference: **The Scoped Author Grant:** Authorizes creating,
- prompts/fusions/Organizer.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Ouija.md: 1 flags
  - dangling_reference: **The Scoped Scribe Grant:** Authorizes injecting
- prompts/fusions/Pacemaker.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
Recurring tensions: None found

## 10. Spot-check
- prompts/micro/Iconographer.md: 44.14
- prompts/fusions/Echodrop.md: 64.00
- prompts/Cortex.md: 54.86
- prompts/fusions/Collider.md: 70.34
- prompts/Untangler.md: 61.05
- prompts/fusions/Chronicle.md: 56.74
- prompts/fusions/Customs.md: 46.92
- prompts/fusions/Sunsetter.md: 51.30
- prompts/fusions/Overclock.md: 68.53
- prompts/Modernizer.md: 70.59

Highest 5:
- prompts/Navigator.md: 75.43
- prompts/fusions/Payload.md: 74.68
- prompts/orphans/Historian.md: 72.68
- prompts/fusions/Triage.md: 72.59
- prompts/fusions/Sanitizer.md: 72.10

Lowest 5:
- prompts/fusions/Honeypot.md: 35.41
- prompts/fusions/Sherpa.md: 34.88
- prompts/fusions/Mulligan.md: 34.71
- prompts/fusions/Registrar.md: 34.27
- prompts/fusions/Prompt Engineer.md: 28.51

## 11. Unavailable tools
- try: 1 agents
- #: 1 agents
- #!/usr/bin/env: 1 agents
- set: 1 agents
- cd: 1 agents

## 12. Effect report
Comparing against scores-20261011183757.csv
Spearman: None found
Top-25 overlap: None found
Bottom-25 overlap: None found
Largest movers: None found

## 13. Reference check
consistently low across earlier versions:
- Virtuoso: Rank 246.0
- Upgrader: Rank 254.0
- Pruner: Rank 227.0
- Foreman: Rank 244.0
- Sherpa: Rank 256.0
Unstable across versions:
- Hazmat: Rank 23.0
- Paramedic: Rank 8.0
Human anchors, BEST:
Human anchors, WORST:

## 14. Blind spots
the graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
