# Roster Grader Summary

## 1. Headline
Tiers: Top (83), Middle (81), Bottom (85), Unstable (1)

Top 10 Most Unstable Files:
- prompts/orphans/emptyslots.md (Range: 92 - 150)

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
Length Correlation (before): {"A": -0.13, "B": -0.19, "C": 0.25, "D": 0.14, "E": 0.46, "H": -0.27, "Composite": 0.1}
Length Correlation (after): {"A": -0.13, "B": -0.19, "C": 0.25, "D": 0.14, "E": 0.46, "H": -0.27}

Dimension Correlation Matrix:
| | A | B | C | D | E | F | H |
|---|---|---|---|---|---|---|---|
| A | 1.00 | 0.45 | -0.10 | -0.11 | -0.11 | -0.04 | 0.56 |
| B | 0.45 | 1.00 | -0.19 | -0.09 | -0.30 | 0.05 | 0.36 |
| C | -0.10 | -0.19 | 1.00 | 0.24 | 0.43 | -0.11 | -0.27 |
| D | -0.11 | -0.09 | 0.24 | 1.00 | 0.13 | 0.00 | -0.17 |
| E | -0.11 | -0.30 | 0.43 | 0.13 | 1.00 | -0.00 | -0.26 |
| F | -0.04 | 0.05 | -0.11 | 0.00 | -0.00 | 1.00 | 0.02 |
| H | 0.56 | 0.36 | -0.27 | -0.17 | -0.26 | 0.02 | 1.00 |

## 5. Top 25 and Bottom 25

### Top 25
- **prompts/fusions/Bastion.md**: Rank 1 (p10-p90: 1-1)
  - Strengths: A (94.2), C (85.9), E (80.8)
  - Issues: H (54.5), D (60.3), B (66.3)
- **prompts/fusions/Zealot.md**: Rank 2 (p10-p90: 2-2)
  - Strengths: E (86.1), A (76.6), C (71.3)
  - Issues: H (60.7), B (68.8), D (71.2)
- **prompts/fusions/Sanitizer.md**: Rank 3 (p10-p90: 3-4)
  - Strengths: C (87.0), E (81.2), B (77.8)
  - Issues: H (39.8), D (67.9), A (72.5)
- **prompts/fusions/Payload.md**: Rank 4 (p10-p90: 3-5)
  - Strengths: E (94.8), C (93.6), D (75.9)
  - Issues: A (47.6), H (54.5), B (70.6)
- **prompts/fusions/Surveyor.md**: Rank 5 (p10-p90: 4-6)
  - Strengths: E (86.1), D (82.1), A (78.6)
  - Issues: H (42.0), C (51.7), B (69.7)
- **prompts/fusions/Yggdrasil.md**: Rank 6 (p10-p90: 5-7)
  - Strengths: B (83.1), H (79.9), A (76.6)
  - Issues: D (45.8), C (60.1), E (73.1)
- **prompts/fusions/Interrogator.md**: Rank 7 (p10-p90: 6-7)
  - Strengths: D (94.6), A (70.8), B (67.3)
  - Issues: H (41.4), C (58.7), E (63.0)
- **prompts/fusions/Overclock.md**: Rank 8 (p10-p90: 8-12)
  - Strengths: D (91.3), E (78.4), B (70.9)
  - Issues: C (48.2), H (49.9), A (62.0)
- **prompts/fusions/Narrator.md**: Rank 9 (p10-p90: 8-12)
  - Strengths: C (81.1), E (77.6), A (71.9)
  - Issues: H (49.1), D (51.5), B (59.1)
- **prompts/fusions/Hazmat.md**: Rank 10 (p10-p90: 8-15)
  - Strengths: B (92.1), D (80.0), A (74.8)
  - Issues: E (18.6), H (41.8), C (69.7)
- **prompts/fusions/Hyperloop.md**: Rank 11 (p10-p90: 9-14)
  - Strengths: E (80.1), C (78.2), B (73.7)
  - Issues: A (55.4), H (56.5), D (57.4)
- **prompts/fusions/Collider.md**: Rank 12 (p10-p90: 9-16)
  - Strengths: E (96.1), D (90.8), C (71.1)
  - Issues: H (38.2), B (45.2), A (50.9)
