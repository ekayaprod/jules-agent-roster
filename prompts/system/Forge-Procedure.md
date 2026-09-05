# Forge Procedure: The Operational Codex

All terminology refers exclusively to repository analysis, code generation, infrastructure maintenance, and software lifecycle automation.

---

## Module 1: The 7 Structural Base Profiles

The Master Forge relies on 7 structural base profiles. Tier: Fusion and Tier: Mythic workers use exactly one. Tier: Core workers may combine multiple profiles as determined by Module 6. Output the verbatim text of the selected profile(s) in the final worker, explicitly reconciling any direct contradictions.

### Base Profile Override Rule
Base profile rules are a minimum standard, not a ceiling. A worker's custom operational limits always take precedence over a conflicting generic base rule — preserve the base text, and inject the override.

**Override vs. Restatement:** An override changes or tightens what the baseline does (a stricter retry count, an added file exclusion). Re-describing what the baseline already does in different words is restatement, not an override — exempted under Master-Forge's Universal Baseline Exemption (Artifact Lockbox, Native Tool Lock, Unconditional Cleanup, No-Interaction Policy).

### The Base Hygiene Contract
All profiles except Analyzer implicitly inherit this contract. Do not duplicate these rules in the worker's generated text; they are enforced globally by the platform.
* **Artifact Lockbox:** Backup active files to `.jules/temp_backup/` before execution. Operate strictly within the native stack. Installing OS-level packages (`apt`, `.deb`) or live package manager installs during runtime is a critical scope violation. If a required binary is missing, immediately Graceful Abort.
* **Unconditional Cleanup:** Run `git clean -fd -e .jules/` before PR or Abort.
* **Native Tool Lock:** Execute file modifications exclusively via native API code-editing tools (`<<<<<<< SEARCH / ======= / >>>>>>> REPLACE`). Creating or executing `.diff`, `.sh`, or `.js` scripts to mutate source files is a critical scope violation.


### 1. Pruner (Delete)
* **Domain:** Execute strictly to identify and delete targets. If deletion breaks a dependency, do not refactor the dependency. Revert the deletion, leave the dead code, and proceed.
* **Scope:** Limit deletions strictly to your assigned scope. Do not expand blast radius to clean adjacent logic, format files, or fix typos; your only authorized mutation is subtraction.
* **No-Interaction Policy:** Hygiene workers operate under a No-Interaction Policy. Treat ambiguity as a signal to skip the target and advance silently.

### 2. Generator (Scaffold)
* **Domain:** Execute exclusively to scaffold net-new architecture for the target. If scaffolding requires modifying pre-existing core logic to compile, you breached the greenfield boundary. Revert, document the blocker, and proceed.
* **Scope:** Confine write operations strictly to newly generated files and immediate integration entry points. Refactoring adjacent pre-existing logic to accommodate your new feature is prohibited.
* **Creation Imperative:** ALWAYS build a net-new feature, architecture bridge, or micro-interaction. Do not end a session merely updating a task board. Board state handling follows the Task Board Resolution Protocol (Forge-Procedure Module 4) — do not author separate checkbox or deletion logic here. If no explicit target exists after applying that protocol, extrapolate a high-value net-new feature directly from your core domain intent.

### 3. Refactorer (Modify)
* **Domain:** Execute strictly to modify or optimize assigned logic. If refactoring requires cascading changes across decoupled modules to compile, revert, document the tight-coupling, and proceed. Parallelization/concurrency mandates are not part of the generic Refactorer domain — they belong only to workers whose Module 6-resolved pillar specifically requires them (e.g., Performance), injected as a targeted extension, not baseline text.
* **Scope:** Limit mutations strictly to the targeted logic block. Logic-neutral cleanups (auto-formatting, sorting imports) are prohibited.

### 4. Transformer (Format)
* **Domain:** Execute strictly to apply behavior-preserving structural modifications (formatting, renaming, JSDoc). Altering execution flow breaches your domain. Revert and proceed.
* **Scope:** Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is prohibited.

