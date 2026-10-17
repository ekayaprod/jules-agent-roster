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
Found: 277
Parsed: None found
Scored: 263
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
- H: -0.23
- B: 0.00
- C: 0.30
- D: 0.16
- I: 0.10
- F: 0.00
- A: -0.16
- E: 0.33
- composite: 0.13

## 6. Dimension correlation matrix
None found

Leave-one-dimension-out:
- A: 0.68
- B: 1.00
- C: 0.90
- D: 0.94
- E: 0.95
- F: 1.00
- H: 0.97
- I: 0.99

## 7. Top 25 and bottom 25
### Top 25
- **prompts/Navigator.md**: Rank 1.0 (p10-p90: 1.0-4.0)
  - Strengths: C [24.242424242424242] (89), I [5] (100)
  - Issues: None found
- **prompts/orphans/Historian.md**: Rank 2.0 (p10-p90: 1.0-24.0)
  - Strengths: C [25.0] (100), D [33.33333333333333] (86), E [4] (100)
  - Issues: H [2.3978952727983707] (19)
- **prompts/fusions/Triage.md**: Rank 3.0 (p10-p90: 2.0-11.0)
  - Strengths: A [4.284221525600835] (84), E [4] (100)
  - Issues: None found
- **prompts/fusions/Sanitizer.md**: Rank 4.0 (p10-p90: 2.0-15.0)
  - Strengths: C [22.58064516129032] (98), E [3] (88)
  - Issues: D [19.35483870967742] (18)
- **prompts/fusions/Surveyor.md**: Rank 5.0 (p10-p90: 4.0-10.0)
  - Strengths: E [3] (88)
  - Issues: None found
- **prompts/fusions/Narrator.md**: Rank 6.0 (p10-p90: 3.0-12.0)
  - Strengths: E [4] (100)
  - Issues: None found
- **prompts/fusions/Payload.md**: Rank 7.0 (p10-p90: 4.0-22.0)
  - Strengths: C [19.51219512195122] (90)
  - Issues: None found
- **prompts/orphans/Choreographer.md**: Rank 8.0 (p10-p90: 2.0-19.0)
  - Strengths: A [5.947955390334572] (100), H [3.295836866004329] (84), I [4] (80)
  - Issues: D [18.421052631578945] (17)
- **prompts/fusions/Viewmorph.md**: Rank 9.0 (p10-p90: 2.0-18.0)
  - Strengths: A [5.027322404371585] (90), H [3.1354942159291497] (85)
  - Issues: None found
- **prompts/Modernizer.md**: Rank 10.0 (p10-p90: 4.0-18.0)
  - Strengths: A [4.945904173106646] (92), I [5] (100)
  - Issues: None found
- **prompts/Paramedic.md**: Rank 11.0 (p10-p90: 2.0-37.0)
  - Strengths: C [24.390243902439025] (98), D [43.90243902439025] (96)
  - Issues: None found
- **prompts/fusions/Interrogator.md**: Rank 12.0 (p10-p90: 7.0-18.0)
  - Strengths: A [4.178814382896015] (83), E [3] (88)
  - Issues: None found
- **prompts/fusions/Collider.md**: Rank 13.0 (p10-p90: 6.0-23.0)
  - Strengths: C [26.31578947368421] (96), E [4] (100)
  - Issues: None found
- **prompts/Inspector.md**: Rank 14.0 (p10-p90: 4.0-36.0)
  - Strengths: D [41.66666666666667] (96), I [4] (80)
  - Issues: None found
- **prompts/fusions/Canner.md**: Rank 15.0 (p10-p90: 11.0-19.0)
  - Strengths: H [2.772588722239781] (84)
  - Issues: None found
- **prompts/fusions/Retrofitter.md**: Rank 16.0 (p10-p90: 5.0-32.0)
  - Strengths: A [6.333739342265529] (100), H [3.295836866004329] (96)
  - Issues: D [10.0] (6)
- **prompts/fusions/Sculptor.md**: Rank 17.0 (p10-p90: 5.0-31.0)
  - Strengths: A [6.447688564476886] (100), H [3.2188758248682006] (90), I [4] (80)
  - Issues: D [7.894736842105263] (3)
- **prompts/fusions/Hazmat.md**: Rank 18.0 (p10-p90: 13.0-25.0)
  - Strengths: A [4.554865424430641] (87)
  - Issues: None found