- **prompts/orphans/Choreographer.md**: Rank 13 (p10-p90: 9-17)
  - Strengths: A (95.9), H (80.7), C (59.4)
  - Issues: D (46.3), E (47.5), B (56.8)
- **prompts/fusions/Viewmorph.md**: Rank 14 (p10-p90: 11-17)
  - Strengths: B (87.9), A (79.4), C (74.4)
  - Issues: D (31.1), E (54.7), H (58.5)
- **prompts/fusions/Cerberus.md**: Rank 15 (p10-p90: 14-19)
  - Strengths: C (91.2), E (81.2), A (69.0)
  - Issues: H (39.8), B (46.4), D (47.1)
- **prompts/fusions/Slipstream.md**: Rank 16 (p10-p90: 13-19)
  - Strengths: C (84.0), E (68.3), D (66.8)
  - Issues: H (45.2), B (57.2), A (57.6)
- **prompts/Scavenger.md**: Rank 17 (p10-p90: 13-21)
  - Strengths: E (90.5), C (88.4), A (70.2)
  - Issues: D (28.7), B (48.9), H (55.7)
- **prompts/orphans/Janitor.md**: Rank 18 (p10-p90: 13-22)
  - Strengths: A (98.3), H (57.5), C (55.4)
  - Issues: D (45.0), B (50.4), C (55.4)
- **prompts/fusions/Groundskeeper.md**: Rank 19 (p10-p90: 15-23)
  - Strengths: A (85.4), E (68.3), H (65.7)
  - Issues: B (40.1), C (45.3), D (61.6)
- **prompts/fusions/Millisecond.md**: Rank 20 (p10-p90: 16-23)
  - Strengths: D (77.5), C (74.0), E (63.7)
  - Issues: H (41.7), B (52.6), A (59.9)
- **prompts/fusions/Terraformer.md**: Rank 21 (p10-p90: 18-25)
  - Strengths: C (83.0), H (72.7), D (62.0)
  - Issues: B (49.9), A (52.7), E (56.0)
- **prompts/fusions/Triage.md**: Rank 22 (p10-p90: 20-24)
  - Strengths: E (77.6), A (74.8), D (63.9)
  - Issues: H (42.1), C (59.4), B (60.7)
- **prompts/fusions/Retrofitter.md**: Rank 23 (p10-p90: 19-27)
  - Strengths: H (91.6), A (76.6), C (64.4)
  - Issues: D (25.5), E (56.0), B (60.9)
- **prompts/fusions/Canner.md**: Rank 24 (p10-p90: 20-27)
  - Strengths: E (90.5), D (78.2), C (68.7)
  - Issues: B (14.3), A (55.6), H (60.1)
- **prompts/fusions/Helmsman.md**: Rank 25 (p10-p90: 23-26)
  - Strengths: E (81.5), A (69.4), B (62.6)
  - Issues: H (43.3), C (55.4), D (56.7)

### Bottom 25
- **prompts/fusions/Tectonic.md**: Rank 226 (p10-p90: 223-230)
  - Strengths: E (53.5), H (53.4), B (36.3)
  - Issues: A (17.2), C (20.1), D (33.4)
- **prompts/fusions/Typesetter.md**: Rank 227 (p10-p90: 222-231)
  - Strengths: D (54.8), C (47.4), E (45.9)
  - Issues: B (6.5), A (6.9), H (37.2)
- **prompts/fusions/Occam.md**: Rank 228 (p10-p90: 225-234)
  - Strengths: C (60.9), E (45.9), D (33.0)
  - Issues: A (3.2), B (28.7), H (31.1)
- **prompts/fusions/Grammarian.md**: Rank 229 (p10-p90: 226-233)
  - Strengths: C (51.2), B (43.4), H (35.5)
  - Issues: A (16.2), E (18.6), D (30.8)
- **prompts/fusions/WorldGen.md**: Rank 230 (p10-p90: 224-235)
  - Strengths: B (72.7), H (44.8), E (27.4)
  - Issues: D (15.6), C (23.3), A (24.7)
- **prompts/fusions/Surgeon.md**: Rank 231 (p10-p90: 225-234)
  - Strengths: E (73.2), D (54.8), H (40.9)
  - Issues: A (3.3), B (10.2), C (26.0)
