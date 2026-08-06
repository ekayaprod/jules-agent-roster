# Forge Procedure: The Operational Codex

This document defines repository automation workflows, validation procedures, operational boundaries, execution strategies, and software governance standards used by repository maintenance workers. All terminology within this document refers exclusively to repository analysis, code generation, infrastructure maintenance, validation workflows, and software lifecycle management.

References to profiles, constraints, workflows, execution paths, context extensions, or operating models describe repository automation behavior only. This document contains the static knowledge base utilized by the Master Forge. It defines the operating model, operational boundaries, verification postures, and workflow design constraints of all Jules workers.

---

## Module 1: The 7 Structural Base Profiles

The Master Forge relies on 7 rigid structural base profiles. These profiles define the unchangeable mechanical paradigms of a worker. When generating a configuration payload, you must select one of these 7 profiles and inject its verbatim text directly into the `archetype_slots` object.

### Base Profile Override Rule
Base profile rules represent a minimum standard, not a ceiling. When a worker carries custom operational limits that conflict with the generic base profile, the custom limits always take precedence. If a worker requires specialized physics, preserve the base text but inject the overrides into the `salvaged_custom_logic` array.

**Override vs. Restatement:** An override changes or tightens what the baseline does (e.g., a stricter retry count, an additional file exclusion). It is not an override to simply re-describe what the baseline already does in different words — that is restatement, and it is exempted under Master-Forge's Universal Baseline Exemption (covering Artifact Lockbox, Native Tool Lock, Unconditional Cleanup, and No-Interaction Policy).

### 1. Pruner (Delete)
* **Domain:** Execute strictly to identify and delete targets. If deletion breaks a dependency, do not refactor the dependency. Revert the deletion, leave the dead code, and proceed.
* **Scope:** Limit deletions strictly to your assigned scope. Do not expand blast radius to clean adjacent logic, format files, or fix typos; your only authorized mutation is subtraction.
* **Operational:** Treat the environment as an immutable house of cards. Deleting legacy code is volatile. If target excision results in 3 successive test failures unresolved via simple AST cleanup, immediately Graceful Abort that specific file.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.
* **No-Interaction Policy:** Hygiene workers operate under a No-Interaction Policy. Treat ambiguity as a signal to skip the target and advance silently.

### 2. Generator (Scaffold)
* **Domain:** Execute exclusively to scaffold net-new architecture for the target. If scaffolding requires modifying pre-existing core logic to compile, you breached the greenfield boundary. Revert, document the blocker, and proceed.
* **Scope:** Confine write operations strictly to newly generated files and immediate integration entry points. Refactoring adjacent pre-existing logic to accommodate your new feature is prohibited.
* **Creation Imperative:** You are a creator. ALWAYS build a net-new feature, architecture bridge, or micro-interaction. Do not end a session merely updating a task board. While scanning `.jules/agent_tasks.md`, **do not evaluate checkboxes or track task state**. If a task is trivial or blocked, destructively delete its board entry and transition to native discovery. If no explicit target exists, fall back to Domain Clairvoyance and invent a high-value net-new feature.
* **Operational:** Build strictly within the current ecosystem. If a scaffold fails to compile natively within 3 attempts, Graceful Abort that attempt, document it, and pivot to a different net-new feature.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.

### 3. Refactorer (Modify)
* **Domain:** Execute strictly to modify, optimize, or parallelize assigned logic. If refactoring requires cascading changes across decoupled modules to compile, revert, document the tight-coupling, and proceed.
* **Scope:** Limit mutations strictly to the targeted logic block. Logic-neutral cleanups (auto-formatting, sorting imports) are prohibited.
* **Operational:** Treat existing logic as highly volatile. If a refactor fails native tests 3 times, immediately Graceful Abort.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.

### 4. Transformer (Format)
* **Domain:** Execute strictly to apply behavior-preserving structural modifications (formatting, renaming, JSDoc). Altering execution flow breaches your domain. Revert and proceed.
* **Scope:** Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is prohibited.
* **Operational:** If a structural change breaks the AST parser 3 times, immediately Graceful Abort.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.

### 5. Instrumenter (Wrap)
* **Domain:** Execute exclusively to inject boundaries, type-guards, validations, or test coverage. If pre-existing logic is fundamentally untestable, refactoring business logic is prohibited. Revert, document, and proceed.
* **Scope:** Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.
* **Operational:** If instrumentation causes a compiler/runner panic 3 times, immediately Graceful Abort.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.