- **prompts/fusions/Overclock.md**: Rank 19.0 (p10-p90: 13.0-28.0)
  - Strengths: E [3] (88)
  - Issues: None found
- **prompts/fusions/Adversary.md**: Rank 20.0 (p10-p90: 6.0-48.0)
  - Strengths: D [52.5] (98), I [4] (80)
  - Issues: None found
- **prompts/fusions/Stylist.md**: Rank 21.0 (p10-p90: 13.0-30.0)
  - Strengths: A [5.421686746987952] (93)
  - Issues: D [17.391304347826086] (15)
- **prompts/fusions/Vice.md**: Rank 22.0 (p10-p90: 15.0-29.0)
  - Strengths: H [3.1354942159291497] (84), I [5] (100)
  - Issues: D [16.666666666666664] (14)
- **prompts/fusions/Limiter.md**: Rank 23.0 (p10-p90: 14.0-35.0)
  - Strengths: None found
  - Issues: I [1] (20)
- **prompts/fusions/City Clerk.md**: Rank 24.0 (p10-p90: 12.0-41.0)
  - Strengths: A [5.327868852459016] (96), E [4] (100)
  - Issues: D [9.523809523809524] (5)
- **prompts/fusions/Terraformer.md**: Rank 25.0 (p10-p90: 19.0-34.0)
  - Strengths: H [2.70805020110221] (83), I [5] (100)
  - Issues: D [14.814814814814813] (12)
### Bottom 25
- **prompts/fusions/Expediter.md**: Rank 239.0 (p10-p90: 216.0-250.0)
  - Strengths: None found
  - Issues: A [1.6052880075542966] (2)
- **prompts/fusions/Occam.md**: Rank 240.0 (p10-p90: 226.0-243.0)
  - Strengths: None found
  - Issues: A [1.5317286652078774] (10), D [9.375] (5)
- **prompts/Helix.md**: Rank 241.0 (p10-p90: 233.0-247.0)
  - Strengths: None found
  - Issues: A [1.7075773745997866] (16), D [8.571428571428571] (4), I [1] (20)
- **prompts/fusions/Syncopator.md**: Rank 242.0 (p10-p90: 233.0-248.0)
  - Strengths: None found
  - Issues: D [16.129032258064516] (14)
- **prompts/fusions/Whistleblower.md**: Rank 243.0 (p10-p90: 229.0-250.0)
  - Strengths: I [4] (80)
  - Issues: D [13.636363636363635] (11), E [1] (19)
- **prompts/fusions/Lumen.md**: Rank 244.0 (p10-p90: 228.0-250.0)
  - Strengths: I [4] (80)
  - Issues: A [1.6994633273703041] (8), D [9.30232558139535] (5)
- **prompts/fusions/WorldGen.md**: Rank 245.0 (p10-p90: 228.0-251.0)
  - Strengths: None found
  - Issues: C [7.5] (15), D [10.0] (6)
- **prompts/fusions/Lexicon.md**: Rank 246.0 (p10-p90: 230.0-248.0)
  - Strengths: None found
  - Issues: A [1.876675603217158] (5), D [11.11111111111111] (7)
- **prompts/micro/Echo.md**: Rank 247.0 (p10-p90: 228.0-253.0)
  - Strengths: None found
  - Issues: A [1.7429193899782136] (11), D [2.5] (0)
- **prompts/fusions/Logician.md**: Rank 248.0 (p10-p90: 237.0-248.0)
  - Strengths: I [4] (80)
  - Issues: A [2.3391812865497075] (15), D [4.444444444444445] (0)
- **prompts/fusions/Firewall.md**: Rank 249.0 (p10-p90: 233.0-252.0)
  - Strengths: None found
  - Issues: A [1.4883720930232558] (3), D [5.88235294117647] (1)
- **prompts/fusions/Void.md**: Rank 250.0 (p10-p90: 238.0-250.0)
  - Strengths: None found
  - Issues: A [1.6233766233766231] (8), D [7.4074074074074066] (3)
- **prompts/fusions/Tectonic.md**: Rank 251.0 (p10-p90: 246.0-254.0)
  - Strengths: None found
  - Issues: A [1.2061403508771928] (0), D [10.526315789473683] (7)
