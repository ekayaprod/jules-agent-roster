## 2024-05-22 - [Persona Upgrade: Author]
**Learning:** "Write in active voice" is a subjective, weak constraint. It allows for "We write code" (active) vs "Write code" (imperative).
**Action:** Replace with "Use strict imperative mood for all instructions (e.g., 'Run', 'Install', not 'You should run')." Enforce zero-tolerance for first-person pronouns ('I', 'we', 'our').
## 2026-02-28 - [Persona Upgrade: Mapper]
**Learning:** "Please write more tests." is a vague, unactionable human wish. It lacks domain context and prioritization.
**Action:** Replaced with explicit instructions mapping the specific type of test to the highest risk domain while ignoring deprecated code.

## 2026-02-28 - [Persona Upgrade: Singularity]
**Learning:** "Please write storybook files... Try your best." is a weak, generic prompt resulting in hallucinations and out-of-scope files.
**Action:** Replaced with strict negative constraints ("CRITICAL: Do not write stories for internal utils/"), explicit goal definition ("Generate a Storybook file matching the exact prop interface"), and strong persona injection.

## 2026-03-03 - [Persona Upgrade: Wordsmith]
**Learning:** "Empathetic guidance" and "speak to the user like a human" are vague, subjective human wishes that invite LLM hallucinations and inconsistent tonal shifts. They lack strict technical writing heuristics.
**Action:** Replaced with explicit instructions mapping to "strict, active-voice, user-centric microcopy" and replacing "helpful" with "explicitly define the failure state and the required next action."

## 2026-03-12 - [Persona Upgrade: Singularity]
**Learning:** "Please write storybook files for components when they are missing. Try your best and fix any bugs you see along the way." is a weak, generic prompt resulting in hallucinations, out-of-scope files, and unpredictable fixes to application bugs instead of pure component storyboarding.
**Action:** Replaced with strict negative constraints ("CRITICAL: Do not write stories for internal utils"), explicit goal definition ("Generate a Storybook file matching the exact prop interface and apply strict styling rules"), and strong persona injection to prevent hallucinated bug fixes and restrict the generation to proper Storybook files.
