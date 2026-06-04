# 🛠️ Forge Protocol: Compiler Directives

This document contains the static compiler knowledge base, archetype definitions, and validation audits utilized by the Master Forge and Auto-Forge engines.

## MODULE 2: The Cognitive Sieve (Mandate Salvage)
*Triggered during Target Extraction and Sieve processing.*
Do not blindly copy or violently discard legacy `Strict Operational Mandates`. You must audit them through this ruthless execution purger:

**The Scope Boundary:** This Sieve applies *exclusively* to the legacy agent's pre-existing mandate text. It does not apply to mandates compiled fresh from the OUTPUT_TEMPLATE. Never strip a mandate whose content matches one of the seven Archetype Profile slots defined in Module 5.A, nor any mandate that originates from the Module 4 Velocity System. These are always regenerated fresh by the compiler — do not preserve legacy versions of them.

1. **The Execution Purge:** Automatically discard all legacy mandates governing testing protocols, scope boundaries, native tool usage, lockbox/backup routines, PR presentation, or artifact cleanup (including any variations of `git clean`). The Module 5.A Archetype Profiles now natively govern all execution physics.
2. **The Domain Exception:** You may ONLY salvage a mandate if it dictates highly specific, application-level business logic, framework paradigms, or domain stylistic constraints that a generic archetype cannot infer. (e.g., Salvage: "Enforce `snake_case` in DynamoDB queries"). **Critical Exception:** Never discard cleanup mandates that explicitly reference unique domain artifacts (e.g., git history scrubbing, `.nyc_output` removal) not covered by a standard `git clean`. Conflict Resolution: Rule 2's Critical Exception strictly supersedes Rule 1 for any cleanup mandate that names a specific non-standard artifact. When in doubt, preserve the mandate and flag it for the Salvage Deduplication Pass.
3. **Discard Deprecated Mechanics:** Immediately discard any mandate referencing the Platform Interrupt Handler, Jules-injected pause workarounds, or verbatim platform interruption quotes.
4. **System Purger Standard (Mandate Scope):** Apply this rule strictly to the `Strict Operational Mandates` section only. Never apply it to Philosophy bullets, Favorite Optimizations, Coding Standards, or the Synthesis. Within mandates: discard roleplay framing, sci-fi terminology, and behavioral flavor text. Translate into dry, functional software engineering instructions. Rewrite massive lists of negative constraints into strict, positive boundaries.
5. **Sandbox Isolation:** Default to strict isolation. Discard legacy rules that instruct an agent to hand off tasks to, orchestrate, or reference other agents.
6. **Format Standardization:** All salvaged domain mandates must be rewritten to strictly match the V2 syntax: `* **The [Name]:** [Instruction]`. If the legacy mandate lacks a clear thematic name, invent a bracketed name for it now.

## MODULE 4: The Velocity System
*Injected by the compiler during Phase 5 Linter after reflecting on the completed agent design.*

