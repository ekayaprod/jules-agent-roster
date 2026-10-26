# Roster Grader Summary

## 1. Self-check
PASS: calibration matches code
PASS: every computed dimension has a weight or is advisory
WARN: D median 15.4 not between 25 and 75
WARN: F tied at min/max above 60%
WARN: F median 100.0 not between 25 and 75
WARN: D median 15.351170568561873 not between 25 and 75
WARN: F tied at min/max above 60%
WARN: F median 100 not between 25 and 75
PASS: frontmatter parse coverage (100.0%)
PASS: boilerplate stripping active
PASS: tools checked with shutil.which
PASS: unit tests pass

## 2. Coverage
Found: 259
Parsed: None found
Scored: 245
Excluded: 14
- prompts/README.md: readme file
- prompts/fusions/README.md: readme file
- prompts/system/3passcleaner.md: system part in path
- prompts/system/Audit-Procedure.md: system part in path
- prompts/system/Auto-Forge.md: system part in path
- prompts/system/Auto-Micro.md: system part in path
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
- D: 0.26
- E: 0.42
- H: -0.36
- A: -0.13
- F: 0.03
- B: 0.00
- I: 0.01
- C: 0.31
- composite: 0.20

## 6. Dimension correlation matrix
None found

Leave-one-dimension-out:
- A: 0.72
- B: 1.00
- C: 0.89
- D: 0.94
- E: 0.94
- F: 1.00
- H: 0.97
- I: 0.99

## 7. Top 25 and bottom 25
### Top 25
- **prompts/Navigator.md**: Rank 1.0 (p10-p90: 1.0-1.0)
  - Strengths: A [4.12262156448203] (82), C [24.242424242424242] (89), H [3.091042453358316] (82), I [5] (100)
  - Issues: None found
- **prompts/fusions/Payload.md**: Rank 2.0 (p10-p90: 2.0-6.0)
  - Strengths: C [21.951219512195124] (96), H [3.1354942159291497] (81)
  - Issues: None found
- **prompts/fusions/Adversary.md**: Rank 3.0 (p10-p90: 2.0-14.0)
  - Strengths: D [52.5] (98), I [4] (80)
  - Issues: None found
- **prompts/fusions/Interrogator.md**: Rank 4.0 (p10-p90: 3.0-8.0)
  - Strengths: A [4.637096774193548] (88), E [3] (88), I [4] (80)
  - Issues: None found
- **prompts/fusions/Surveyor.md**: Rank 5.0 (p10-p90: 5.0-9.0)
  - Strengths: A [4.395604395604396] (83), E [3] (88)
  - Issues: None found
- **prompts/Inspector.md**: Rank 6.0 (p10-p90: 3.0-21.0)
  - Strengths: D [41.66666666666667] (96), I [4] (80)
  - Issues: None found
- **prompts/fusions/Sanitizer.md**: Rank 7.0 (p10-p90: 3.0-15.0)
  - Strengths: A [4.850746268656716] (84), C [22.58064516129032] (98), E [3] (88)
  - Issues: D [19.35483870967742] (18)
- **prompts/fusions/Viewmorph.md**: Rank 8.0 (p10-p90: 3.0-17.0)
  - Strengths: A [5.561861520998865] (99), H [3.1354942159291497] (86)
  - Issues: None found
- **prompts/fusions/Narrator.md**: Rank 9.0 (p10-p90: 7.0-13.0)
  - Strengths: E [4] (100)
  - Issues: None found
- **prompts/fusions/Triage.md**: Rank 10.0 (p10-p90: 6.0-14.0)
  - Strengths: A [4.444444444444445] (83), E [4] (100)
  - Issues: None found
- **prompts/Modernizer.md**: Rank 11.0 (p10-p90: 4.0-18.0)
  - Strengths: A [5.507474429583006] (99), I [5] (100)
  - Issues: None found
- **prompts/fusions/Overclock.md**: Rank 12.0 (p10-p90: 8.0-17.0)
  - Strengths: A [4.502617801047121] (84), E [3] (88)
  - Issues: None found
- **prompts/fusions/Collider.md**: Rank 13.0 (p10-p90: 7.0-22.0)
  - Strengths: C [26.31578947368421] (96), E [4] (100)
  - Issues: None found
- **prompts/Paramedic.md**: Rank 14.0 (p10-p90: 4.0-45.0)
  - Strengths: C [21.951219512195124] (95), D [43.90243902439025] (96)
  - Issues: None found
- **prompts/fusions/Stylist.md**: Rank 15.0 (p10-p90: 11.0-28.0)
  - Strengths: A [6.425702811244979] (100)
  - Issues: D [17.391304347826086] (15)
- **prompts/Scribe.md**: Rank 16.0 (p10-p90: 13.0-27.0)
  - Strengths: I [4] (80)
  - Issues: None found
- **prompts/fusions/Hazmat.md**: Rank 17.0 (p10-p90: 13.0-26.0)
  - Strengths: A [4.968944099378882] (92)
  - Issues: None found
