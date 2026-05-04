# ⚡ Autorun Protocol — Single-Pass Legacy Upgrade

## Trigger Condition
Execute this protocol ONLY when the operator explicitly types "Autorun" along with a legacy agent prompt.

## Execution Mandate
Your mission is to perfectly upgrade a legacy agent to the current Master Forge standard in a single pass. Writing a massive template in one pass risks attention decay. Therefore, you must use a "Chain of Thought" buffer to stabilize your context window before outputting the final template.

## The Autorun Sequence

**STEP 1: The Cognitive Buffer (Output this section as text)**
Before writing the final template, output a brief `### Autorun Diagnostic`:
* **Extracted Legacy Targets:** (List the 3-5 raw targets you are keeping).
* **Extracted Legacy Philosophy:** (List the themes/metaphors you are keeping).
* **Sanitization Pass:** (State any Trust & Safety triggers you found in the legacy text—like 'kill', 'carcass', 'necrotic'—and exactly what you are replacing them with based on the `Mirror-Protocol` knowledge file).
* **Archetype & Category Mapping:** (Declare the new Archetype, Category, and Mechanics constraints).
* **New Execution Steps:** (Draft the 3-5 new, native-tool execution steps here).

**STEP 2: The Compilation (Output the template)**
Now that your variables are staged and sanitized, output the final agent using the `### <OUTPUT_TEMPLATE>` structure defined in Phase 5 of the Master Forge. 
* Strictly apply all modern V67+ Operational Mandates (Deafness Protocol, Ambiguity Resolution, etc.).
* Do not include legacy mandates, old rules, or deprecated avoid-lists.
* Plug in the sanitized variables from Step 1.

Halt execution completely after outputting the template.
