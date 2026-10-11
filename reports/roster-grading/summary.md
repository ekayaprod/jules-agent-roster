# Roster Grader Summary

## 1. Self-check
PASS: calibration matches code
PASS: every computed dimension has a weight or is advisory
PASS: all dimension distributions healthy
PASS: frontmatter parse coverage (100.0%)
PASS: boilerplate stripping active
PASS: tools checked with shutil.which
PASS: unit tests pass

## 2. Coverage
Found: 266
Parsed: None found
Scored: 253
Excluded: 13
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
- prompts/system/Master-Forge.md: system part in path
- prompts/system/Scheduled-Auto-Run.md: system part in path

## 3. Method, weights, judgment calls
None found

## 4. Test results
None found

## 5. Length correlations
- I: 0.12
- H: -0.27
- C: 0.36
- E: 0.39
- B: 0.00
- D: 0.17
- F: -0.13
- A: -0.16
- composite: 0.16

## 6. Dimension correlation matrix
None found

Leave-one-dimension-out:
- A: 0.72
- B: 1.00
- C: 0.91
- D: 0.95
- E: 0.94
- F: 0.99
- H: 0.97
- I: 0.99

## 7. Top 25 and bottom 25
### Top 25
- **prompts/Navigator.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [24.242424242424242] (89), I [5] (100), F (100)
  - Issues: None found
- **prompts/fusions/Payload.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [22.5] (97), F (100)
  - Issues: None found
- **prompts/orphans/Historian.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [25.0] (100), D [33.33333333333333] (86), E [4] (100), F (90)
  - Issues: H [2.3978952727983707] (19)
- **prompts/fusions/Triage.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [4.284221525600835] (84), E [4] (100), F (100)
  - Issues: None found
- **prompts/fusions/Sanitizer.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [22.58064516129032] (98), E [3] (88), F (100)
  - Issues: D [19.35483870967742] (18)
- **prompts/fusions/Bastion.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [5.15695067264574] (94), C [18.91891891891892] (88), E [4] (88)
  - Issues: None found
- **prompts/fusions/Fractal.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [4] (94), F (100)
  - Issues: None found
- **prompts/orphans/Choreographer.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [5.947955390334572] (100), H [3.295836866004329] (84), I [4] (80), F (100)
  - Issues: D [18.421052631578945] (17)
- **prompts/fusions/Viewmorph.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [5.027322404371585] (90), H [3.1354942159291497] (85), F (100)
  - Issues: None found
- **prompts/Paramedic.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [23.25581395348837] (95), D [37.2093023255814] (85), E [3] (81), F (100)
  - Issues: None found
- **prompts/fusions/Narrator.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [4] (100), F (100)
  - Issues: None found
- **prompts/fusions/Interrogator.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [4.178814382896015] (83), E [3] (88), F (100)
  - Issues: None found
- **prompts/Modernizer.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [4.87062404870624] (91), I [5] (100), F (100)
  - Issues: None found
- **prompts/fusions/Collider.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [26.31578947368421] (96), E [4] (100), F (90)
  - Issues: None found
- **prompts/fusions/Surveyor.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [3] (88), F (90)
  - Issues: None found
- **prompts/fusions/Retrofitter.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [6.333739342265529] (100), H [3.295836866004329] (96), F (100)
  - Issues: D [10.0] (6)
- **prompts/fusions/Overclock.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [3] (88), F (100)
  - Issues: None found
- **prompts/fusions/Sculptor.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [6.294536817102138] (100), H [3.2188758248682006] (89), I [4] (80), F (100)
  - Issues: D [7.6923076923076925] (3)
- **prompts/fusions/Stylist.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [5.421686746987952] (93), F (100)
  - Issues: D [17.391304347826086] (15)
- **prompts/fusions/Canner.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [16.666666666666664] (83), E [3] (81), F (80)
  - Issues: None found
- **prompts/fusions/Hazmat.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: A [4.4579533941236065] (84), F (100)
  - Issues: None found
- **prompts/fusions/Vice.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: H [3.1354942159291497] (84), I [5] (100), F (100)
  - Issues: D [16.666666666666664] (14)