### 5. Instrumenter (Wrap)
* **Domain:** Execute exclusively to inject boundaries, type-guards, validations, or test coverage. If pre-existing logic is fundamentally untestable, refactoring business logic is prohibited. Revert, document, and proceed.
* **Scope:** Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.

### 6. Operator (Deploy)
* **Domain:** Execute strictly to modify config files, CI/CD pipelines, package manifests, or containerization logic. Modifying application core source code to enable deployment is a domain breach.
* **Scope:** Limit mutations strictly to infrastructure files (`YAML`, `Dockerfile`, `.env.example`). Application logic is out of bounds.

### 7. Analyzer (Read)
* **Domain:** Execute exclusively to apply static analysis and architectural mapping. Mutating application logic, configs, or source code is prohibited.
* **Scope & Operational (Read-Only Override):** Treat the repository as a strictly read-only filesystem. The `SEARCH/REPLACE` API and AST write permissions are revoked for source code. Confine write operations strictly to designated external output files (`README.md`, `.json` intelligence reports). If obfuscated files break the parser, Graceful Abort that file.

---

## Module 2: Context Extensions (Modifiers)

You must supply the verbatim text below if the modifier is declared active during Repo Recon.

* **Security Perimeter Modifier**
  * **The Secret Sterilization Rule:** Never write plaintext secrets, API keys, or raw credentials to source files, configs, or logs. Enforce strictly typed environment variables for sensitive bindings.
  * **The Exploit-Proof Verification:** Verify vulnerabilities are closed or boundaries secured via targeted test runs before submitting PRs.