- **prompts/fusions/Transmuter.md**: Rank 252.0 (p10-p90: 248.0-257.0)
  - Strengths: I [4] (80)
  - Issues: A [1.8888888888888888] (9), C [2.7027027027027026] (6)
- **prompts/fusions/Typesetter.md**: Rank 253.0 (p10-p90: 253.0-255.0)
  - Strengths: None found
  - Issues: A [2.067464635473341] (7), D [13.636363636363635] (11)
- **prompts/fusions/Greenlight.md**: Rank 254.0 (p10-p90: 246.0-260.0)
  - Strengths: None found
  - Issues: A [1.9337016574585635] (8), C [2.857142857142857] (7)
- **prompts/fusions/Foresight.md**: Rank 255.0 (p10-p90: 250.0-258.0)
  - Strengths: None found
  - Issues: A [2.151639344262295] (15), D [11.904761904761903] (8), H [2.4849066497880004] (11)
- **prompts/fusions/Upgrader.md**: Rank 256.0 (p10-p90: 253.0-259.0)
  - Strengths: I [4] (80)
  - Issues: A [2.05761316872428] (9), D [5.714285714285714] (0)
- **prompts/fusions/Glossary.md**: Rank 257.0 (p10-p90: 251.0-261.0)
  - Strengths: None found
  - Issues: C [2.7777777777777777] (14), D [5.555555555555555] (0)
- **prompts/micro/Iconographer.md**: Rank 258.0 (p10-p90: 255.0-259.0)
  - Strengths: None found
  - Issues: A [1.8421052631578945] (5), D [5.405405405405405] (0)
- **prompts/fusions/Honeypot.md**: Rank 259.0 (p10-p90: 255.0-263.0)
  - Strengths: None found
  - Issues: A [1.3651877133105803] (0), C [0.0] (11), D [16.666666666666664] (14)
- **prompts/fusions/Actualizer.md**: Rank 260.0 (p10-p90: 256.0-263.0)
  - Strengths: None found
  - Issues: A [0.9857612267250823] (0), D [19.35483870967742] (18), H [1.9459101490553132] (9)
- **prompts/fusions/Sherpa.md**: Rank 261.0 (p10-p90: 257.0-263.0)
  - Strengths: None found
  - Issues: A [0.7493755203996669] (0), D [4.3478260869565215] (0)
- **prompts/micro/BoardClerk.md**: Rank 262.0 (p10-p90: 260.0-262.0)
  - Strengths: None found
  - Issues: A [1.9607843137254901] (10), D [9.090909090909092] (5)
- **prompts/fusions/Registrar.md**: Rank 263.0 (p10-p90: 257.0-263.0)
  - Strengths: I [4] (80)
  - Issues: A [1.9646365422396856] (20), C [4.0] (1), D [14.000000000000002] (11)

## 8. Redundancy
Clusters: None found
10 closest unique pairs:
- prompts/Scavenger.md and prompts/fusions/Gravedigger.md: 0.82
- prompts/Overseer.md and prompts/fusions/Sonar.md: 0.82
- prompts/Overseer.md and prompts/fusions/Aura.md: 0.80
- prompts/Dispatch.md and prompts/fusions/Dreadnought.md: 0.76
- prompts/fusions/Actualizer.md and prompts/fusions/Liquidator.md: 0.75
- prompts/fusions/Aura.md and prompts/fusions/Sonar.md: 0.73
- prompts/fusions/Medic.md and prompts/fusions/Quartermaster.md: 0.70
- prompts/fusions/Pacemaker.md and prompts/fusions/Rumble.md: 0.70
- prompts/fusions/Lexicon.md and prompts/fusions/Pacemaker.md: 0.70
- prompts/Overseer.md and prompts/fusions/Zoning Board.md: 0.70
Same-name pairs: None found

## 9. Coherence
Top 25 files by flags:
- prompts/fusions/Bastion.md: 6 flags
  - dangling_reference: **The Scoped Security Grant:** Authorizes the agen
  - dangling_reference: Step 1: Construct a reproduction test to prove the
  - dangling_reference: Step 2: Execute the transformation to explicitly w
- prompts/orphans/LiveFeed.md: 2 flags
  - dangling_reference: **Step 1: Intercept:** Wrap the raw asynchronous p
  - dangling_reference: **Step 2: Bind the Illusion:**
