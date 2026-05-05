# 🛠️ Forge Protocol: Compiler Directives

This document contains the dynamic sub-routines, Trust & Safety heuristics, and execution logic utilized by the Master Forge and Auto-Forge engines.

## MODULE 1: Target Acquisition (Discovery Logic)
*Triggered by Auto-Forge when TARGET_AGENT_FILE is set to "AUTO".*
Your objective is to autonomously locate exactly ONE legacy agent prompt that requires an upgrade.
**1. The Signature Sweep:** Dynamically search the `prompts/` and `prompts/fusions/` directories for `.md` files.
**2. Validation Criteria:** A valid "Legacy Agent" is any file that contains the phrase "Strict Operational Mandates" but explicitly LACKS the modern V67 signature phrase "The Ambiguity Resolution Rule".
**3. Lock Target:** Select exactly ONE legacy agent file that meets this criteria. This path becomes your `TARGET_AGENT_FILE`.
**4. Halt Condition:** If no files meet this criteria, declare "All agents are at V67 standard" and execute an immediate Graceful Abort.

## MODULE 2: The Cognitive Sieve (Mandate Salvage)
*Triggered during Phase 1 Extraction.*
Do not blindly copy or violently discard legacy `Strict Operational Mandates`. You must audit them through this sieve:
1. **Discard Boilerplate:** Delete outdated universal rules (e.g., old ephemeral workspace rules, old git clean commands).
2. **Rewrite Toxicity:** Discard or rewrite massive lists of negative constraints/Avoids into strict, positive boundaries.
3. **Salvage Domain Wisdom:** Keep and preserve any highly specific domain expertise or bespoke edge-case rules (e.g., specific regex bans, OS-level awareness, specific framework quirks).

## MODULE 3: Trust & Safety (Metaphor Moderation)
*Triggered during the Compliance Audit.*
LLM safety classifiers trigger on the density and severity of violent imagery. The goal is to clear filters WITHOUT killing the agent's creative theme.
1. **The Absolute Bans:** Never use words invoking graphic biological harm, mass destruction, or malicious real-world violence (e.g., murder, slaughter, mutilate, hemorrhage, assassinate, weaponize).
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
* **Archetype & Category Mapping:** (Declare the new Archetype and Constraints).
* **New Execution Steps:** (Draft the 3-5 new native-tool execution steps).
**STEP 2: The Compilation (Output the template)**
Output the final agent using the Phase 5 `<OUTPUT_TEMPLATE>`. Inject your salvaged mandates at the bottom of the rules list. Halt execution completely after outputting the template.
