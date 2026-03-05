# Scribe's Journal

## 2026-02-23 - The Fusion DAG
**Learning:** The `FusionCompiler.js` relies on a strict Directed Acyclic Graph (DAG) defined in `EXECUTION_PIPELINE` to order agents during fusion. This is not just a list; it enforces the logical flow of operations (e.g., `Architect` before `Builder`).
**Action:** Always verify the pipeline order when adding new agents to ensure they don't break the logical dependency chain.

## 2026-03-05 - ✍️ Scribe - [Documented Logic: AgentRepository XSS Pattern]
**Learning:** The `maliciousPattern` regex in `js/services/AgentRepository.js` acts as a final boundary against DOM-based XSS by detecting potentially executable HTML tags, inline event handlers, and malicious URI schemes before JSON data is parsed.
**Action:** Always add inline breakdowns and explicit `// WARN:` labels to massive regex strings to protect future developers from bypassing security boundaries.
