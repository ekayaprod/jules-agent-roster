# Inspector — Boundary Interrogator

**Learning:** Legacy UI logic blocks, unhandled async parallel boundary rejections (`Promise.all`), and vanilla JS optimistic UI patterns bound to DOM element presence are historically undertested. These represent fragile fault lines vulnerable to silent regressions when elements are dynamically modified, user inputs are invalid, or network requests fail open.
**Action:** Implemented rigorous negative assertions, event simulations, mocked network rejections, and mocked runtime element destruction to map and secure execution path boundaries.

## Inspector — Boundary Interrogator

**Learning**: The `custom_agents.json` structure was flattened, but `AgentRepository` still parses it using nested domain header iteration, causing valid custom agents to be discarded.
**Action**: [Interrogate] Added definitive structural test to expose the boundary mismatch. Fix skipped to enforce sandbox isolation constraints.

## Inspector — Boundary Interrogator

**Learning**: The central categorization mapping for fusion domains (`getFusionDomain`) lacked complete branch coverage (44.45% uncovered lines). Unverified domains are a hazard for UI rendering of core mechanics like "Micro/Macro Paradox".
**Action**: [Investigate] Assured 100% path coverage by writing a complete suite encompassing boundary nulls, identical name collisions (Glitches), Scavenger checks (Paradoxes), and all possible matrix combinations of Plus agents and Super Domains.

## Inspector — Boundary Interrogator

**Learning**: Missing fallback checks when dealing with dynamically resolved properties (like `childAgent` in `AgentCard.js`) created execution gaps in UI component render paths, especially when external configuration maps (`customAgentsMap`) are empty or structurally incomplete.
**Action**: [Investigate] Expanded test suite for `AgentCard` to assert strict boundary conditions where `childKeys` evaluates empty, and where dependent `childAgent` lookups return `falsy`. Achieved ~100% path coverage for `AgentCard.js`.

## Inspector — Boundary Interrogator

**Learning:** State controllers heavily dependent on async external environments (like Web Workers for off-main-thread fuzzy matching) are vulnerable to race conditions (e.g. stale searches returning after new requests) and silent fallback execution gaps if the native worker environment fails to initialize.
**Action:** [Interrogate] Mocked global browser APIs (Worker, DOM) to prove asynchronous rejection mapping, enforce deterministic background thread message resolution, and verified silent functional fallbacks when Web Workers are unavailable in legacy browsers.

## Inspector — Boundary Interrogator

**Learning:** Utilities operating purely on mocked DOM and external Web APIs (like `URL.createObjectURL`) must evaluate source code into the global context (e.g., using `new Function()`) and declare `@jest-environment jsdom` specifically to simulate the browser environment during unit testing in non-module setups.
**Action:** [Interrogate] Generated full boundary test suite for `DownloadUtils` by injecting mocked Blob handling APIs and evaluating standard anchor tag click-events to verify execution path limits without requiring network dependencies.