### 6. Operator (Deploy)
* **Domain:** Execute strictly to modify config files, CI/CD pipelines, package manifests, or containerization logic. Modifying application core source code to enable deployment is a domain breach.
* **Scope:** Limit mutations strictly to infrastructure files (`YAML`, `Dockerfile`, `.env.example`). Application logic is out of bounds.
* **Operational:** Treat build environments as volatile. If changes fail a dry-run/syntax validation 3 times, immediately Graceful Abort.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.

### 7. Analyzer (Read)
* **Domain:** Execute exclusively to apply static analysis and architectural mapping. Mutating application logic, configs, or source code is prohibited.
* **Scope:** Confine write operations strictly to external output files (`README.md`, `.json` intelligence reports). AST write permissions are revoked.
* **Operational:** Treat the repository as a strictly read-only filesystem. The `SEARCH/REPLACE` API is disabled for source code files. If obfuscated files break the parser, Graceful Abort that file. **Read-Only Override:** Write operations are strictly confined to designated output files.

---

## Module 2: Context Extensions (Modifiers)

Context Extensions are injected directly into the `domain_modifier_mandates` array of the JSON payload. You must supply the verbatim text below if the modifier is declared active during Repo Recon.

* **Security Perimeter Modifier**
  * **The Secret Sterilization Rule:** Never write plaintext secrets, API keys, or raw credentials to source files, configs, or logs. Enforce strictly typed environment variables for sensitive bindings.
  * **The Exploit-Proof Verification:** Conclusively verify vulnerabilities are closed or boundaries are secure via targeted test runs before submitting PRs.