- **prompts/fusions/Systematizer.md**: Rank 18.0 (p10-p90: 13.0-26.0)
  - Strengths: C [27.77777777777778] (85), E [3] (81)
  - Issues: None found
- **prompts/fusions/Canner.md**: Rank 19.0 (p10-p90: 17.0-24.0)
  - Strengths: H [2.772588722239781] (84)
  - Issues: None found
- **prompts/fusions/Terraformer.md**: Rank 20.0 (p10-p90: 13.0-28.0)
  - Strengths: A [4.597701149425287] (82), H [2.772588722239781] (85), I [5] (100)
  - Issues: D [14.814814814814813] (12)
- **prompts/fusions/Retrofitter.md**: Rank 21.0 (p10-p90: 10.0-34.0)
  - Strengths: A [6.388526727509778] (100), H [3.2188758248682006] (100)
  - Issues: D [10.526315789473683] (7)
- **prompts/fusions/Harbormaster.md**: Rank 22.0 (p10-p90: 12.0-34.0)
  - Strengths: I [5] (100)
  - Issues: None found
- **prompts/fusions/Limiter.md**: Rank 23.0 (p10-p90: 15.0-34.0)
  - Strengths: C [15.789473684210526] (81)
  - Issues: I [1] (20)
- **prompts/fusions/Telemetrist.md**: Rank 24.0 (p10-p90: 17.0-27.0)
  - Strengths: H [2.70805020110221] (83)
  - Issues: None found
- **prompts/fusions/Flourish.md**: Rank 25.0 (p10-p90: 14.0-41.0)
  - Strengths: E [3] (88)
  - Issues: None found
### Bottom 25
- **prompts/fusions/REST Enforcer.md**: Rank 221.0 (p10-p90: 204.0-227.0)
  - Strengths: E [4] (81)
  - Issues: D [8.333333333333332] (4)
- **prompts/fusions/Synchronizer.md**: Rank 222.0 (p10-p90: 187.0-234.0)
  - Strengths: E [4] (81), I [4] (80)
  - Issues: A [1.7084282460136675] (4), D [13.333333333333334] (10)
- **prompts/fusions/Espresso.md**: Rank 223.0 (p10-p90: 203.0-228.0)
  - Strengths: None found
  - Issues: D [12.903225806451612] (10), I [1] (20)
- **prompts/fusions/Panopticon.md**: Rank 224.0 (p10-p90: 199.0-230.0)
  - Strengths: I [4] (80)
  - Issues: A [1.882845188284519] (17), D [2.564102564102564] (0)
- **prompts/fusions/Examiner.md**: Rank 225.0 (p10-p90: 195.0-234.0)
  - Strengths: None found
  - Issues: A [2.2908366533864544] (16), I [1] (20)
- **prompts/fusions/Pruner.md**: Rank 226.0 (p10-p90: 212.0-228.0)
  - Strengths: None found
  - Issues: D [11.627906976744185] (8)
- **prompts/fusions/Occam.md**: Rank 227.0 (p10-p90: 215.0-231.0)
  - Strengths: None found
  - Issues: D [9.375] (5)
- **prompts/fusions/Hologram.md**: Rank 228.0 (p10-p90: 212.0-233.0)
  - Strengths: None found
  - Issues: D [3.0303030303030303] (0)
- **prompts/fusions/Syncopator.md**: Rank 229.0 (p10-p90: 220.0-232.0)
  - Strengths: None found
  - Issues: D [16.129032258064516] (14)
- **prompts/orphans/Seawall.md**: Rank 230.0 (p10-p90: 212.0-235.0)
  - Strengths: I [4] (80)
  - Issues: D [10.0] (6), E [0] (0)
- **prompts/fusions/Electrician.md**: Rank 231.0 (p10-p90: 226.0-235.0)
  - Strengths: None found
  - Issues: D [17.142857142857142] (15)
- **prompts/micro/Iconographer.md**: Rank 232.0 (p10-p90: 225.0-236.0)
  - Strengths: None found
  - Issues: D [10.526315789473683] (7)
- **prompts/fusions/WorldGen.md**: Rank 233.0 (p10-p90: 223.0-238.0)
  - Strengths: None found
  - Issues: C [7.894736842105263] (17), D [10.526315789473683] (7)
- **prompts/fusions/Actualizer.md**: Rank 234.0 (p10-p90: 220.0-238.0)
  - Strengths: None found
  - Issues: A [1.5906680805938493] (18), H [2.4849066497880004] (19)
- **prompts/fusions/Whistleblower.md**: Rank 235.0 (p10-p90: 225.0-236.0)
  - Strengths: I [4] (80)
  - Issues: D [13.953488372093023] (11), E [1] (19)
- **prompts/fusions/Tectonic.md**: Rank 236.0 (p10-p90: 227.0-240.0)
  - Strengths: None found
  - Issues: A [1.644736842105263] (12), D [10.526315789473683] (7)
- **prompts/micro/Aligner.md**: Rank 237.0 (p10-p90: 232.0-240.0)
  - Strengths: None found
  - Issues: D [13.333333333333334] (10)