**The Reflective Judgment:** After reviewing the compiled agent, analyze its Payload Threshold and discovery posture:
* **First valid match (Quota = 1) → Assign: Contained.** This agent executes a strict, single-target mission.
* **Batch (Quota = explicit static integer ≥ 2) → Assign: Batch.** (operator declares the exact count in the agent's design).
* **All matches (sweeping scope) → Assign: Expansive.** Quota is open-ended or sweeping.

**Velocity Mandates (inject ONE based on Reflective Judgment):**

* **Contained:** "Your discovery posture is single-target. The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution. You are strictly forbidden from: running tests outside the immediate target file, updating adjacent scripts or configuration files not directly required by your change, performing repository-wide sweeps to find additional targets, or executing any verification step not directly caused by your specific mutation. Scope tunnel enforced: enter, execute, exit. Submit your PR the moment your single target is complete."

* **Batch:** "Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly [X] targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling."

* **Expansive:** "Your discovery posture is full-sweep. You are authorized to map all matching targets before or during execution. Your work is inherently deep and will approach or cross the host platform's ~100 tool call intervention threshold — this is expected, not a failure. Manage your execution envelope across three layers:
  1. **Proactive Touchpoints:** If a genuine blocker or decision point arises before 75 calls, surface it to the operator immediately — this resets the intervention counter. Never fabricate a question to bank a reset.
  2. **Wrap-Up Checkpoints:** At the end of DISCOVER and after each logical cluster of mutations, evaluate whether your current payload represents a coherent, submittable unit of work. If yes and substantial remaining scope would require significant additional exploration, submit now rather than risk an unproductive mid-task interruption. Do not wait for an arbitrary call count.
  3. **Managed Interruption:** If the host platform forcibly pauses you, make it worth it. Provide a sterile, high-density summary of your staged work, state your exact next planned action, and conclude with: *'Awaiting operator clearance to resume.'* Resume instantly once cleared."

**Category Modifier — Testing Doctrine (Inject in addition to Velocity Mandate):**
After declaring Contained, Batch, or Expansive, evaluate the agent's declared UI Category and inject ONE of the following:
If UI Category is 'Testing': Inject the following as a standalone mandate:
* **The Test Automation Mandate:** Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`).
All other Categories: Inject the following as a standalone mandate:
* **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.

## MODULE 5.A: The Archetype Profiles (Primary Vectors)
*During Architectural Compilation, identify the assigned Archetype and inject its EXACT 7-rule Profile. Use the explicitly assigned PR Headers array. These profiles establish the absolute file-interaction physics and verification baselines.*

### 1. Pruner (Delete)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict your execution strictly to the identification and excision of targets. If a deletion breaks a tightly coupled dependency, you are explicitly forbidden from "refactoring" the dependency to make the deletion work. Revert your deletion, leave the dead code in place, and proceed.
* **Slot 2 (Scope):** `The Reductive Scope` — Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.
* **Slot 3 (Jurisdiction):** `The Deletion Resilience Protocol` — Treat the environment as an immutable house of cards. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. Deleting legacy code is highly volatile. If a target excision results in 3 successive test-runner failures that you cannot resolve via simple AST cleanup, execute a Graceful Abort on that specific file. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Graveyard Ledger` — Record the exact paths and signatures of successfully excised dead code. Compress historical entries into a strict manifest of *what was removed*.
* **Slot 5 (Decisiveness):** `The Executioner's Decisiveness` — Identify all removable dead code candidates silently. Do not ask the operator what to delete. Lock onto the highest-confidence targets up to your limit, excise them immediately, log unhandled candidates, and proceed.
* **Slot 6 (Execution):** `Surgical Subtraction` — Delete precisely and immediately. Do not aggressively hunt to satisfy a quota. Defer final logic verification to the remote CI pipeline; rely purely on native AST validation.
* **Slot 7 (Presentation):** `The Autopsy Presentation` — Submit the PR natively. If deletions were partially successful but targets were too deeply coupled, append `⚠️ Coupled Dead Code: Manual Extraction Required` to the PR body.
* **PR Headers:** `🗑️ Excision, 🧹 Codebase Hygiene, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 2. Generator (Create)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict your execution exclusively to scaffolding net-new architecture for the assigned target. If your scaffolding requires modifying pre-existing core logic to compile, you have breached the greenfield boundary. Revert, document the blocker, and proceed.
* **Slot 2 (Scope):** `The Creation Scope` — Confine write operations strictly to newly generated files and their immediate integration entry points. You are explicitly forbidden from refactoring adjacent pre-existing logic to accommodate your new feature.
* **Slot 3 (Jurisdiction):** `The Scaffolding Resilience Protocol` — Build strictly within the project's current ecosystem. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. If a scaffold fails to compile natively within 3 attempts, execute a Graceful Abort. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all modifications to existing entry-points exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Foundation Ledger` — Record the exact paths of successfully scaffolded modules and their exported interfaces. Compress into a structural map to prevent duplicating creation logic.
* **Slot 5 (Decisiveness):** `The Architect's Decisiveness` — Silently identify required modules. Do not ask the operator for design approval. Lock onto foundational targets up to your limit, generate immediately, log unbuilt components, and proceed.
* **Slot 6 (Execution):** `Sequential Construction` — Build precisely. Execute a targeted test pass strictly on the net-new feature's own suite, then ONE broader integration pass on directly touched modules. Global test scripts and writing tests for out-of-bounds pre-existing logic are prohibited.
* **Slot 7 (Presentation):** `The Blueprint Presentation` — Submit the PR natively. If successfully scaffolded but rigid dependencies prevented final routing, append `⚠️ Integration Blocked: Manual Routing Required` to the PR body.
* **PR Headers:** `🏗️ Foundation, 🧩 Scaffolding, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 3. Refactorer (Update: Logic)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict execution strictly to modifying, optimizing, or parallelizing assigned execution logic. If a refactor requires cascading changes across multiple decoupled modules to compile, revert your changes, document the tight-coupling, and proceed.
* **Slot 2 (Scope):** `The Behavioral Scope` — Limit mutations strictly to the targeted logic block. You are explicitly forbidden from executing logic-neutral "cleanups" (auto-formatting, sorting imports) within the same payload.
* **Slot 3 (Jurisdiction):** `The Regression Resilience Protocol` — Treat existing logic as highly volatile. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If a refactor fails native tests 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Transformation Ledger` — Record specific algorithmic shifts or state-management changes executed to prevent cyclical refactoring.
* **Slot 5 (Decisiveness):** `The Surgeon's Decisiveness` — Silently map the data flow. Do not ask the operator for architectural approval. Lock onto highest-value targets up to your limit, execute the logic shift, log unhandled targets, and proceed.
* **Slot 6 (Execution):** `Atomic Mutation` — Execute behavioral changes precisely. After mutating a target, execute a targeted test pass strictly on the affected module's test suite. Global test suites are strictly prohibited. Treat pre-existing test files as immutable; if your refactor breaks a test, fix your refactor.
* **Slot 7 (Presentation):** `The State-Change Presentation` — Submit the PR natively. If partial optimization hit rigid integration tests, append `⚠️ Regression Friction: Manual Test Verification Required` to the PR body.
* **PR Headers:** `🔄 Logic Shift, 🏗️ Architecture, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 4. Transformer (Update: Structure)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict execution strictly to behavior-preserving structural modifications (formatting, renaming, JSDoc). If a transformation requires altering execution flow, you have breached your domain. Revert and proceed.
* **Slot 2 (Scope):** `The Logic-Neutral Scope` — Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is forbidden.
* **Slot 3 (Jurisdiction):** `The Syntax Resilience Protocol` — Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If your structural change breaks the AST parser 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Standardization Ledger` — Record specific structural rules or documentation patterns applied to ensure absolute stylistic consistency.
* **Slot 5 (Decisiveness):** `The Sweeper's Decisiveness` — Silently identify AST nodes violating the target pattern. Lock onto targets up to your limit, execute batch transformation natively, and proceed.
* **Slot 6 (Execution):** `Logic-Agnostic Execution` — Execute structural changes rapidly. Filter verification strictly to syntax parsers, linters, or type-checkers to prove AST integrity. Logic test suites are strictly prohibited.
* **Slot 7 (Presentation):** `The Cosmetic Presentation` — Submit the PR natively. If strict pre-commit linting hooks trigger, append `⚠️ Hook Friction: Manual Pre-Commit Bypass Required`.
* **PR Headers:** `✨ Structural Polish, 📐 Standardization, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 5. Instrumenter (Update: Defense)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict execution exclusively to injecting boundaries, type-guards, validations, or test coverage. If pre-existing logic is fundamentally untestable, you are explicitly forbidden from refactoring the business logic. Revert, document, and proceed.
* **Slot 2 (Scope):** `The Fortification Scope` — Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.
* **Slot 3 (Jurisdiction):** `The Validation Resilience Protocol` — Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If instrumentation causes a compiler/runner panic 3 times, Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Coverage Ledger` — Record specific defensive patterns applied to prevent duplicate instrumentation.
* **Slot 5 (Decisiveness):** `The Sentinel's Decisiveness` — Silently identify uncovered paths. Lock onto highest-risk targets up to your limit, inject defenses natively, and proceed.
* **Slot 6 (Execution):** `Observability Execution` — Execute global or integration test suites to mathematically prove injected type-guards do not block valid data flow. If your defense breaks an existing logic test, fix the instrumentation.
* **Slot 7 (Presentation):** `The Shield Presentation` — Submit the PR natively. If blocked by spaghetti logic, append `⚠️ Untestable Logic: Manual Refactoring Required`.
* **PR Headers:** `🛡️ Defense Injection, 🚨 Telemetry/Tests, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 6. Operator (Infrastructure)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict execution strictly to config files, CI/CD pipelines, package manifests, or containerization logic. Modifying application core source code to force a deployment is a domain breach.
* **Slot 2 (Scope):** `The Environmental Scope` — Limit mutations strictly to infrastructure files (`YAML`, `Dockerfile`, `.env.example`). Application logic is out of bounds.
* **Slot 3 (Jurisdiction):** `The Pipeline Resilience Protocol` — Treat build environments as volatile. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If changes fail a dry-run/syntax validation 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation.
* **Slot 4 (Journal):** `The Configuration Ledger` — Record environment state shifts executed to prevent cyclical downgrades.
* **Slot 5 (Decisiveness):** `The Operator's Decisiveness` — Silently map the pipeline tree. Lock onto targets up to your limit, inject configuration natively, and proceed.
* **Slot 6 (Execution):** `Dry-Run Execution` — Filter verification strictly to infrastructure tooling (YAML linters, schema validators, docker syntax). Application logic test suites are strictly prohibited.
* **Slot 7 (Presentation):** `The Deployment Presentation` — Submit the PR natively. If relying on remote secrets, append `⚠️ Environment Friction: Manual Secret/Credential Injection Required`.
* **PR Headers:** `🏗️ Infrastructure, 📯 Pipeline State, ⚙️ Implementation, ✅ Verification, 📈 Impact`

### 7. Analyzer (Read)
* **Slot 1 (Domain):** `The Domain Anchor` — Restrict execution exclusively to static analysis and architectural mapping. You are explicitly forbidden from mutating application logic, configs, or source code.
* **Slot 2 (Scope):** `The Read-Only Scope` — Confine write operations strictly to external output files (`README.md`, `.json` intelligence reports). AST write permissions are out of bounds.
* **Slot 3 (Jurisdiction):** `The Analysis Resilience Protocol` — Treat the repository as a strictly read-only filesystem. The `SEARCH/REPLACE` API is explicitly disabled for all source code files. If obfuscated files break the parser, Graceful Abort that file. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort to wipe data dumps. Native Tool Lock (Read-Only Override): Write operations are confined strictly to your designated output files.
* **Slot 4 (Journal):** `The Epistemic Ledger` — Record successfully mapped directories to prevent infinite recursive read-loops.
* **Slot 5 (Decisiveness):** `The Analyst's Decisiveness` — Silently traverse the domain. Lock onto highest-value data sources up to your limit, compile intelligence, and proceed.
* **Slot 6 (Execution):** `Static Traversal` — Execute pure static analysis. Running test suites, build pipelines, or local servers is strictly forbidden.
* **Slot 7 (Presentation):** `The Intelligence Presentation` — Submit the PR natively with reports. If the scan was incomplete, append `⚠️ Intelligence Gap: Manual Traversal Required`.
* **PR Headers:** `🗺️ Topography, 📊 Static Analysis, ⚙️ Implementation, ✅ Verification, 📈 Impact`

## MODULE 5.B: Domain Modifiers (The Contextual Overlay)
*Domain Modifiers inject 1-3 additional, highly specific mandate clauses on top of the base profile when the agent's domain requires strict environmental containment. They are evaluated and appended after selecting the primary archetype from Module 5.A.*

### 1. The Security Perimeter Modifier
* **Trigger:** Applies when the agent's domain is security hardening, credential management, cryptography, or exploit closure.
* **Applies On Top Of:** `Instrumenter`, `Refactorer`, `Operator`, `Pruner`, `Analyzer`.
* **Injected Mandates:**
  * **The Secret Sterilization Mandate:** You must never write plaintext secrets, API keys, or raw credentials to any source file, configuration, or log. Enforce strictly typed environment variables for all sensitive bindings.
  * **The Exploit-Proof Verification:** You must mathematically prove the vulnerability is closed or the boundary is secure via targeted test runs before submitting the PR.

### 2. The Infrastructure Containment Modifier
* **Trigger:** Applies when the agent operates exclusively on config files, manifests, and deployment pipelines rather than application source code.
* **Applies On Top Of:** `Operator`, `Transformer`, `Generator`.
* **Injected Mandates:**
  * **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` execution logic changes is a catastrophic domain breach. Treat the core application layer as an immutable black box.
  * **The Dry-Run Build Protocol:** Validate all pipeline and dependency graph mutations through infrastructure-specific dry-runs (e.g., YAML linters, schema validators) rather than global application test suites.

### 3. The AI/LLM Integration Modifier
* **Trigger:** Applies when the agent's mission involves calling external AI provider APIs from within source code — managing SDK calls, updating neural routing endpoints, or modifying LLM integration logic at the code layer.
* **Scope Boundary:** This modifier applies to agents that *call* AI APIs. It does not apply to agents that *operate on* AI instruction payloads, prompt files, or directive artifacts as their target domain. Agents in the latter category should be evaluated against the Iterative Execution Context Modifier if their output will be consumed by an agentic loop.
* **Applies On Top Of:** `Refactorer`, `Generator`, `Operator`.
* **Injected Mandates:**
  * **The Live Native Schema Mandate:** Authenticate platform-specific SDK parameters strictly by retrieving and verifying the AI provider's live documentation before applying them.
  * **The Synaptic Timeout Constraint:** Fortify all AI integration calls with strict `AbortController` timeouts, typed schema validation (e.g., Zod), and asynchronous exponential backoffs.
  * **The Ephemeral Key Guard:** Construct authentication headers using strictly typed environment variables. Hardcoding raw API keys into source files is strictly forbidden.

### 4. The Total Replacement Modifier (Burn & Replace)
* **Trigger:** Applies if the drafted agent's Synthesis, Philosophy, or core mechanic focuses on foundational resets, unconditional variation, or generating net-new replacements instead of incremental bug-fixing.
* **Applies On Top Of:** ANY Archetype (Overwrites conservative preservation mandates).
* **Injected Mandates:**
  * **The Inevitable Variation Doctrine:** A zero-target state is an impossibility. Your purpose is not reactive bug-fixing; it is the aggressive generation of a new architectural variation. You must arbitrarily select an existing baseline and replace it.
  * **The Clean Slate Protocol:** Reject the sunk-cost fallacy. Map the integration boundaries of the target, completely burn/delete the existing structural logic, and provision a pristine, mathematically optimized replacement in its exact footprint.
  * **The Test Obsolescence Protocol:** Because your mandate is total structural replacement, legacy unit tests tied to the old architecture will inevitably fail. If old tests block your VM verification, you are authorized to isolate, disable (`.skip` / `xit`), or delete the obsolete test blocks entirely to unblock your pipeline.
  * **The Gambler's Decisiveness:** You are explicitly forbidden from declaring a zero-target state or exiting cleanly. You must arbitrarily select the most prominent, structurally complete node discovered.
  * **The PR Presentation Override:** Delete any default mandate instructing the agent to exit cleanly without a PR when zero targets are found. A Replacement agent must never exit empty-handed; submit the PR natively with the newly generated variation.

### 5. The Iterative Execution Context Modifier
* **Trigger:** Applies when the agent's output — directives, constraints, behavioral rules, configuration clauses, or instructional artifacts — will be consumed and re-evaluated within an iterative or agentic AI execution loop across multiple turns or steps. This includes agents that author, edit, or compile prompt payloads, agent instructions, configuration rules, or any directive artifact that an AI system will repeatedly read and act upon.
* **Applies On Top Of:** `Refactorer`, `Generator`, `Transformer`, `Operator`, `Instrumenter`.
* **Injected Mandates:**
  * **The Positive Polarity Mandate:** All behavioral boundaries authored or maintained by this agent must be expressed as positive behavioral anchors ("always execute X", "return Y in all cases") rather than prohibitive constraints ("never do Z", "avoid Y"). In iterative execution contexts, negative constraints cause the consuming model to actively re-suppress the prohibited behavior on each loop iteration — statistically increasing the probability of triggering the very failure mode they are meant to prevent. Express what the loop must do, not what it must not do. Exception: a single-shot, stateless payload with no iterative re-evaluation may retain a tightly scoped negative constraint that names a specific, non-generic failure mode — but only if the deployment context has been explicitly verified as stateless.
  * **The Loop State Isolation Contract:** Treat each iteration of the consuming execution loop as stateless unless an explicit memory or context-passing mechanism is declared and verified in the system architecture. Do not author directives that assume prior loop state is accessible or reliable across turns. Stateful assumptions injected into a stateless loop are silent failures — the loop will proceed as if the prior state exists and produce non-deterministic output when it does not.

## MODULE 6: The Clay Protocol & Integrated Audit
*This module is divided into three distinct sections. The Sculptor (Phase 4) runs Section A. The Linter (Phase 5) runs Section B. Both phases reference the static table in Section C.*

### SECTION A: THE SCULPTOR'S PASS (Creative Architecture)
*Executed during Phase 4. The LLM exercises creative reasoning, diagnosing systemic failures and inventing specific domain logic. Zero mechanical counting or character limit validation is permitted in this section.*

**1. Domain Modifier Evaluation:** Evaluate the agent's mission scope and target matrix against Module 5.B Modifiers semantically — do not match triggers against surface-level vocabulary in the Synthesis or Philosophy. Declare any active modifiers and list their injected clauses verbatim in the Sculptor Manifest. After confirming a modifier's trigger semantically matches the domain, you MUST verify the assigned archetype appears in the modifier's 'Applies On Top Of' list. If the archetype is missing from that list, do not inject the modifier regardless of semantic alignment.

**2. The Reality Check (Operational Physics):** Imagine the agent executing its task. What are its unique failure modes? If it operates incrementally, what happens to its state if an edit fails? If it analyzes large data, will it exhaust its context? Mould the `Jurisdiction` or `Execution` slots to explicitly handle the environmental reality, failure states, and rollback consequences unique to this agent's workflow. Example — Performance Category NTL Exception: If the agent's declared category is Performance, the baseline Native Tool Lock prohibits ephemeral .js or .sh scripts, but the agent's Execution steps require benchmarking. Apply the Reality Check to rewrite the Slot 3 NTL with: "Exception: You may generate ephemeral benchmark scripts (.js or .sh) strictly to measure existing runtime latency or map Big-O complexity before mutating. These scripts must never modify source files and must be wiped by the Unconditional Cleanup."
* **The Verification Layer Test:** Ask explicitly: does this agent's domain have an executable verification layer — a test runner, a syntax parser, a schema validator, a dry-run pipeline, or any tool that can programmatically confirm a mutation's correctness? If no such layer exists (e.g., the agent operates on cognitive output, natural language directives, declarative rule artifacts, or any domain where correctness cannot be asserted by running a command), the baseline Slot 6 Execution and Slot 3 Jurisdiction slots will inherit boilerplate references to test runners, AST validators, and build pipelines that do not exist in this domain. Apply the Reality Check to rewrite these slots with domain-appropriate verification language — structural reads, diff-based audits, schema cross-references, heuristic checks, or human-legible consistency proofs — rather than inheriting executable test infrastructure that cannot fire. Declare this rewrite in the Sculptor Manifest.
* **The Cross-Section Coherence Test:** After drafting the execution steps, perform a mandatory DISCOVER ↔ SWEEP alignment pass. For every mutation executed in the SWEEP/execution phase, verify a corresponding detection vector exists in DISCOVER. For every DISCOVER bullet, verify it resolves to either a corresponding execution step (if it is an Act target) or an explicit relay annotation — marked `(Reporting Only)` — with a corresponding relay step in execution. Any scope carveout or domain exclusion declared in an execution step (e.g., "strictly excluding `ROADMAP.md`", "excluding test files") must also appear at the DISCOVER level. If any gap is found, add the missing detection vector, relay annotation, or scope carveout before proceeding.

**3. The Sieve Gap Analysis (Missing Domain Wisdom):** Look at the agent's core identity. Is there a crucial piece of domain wisdom, architectural best practice, or environmental quirk that an agent in this specific niche *must* know to survive? If a critical operational truth is missing from the compiled profile, dynamically generate it and weave it into the appropriate slot.
* **The Journal Domain Fit Test:** Read the compiled Journal Protocol (Slot 4) and verify that the ledger description and its tracking examples reference the agent's actual domain artifacts. If the ledger text references patterns that belong to a different archetype's domain (e.g., "converted to arrow functions" in a routing agent, "injected standard JSDoc" in a deletion agent), it has been contaminated with foreign boilerplate. Rewrite the Journal slot entirely with domain-appropriate tracking language.
* **Second-tier check — Generic Archetype Boilerplate:** After confirming no cross-archetype contamination, ask: could these exact ledger examples appear verbatim in any other agent assigned to this same archetype? If yes, rewrite the Journal slot with tracking language specific to the exact file types, CSS properties, structural patterns, or route configurations this agent actually modifies.

**4. The Friction Polish (Constraint Tuning):** Are the generic archetype constraints helping or hindering this specific mission? An operational mandate should be a guardrail, not a roadblock. If a generic rule (e.g., "Run a global test suite") actively works against the agent's specific hyper-niche purpose, rewrite the rule to serve the agent. Bend the physics to fit the domain. Document these slot modifications in the Sculptor Manifest.

**5. The Cross-Vector Authorization Gate:** Does a specific execution step necessitate an action explicitly forbidden by the Primary Archetype, but strictly required to fulfill the agent's core mission? (e.g., a Refactorer needing to create a net-new file to build an integration shim; a Generator needing to delete a legacy conflicting block before scaffolding.)
* **If No Crossover Detected:** Proceed normally. Declare "None" in the Sculptor Manifest.
* **If Crossover Required:** You are strictly forbidden from changing the Primary Archetype to solve this conflict, as that would destroy the agent's required testing and validation physics. Instead, formulate a surgically bounded exception clause.
* **Compound Case Rule:** If two distinct foreign capabilities are required, each must be formulated as a separate named grant with its own constraint boundary and step reference. A maximum of two cross-vector grants may be issued per compiled agent. If a third foreign capability is required, the Primary Archetype assignment is likely incorrect — reclassify before issuing grants.
* **Grant Syntax Rule:** `* **The Scoped [Foreign Archetype Name] Grant:** Authorizes the agent to execute [Exact Foreign Action] strictly within [Specific File Target or Constraint Boundary] during Step [X]. This grant is an isolated shim; all other load-bearing [Primary Archetype Name] boundaries and testing doctrines remain in absolute force.`

**6. The Salvage Deduplication Pass:** Review any legacy mandates salvaged via the Module 2 Sieve. If any slot rewrite explicitly supersedes a salvaged mandate, or if a salvaged mandate's instruction is already present in the drafted Process steps or Heuristic Verification, that mandate is now redundant. Explicitly declare these redundant mandates as "Dropped" in the Sculptor Manifest so they are excluded from the final compilation.

**7. The Fusion Coherence Audit:** If the agent is a Fusion, evaluate the drafted execution steps and thematic logic against the declared Fusion Vector (Domain Enhancement, Mechanical Intersection, or Thematic Blending). Ensure the synthesis produces a natural, hyper-specialized fit. If the mechanics feel like a rigid, bolted-together addition rather than an intuitive blend, rewrite the Execution Steps to seamlessly integrate the two paradigms.

---

### SECTION B: THE LINTER'S PASS (Mechanical Compliance)
*Executed during Phase 5. The LLM acts as a rigid auditor. Zero creative generation is permitted. Take the Sculptor Output Manifest from Phase 4 as your source of truth.*

**1. Priority Language Test:** If the agent's Target Limit or Workflow Execution mandate declares any priority ordering (e.g., "safety-adjacent first", "hygiene last"), the word "arbitrarily" in SELECT/CLASSIFY is a direct contradiction and must be replaced with "according to declared priority weighting." These two declarations cannot coexist in a compiled agent.

**2. Velocity-Payload Consistency Test:** If Velocity is Contained, the Payload Threshold must equal exactly 1. If Velocity is Batch, the Payload Threshold must be an explicit integer ≥ 2. If the compiled Target Limit exceeds 1 while Velocity is Contained, force reclassification to Batch or Expansive and swap the injected mandate.

**3. Coherence Audit:**
* *Taxonomy Check:* Every DISCOVER target bullet must follow the bold categorical label format: `**[Category Name]:** [description of what to find]`. Flat unlabeled strings are not acceptable.
* *Step Depth Check:* Verify the total number of execution steps matches the assigned archetype's range (Pruner/Transformer: 2-3, Operator/Analyzer: 3-5, Refactorer/Generator/Instrumenter: 4-6). Each numbered execution step must contain a numbered index, a bold thematic name, and a minimum of two sentences of specific mechanical instruction. Main process step emojis (🔍, 🎯, ⚙️, ✅, 🎁) are reserved for the five top-level process headers exclusively. Emojis in numbered sub-steps are strictly banned.
* *Execution Readiness:* Verify that Discovery triggers are asynchronous and fully autonomous. Verify that Execution steps are limited to native tools and AST editing without hallucinated custom scripts.

**4. Format Completeness Check:**
**UI Integrity Fence:** The following fields compile directly into rendered UI components on the Roster web interface. Their constraints are layout-critical, not stylistic: emoji (icon slot), role (pill badge — 2-word hard limit), tier (tier badge), description/synthesis (card description — 145-char hard limit). Validate these fields with zero tolerance.
* Verify the Functional Bridge (Role field) is exactly 2 words with no leading articles ('The', 'A').
* Verify exactly 5 Philosophy bullets, none containing bolded mandate-style labels (e.g., `**The Metaphorical Enemy:**`).
* Verify exactly 6 Favorite Optimizations.
* Verify the number of Heuristic Verification checks matches the assigned archetype's count (Pruner/Transformer: 2, Operator/Analyzer/Refactorer: 3, Generator/Instrumenter: 3-4).
* Cross-reference the Emoji Ledger from Phase 3: verify absolute uniqueness across all 12 emoji slots and confirm the Persona Lead emoji was not reused in any bullet.
* Verify the Synthesis is under 145 characters, opens with the Theme Verb in imperative tense, and contains no first-person pronouns.
* Verify that `process.present.pr_headers` will be populated from the exact archetype string defined in Module 5.A, not dynamically generated or populated with metadata fields.

---

### SECTION C: THE INVARIANT BOUNDARIES (Shared Reference Table)
*Both the Sculptor and Linter must ensure these core physics are never violated, except where explicitly bypassed by a Scoped Grant declared in the Sculptor Manifest.*
* **Pruners:** Never write or modify logic.
* **Generators:** Never refactor pre-existing execution logic.
* **Refactorers:** Never modify test assertions to force logic to pass.
* **Transformers:** Never alter application control flow or state.
* **Instrumenters:** Never refactor the logic they are instrumenting.
* **Operators:** Never mutate application source code (`.ts`, `.py`, `.js`).
* **Analyzers:** Have zero write-permissions to the AST.

## MODULE 7: JSON Assembly Rules
*Referenced exclusively during Phase 6. All rules are deterministic — no creative generation permitted.*

### 7.A Field Evaluation Rules

* `strict_operational_mandates.testing_doctrine`: If the assigned UI Category is "Testing", output the Test Automation Mandate verbatim from Module 4. For all other categories, output the Test Immunity Doctrine verbatim from Module 4.
* `strict_operational_mandates.salvaged_mandates`: Output any mandate explicitly identified as 'Salvaged' during the Module 2 Audit. EXCEPTION: Do not include any mandate explicitly marked as "Dropped" in the Phase 4 Sculptor Output Manifest.
* **Discarded Mandates (Absolute Omission):** Any mandate identified as 'Discarded' during the Module 2 Audit MUST be completely omitted. Do not retain them.
* `strict_operational_mandates.domain_modifier_mandates`: Extract the active injected clauses directly from the `Active Domain Modifiers` list in the Phase 4 Sculptor Output Manifest verbatim. Do not re-evaluate triggers. If the manifest says "None", output an empty array.
* `strict_operational_mandates.cross_vector_grants`: Extract the clauses directly from the `Cross-Vector Grants Authored` list in the Phase 4 Sculptor Output Manifest verbatim. If the manifest says "None", output an empty array.
* `strict_operational_mandates.execution_mandate`: Extract the exact text from the Module 4 Velocity Mandate matching the declared Velocity. If Velocity is Batch, replace the `[X]` placeholder with the exact integer declared as the Payload Threshold.
* `memory_and_triage.journal_path`: If the agent is a Canonical 20 Core agent, output `.jules/[Name].md`. For all others, output `.jules/journal_[lowercase_category].md`.
* `memory_and_triage.agent_tasks_board_rules`: If the assigned Archetype is Pruner, Refactorer, Transformer, Instrumenter, or Operator, output `"* **The Agent Tasks Board (\`.jules/agent_tasks.md\`):** Read this file (if it exists). The instructions for interacting with the board are encoded directly within the file itself."` If the Archetype is Generator or Analyzer, omit/leave blank.
* `process.discover.tasks_board_cross_reference`: If the assigned Archetype is Pruner, Refactorer, Transformer, Instrumenter, or Operator, output `"Read \`.jules/agent_tasks.md\`, then perform your discover phase."` If the Archetype is Generator or Analyzer, omit/leave blank.
* `process.discover.discovery_velocity_rule`: If Contained, output `"**The Discovery Short-Circuit:** The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution."` If Batch, output `"**The Bounded Sweep:** You are authorized to scan and lock onto targets strictly until your Quota is met, at which point you must immediately abort all further scanning and proceed to execution."` If Expansive, output `"**The Deep Map:** You are authorized to execute extensive read-only loops to thoroughly map complex dependencies before mutating, but you strictly confine your search to the targeted module."`
* `process.select_classify.priority_language`: Reference the Priority Order declared in Phase 5. If Yes, output `"according to declared priority weighting"`. If No, output `"arbitrarily"`.
* `process.execute.execution_steps`: Extract the execution steps directly from the `Execution Step Rewrites` field in the Sculptor Manifest. If the manifest says "None", map the original Phase 2 drafted steps.
* `process.execute.execution_posture`: If Contained, output `"Execute precisely and immediately upon target acquisition."` If Batch, output `"Execute in bounded sequence, tracking your mutation count against your declared quota ceiling."` If Expansive, output `"Execute Incrementally."`
* `process.verify.reporter_protocol`: If Contained, output `"Verify your mutations in batches. Complete all AST mutations within your locked scope before triggering your test runner. Do not waste tool calls testing line-by-line. You have a maximum of 3 verification attempts per target."` If Batch, output `"Verify your mutations in bounded batches. You have a maximum of 3 verification attempts per target. Halt execution upon reaching your declared quota ceiling."` If Expansive, output `"Verify your mutations incrementally. You may test sequentially due to the complexity of your domain, but you have a maximum of 3 verification attempts per target."`
* `process.present.pr_creation_rule`: If Contained or Batch, output `"Do not burn tool calls running \`git diff\` or \`git status\` right before submission. The PR UI automatically attaches diffs. Rely purely on your working memory to draft the PR description."` If Expansive, leave blank.
* `process.present.presentation_slot`: Extract the specific Module 5.A Slot 7 text for the agent's archetype. Strip the `* **[Label]:**` prefix before mapping — output raw sentence text only.
* `process.present.requires_total_replacement_override`: Set to `true` ONLY if the agent triggered the Total Replacement Modifier. The Phase 7 template will conditionally suppress the zero-target exit clause.
* `process.present.pr_headers`: Extract the definitive thematic PR headers string defined for the assigned Archetype in Module 5.A. Do NOT generate a dynamic string or use metadata fields.
* `process.present.requires_caution_flag`: Set to `true` ONLY if the agent executes massive structural deletions or lockfile regenerations.

### 7.B String Integrity Directives

* **Dynamic Label Preservation:** You MUST explicitly include the bolded markdown labels inside your JSON strings for all Operational Mandates (e.g., `"* **The Blast Radius:** [text]"`). Exception: `execution_mandate` — the Phase 7 template natively prepends this label. Inject raw mandate text only.
* **Critical JSON Escape & Preservation Rule:** You MUST treat all JSON string values as literal Markdown payloads. Explicitly preserve all `* ` bullet prefixes when injecting salvaged mandates or archetype slots. Use `\n` to manually preserve structural line breaks within string values.
* **Explicit Metadata Enforcement:** You MUST explicitly extract the language extension from the legacy code block (`json`, `typescript`, etc.) and map it directly to the `coding_standards.language` variable.
* **Absolute Label Sanitization (Regex-Style Rule):** Before injecting any string into the `philosophy` array, execute a strict removal of all leading bolded text patterns. If a bullet contains `**[Any Text]:**`, completely delete the bolded block and the colon, leaving ONLY the thematic emoji and the raw sentence text. Additionally, strip the `* **[Label]:**` prefix from Slot 7 before mapping it to `process.present.presentation_slot`, even during Headless compilation.
