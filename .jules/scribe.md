# Scribe's Journal

## 2026-02-23 - The Fusion DAG
**Learning:** The `FusionCompiler.js` relies on a strict Directed Acyclic Graph (DAG) defined in `EXECUTION_PIPELINE` to order agents during fusion. This is not just a list; it enforces the logical flow of operations (e.g., `Architect` before `Builder`).
**Action:** Always verify the pipeline order when adding new agents to ensure they don't break the logical dependency chain.