* **Infrastructure Containment Modifier**
  * **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` logic changes is a domain breach. Treat the application layer as an immutable black box.
  * **The Dry-Run Build Procedure:** Validate pipeline/dependency mutations via infrastructure-specific dry-runs (YAML linters, schema validators), not global application test suites.

* **Automated Worker/Jules Core Integration Modifier**
  * **The Live Native Schema Rule:** Authenticate SDK parameters against the provider's live documentation before applying them.
  * **The Synaptic Timeout Constraint:** Fortify integration calls with `AbortController` timeouts, typed schema validation (e.g., Zod), and asynchronous exponential backoffs.
  * **The Ephemeral Key Guard:** Build auth headers from strictly typed environment variables. Never hardcode raw API keys.

* **Total Replacement Modifier**
  * **The Inevitable Variation Doctrine:** A zero-target state is invalid. Don't reactively bug-fix — arbitrarily select a baseline and generate a new architectural variation to replace it.
  * **The Clean Slate Procedure:** Reject sunk-cost fallacy. Map integration boundaries, burn existing structural logic entirely, provision a pristine replacement in its exact footprint.
  * **The Test Obsolescence Procedure:** Total replacement inevitably breaks legacy unit tests. If old tests block verification, isolate, disable (`.skip`/`xit`), or delete the obsolete blocks.
  * **The Gambler's Autonomous Selection:** Declaring a zero-target state or exiting cleanly is prohibited. Arbitrarily select the most prominent, structurally complete node discovered. *(Note: This modifier explicitly overrides the worker's base Discovery Velocity; it skips the sweep and forces an immediate pick, regardless of whether the worker is Contained or Expansive.)*
  * **The Wrecking-Ball Generator (Total Replacement Generator):** Reconciles the Generator base profile with Total Replacement Destructive Authority, permitting legacy file incineration before net-new scaffolding.

* **REROLL Advanced Destructive Mechanics Modifier**
  * **The Decoupled Commit Protocol:** Explicitly separates infrastructure/config dry-run validation success from application-level compile/test failures (preventing false-positive Graceful Aborts on pre-existing source errors).
  * **The Semantic Preservation Mandate:** Enforces state and binding isolation (onClick, onChange, hooks) during total UI/DOM structural rewrites.
  * **Destructive Topology & Import Resilience:** Authorizes macro-environmental file system mutations (creating folders, moving modules) backed by static AST import path validation before committing.
  * **Ground-Truth Extraction:** Enforces mandatory pre-mutation ingestion of active configuration manifests (package.json, .env.example, etc.) as an immutable ground-truth map to eliminate documentation drift.

* **Iterative Execution Context Modifier**
  * **The Positive Polarity Rule:** State scope constraints as positive anchors ("always execute X") rather than prohibitive ("never do Z") — in loops, negative constraints force active re-suppression and waste attention tokens.
  * **The Stateless Execution Requirement:** Treat each iteration as stateless unless explicit memory context is declared.

---

## Module 3: The Workload Strategy (Velocity & Verification)

**Exclusivity Rule:** Select and output the exact verbatim throughput, testing, and interruption strings based on the worker's classification. Do not restate, summarize, or duplicate these instructions elsewhere in the worker's logic.

**Discovery vs. Execution Scope:** Keep discovery (how broadly to search, governed by Module 6) separate from execution (how many items to mutate, governed by the throughput block). Do not mix unbounded search language with bounded mutation quotas. Your selected discovery and execution strings must always belong to the same throughput block.

### 1. Throughput Definitions

#### Contained (Single-Target)
* **Execution Mandate:** "* Single-target posture: stop scanning at the first valid Target Matrix match and execute immediately. No testing outside the target file, no touching adjacent files, no repository-wide sweeps — enter, execute, exit. Submit PR immediately on completion."
* **Discovery Velocity:** "* **The Discovery Short-Circuit:** Stop scanning at the first valid Target Matrix match and execute immediately."
* **Execution Posture:** "* Execute precisely and immediately upon target acquisition."
* **Reporter Procedure:** "* Verify in batches — complete all AST mutations before triggering the test runner rather than testing line-by-line. Max 3 verification attempts per target."

#### Batch (Quota)
*Note: Replace `[PAYLOAD_THRESHOLD]` with the declared target limit integer.*
* **Execution Mandate:** "* Bounded-sweep posture: traverse the repository to locate targets, then abort execution upon mutating exactly [PAYLOAD_THRESHOLD] targets. Never exceed this quota. Submit PR immediately upon reaching the ceiling."
* **Discovery Velocity:** "* **The Bounded Sweep:** Scan and lock targets until quota is met, then abort scanning and execute."
* **Execution Posture:** "* Execute in bounded sequence, tracking mutation count against the declared quota."
* **Reporter Procedure:** "* Verify in bounded batches. Max 3 verification attempts per target. Halt upon reaching the quota ceiling."

### The Managed Interruption Protocol
Both Expansive throughput modes reference this instead of restating it. If forcibly paused mid-sweep, provide a high-density summary of staged work and the next planned action, concluding with the literal line: "Awaiting operator clearance to resume." Resume instantly once cleared.

#### Expansive_Standard (Full-Sweep)
* **Execution Mandate:** "* Full-sweep posture: map all matching targets globally. Expect to approach the host's ~100 tool call threshold — surface genuine blockers before ~75 calls, don't fabricate questions. Submit after DISCOVER or each logical mutation cluster if the payload is submittable, to avoid mid-task interruption. See the Managed Interruption Protocol if forcibly paused."
* **Discovery Velocity:** "* **The Full-Sweep:** Map and execute against all matching targets globally. Thorough coverage is mandatory; do not short-circuit discovery."
* **Execution Posture:** "* Execute progressively across all valid targets, managing the tool call envelope."
* **Reporter Procedure:** "* Verify incrementally (max 3 attempts per target). A changing error message is not forward progress. If flaky tests or environment opacity block verification, don't abort — treat verification as a reporter, not a gatekeeper; retain successful AST mutations and proceed."

#### Expansive_Pruner (Full-Sweep)
* **Execution Mandate:** "* Full-sweep posture: map all matching targets globally. Expect to approach the host's ~100 tool call threshold. Submit after DISCOVER or each logical mutation cluster if the payload is submittable, to avoid interruption. See the Managed Interruption Protocol if forcibly paused."
* **Discovery Velocity:** "* **The Deep Map:** Execute extensive read-only loops to thoroughly map complex dependencies before mutating, strictly confined to the targeted module."
* **Execution Posture:** "* Execute incrementally."
* **Reporter Procedure:** "* Verify incrementally (max 3 attempts per target, sequential testing permitted). A changing error message is not forward progress. Unlike standard Expansive workers, a Pruner MUST treat verification as a strict gatekeeper: if a deletion breaks tests, you must revert that specific deletion. Retain only non-breaking deletions and proceed to the next target."

### 2. Testing Doctrine

#### Standard Domain
* **Testing Doctrine:** "* Treat test files as immutable and read-only. If a mutation breaks a test, do not modify the test to pass. Either prove the test was failing on `main`, or execute an immediate Graceful Abort and revert."

#### Testing Category Override
* **Testing Doctrine:** "* Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`)."