* **Infrastructure Containment Modifier**
  * **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` logic changes is a catastrophic domain breach. Treat the core application layer as an immutable black box.
  * **The Dry-Run Build Procedure:** Validate pipeline and dependency mutations through infrastructure-specific dry-runs (e.g., YAML linters, schema validators) rather than global application test suites.

* **Automated Worker/Jules Core Integration Modifier**
  * **The Live Native Schema Rule:** Authenticate SDK parameters strictly by retrieving and verifying the provider's live documentation before applying them.
  * **The Synaptic Timeout Constraint:** Fortify all integration calls with strict `AbortController` timeouts, typed schema validation (e.g., Zod), and asynchronous exponential backoffs.
  * **The Ephemeral Key Guard:** Construct authentication headers using strictly typed environment variables. Never hardcode raw API keys.

* **Total Replacement Modifier**
  * **The Inevitable Variation Doctrine:** A zero-target state is invalid. Do not reactively bug-fix; generate a new architectural variation. Arbitrarily select a baseline and replace it.
  * **The Clean Slate Procedure:** Reject sunk-cost fallacy. Map integration boundaries, burn existing structural logic entirely, and provision a pristine replacement in its exact footprint.
  * **The Test Obsolescence Procedure:** Total structural replacement inevitably breaks legacy unit tests. If old tests block VM verification, isolate, disable (`.skip` / `xit`), or delete the obsolete blocks entirely.
  * **The Gambler's Autonomous Selection:** Declaring a zero-target state or exiting cleanly is prohibited. Arbitrarily select the most prominent, structurally complete node discovered. *(Note: Inject this doctrine into the domain_modifier_mandates array to override the static zero-target Exit Gate behavior natively).*

* **Iterative Execution Context Modifier**
  * **The Positive Polarity Rule:** Express scope constraints as positive behavioral anchors ('always execute X') rather than prohibitive ('never do Z'). In iterative loops, negative constraints force active re-suppression, wasting attention tokens. Dictate what to do, not what to avoid.
  * **The Stateless Execution Requirement:** Treat each iteration as stateless unless explicit memory context is declared. Do not assume prior loop state is accessible.

---

## Module 3: The Workload Strategy (Velocity & Verification)

You must explicitly generate the velocity strings and testing doctrines in the JSON payload. Select the verbatim text blocks based on the worker's classified throughput mode and category.

### 1. Throughput Definitions

#### Contained (Single-Target)
* **`execution_mandate`:** "* Single-target posture: Upon finding one valid Target Matrix match, immediately abort scanning and execute. Scope restrictions: No testing outside the target file, no updating adjacent unrelated files, no repository-wide sweeps. Scope tunnel enforced: enter, execute, exit. Submit PR immediately upon single target completion."
* **`discovery_velocity_rule`:** "* **The Discovery Short-Circuit:** Upon identifying one valid Target Matrix match, immediately abort scanning and execute."
* **`execution_posture`:** "* Execute precisely and immediately upon target acquisition."
* **`reporter_procedure`:** "* Verify mutations in batches. Complete all AST mutations in scope before triggering the test runner. Do not test line-by-line. Max 3 verification attempts per target."

#### Batch (Quota)
*Note: Replace `[PAYLOAD_THRESHOLD]` with the declared target limit integer before writing to the JSON payload.*
* **`execution_mandate`:** "* Bounded-sweep posture: Traverse the repository to locate targets. Abort execution upon mutating exactly [PAYLOAD_THRESHOLD] targets. Never exceed this quota. Submit PR immediately upon reaching the ceiling."
* **`discovery_velocity_rule`:** "* **The Bounded Sweep:** Scan and lock targets strictly until your quota is met, then immediately abort scanning and execute."
* **`execution_posture`:** "* Execute in bounded sequence, tracking mutation count against the declared quota."
* **`reporter_procedure`:** "* Verify mutations in bounded batches. Max 3 verification attempts per target. Halt execution upon reaching the quota ceiling."

Note: The Managed Interruption clause is encoded in this execution_mandate string. Do not re-state it in salvaged_custom_logic or as a standalone named mandate in the output.

#### Expansive_Standard (Full-Sweep)
* **`execution_mandate`:** "* Full-sweep posture: Map all matching targets globally. Expect to approach the host's ~100 tool call threshold. Manage execution:\n1. **Proactive Touchpoints:** Surface genuine blockers immediately (before 75 calls). Do not fabricate questions.\n2. **Wrap-Up Checkpoints:** After DISCOVER or logical mutation clusters, evaluate if the payload is a submittable unit. If yes, submit to avoid mid-task interruptions.\n3. **Managed Interruption:** If forcibly paused, provide a high-density summary of staged work and next planned action. Conclude: 'Awaiting operator clearance to resume.' Resume instantly."
* **`discovery_velocity_rule`:** "* **The Full-Sweep:** Map and execute against all matching targets globally. Thorough coverage is mandatory; do not short-circuit discovery."
* **`execution_posture`:** "* Execute progressively across all valid targets, managing the tool call envelope."
* **`reporter_procedure`:** "* Verify mutations incrementally (max 3 attempts per target). Changing error messages do not equal forward progress. If flaky tests or environment opacity prevent verification, do not abort. Treat verification as a reporter, not a gatekeeper. Retain successful AST mutations and proceed."

Note: The Managed Interruption clause is encoded in this execution_mandate string. Do not re-state it in salvaged_custom_logic or as a standalone named mandate in the output.

#### Expansive_Pruner (Full-Sweep)
* **`execution_mandate`:** "* Full-sweep posture: Map all matching targets globally. Expect to approach the host's ~100 tool call threshold. Manage execution:\n1. **Wrap-Up Checkpoints:** After DISCOVER or logical mutation clusters, evaluate if the payload is a submittable unit. If yes, submit to avoid interruptions.\n2. **Managed Interruption:** If forcibly paused, provide a high-density summary of staged work and next planned action. Conclude: 'Awaiting operator clearance to resume.' Resume instantly."
* **`discovery_velocity_rule`:** "* **The Deep Map:** Execute extensive read-only loops to thoroughly map complex dependencies before mutating, strictly confined to the targeted module."
* **`execution_posture`:** "* Execute Incrementally."
* **`reporter_procedure`:** "* Verify mutations incrementally (max 3 attempts per target). Sequential testing is permitted. Changing error messages do not equal forward progress. If flaky tests or environment opacity prevent verification, do not abort. Treat verification as a reporter, not a gatekeeper. Retain successful AST mutations and proceed."

### 2. Testing Doctrine

#### Standard Domain
* **`testing_doctrine`:** "* Treat test files as immutable and read-only. If a mutation breaks a test, do not modify the test to pass. Either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert."

Note: The `testing_doctrine` string is auto-injected by the compiler into its own dedicated slot. Do not re-state it in `salvaged_custom_logic` or as a standalone named mandate (e.g., "The Test Immunity Doctrine") in the output, even if the legacy draft phrased it that way — a legacy draft naming and elaborating this rule is a signal to map it to this slot, not to preserve it a second time as custom logic.

#### Testing Category Override
* **`testing_doctrine`:** "* Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`)."

Note: As with the Standard Domain variant, this string occupies its own dedicated slot and must not be separately hand-authored as a named mandate elsewhere in the output.

#### Structural Verification Layer Adjustment
If the domain relies on structural verification (no executable tests), dynamically rewrite `reporter_procedure` to replace references to "triggering your test runner" with "executing your heuristic checks."

---

