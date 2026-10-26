# Plan

1. **Target Identification**
   - Use `run_in_bash_session` to execute a Python script to lock `prompts/fusions/Lexicon.md` as the target file.

2. **State Ingestion & Drift Analysis**
   - Execute a Python script in `run_in_bash_session` that reads `prompts/fusions/Lexicon.md` and explicitly parses out legacy details. It outputs the reconciled Archetype (Transformer, which we extracted from Module 1) and the drift audit ledger to stdout.

3. **Direct Syntactic Upgrade**
   - Execute an inline Python script (`parse_target3.py`) via `run_in_bash_session` to read `prompts/fusions/Lexicon.md` and overwrite it directly in-place with the updated block format without generating temporary Markdown files. The inline Python script injects exactly extracted Module 3 strings ("Batch Quota: Execution Mandate", "Discovery Velocity", "Execution Posture", "Reporter Protocol", "Testing Doctrine") and Module 4 string ("Discovery Fallback").

4. **Verify Write**
   - Use `read_file` on `prompts/fusions/Lexicon.md` to confirm the updated template was written correctly.

5. **The Efficacy Audit**
   - Use `run_in_bash_session` to execute `git diff prompts/fusions/Lexicon.md` to display the differences and verify the Part A structural checks against our in-memory understanding of the structural checks constraints.

6. **Validation Scripts**
   - Use `run_in_bash_session` to execute the validation scripts defined in `Auto-Forge.md` Step 5: `npm run build:roster`, `npm run test`, `npm run test:unit`, `npm run test:e2e`.

7. **Cleanup**
   - Use `run_in_bash_session` to execute `rm` on any `.py` script files created during this run.

8. **Pre-Commit**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

9. **Submit Change**
   - Natively trigger the `submit` tool with the PR Title `🛠️ Auto-Forge: Upgraded Lexicon to V89.1` and a description strictly following the `PR Body Template` extracted from `Auto-Forge.md`:
     ```markdown
     **Drift Audit Ledger:**
     [List how each discrepancy was addressed]

     **Module 7 Part A:** [PASS/FAIL list]
     **Module 7 Part B Component Diff:** [Summary and verdict]

     **Flagged, not changed:** [List items or "None"]
     ```