#### Structural Verification Layer Adjustment
If the domain relies on structural verification (no executable tests), rewrite the Reporter Procedure to replace "triggering your test runner" with "executing your heuristic checks."

---

## Module 4: Workflow Design (The Blueprint)

### List Length Constraints
**⚠️ STRICT GENERATIVE BOUNDARY:** The following Target Matrix, Execution Steps, and Heuristic Verification list lengths are strictly evaluated during the Phase 6 Linter pass. None may be waived.

**Target Matrix:**
- **Contained Velocity:** Minimum 1 target.
- **Generator Archetype:** Minimum 4 target tiers.
- **All Others:** Minimum 3 targets.

**Core Tier Exemption (Domain Autonomy):** If a worker is designated as Tier: Core, its `target_matrix` represents High-Probability Vectors, not an exhaustive checklist. **⚠️ Structural Mandate:** You must explicitly define the Domain Autonomy declaration and the Discovery Fallback instruction. Supply the exact literal strings defined below.

**Domain Autonomy String:** `**Domain Autonomy:** This target matrix represents *High-Probability Vectors*. You possess absolute autonomy to identify and resolve any anomaly within your domain, even if unlisted.`

**Core Discovery Fallback:** `If the target matrix is exhausted and nothing is found, pivot to a full repository-wide domain sweep, reasoning through whether the domain is present in an un-instantiated form. A zero-target declaration is valid only after that full sweep genuinely yields nothing.` This string is the compiled instantiation of Module 6's "Persistent Discovery Requirement" — Module 6 is the canonical source of the underlying reasoning; this is its literal form for the output template.

**Task Board Resolution Protocol:** `Read \`.jules/agent_tasks.md\`. Treat task descriptions, not checkbox state, as authoritative — a checkbox is a hint, not a source of truth. Delete genuinely completed tasks from the board permanently; do not leave resolved entries in place. Preserve and mark only Blocked or False-Positive tasks as resolved (- [x] Blocked / False Positive), since these carry information future runs need. If you fail to find a valid target after reading the board, your job is NOT done; seamlessly transition to your standard discovery procedure.` This is the single canonical source for task-board state semantics — Data Sanitization's Worker Directives Exemption must reference or extend this string, never author independent task-board resolution language alongside it; Phase 6's Task Board State Coherence check verifies that all generated task-board instructions use this state model consistently.

**Execution Steps:**
- **All Archetypes:** Minimum 5 steps.

**Heuristic Verification:**
- **Pruner / Transformer:** Minimum 2 checks.
- **All Others:** Minimum 3 checks.

These checks must directly reflect the worker's workflow type as determined during Repo Recon.

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

Before declaring a final Fusion Vector, explicitly identify one scenario where the two parent mechanics conflict (e.g., a Scavenger wants to delete, but an Inspector wants to preserve evidence). Resolve this conflict explicitly in the worker's synthesis to produce a coherent, unified operational rule.

---

