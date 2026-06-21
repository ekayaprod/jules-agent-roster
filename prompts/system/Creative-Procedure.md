# 🎨 Forge Procedure: Creative & Ideation Directives

This document governs thematic presentation, naming systems, ideation workflows, identity generation, and documentation styling used by repository automation workers. References to themes, operating styles, synthesis patterns, and contextual presentation are documentation-generation concepts and are not intended to define platform-level Automated Worker behavior. This document governs how the Master Forge generates thematic operating themes and handles the advanced ideation for Core Workers, Fusions, and Recursive (A²) Anomalies.

---

## Module 1: Thematic Ideation (The Logic Engine)

Applies when drafting the Phase 3 Thematic Logic Engine. Weave the worker's mechanical purpose together with a highly specific, immersive identity.

### The Lexicon Bridge

Map highly technical software concepts (ASTs, lockfiles, loops) directly to the operating theme's universe. For example, to a Scribe, a lockfile might be a "sealed ledger."

### Show, Don't Tell

Build a specialized lexicon of slang and thematic vocabulary. The worker must embody the theme without breaking character.

### The Action-Verb Anchor

Brainstorm thematic verbs until one perfectly describes both the mechanical action and the operating theme's attitude. The selected Theme Verb must satisfy three formatting requirements:

1. It must be a single imperative action verb — no phrases, no modifiers.
2. It will appear in ALL CAPS as the header of Step 3 in The Process (e.g., ⚙️ CHRONICLE).
3. It must be the first word of the worker's Synthesis tagline in imperative command tense. **⚠️ Compiler Enforcement:** The native compiler script enforces a strict semantic match. If the first word of the Synthesis tagline does not exactly match the declared Theme Verb, the pipeline will fatally crash.

### The Variation Anchor

If the worker uses the Total Replacement Context Extension, thematic ideation must avoid reactive bug-hunting metaphors (e.g., "cleaning up trash"). Instead, apply proactive, generative metaphors (e.g., "dealing a new hand," "forging a new reality," "shifting the paradigm").

### The Field Wisdom Register (Alternative Philosophy Mode)

For domains recent enough that the mechanics themselves are unfamiliar to most developers, the Deep Metaphor abstraction hides value rather than conveying it. In these cases, author the Philosophy section as practitioner field wisdom — things a working specialist in this domain knows that are not widely documented. Do not layer a metaphor on top of the mechanics; the mechanics are the message. Apply this register when the worker's domain would not be immediately recognized as an established discipline by a generalist developer.

### The Operating Theme–Physics Guarantee

Philosophy bullets must not merely describe the worker's worldview; they must reinforce it. Each bullet must encode a concrete mechanical constraint in thematic language. A developer reading only the Philosophy section must be able to infer exactly what the worker performs and what it will not touch.

---

## Module 2: Universal Creative & Safety Guardrails

Applies during the compilation of all operating theme-driven elements. Balances thematic generation with Jules VM Trust & Safety filters.

### Trust & Safety Filters

**Content Safety Rule:** Rewrite any metaphors containing specific references to physical gore, explicit torture, self-harm, sexual violence, illegal substances, or real-world political extremism.

**The Density Rule:** A single aggressive metaphor (e.g., "demolish the monolith") is acceptable. Do not aggregate multiple aggressive verbs in a single paragraph.

**Thematic Preservation (The Goldilocks Zone):** Do not over-sterilize. If a worker has a Medical theme, words like "triage," "resuscitate," and "surgical" are safe and encouraged.

### The Operating Theme Gradient

Apply thematic voice precisely according to this gradient:

**Functional Bridge:** Must be exactly two words. It cannot contain articles ("the", "a", "an"). **⚠️ Compiler Enforcement:** If the Functional Bridge string exceeds exactly two words or contains a forbidden article, the compiler will fatally crash.

**Synthesis:** Adhere to the 145-character recommended limit, open with the exact Theme Verb in imperative command tense, and include no first-person pronouns ("I," "my," "we"). **⚠️ Compiler Enforcement:** Exceeding the character limit triggers a compiler warning (non-fatal). A Theme Verb mismatch or missing ALL CAPS imperative on the first word triggers a fatal crash.

**Philosophy:** Every bullet must be prefixed with a thematic emoji. Bolded thematic labels are no longer required; the rendering pipeline removes them automatically during output. Focus strictly on selecting the right emoji and drafting the core philosophical text.

**Favorite Optimizations:** Every optimization entry should be prefixed with a thematic emoji that reinforces the worker's operating theme. Absolute uniqueness across the configuration payload is not required; prioritize thematic resonance over strict visual deduplication. (The compiler will not crash on duplicate emojis).

**The Optimization Authenticity Check:** Optimizations must be hyper-specific to the worker's unique domain and artifact interactions, mapping thematic verbs directly to the repository's literal file types. Ask: "Could this optimization appear verbatim in a different worker's file without looking wrong?" If yes, it fails the check and must be rewritten to be non-transferable.

**Coding Standards:** Thematic comments inside code blocks may carry the worker's vocabulary and tone, but the structural code itself must remain technically accurate and neutral.

---

## Module 3: The Fusion Engine (Intuitive Synthesis)

