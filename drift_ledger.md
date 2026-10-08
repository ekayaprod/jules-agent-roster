# Drift Audit Ledger for Janitor -> Compactor

1. **Target Matrix formatting**: Legacy uses `* **Package Cleanups:** Ad-hoc...`. Need to match `* **[Category Name]:** [description]`. Wait, it is already using that. Will double check.
2. **Heuristic Verification formatting**: Legacy has `* Does the new centralized manifest...`. Need to match `* **[Label]:** [Question]?`.
3. **Execution Steps**: Legacy has `* Execute in bounded sequence... * 1. ... * 2. ...`. The template requires `{{EXECUTION_POSTURE}} {{EXECUTION_MANDATE}}` directly next to `⚙️ **{{THEME_VERB}}** —`, followed by `{{EXECUTION_STEPS}}` which should be a numbered list without the asterisk.
4. **Throughput Strings**: Legacy has ad-hoc throughput string mixing in `The Process`. Need to use exact strings from `Forge-Procedure.md` for "Batch (Quota)".
    * Discovery Velocity: `* **The Bounded Sweep:** Scan and lock targets until quota is met, then abort scanning and execute.`
    * Execution Mandate: `* Bounded-sweep posture: traverse the repository to locate targets, then abort execution upon mutating exactly 3 targets. Ensure you strictly adhere to this quota. Submit PR immediately upon reaching the ceiling.`
    * Execution Posture: `* Execute in bounded sequence, tracking mutation count against the declared quota.`
    * Reporter Procedure: `* Verify in bounded batches. Max 3 verification attempts per target. Halt upon reaching the quota ceiling.`
5. **Task Board Resolution Protocol**: Missing from legacy (it has a slightly modified version without the backticks). Need `Read \`.jules/agent_tasks.md\` and permanently delete genuinely completed tasks matching your domain.`
6. **Strict Operational Rules**: The `Operator Base Profile` rule needs to match the base profile strictly. Wait, it does pretty much match, but let's make sure it matches Module 1 EXACTLY, plus retaining the custom modifiers.
7. **Identity Changes**: Name -> Compactor, Emoji -> 🗜️, Theme Verb -> COMPACT.
8. **Testing Doctrine**: Legacy: `* Treat test files as immutable and read-only. If a mutation breaks a test, do not modify the test to pass. Either prove the test was failing on main, or execute an immediate Graceful Abort and revert.` We need to change this to the Standard Domain testing doctrine: `* Treat test files as immutable and read-only. If a mutation breaks a test, preserve the test unaltered. Either prove the test was failing on \`main\`, or conditionally inherit the abort/proceed logic of the assigned Throughput Definition.`
9. **Heuristics format**: Change `* Does the new centralized...` to `* **Dry-Run Environment:** Does the new centralized manifest run successfully in a dry-run environment?` etc.
