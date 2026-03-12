# Scribe's Journal

## 2026-02-23 - The Fusion DAG
**Learning:** The `FusionCompiler.js` relies on a strict Directed Acyclic Graph (DAG) defined in `EXECUTION_PIPELINE` to order agents during fusion. This is not just a list; it enforces the logical flow of operations (e.g., `Architect` before `Builder`).
**Action:** Always verify the pipeline order when adding new agents to ensure they don't break the logical dependency chain.

## 2026-03-05 - ✍️ Scribe - [Documented Logic: AgentRepository XSS Pattern]
**Learning:** The `maliciousPattern` regex in `js/services/AgentRepository.js` acts as a final boundary against DOM-based XSS by detecting potentially executable HTML tags, inline event handlers, and malicious URI schemes before JSON data is parsed.
**Action:** Always add inline breakdowns and explicit `// WARN:` labels to massive regex strings to protect future developers from bypassing security boundaries.
## 2026-03-12 - ✍️ Scribe - [Documented Logic: FusionAnimation]
**Learning:** The undocumented Google Emoji Kitchen API uses the hardcoded `v=20231116` dataset snapshot parameter and strictly enforces alphabetical ordering for unicode point routing, requiring explicit `u1_u2` and `u2_u1` URL permutation fallbacks to prevent silent 404 failures.
**Action:** Document hardcoded magic dates and implicit URL path dependency fallbacks using inline `// ✍️ ILLUMINATE:` blocks to protect execution constraints.