- **prompts/fusions/Illuminator.md**: Rank 232 (p10-p90: 225-235)
  - Strengths: H (63.3), E (45.9), D (35.3)
  - Issues: C (15.2), B (16.4), A (25.3)
- **prompts/fusions/Pacemaker.md**: Rank 233 (p10-p90: 226-236)
  - Strengths: E (80.1), C (54.0), D (45.7)
  - Issues: A (3.2), B (3.7), H (10.0)
- **prompts/fusions/Transmuter.md**: Rank 234 (p10-p90: 231-237)
  - Strengths: B (51.5), C (51.5), D (44.3)
  - Issues: A (2.0), E (18.6), H (27.9)
- **prompts/orphans/Virtuoso.md**: Rank 235 (p10-p90: 226-239)
  - Strengths: B (65.6), A (44.5), H (41.7)
  - Issues: C (4.0), E (6.3), D (24.0)
- **prompts/fusions/Canvas.md**: Rank 236 (p10-p90: 232-237)
  - Strengths: E (53.5), D (51.6), H (48.8)
  - Issues: B (5.5), A (9.5), C (26.4)
- **prompts/fusions/Espresso.md**: Rank 237 (p10-p90: 234-238)
  - Strengths: H (52.4), E (45.9), C (39.7)
  - Issues: A (4.9), D (26.2), B (34.5)
- **prompts/micro/Echo.md**: Rank 238 (p10-p90: 235-239)
  - Strengths: E (72.6), C (39.4), A (28.1)
  - Issues: D (6.9), B (16.0), H (20.3)
- **prompts/fusions/Expediter.md**: Rank 239 (p10-p90: 236-240)
  - Strengths: D (67.8), C (42.2), E (36.9)
  - Issues: A (3.4), B (8.0), H (17.0)
- **prompts/fusions/Pruner.md**: Rank 240 (p10-p90: 239-240)
  - Strengths: E (73.1), H (35.8), C (32.2)
  - Issues: B (12.2), A (13.9), D (17.2)
- **prompts/micro/Nomenclator.md**: Rank 241 (p10-p90: 241-242)
  - Strengths: E (55.4), B (46.3), C (38.0)
  - Issues: D (9.7), H (10.5), A (15.3)
- **prompts/fusions/REST Enforcer.md**: Rank 242 (p10-p90: 242-244)
  - Strengths: B (46.5), C (40.0), E (36.9)
  - Issues: A (0.4), D (24.0), H (27.9)
- **prompts/fusions/Mulligan.md**: Rank 243 (p10-p90: 242-244)
  - Strengths: B (58.1), C (35.4), E (27.4)
  - Issues: A (12.0), H (14.9), D (20.1)
- **prompts/fusions/Logician.md**: Rank 244 (p10-p90: 242-244)
  - Strengths: E (53.5), H (39.4), C (25.6)
  - Issues: D (15.9), A (16.4), B (19.6)
- **prompts/fusions/Upgrader.md**: Rank 245 (p10-p90: 245-246)
  - Strengths: B (61.2), D (35.3), H (27.7)
  - Issues: A (7.3), E (12.6), C (14.2)
- **prompts/fusions/Foreman.md**: Rank 246 (p10-p90: 245-246)
  - Strengths: E (39.9), H (34.2), D (28.4)
  - Issues: A (2.5), C (26.5), B (28.4)
- **prompts/fusions/Prompt Engineer.md**: Rank 247 (p10-p90: 247-249)
  - Strengths: B (95.9), H (28.1), E (15.1)
  - Issues: A (3.6), C (5.4), D (13.7)
- **prompts/fusions/Lumen.md**: Rank 248 (p10-p90: 247-249)
  - Strengths: E (63.7), D (27.6), C (21.6)
  - Issues: B (4.7), A (8.2), H (13.7)
- **prompts/fusions/Forensic Architect.md**: Rank 249 (p10-p90: 248-249)
  - Strengths: D (44.8), H (25.2), C (16.7)
  - Issues: E (10.2), A (11.2), B (15.8)
- **prompts/fusions/Sherpa.md**: Rank 250 (p10-p90: 250-250)
  - Strengths: C (52.8), B (42.8), E (21.4)
  - Issues: A (0.0), D (1.2), H (14.1)

