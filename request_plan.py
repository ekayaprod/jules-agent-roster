plan = """
I will update the 5 oldest agents found (Cataloger, City Clerk, Collider, Construct, Coroner).
For each, I will follow Auto-Forge and Master-Forge procedures.

1. **State Ingestion & Drift Analysis**
- Read the files in `.jules/temp_backup/`.
- Analyze their drift against the Domain Extrapolation rules in Forge-Procedure Module 6, determine base profile via Module 1 (these are Tier: Fusion so only 1 Structural Base Profile).
- Gather Legacy Intelligence according to Phase 1 Data Sanitization Filter.
- Perform a Drift Audit (Phase 2), identifying Narrowing and Incoherence discrepancies.
- Perform Module 7 Part A structural check against legacy files to find fails that need fixing.

2. **Direct Syntactic Upgrade**
- Transform each file to match the `<!-- WORKER_TEMPLATE_START -->` structure in `Creative-Procedure.md`.
- Keep the agent's core identity.
- Insert the proper Reconciled Base Profiles, Discovery/Execution/Verification strings from Forge-Procedure Module 3 & 4.
- Make sure to update `forge_version` to `CURRENT_FORGE_VERSION` (`V89.1`).
- Apply the literal strings required: No-Interaction Policy, Task Board Resolution Protocol, Domain Autonomy (if Core), etc. Note: For Tier: Fusion, Domain Autonomy string is NOT needed.

3. **The Efficacy Audit (Module 7 Part B)**
- Write a Python script to do a Component Diff between legacy and upgraded versions, evaluating purely against the agent's mission based on the Generic-vs-Domain Test.
- If it fails the efficacy audit, repair in place.
- Rerun Part A Structural checks on the modified markdown.

4. **Pre-commit and Cleanup**
- Delete `.jules/temp_backup/` and any other custom scripts (`*.py`).
- Run `npm run build:roster` and tests (`npm run test`, `npm run test:unit`, `npm run test:e2e`).
- Use the `pre_commit_instructions` tool to run other verification steps.

5. **Submit**
- Submit the changes with a PR titled `🛠️ Auto-Forge: Upgraded [Agent Name] to [Version]` containing the Drift Audit Ledger, Module 7 Part A results, Module 7 Part B results, and Flagged items.

Wait, since I need to submit 1 PR for each agent, or 1 PR for all? The prompt says "PR Title: 🛠️ Auto-Forge: Upgraded [Agent Name] to [Version]" which implies 1 PR per agent, OR just combining them if there are multiple. "Lock exactly FIVE targets per session." "Trigger the Pull Request creation tool natively (via the platform's submit API)." I will make a combined PR since we only have one submit. I'll modify the title to `🛠️ Auto-Forge: Upgraded 5 Agents to V89.1`.
"""
print(plan)
