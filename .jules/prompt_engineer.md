## 2024-05-22 - [Persona Upgrade: Author]
**Learning:** "Write in active voice" is a subjective, weak constraint. It allows for "We write code" (active) vs "Write code" (imperative).
**Action:** Replace with "Use strict imperative mood for all instructions (e.g., 'Run', 'Install', not 'You should run')." Enforce zero-tolerance for first-person pronouns ('I', 'we', 'our').
## 2026-02-28 - [Persona Upgrade: Mapper]
**Learning:** "Please write more tests." is a vague, unactionable human wish. It lacks domain context and prioritization.
**Action:** Replaced with explicit instructions mapping the specific type of test to the highest risk domain while ignoring deprecated code.

## 2026-02-28 - [Persona Upgrade: Singularity]
**Learning:** "Please write storybook files... Try your best." is a weak, generic prompt resulting in hallucinations and out-of-scope files.
**Action:** Replaced with strict negative constraints ("CRITICAL: Do not write stories for internal utils/"), explicit goal definition ("Generate a Storybook file matching the exact prop interface"), and strong persona injection.