## 6. Redundancy
Top 10 Closest Pairs:
- 0.58: prompts/Architect.md and prompts/fusions/Plumbline.md
- 0.58: prompts/Navigator.md and prompts/fusions/Harbormaster.md
- 0.56: prompts/Overseer.md and prompts/fusions/Zoning Board.md
- 0.51: prompts/Helix.md and prompts/fusions/Conveyor.md
- 0.50: prompts/Author.md and prompts/fusions/Ghostwriter.md
- 0.48: prompts/fusions/Pacemaker.md and prompts/fusions/Lumen.md
- 0.47: prompts/fusions/Pacemaker.md and prompts/fusions/Canvas.md
- 0.45: prompts/Bolt+.md and prompts/fusions/Overdrive.md
- 0.44: prompts/Scavenger.md and prompts/fusions/Demolition.md
- 0.44: prompts/Dispatch.md and prompts/fusions/Echodrop.md

Same-Name File Pairs:
- 0.13: prompts/Janitor.md and prompts/orphans/Janitor.md

## 7. Coherence
Top 25 files by F flags:
- **prompts/Janitor.md**: 1 flags
  - opposing_modality: * 🔦 What cannot be bagged must be illuminated — shine a light on observable hazards and log them to the journal for institutional awareness without polluting the task board.
- **prompts/Dispatch.md**: 1 flags
  - opposing_modality: * 🛑 Protocol correctness is non-negotiable; structural integrity must be strictly validated by native YAML linters or dry-run builds before the cargo leaves the bay.
- **prompts/micro/Nomenclator.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Firewall.md**: 1 flags
  - opposing_modality: * **The Ephemeral Key Guard:** Construct authentication headers using strictly typed environment variables. Do not hardcode raw API keys into source files.
- **prompts/fusions/Polygraph.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Sylar.md**: 1 flags
  - near_duplicate: * **Incremental Scope Lock:** Continue executing within your locked scope up to a maximum of 3. Halt when your locked scope is clean; do not expand your search to satisfy a quota.
- **prompts/fusions/Sculptor.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Retrofit.md**: 1 flags
  - opposing_modality: * 🛡️ Every retrofitted manifest must be validated strictly by native YAML linters and container dry-runs before the payload leaves the dock.
- **prompts/fusions/Triage.md**: 1 flags
  - opposing_modality: * **The State Bounding Rule:** When updating `catch` or `finally` blocks to restore application state, exclusively utilize state-setter functions (e.g., `setIsLoading`) that are already imported and visibly present within the immediate module scope. Do not hallucinate or import net-new global state management actions.
- **prompts/fusions/Warden.md**: 1 flags
  - opposing_modality: * 🛑 Protocol correctness is non-negotiable; structural integrity must be strictly validated by native AST tools and YAML linters before the cargo leaves the bay.
- **prompts/fusions/Sherpa.md**: 1 flags
  - opposing_modality: * 🗺️ Follow the native trail. Guidance must use the repository's existing components, interaction patterns, terminology, and visual language.
- **prompts/fusions/Discharge.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Canvas.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Bastion.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Void.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Cataloger.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Mapper.md**: 1 flags
  - opposing_modality: * **No Interactive Dependency Generation:** Do not wait for the user to provide exact dependencies or logic bugs; outline what tests need to be written, leaving the implementation to downstream agents.
- **prompts/fusions/Rulemaker.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/fusions/Obituary Writer.md**: 1 flags
  - opposing_modality: * **Domain:** Execute strictly to identify and delete targets. If deletion breaks a dependency, do not refactor the dependency. Revert the deletion, leave the dead code, and proceed.
- **prompts/fusions/Quarantine.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.50
- **prompts/fusions/Scout.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/orphans/Sprinter.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.60
- **prompts/orphans/Publicist.md**: 1 flags
  - mission_drift_advisory: Mission drift score: 0.67
- **prompts/orphans/Choreographer.md**: 1 flags
  - opposing_modality: * Uncover form submit buttons that do not visually disable or pulse while `isSubmitting` is true.

## 8. Recurring Tensions