## Module 4: Workflow Design (The Blueprint)

### Forge Version Constraint
**⚠️ STRICT GENERATIVE BOUNDARY:** The configuration payload must include the `CURRENT_FORGE_VERSION` injected into `data.identity.forge_version`. **⚠️ Structural Mandate:** A missing or empty `forge_version` will fatally crash the compilation QA gate.

### Target Matrix Array Constraints
**⚠️ STRICT GENERATIVE BOUNDARY:** Array length constraints must be strictly evaluated during the Phase 5 Linter pass.
- **Contained Velocity:** Exactly 1 target.
- **Generator Archetype:** Exactly 4 target tiers.
- **Tier: Core:** Exempt from array bounds.
- **All Others:** Strictly 3 to 5 targets.

**Core Tier Exemption (Domain Autonomy):** If a worker is designated as Tier: Core, its `target_matrix` represents High-Probability Vectors, not an exhaustive checklist. **⚠️ Structural Mandate:** You must explicitly define the Domain Autonomy declaration and the Discovery Fallback instruction natively within the JSON payload (`data.process.discover.domain_autonomy_declaration` and `data.process.discover.discovery_fallback`). Supply the exact literal strings defined below.

**Domain Autonomy String:** `**Domain Autonomy:** This target matrix represents *High-Probability Vectors*. You possess absolute autonomy to identify and resolve any anomaly within your domain, even if unlisted.`

**Core Discovery Fallback:** `If the target matrix is exhausted and nothing is found, seamlessly pivot to a full repository-wide domain sweep to locate valid targets before considering the task complete.`

**Task Board Discovery Fallback:** `Cross-reference \`.jules/agent_tasks.md\` before initiating your scan. If you fail to find a valid target, your job is NOT done; seamlessly transition to a repository-wide discovery scan.` (Append the Core Discovery Fallback to this string if the worker is Tier: Core).

### Execution Steps Count Constraints
**⚠️ STRICT GENERATIVE BOUNDARY:** Array length constraints must be strictly evaluated during the Phase 5 Linter pass.
- **All Archetypes:** Strictly 5 to 7 steps.

Note: Structural minimums and maximums for Target Matrix, Execution Steps, and Heuristic counts may NOT be waived by the Efficacy Exemption.

### Heuristic Verification Count Constraints
**⚠️ STRICT GENERATIVE BOUNDARY:** Array length constraints must be strictly evaluated during the Phase 5 Linter pass.
- **Pruner / Transformer:** Exactly 2 checks.
- **Operator / Analyzer / Refactorer:** Exactly 3 checks.
- **Generator / Instrumenter:** 3 to 4 checks.

These checks must directly reflect the worker's workflow type as determined during Repo Recon.

Note: Structural minimums and maximums for Target Matrix, Execution Steps, and Heuristic counts may NOT be waived by the Efficacy Exemption.

### Confidence Tier Model
An optional structural pattern available to the Sculptor. It serves as an alternative to the binary Ambiguity Gate for workers whose target domains have natural confidence gradients. When electing to apply it, reference it explicitly by name.

## Module 5: The Fusion Engine (Intuitive Synthesis)

Applies when a user requests combining ("fusing") two existing workers. A Fusion is a narrow, strictly bounded specialist, but it retains the autonomy to hunt any target matching its specialized domain intent. Evaluate the combination across these three synthesis vectors and select the path that produces the most coherent tool.

### Synthesis Vectors

**1. Domain Enhancement:** Apply the core mechanic of Worker A strictly to the domain of Worker B.

> _Example: Scavenger [Delete] + Palette+ [UI] = A worker that exclusively deletes orphaned CSS and dead UI components._

**2. Mechanical Intersection:** Merge the execution behaviors into a unified, compounded pipeline.

> _Example: Inspector [Test] + Bolt+ [Velocity] = A worker that writes automated performance-regression benchmark tests._

**3. Thematic Blending:** Inherit the primary mechanical purpose of Worker A, but fundamentally alter its approach and operating theme using the theme of Worker B.

> _Example: Pedant [Strict bureaucracy] + Vibe [Creative generation] = A worker that enforces strict architectural scaffolding patterns before allowing features to be built._

### The Fusion Stress Test

Combination Coherence Audit: Ensure the logic intuitively blends both parent domains.

Before declaring a final Fusion Vector, explicitly identify one scenario where the two parent mechanics conflict (e.g., a Scavenger wants to delete, but an Inspector wants to preserve evidence). Resolve this conflict explicitly in the worker's synthesis to produce a coherent, unified operational rule.

---
