## 2024-05-24 - 🕵️ Inspector - Added Boundary Coverage for JulesManager Modal UI
**Learning:** Legacy UI logic blocks (like modal initialization and state transitions) are often left completely untested during rapid iteration, leading to silent regressions when elements are missing from the DOM or user inputs are invalid.
**Action:** Implemented rigorous UI boundary tests asserting input bounds, keydown events, empty input behavior, and mocked network failure states without modifying business code.
2025-02-12
**Title**: Concurrency Stress & Unhandled Promise.all Rejections
**Learning**: Un-awaited `Promise.all` blocks inside fire-and-forget event listeners represent fragile fault lines because any single unhandled rejection crashes the execution context natively. However, parallel processes inside the block execute simultaneously, meaning some promises resolve while others fail open.
**Action**: Interrogated the parallel boundary using `jest.spyOn(Promise, 'all')` combined with a `try/finally` interceptor to prove the unhandled rejection occurs while asserting that the independent concurrent execution path still completes successfully.
2024-05-25
**Title**: Added Boundary Coverage for `Promise.all` Repo Change Event in JulesManager
**Learning**: Dynamically bound async event listeners (like native HTML `change` events triggering `Promise.all` logic) often escape test coverage due to implicit microtask queueing required in Jest. Explicitly simulating dispatch events and awaiting `Promise.resolve()` uncovers these blind spots.
**Action**: Simulated event dispatches using `new Event('change')` and explicitly awaited microtasks using consecutive `Promise.resolve()` calls to strictly enforce coverage of asynchronous boundary execution paths in vanilla JS.
2025-03-09
**Title**: Boundary Assault on JulesManager Async Optimistic UI
**Learning**: Optimistic UI rollback mechanisms strictly tied to DOM element presence (`innerHTML`, `className`) are highly susceptible to silent crash cascades if standard elements are dynamically removed or fail to mount.
**Action**: Simulated runtime destruction of critical DOM elements (`statusSpan`, `fetchingIndicator`) and structurally mocked API rejections to interrogate and enforce safe fallback behavior across async network boundaries.
2026-03-14
**Title**: Boundary Assault on Flat vs Nested JSON Structures
**Learning**: Hardcoding parsing logic to expect a specific level of dictionary nesting (like `{ "Category": { "AgentKey": {} } }`) creates a brittle execution boundary. When data configuration files are optimized and flattened to remove unnecessary domain headers, the parsing layer inherently fails silently because it interprets the flat keys as categories rather than data entries.
**Action**: Interrogated the JSON parsing boundary with a strictly mocked flat `custom_agents.json` response to definitively prove that `AgentRepository` silently fails to map flat agent structures into its internal state, leaving an accurately failing test as documentation of this structural fault line.
## 2024-05-24 - 🕵️ Inspector - Boundary Coverage Synthesized
**Learning:** Legacy UI logic blocks, unhandled async parallel boundary rejections (`Promise.all`), and vanilla JS optimistic UI patterns bound to DOM element presence are historically undertested. These represent fragile fault lines vulnerable to silent regressions when elements are dynamically modified, user inputs are invalid, or network requests fail open.
**Action:** Implemented rigorous negative assertions, event simulations, mocked network rejections, and mocked runtime element destruction to map and secure execution path boundaries.

2024-03-14
**Title**: [Flat `custom_agents.json` Structural Mismatch]
**Learning**: The `custom_agents.json` structure was flattened, but `AgentRepository` still parses it using nested domain header iteration, causing valid custom agents to be discarded.
**Action**: [Interrogate] Added definitive structural test to expose the boundary mismatch. Fix skipped to enforce sandbox isolation constraints.
2025-03-14
**Title**: Boundary Coverage for RarityEngine `getFusionDomain`
**Learning**: The central categorization mapping for fusion domains (`getFusionDomain`) lacked complete branch coverage (44.45% uncovered lines). Unverified domains are a hazard for UI rendering of core mechanics like "Micro/Macro Paradox".
**Action**: [Investigate] Assured 100% path coverage by writing a complete suite encompassing boundary nulls, identical name collisions (Glitches), Scavenger checks (Paradoxes), and all possible matrix combinations of Plus agents and Super Domains.