## 9. Spot Check Sample
- prompts/fusions/Bastion.md (Rank 1)
- prompts/fusions/Zealot.md (Rank 2)
- prompts/fusions/Sanitizer.md (Rank 3)
- prompts/fusions/Payload.md (Rank 4)
- prompts/fusions/Surveyor.md (Rank 5)
- prompts/fusions/Foreman.md (Rank 246)
- prompts/fusions/Prompt Engineer.md (Rank 247)
- prompts/fusions/Lumen.md (Rank 248)
- prompts/fusions/Forensic Architect.md (Rank 249)
- prompts/fusions/Sherpa.md (Rank 250)

## 10. Tool Lexicon & Inventory
Top Tools:
- main: 145
- git: 113
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
- aria-label: 14
- null: 14
- undefined: 14
- docker: 13
- index.ts: 13
- docker-compose.yml: 12
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
- finally (used by prompts/fusions/Pantomime.md, prompts/fusions/Triage.md, prompts/fusions/Sanitizer.md)
- find (used by prompts/fusions/Ghost Hunter.md, prompts/fusions/Echodrop.md, prompts/Overseer.md)
- aws_access_key_id (used by prompts/fusions/Revoker.md)
- middleware.ts (used by prompts/fusions/Customs.md)
- jest.setup.js (used by prompts/fusions/Overclock.md, prompts/fusions/Adversary.md)
- routes.go (used by prompts/fusions/Scaffolder.md)
- transition (used by prompts/fusions/Chameleon.md, prompts/fusions/Sculptor.md)
- ease-in-out (used by prompts/Palette+.md)
- blur (used by prompts/fusions/Pathfinder.md)
- rm (used by prompts/fusions/Hitman.md, prompts/orphans/Janitor.md)
- main.py (used by prompts/fusions/Watchtower.md)
- index.ts (used by prompts/fusions/City Clerk.md, prompts/fusions/Renovator.md, prompts/Architect.md)
- istanbul (used by prompts/fusions/Adversary.md)
- margin (used by prompts/fusions/Flourish.md, prompts/orphans/Caliper.md, prompts/fusions/Sculptor.md)
- firebase.json (used by prompts/fusions/Bastion.md)
- with (used by prompts/fusions/Sanitizer.md)
- warn (used by prompts/fusions/Ratchet.md, prompts/fusions/Zealot.md)
- utils.test.ts (used by prompts/fusions/Surveyor.md)
- aws_s3_bucket_public_access_block (used by prompts/fusions/Bastion.md)
- bg-blue-600 (used by prompts/Palette+.md)
- status_code (used by prompts/fusions/Telemetrist.md)
- cy.request (used by prompts/orphans/Autopilot.md)
- aria- (used by prompts/fusions/Mulligan.md)
- openai (used by prompts/fusions/Electrician.md)
- build.sh (used by prompts/fusions/Decommissioner.md)
- no-explicit-any (used by prompts/fusions/Zealot.md)
- feature (used by prompts/fusions/Terraformer.md)
- transform (used by prompts/fusions/Vice.md, prompts/fusions/Chameleon.md, prompts/fusions/Sculptor.md)
- snake_case (used by prompts/orphans/Canon.md, prompts/orphans/orphans.md)
- throw (used by prompts/fusions/Greenlight.md, prompts/fusions/Mapper.md, prompts/fusions/Pruner.md)
- webpack (used by prompts/fusions/Registrar.md)
- minor (used by prompts/fusions/Siren.md)
- pwsh (used by prompts/orphans/Historian.md)
- array2 (used by prompts/orphans/Sprinter.md, prompts/orphans/orphans.md)
- deploy.sh (used by prompts/fusions/Decommissioner.md)
- legacy_api (used by prompts/fusions/Hitman.md)
- iptables (used by prompts/fusions/Bastion.md)
- setup-python (used by prompts/fusions/Echodrop.md)
- dotenv (used by prompts/fusions/Steward.md)
- as (used by prompts/Scavenger.md, prompts/fusions/Bulwark.md)

## 11. Effect Report

## 12. Reference Check and Human Anchors
Hazmat: 10
Paramedic: 38
Virtuoso: 235
Tokenizer: 207
Synchronizer: 224
Speed Camera: 130
Upgrader: 245

## 13. Blind Spots
The graders cannot judge domain correctness, whether a command works on a given repo, or reasoning quality. Treat the ranking as triage, not a verdict.
