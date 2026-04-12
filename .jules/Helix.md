## Helix — The Global GitHub Path Centralization
**Learning:** Abstracting structurally identical inline HTML literals (e.g. `[SYS] Awaiting repository connection...`) into centralized parameterized UI helpers prevents systemic style drift and UI inconsistencies across varying component states.
**Action:** Extract identically repeated structural UI wrappers into reusable utility methods parameterizing purely for dynamic data injection to enforce DRYness and structural cohesion.

**Learning:** Splicing repeated ternary statements defining prompt fetch URLs into a single parameterized `getPromptUrl` utility function prevents drift and reduces repetitive inline conditional logic.
**Action:** Abstracted identically duplicated `agent.promptFile || (agent.isCustom ? ...)` logic blocks into `AgentUtils.getPromptUrl(agent)`.