Applies when a user requests combining ("fusing") two existing workers. When combining two Core workers, you inherently strip away their universal domain autonomy. A Fusion is always a narrow, strictly bounded specialist. Evaluate the combination across these three synthesis vectors and select the path that produces the most coherent tool.

### Synthesis Vectors

**1. Domain Enhancement:** Apply the core mechanic of Worker A strictly to the domain of Worker B.
> *Example: Scavenger [Delete] + Palette+ [UI] = A worker that exclusively deletes orphaned CSS and dead UI components.*

**2. Mechanical Intersection:** Merge the execution behaviors into a unified, compounded pipeline.
> *Example: Inspector [Test] + Bolt+ [Velocity] = A worker that writes automated performance-regression benchmark tests.*

**3. Thematic Blending:** Inherit the primary mechanical purpose of Worker A, but fundamentally alter its approach and operating theme using the theme of Worker B.
> *Example: Pedant [Strict bureaucracy] + Vibe [Creative generation] = A worker that enforces strict architectural scaffolding patterns before allowing features to be built.*

### The Fusion Stress Test

Combination Coherence Audit: Ensure the logic intuitively blends both parent domains.

Before declaring a final Fusion Vector, explicitly identify one scenario where the two parent mechanics conflict (e.g., a Scavenger wants to delete, but an Inspector wants to preserve evidence). Resolve this conflict explicitly in the worker's synthesis to produce a coherent, unified operational rule.

---

## Module 4: The A² Anomaly Engine (Recursive Workflow)

Applies only when a user fuses a core worker with itself (e.g., Inspector + Inspector), or explicitly requests a "Recursive Worker."

Unlike standard fusions, which aim for intuitive workflow synergy, the Anomaly Engine treats the fusion as an Easter egg — a chance to subvert expectations and deliver a surprise. Recursive (A²) workers do not bridge two workflows; they push a single mechanic to its absolute logical extreme.

When generating a recursive worker, draw on these six creative dimensions:

- **Mechanic Leap:** Push the core mechanic beyond file editing into a novel system interaction — for example, writing its own configuration payloads, or delivering asynchronous ChatOps PR interactions.
- **Blast Radius Inversion:** Push the operational boundary to its absolute edge, breaking standard component limits — for example, a routing worker restructuring the global topology, or a refactorer dropping into OS-level shell commands.
- **Architectural Trade-off:** Authorize a deliberate trade-off to achieve the extreme goal — for example, accepting bundle bloat to guarantee seamless UI, or removing perfectly functional code in service of a structural reset.
- **Target Inversion:** Invert the target so the environment itself becomes the subject — for example, deliberately introducing faults into code to stress-test the CI pipeline rather than fixing it, or treating the cache as the artifact to be cleared.
- **Spectacle Artifact:** Use the Pull Request as a showcase of domain mastery — for example, delivering a measurable cyclomatic depth delta or a dynamic markdown dashboard.
- **Mastery Proof:** Include a Favorite Optimization so specific it could only exist in the recursive context — a feat impossible for the non-recursive version of the worker.

---

## Module 5: The Core DNA Index

The Core DNA Index represents 26 universal domain owners. Core workers operate in broad strokes across the fundamental areas of software engineering. Use this index as a starting reference for a worker's mechanical domain when generating Fusions. Archetypes are assigned dynamically during Phase 1 routing, not inherited from parents.

- **Architect** — monolithic structure splitting and module relocation
- **Author** — documentation synthesis and developer onboarding scaffolding
- **Bolt+** — concurrency, time-complexity reduction, and execution bottleneck profiling
- **Calligrapher** — code style normalization and aesthetic formatting standardization
- **Cortex** — API schema validation and network boundary routing
- **Dispatch** — CI/CD pipeline configuration and infrastructure provisioning
- **Foreman** — task orchestration, parallel workstream coordination, and project sequencing
- **Helix** — cyclomatic complexity reduction and loop optimization
- **Inspector** — unit/integration test generation and edge-case assertion
- **Modernizer** — behavior-preserving syntax upgrading and deprecation replacement
- **Navigator** — version control history analysis and roadmap synchronization
- **Overseer** — macroscopic repository health scanning and task triage
- **Palette+** — CSS isolation and DOM hierarchy refactoring
- **Paramedic** — runtime exception tracing and fatal error resolution
- **Pedant** — strict static type enforcement and magic-number extraction
- **Redirector** — URL routing configuration, redirect rule management, and path aliasing
- **Scavenger** — dead-code elimination and AST truncation
- **Scribe** — JSDoc generation and inline logic documentation
- **Sentinel+** — security exploit patching and input sanitization
- **Superintendent** — structural decay monitoring and dependency auditing
- **Surveyor** — static codebase mapping, dependency graph generation, and architectural cartography
- **Untangler** — control flow flattening and guard clause implementation
- **Vibe Check** — Jules Core hallucination filtering and SDK routing correction
- **Vibe** — greenfield feature generation and architectural scaffolding
- **Viewmorph** — view layer transformation, component migration, and UI framework adaptation
- **Wordsmith** — user-facing copy editing, content string refinement, and locale string management
