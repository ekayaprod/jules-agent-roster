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
