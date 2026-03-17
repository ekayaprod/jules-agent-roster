## 2024-05-24 - 🕵️ Inspector - Boundary Coverage Synthesized
**Learning:** Legacy UI logic blocks, unhandled async parallel boundary rejections (`Promise.all`), and vanilla JS optimistic UI patterns bound to DOM element presence are historically undertested. These represent fragile fault lines vulnerable to silent regressions when elements are dynamically modified, user inputs are invalid, or network requests fail open.
**Action:** Implemented rigorous negative assertions, event simulations, mocked network rejections, and mocked runtime element destruction to map and secure execution path boundaries.

## 2024-03-14 - 🕵️ Inspector - [Flat `custom_agents.json` Structural Mismatch]
**Learning**: The `custom_agents.json` structure was flattened, but `AgentRepository` still parses it using nested domain header iteration, causing valid custom agents to be discarded.
**Action**: [Interrogate] Added definitive structural test to expose the boundary mismatch. Fix skipped to enforce sandbox isolation constraints.

## 2025-03-14 - 🕵️ Inspector - Boundary Coverage for RarityEngine `getFusionDomain`
**Learning**: The central categorization mapping for fusion domains (`getFusionDomain`) lacked complete branch coverage (44.45% uncovered lines). Unverified domains are a hazard for UI rendering of core mechanics like "Micro/Macro Paradox".
**Action**: [Investigate] Assured 100% path coverage by writing a complete suite encompassing boundary nulls, identical name collisions (Glitches), Scavenger checks (Paradoxes), and all possible matrix combinations of Plus agents and Super Domains.

## 2025-05-18 - 🕵️ Inspector - Boundary Coverage for AgentCard Splay Logic
**Learning**: Missing fallback checks when dealing with dynamically resolved properties (like `childAgent` in `AgentCard.js`) created execution gaps in UI component render paths, especially when external configuration maps (`customAgentsMap`) are empty or structurally incomplete.
**Action**: [Investigate] Expanded test suite for `AgentCard` to assert strict boundary conditions where `childKeys` evaluates empty, and where dependent `childAgent` lookups return `falsy`. Achieved ~100% path coverage for `AgentCard.js`.
