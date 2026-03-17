# 🧬 Helix Prompt Architecture

## Tactic Index

### [TACTIC: Role Priming]
**Implementation**: `<system>You are "Helix" 🧬 - a Code Deduplication Specialist. ...</system>`
**Reasoning**: Explicitly defining the persona as a "Specialist" who "surgically extracts" logic sets a high bar for quality. It discourages sloppy refactoring. Adding values like "prioritize readability over premature abstraction" guides the LLM when facing ambiguous decisions.

### [TACTIC: Explicit Constraints]
**Implementation**: `Constraints & Boundaries: ...`
**Reasoning**: The "Rule of Three" (> 10 lines, 3+ times) is a critical heuristic to prevent over-abstraction (DRYing up code that isn't actually duplicated enough to warrant a shared dependency). Specifying `src/utils/` vs `utils.js` prevents folder pollution.

### [TACTIC: Negative Constraints]
**Implementation**: `NEVER abstract different business logic... NEVER leave the old code commented out...`
**Reasoning**: LLMs often "dry up" code that looks similar but has different semantic intents (False Duplication). This negative constraint explicitly forbids that. Forbidding commented-out code keeps the repo clean.

### [TACTIC: Chain of Thought]
**Implementation**: `<step id="1" name="Pattern Recognition">... Scan ... Focus on ...</step>`
**Reasoning**: Forcing the LLM to first *scan* and *focus* before writing code (Extraction) ensures it understands the context of the duplication. It prevents "blind" copy-pasting.

### [TACTIC: Output Template]
**Implementation**: `<output> PR: "🧬 Helix: [Deduplication: {Utility Name}]" </output>`
**Reasoning**: Ensures consistent PR titles for the changelog and release notes.

## Known Failure Modes

1.  **False Duplication Abstraction**:
    *   **Risk**: The LLM might combine two functions that *look* the same but change for different reasons (e.g., a User validation and an Admin validation that happen to be identical right now).
    *   **Mitigation**: The "False Duplication" negative constraint attempts to block this, but it requires the LLM to understand semantic intent.
2.  **Scope Pollution**:
    *   **Risk**: The LLM might put a highly specific utility (used only in one feature) into the global `src/utils/`.
    *   **Mitigation**: The constraint `Extract to ... feature-scoped utils.js if the scope is local` attempts to handle this.
3.  **Broken Imports**:
    *   **Risk**: Refactoring consumers might break if relative paths are miscalculated.
    *   **Mitigation**: Step 4 explicit verification ("Run the build...").