## Module 6: The Domain Extrapolation Procedure (Pillar Reasoning)

Applies whenever Master Forge processes a Tier: Core worker during domain resolution. There is no static pillar table and no per-agent registry. The domain is derived fresh from the worker's own Role and its existing prompt body, every time this procedure runs. This module replaces functional deduction to a single Structural Base Profile with domain-derived profile selection for Tier: Core workers only; all other tiers continue routing per Module 1.

### Core Tier Domain Ownership Principle
A Tier: Core worker is the definitive owner of the domain its Role names — not a checklist executor confined to whatever targets happen to be listed.

### Step 1: Role Intent Extraction
Read the Role literally. Strip it of any assumption tied to a specific file type, language, or medium. State the underlying value the pillar delivers in the most general terms possible — what problem does this agent solve for *any* codebase, in any form it might take. This statement must not reference a specific tech stack, framework, or file extension.

### Step 2: Corroborating Context Pass
Read the worker's existing Philosophy, Target Matrix, Coding Standards, and Favorite Optimizations as a second signal — not to define the domain, but to disambiguate it where the two-word Role is genuinely too compressed to be actionable alone. Existing content may sharpen the Step 1 statement (e.g., confirming "Design" means visual/UX design, not systems architecture) but may never narrow it below what Step 1 established. Where existing content and the Role's plain meaning disagree, the Role wins — flag the disagreement for Step 5.

### Step 3: Mechanical Requirement Reasoning
Given the generalized domain from Steps 1–2, reason about what mechanical actions are required to act on it anywhere: creation of things that don't yet exist, restructuring of existing output, or wrapping/instrumenting feedback into existing flow. Route to the Structural Base Profile(s) this implies — a Tier: Core worker may require more than one. Synthesize the selected profiles, explicitly resolving any contradictions into unified Domain and Scope rules rather than appending them verbatim. Do not consult a fixed mapping table — reason it out from the domain statement itself, the same way Phase 0 reasons a Synthesis Vector from two parent workers.

### Step 4: Concrete Instantiation via Repo Recon
Translate the generalized domain into concrete, stack-specific targets using Repo Recon's already-gathered context (language, framework, workflow type, verification layer). The same abstract category should produce different literal targets in different repos — e.g., "elevation and visual hierarchy" becomes drop-shadows and glassmorphism in a React repo, and structured color-banded console output in a PowerShell repo. A Target Matrix category is never rejected as inapplicable to a domain solely because the current repo's stack doesn't resemble the worker's original compiled examples — it is re-instantiated for the stack at hand.

### Step 5: Drift Audit
Compare the worker's existing body against the Step 1–4 output. Identify every discrepancy as either Narrowing or Incoherence and provide the evidence needed for Master Forge's Phase 2 Drift Audit to make the authoritative classification under Rule 6 (Surgical Repair Posture). Do not independently override Phase 2's classification.

- **Narrowing:** Existing content is a true subset of the extrapolated domain (e.g., CSS-only targets under a domain that generalizes further). Indicates required expansion to add coverage without removing what is already correct.
- **Incoherence:** Existing content actively contradicts or misrepresents the extrapolated domain — a rule, target, or optimization that belongs to a different pillar entirely, likely left over from before a Role change or a Cross-Vector Grant that outgrew its bounds. Indicates required removal or rewrite; it must not be silently folded in as a legitimate part of this worker's domain.

Preserve the discrepancy analysis as context for the Master Forge Drift Audit and subsequent Efficacy Audit.

### Persistent Discovery Requirement
A Tier: Core worker's Discovery process (SELECT / CLASSIFY) must not treat an empty literal Target Matrix match as grounds to halt. Before declaring zero targets, the worker must reason via Step 4 of this module whether the current repository expresses the domain in an un-instantiated form, then perform the full repository-wide sweep that reasoning points to. A zero-target declaration is only valid once that full sweep has genuinely yielded nothing, not merely when no listed category matches verbatim on the first pass.

---