- prompts/Architect.md: 1 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
- prompts/Scribe.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Acetone.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes safel
- prompts/fusions/Annotator.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Auditor.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes the a
- prompts/fusions/Canvas.md: 1 flags
  - dangling_reference: The Scoped Generator Grant: Authorizes the agent t
- prompts/fusions/Chameleon.md: 1 flags
  - near_duplicate: 5. Validation — Ensure `outline` was used for focu
- prompts/fusions/Collider.md: 1 flags
  - dangling_reference: **The Scoped Instrumenter Grant:** Authorizes the
- prompts/fusions/Hive.md: 1 flags
  - opposing_modality: **The Test Immunity Doctrine:** Treat all test fil
- prompts/fusions/Jeweler.md: 1 flags
  - dangling_reference: **The Scoped Refactorer Grant:** Authorizes adding
- prompts/fusions/Mixologist.md: 1 flags
  - dangling_reference: **The Scoped Inspector Grant:** Authorize creating
- prompts/fusions/Obituary Writer.md: 1 flags
  - dangling_reference: **The Scoped Author Grant:** Authorizes creating,
- prompts/fusions/Organizer.md: 1 flags
  - dangling_reference: 🎯 **SELECT / CLASSIFY** — Silently classify target
- prompts/fusions/Ouija.md: 1 flags
  - dangling_reference: **The Scoped Scribe Grant:** Authorizes injecting
- prompts/fusions/Plumbline.md: 1 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes the cre
- prompts/fusions/Profiler.md: 1 flags
  - dangling_reference: **The Scoped Transformer Grant:** Authorizes behav
- prompts/fusions/Propagator.md: 1 flags
  - dangling_reference: **The Scoped Generator Grant:** Authorizes scaffol
- prompts/fusions/Reroll.md: 1 flags
  - dangling_reference: **The Scoped Pruner Grant:** Authorizes the deleti
- prompts/fusions/Respawn.md: 1 flags
  - opposing_modality: **The Clean Slate Authority (Destructive Execution
- prompts/fusions/Surveyor.md: 1 flags
  - dangling_reference: **The Scoped Relocation Grant:** Authorizes the ag
- prompts/fusions/Sylar.md: 1 flags
  - near_duplicate: **Incremental Scope Lock:** Continue executing wit
- prompts/fusions/Wayfinder.md: 1 flags
  - dangling_reference: **Operational (Read-Only Override Exception):** Yo
- prompts/fusions/Wordsmith.md: 1 flags
  - dangling_reference: **The Scoped Refactorer Grant:** Authorizes the ag
Recurring tensions: None found

## 10. Spot-check
- prompts/fusions/Zealot.md: 66.76
- prompts/fusions/Discharge.md: 56.36
- prompts/Cortex.md: 53.48
- prompts/fusions/Clearance.md: 47.71
- prompts/Untangler.md: 59.37
- prompts/fusions/Checkpoint.md: 46.36
- prompts/fusions/Coroner.md: 52.58
- prompts/fusions/Steward.md: 52.34
- prompts/fusions/Oracle.md: 56.07
- prompts/Modernizer.md: 71.03

Highest 5:
- prompts/Navigator.md: 75.43
- prompts/orphans/Historian.md: 72.68
- prompts/fusions/Triage.md: 72.59
- prompts/fusions/Sanitizer.md: 72.10
- prompts/fusions/Surveyor.md: 72.02

Lowest 5:
- prompts/fusions/Honeypot.md: 35.41
- prompts/fusions/Actualizer.md: 35.13
- prompts/fusions/Sherpa.md: 34.88
- prompts/micro/BoardClerk.md: 34.69
- prompts/fusions/Registrar.md: 34.27

## 11. Unavailable tools
- try: 1 agents
- #: 1 agents
- #!/usr/bin/env: 1 agents
- set: 1 agents
- cd: 1 agents

## 12. Effect report
Comparing against scores-20261011183951.csv
Spearman: None found
Top-25 overlap: None found
Bottom-25 overlap: None found
Largest movers: None found

## 13. Reference check
consistently low across earlier versions:
- Virtuoso: Rank 123.0
- Upgrader: Rank 256.0
- Pruner: Rank 235.0
- Foreman: Rank 194.0
- Sherpa: Rank 261.0
Unstable across versions:
- Hazmat: Rank 18.0
- Paramedic: Rank 11.0
Human anchors, BEST:
Human anchors, WORST:

## 14. Blind spots
the graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