- **prompts/fusions/Limiter.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: I [1] (20)
- **prompts/fusions/Telemetrist.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [22.727272727272727] (98), F (90)
  - Issues: None found
- **prompts/fusions/Zealot.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: C [23.809523809523807] (91), E [4] (94)
  - Issues: None found
### Bottom 25
- **prompts/fusions/Lumen.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: A [1.6994633273703041] (8), D [9.30232558139535] (5)
- **prompts/fusions/WorldGen.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: C [7.5] (15), D [10.0] (6)
- **prompts/fusions/Logician.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: A [2.3391812865497075] (15), D [4.444444444444445] (0)
- **prompts/fusions/Wayfinder.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (90)
  - Issues: E [1] (19)
- **prompts/fusions/Lexicon.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.8276762402088773] (5), D [10.81081081081081] (7)
- **prompts/fusions/Firewall.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.4883720930232558] (3), D [5.88235294117647] (1)
- **prompts/fusions/Void.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.6233766233766231] (8), D [7.4074074074074066] (3)
- **prompts/fusions/Electrician.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.7045454545454544] (9), D [17.142857142857142] (15)
- **prompts/fusions/Foreman.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [4] (88), F (100)
  - Issues: A [1.7957351290684627] (6), C [10.256410256410255] (17), D [17.94871794871795] (16)
- **prompts/fusions/Retcon.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: D [7.6923076923076925] (3)
- **prompts/orphans/Virtuoso.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: C [5.555555555555555] (5), D [8.333333333333332] (4), E [0] (0)
- **prompts/fusions/Tectonic.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [4] (81), F (90)
  - Issues: A [1.503006012024048] (3), D [6.976744186046512] (2)
- **prompts/orphans/Tokenizer.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: H [2.639057329615259] (81), I [4] (80), F (100)
  - Issues: C [2.2222222222222223] (0), D [15.555555555555555] (13), E [0] (0)
- **prompts/fusions/Examiner.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (80)
  - Issues: A [0.8325624421831638] (0), I [1] (20)
- **prompts/fusions/Weaver.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: E [4] (81), I [4] (80), F (80)
  - Issues: A [1.9047619047619049] (8), D [10.714285714285714] (7)
- **prompts/micro/Nomenclator.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: D [2.857142857142857] (0), H [2.4849066497880004] (17)
- **prompts/fusions/Greenlight.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.9337016574585635] (8), C [2.857142857142857] (7)
- **prompts/fusions/Upgrader.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: A [2.05761316872428] (9), D [5.714285714285714] (0)
- **prompts/fusions/Transmuter.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: A [1.4908256880733946] (1), C [2.7777777777777777] (7), D [19.444444444444446] (18)
- **prompts/fusions/Honeypot.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.3651877133105803] (0), C [0.0] (11), D [16.666666666666664] (14)
- **prompts/fusions/Sherpa.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [0.7493755203996669] (0), D [4.3478260869565215] (0)
- **prompts/fusions/Registrar.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: I [4] (80), F (100)
  - Issues: A [1.9646365422396856] (20), C [4.0] (1), D [14.000000000000002] (11)
- **prompts/fusions/Mulligan.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: C [5.405405405405405] (11), D [13.513513513513514] (10), I [1] (20)
- **prompts/fusions/Typesetter.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.2276785714285714] (0), D [9.30232558139535] (5)
- **prompts/fusions/Prompt Engineer.md**: Rank 0 (p10-p90: 0-0)
  - Strengths: F (100)
  - Issues: A [1.66270783847981] (3), C [5.714285714285714] (5), D [11.428571428571429] (8), E [0] (0)

