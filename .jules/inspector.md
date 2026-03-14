## 2024-05-24 - 🕵️ Inspector - Boundary Coverage Synthesized
**Learning:** Legacy UI logic blocks, unhandled async parallel boundary rejections (`Promise.all`), and vanilla JS optimistic UI patterns bound to DOM element presence are historically undertested. These represent fragile fault lines vulnerable to silent regressions when elements are dynamically modified, user inputs are invalid, or network requests fail open.
**Action:** Implemented rigorous negative assertions, event simulations, mocked network rejections, and mocked runtime element destruction to map and secure execution path boundaries.

2024-03-14
**Title**: [Flat `custom_agents.json` Structural Mismatch]
**Learning**: The `custom_agents.json` structure was flattened, but `AgentRepository` still parses it using nested domain header iteration, causing valid custom agents to be discarded.
**Action**: [Interrogate] Added definitive structural test to expose the boundary mismatch. Fix skipped to enforce sandbox isolation constraints.