- **prompts/fusions/Firewall.md**: Rank 238.0 (p10-p90: 230.0-241.0)
  - Strengths: None found
  - Issues: A [1.5940488841657812] (15), D [8.571428571428571] (4)
- **prompts/fusions/Glossary.md**: Rank 239.0 (p10-p90: 232.0-243.0)
  - Strengths: None found
  - Issues: C [2.7777777777777777] (14), D [5.555555555555555] (0)
- **prompts/fusions/Foresight.md**: Rank 240.0 (p10-p90: 234.0-242.0)
  - Strengths: None found
  - Issues: D [11.904761904761903] (8), H [2.70805020110221] (18)
- **prompts/fusions/Upgrader.md**: Rank 241.0 (p10-p90: 239.0-244.0)
  - Strengths: I [4] (80)
  - Issues: D [5.714285714285714] (0)
- **prompts/fusions/Honeypot.md**: Rank 242.0 (p10-p90: 239.0-243.0)
  - Strengths: None found
  - Issues: A [1.702127659574468] (17), D [15.0] (12)
- **prompts/fusions/Registrar.md**: Rank 243.0 (p10-p90: 240.0-245.0)
  - Strengths: I [4] (80)
  - Issues: C [4.0] (1), D [14.000000000000002] (11)
- **prompts/fusions/Greenlight.md**: Rank 244.0 (p10-p90: 240.0-245.0)
  - Strengths: None found
  - Issues: A [1.9337016574585635] (8), C [2.857142857142857] (7)
- **prompts/fusions/Sherpa.md**: Rank 245.0 (p10-p90: 243.0-245.0)
  - Strengths: None found
  - Issues: A [1.2489592006661114] (3), D [4.3478260869565215] (0)

## 8. Redundancy
Clusters:
- ['prompts/Vibe Check.md', 'prompts/fusions/Reality Anchor.md']
10 closest unique pairs:
- prompts/Vibe Check.md and prompts/fusions/Reality Anchor.md: 0.88
- prompts/Scavenger.md and prompts/fusions/Gravedigger.md: 0.82
- prompts/Overseer.md and prompts/fusions/Sonar.md: 0.82
- prompts/Overseer.md and prompts/fusions/Aura.md: 0.76
- prompts/fusions/Aura.md and prompts/fusions/Sonar.md: 0.73
- prompts/Dispatch.md and prompts/fusions/Dreadnought.md: 0.71
- prompts/Architect.md and prompts/fusions/Plumbline.md: 0.70
- prompts/Vibe.md and prompts/fusions/Reclaimer.md: 0.69
- prompts/Overseer.md and prompts/fusions/Zoning Board.md: 0.68
- prompts/fusions/Realist.md and prompts/fusions/Reality Anchor.md: 0.67
Same-name pairs: None found

## 9. Coherence
Top 25 files by flags:
- prompts/fusions/Bastion.md: 6 flags
  - dangling_reference: **The Scoped Security Grant:** Authorizes the agen
  - dangling_reference: Step 1: Construct a reproduction test to prove the
  - dangling_reference: Step 2: Execute the transformation to explicitly w
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
- prompts/fusions/Zealot.md: 1 flags
  - dangling_reference: **The Scoped Operator Grant:** Authorizes the agen
- prompts/Author.md: 0 flags
Recurring tensions: None found

## 10. Spot-check
- prompts/fusions/Tectonic.md: 43.11
- prompts/fusions/Marshal.md: 58.30
- prompts/fusions/Aura.md: 56.65
- prompts/Author.md: 57.99
- prompts/fusions/Adversary.md: 75.46
- prompts/orphans/Blackbox.md: 54.31
- prompts/orphans/Speed Camera.md: 53.79
- prompts/orphans/Seawall.md: 45.51
- prompts/fusions/Toxicologist.md: 61.25
- prompts/fusions/Ratchet.md: 63.96

Highest 5:
- prompts/Navigator.md: 80.43
- prompts/fusions/Payload.md: 77.17
- prompts/fusions/Adversary.md: 75.46
- prompts/fusions/Interrogator.md: 74.60
- prompts/fusions/Surveyor.md: 74.02

Lowest 5:
- prompts/fusions/Upgrader.md: 40.58
- prompts/fusions/Honeypot.md: 40.32
- prompts/fusions/Registrar.md: 38.65
- prompts/fusions/Greenlight.md: 37.94
- prompts/fusions/Sherpa.md: 36.60

## 11. Unavailable tools
- try: 1 agents
- #: 1 agents
- #!/usr/bin/env: 1 agents
- set: 1 agents
- cd: 1 agents

## 12. Effect report
Comparing against scores-20261014191803.csv
Spearman: None found
Top-25 overlap: None found
Bottom-25 overlap: None found
Largest movers: None found

## 13. Reference check
consistently low across earlier versions:
- Upgrader: Rank 241.0
- Pruner: Rank 226.0
- Foreman: Rank 99.0
- Sherpa: Rank 245.0
Unstable across versions:
- Hazmat: Rank 17.0
- Paramedic: Rank 14.0
Human anchors, BEST:
Human anchors, WORST:

## 14. Blind spots
the graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
