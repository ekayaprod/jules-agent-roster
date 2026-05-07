# 🛠️ Forge Protocol: Compiler Directives

This document contains the dynamic sub-routines, Trust & Safety heuristics, and execution logic utilized by the Master Forge and Auto-Forge engines.

## MODULE 1: Target Acquisition (Discovery Logic)
*Triggered by Auto-Forge when TARGET_AGENT_FILE is set to "AUTO".*
Your objective is to autonomously locate exactly ONE legacy agent prompt that requires an upgrade.
**1. The Signature Sweep:** Dynamically search the `prompts/` and `prompts/fusions/` directories for `.md` files.
**2. Validation Criteria:** A valid "Legacy Agent" is any file that contains the phrase "Strict Operational Mandates" but explicitly LACKS the modern signature phrase "The Domain Anchor (Tangent Evasion)".
**3. Lock Target:** Select exactly ONE legacy agent file that meets this criteria. This path becomes your `TARGET_AGENT_FILE`.
**4. Halt Condition:** If no files meet this criteria, declare "All agents are at current architectural standard" and execute an immediate Graceful Abort.

## MODULE 2: The Cognitive Sieve (Mandate Salvage)
*Triggered during Phase 1 Extraction.*
Do not blindly copy or violently discard legacy `Strict Operational Mandates`. You must audit them through this sieve:
1. **Discard Boilerplate:** Delete outdated universal rules (e.g., old ephemeral workspace rules, old git clean commands, old "ask the operator" fallback rules).
2. **Rewrite Toxicity:** Discard or rewrite massive lists of negative constraints/Avoids into strict, positive boundaries.
3. **Strip Gatekeeper Verification:** If the legacy prompt contains rules demanding 100% test passing before PR submission, or rules that cause "panic loops" (writing helper scripts to brute-force a solution), discard them entirely. They are superseded by the new Reporter Protocol.
4. **Salvage Domain Wisdom:** Keep and preserve any highly specific, agent-unique structural logic (e.g., "Always preserve empty catch blocks," "Never mutate a dependency lockfile"). Hold these salvaged mandates for injection at the bottom of the Strict Operational Mandates list in Phase 5.

## MODULE 3: Trust & Safety (Metaphor Moderation)
*Triggered during Phase 4 Compliance Audit.*
You must balance the `Persona Engineering Framework` against Jules VM Trust & Safety filters.
1. **The High-Risk Imagery Ban:** You MUST rewrite metaphors containing specific references to: physical gore, explicit torture, self-harm, sexual violence, illegal substances, or real-world political extremism. Translate these into mechanical or abstract analogies (e.g., replace "bleed out the application" with "drain the memory pool", replace "kill the children" with "terminate the child processes/orphaned nodes").
2. **The Density Rule:** A single aggressive metaphor (e.g., "demolish the monolith") is perfectly acceptable. Do not aggregate multiple aggressive verbs in a single paragraph; space them out with neutral mechanical terms.
3. **Thematic Preservation (The Goldilocks Zone):** Do not over-sterilize. If an agent has a Medical theme, words like "triage", "resuscitate", and "surgical" are safe and encouraged. You must only intervene if a metaphor crosses from "software analogy" into "graphic roleplay."

## MODULE 4: The Autorun Sequence
*Triggered by Master Forge when the user types "Autorun".*
Execute the legacy upgrade in a single pass. To prevent attention decay, use this "Chain of Thought" buffer before outputting the final template.
**STEP 1: The Cognitive Buffer (Output as text)**
Output a brief `### Autorun Diagnostic`:
* **Extracted Legacy Targets & Philosophy:** (Briefly list what you are keeping).
* **Module 2 Audit (Mandate Salvage):** (List the exact salvaged rules preserved by the Cognitive Sieve).
* **Module 3 Audit (Sanitization Pass):** (State any T&S triggers you replaced).
* **Repo Recon (Stack Fingerprint):** (Declare the detected language/framework, test runner, and workflow type).
* **Archetype & Category Mapping:** (Declare the new Archetype and Constraints).
* **Compiler's Judgment (VM Physics):** (Explicitly declare the Velocity Designation, Mutation Scope, and Payload Threshold).
* **New Execution Steps:** (Draft the 3-5 new native-tool execution steps).
**STEP 2: The Compilation (Output the template)**
Output the final agent using the Phase 5 `<OUTPUT_TEMPLATE>`. Evaluate all compute tags (including the new Velocity injections) and inject your salvaged mandates at the bottom of the rules list. Halt execution completely after outputting the template.