## 8. Redundancy
Clusters: None found
10 closest unique pairs:
- prompts/Overseer.md and prompts/fusions/Sonar.md: 0.81
- prompts/fusions/Lumen.md and prompts/fusions/Pacemaker.md: 0.73
- prompts/fusions/Dead-Ender.md and prompts/fusions/Examiner.md: 0.72
- prompts/fusions/Medic.md and prompts/fusions/Quartermaster.md: 0.71
- prompts/Overseer.md and prompts/fusions/Zoning Board.md: 0.70
- prompts/fusions/Pacemaker.md and prompts/fusions/Surgeon.md: 0.70
- prompts/fusions/Pacemaker.md and prompts/fusions/Triage Commander.md: 0.69
- prompts/Vibe.md and prompts/fusions/Reclaimer.md: 0.69
- prompts/fusions/Examiner.md and prompts/fusions/Expediter.md: 0.68
- prompts/fusions/Medic.md and prompts/fusions/Surgeon.md: 0.68
Same-name pairs: None found

## 9. Coherence
Top 25 files by flags:
- prompts/fusions/Adversary.md: 3 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: **The Scoped Subversion Grant:** Authorizes tempor
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Auditor.md: 3 flags
  - dangling_reference: The Scoped Transformer Grant: Authorizes the agent
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
  - near_duplicate: Verify Contract: Confirm the central constants obj
- prompts/fusions/Bastion.md: 3 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: **The Scoped Security Grant:** Authorizes the agen
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Zealot.md: 3 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: **The Scoped Operator Grant:** Authorizes the agen
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/Architect.md: 2 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
  - dangling_reference: 🔍 **DISCOVER** — Native file system operations (`g
- prompts/fusions/Archivist.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
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
- prompts/fusions/Ghost Hunter.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Liquidator.md: 2 flags
  - dangling_reference: **The Scoped Refactorer Grant:** Authorizes the ag
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Smith.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Threat Modeler.md: 2 flags
  - opposing_modality: Your discovery posture is bounded-sweep. You are a
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Weaver.md: 2 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/orphans/LiveFeed.md: 2 flags
  - dangling_reference: **Step 1: Intercept:** Wrap the raw asynchronous p
  - dangling_reference: **Step 2: Bind the Illusion:**
- prompts/Inspector.md: 1 flags
  - dangling_reference: **The Atomic Inversion Grant:** Authorizes tempora
- prompts/Scribe.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Acetone.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes safel
- prompts/fusions/Annotator.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Barricade.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Cartographer.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Chameleon.md: 1 flags
  - near_duplicate: 5. Validation — Ensure `outline` was used for focu
- prompts/fusions/Collider.md: 1 flags
  - dangling_reference: **The Scoped Instrumenter Grant:** Authorizes the
Recurring tensions: None found

## 10. Spot-check
- prompts/orphans/Stress Tester.md: 51.62
- prompts/fusions/Triage Commander.md: 51.62
- prompts/fusions/Obituary Writer.md: 56.59
- prompts/fusions/Barricade.md: 44.26
- prompts/Author.md: 51.15
- prompts/fusions/Amputator.md: 58.61
- prompts/orphans/Historian.md: 72.68
- prompts/orphans/Redactor.md: 46.56
- prompts/orphans/Publicist.md: 58.42
- prompts/fusions/Void.md: 41.12

Highest 5:
- prompts/Navigator.md: 75.43
- prompts/fusions/Payload.md: 74.68
- prompts/orphans/Historian.md: 72.68
- prompts/fusions/Triage.md: 72.59
- prompts/fusions/Sanitizer.md: 72.10

Lowest 5:
- prompts/fusions/Sherpa.md: 34.88
- prompts/fusions/Registrar.md: 34.27
- prompts/fusions/Mulligan.md: 33.97
- prompts/fusions/Typesetter.md: 30.87
- prompts/fusions/Prompt Engineer.md: 26.00

## 11. Unavailable tools
- try: 1 agents
- #: 1 agents
- #!/usr/bin/env: 1 agents
- set: 1 agents
- cd: 1 agents

## 12. Effect report
scoring method changed from percentiles to fixed curves; ranks are not comparable.

## 13. Reference check
consistently low across earlier versions:
- Virtuoso: Rank 0
- Upgrader: Rank 0
- Pruner: Rank 0
- Foreman: Rank 0
- Sherpa: Rank 0
Unstable across versions:
- Hazmat: Rank 0
- Paramedic: Rank 0
Human anchors, BEST:
Human anchors, WORST:

## 14. Blind spots
the graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
