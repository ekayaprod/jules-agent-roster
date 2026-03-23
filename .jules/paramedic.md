## 2024-03-07 - 🚨 Paramedic - [Clusterize Visibility Bug in AgentPicker]
**Learning:** Clusterize.js relies on reading the container's scroll height and dimensions to render virtual rows. If its parent container (like a `<dialog>` modal) is hidden and then re-shown, Clusterize does not automatically re-render its items, resulting in a blank list for the user.
**Action:** Always call `instance.refresh(true)` on Clusterize instances when they undergo a state transition from hidden to visible within UI elements.

## 2024-03-11 - 🚨 Paramedic - [Nested Category Config Triage]
**Learning:** When loading custom agent data mapped by nested category arrays (like `custom_agents.json`), assuming a flat key-value object structure for iterative logic causes parsing failures during fusion graph synthesis.
**Action:** Iteration logic for configurations must correctly differentiate between flat arrays and nested categorization wrappers to ensure deeply structured items are properly extracted and flattened before key normalization.

## 2024-05-20 - 🚨 Paramedic - [Boot Race Condition Cure in AgentRepository]
**Learning:** Computing relational attributes (like Rarity Tier) during concurrent network fetches (`Promise.all`) creates a fatal race condition if the computation depends on sibling data streams (like `this.agents`) that haven't fully resolved.
**Action:** Extract all relational attribute computations out of concurrent fetch loops and inject them into a synchronous post-processing phase that explicitly executes only after all dependent data arrays are fully initialized.

2024-05-24
**Title**: [Uninitialized State Triage in FusionIndex Render Pass]
**Learning**: Directly passing an uninitialized or asynchronously loaded state parameter (e.g., `this.customAgents`) to an iterator pattern like `Object.values()` without guarding causes an immediate `TypeError` that will abort the entire rendering pipeline.
**Action**: Explicitly verify environment contexts (`typeof document === 'undefined'`) and inject fallback assignments (`this.customAgents || {}`) before passing objects down the execution chain during component initialization.
2024-05-25
**Title**: [Dynamic Parsing Hazard in JulesAPI Polling]
**Learning**: In modern asynchronous Javascript network requests using `AbortController`, referencing an out-of-scope `timeoutId` inside a `catch` block (e.g. `clearTimeout(timeoutId)`) throws an immediate `ReferenceError`. This overrides the network error being handled and bypasses intended safe-fallback array returns `[]`, triggering fatal `TypeError` crashes in downstream UI boot sequences.
**Action**: Clean up dangling identifiers like `clearTimeout(timeoutId)` from `catch` blocks when transitioning from `setTimeout`-based timeouts to modern `AbortController` request signals.

2026-03-13
**Title**: [Event Delegation Race Condition Triage in UI Rendering]
**Learning**: Broad event delegation patterns (like capturing clicks on `.flip-card`) can swallow interactions intended for nested interactive elements (like a splay menu). Clicking the nested element correctly triggers its local logic but simultaneously triggers the broader parent event, leading to conflicting visual states.
**Action**: Implement explicit structural exclusion guards (e.g., `!e.target.closest('[data-action="toggle-splay"]')`) within broad parent delegation handlers to ensure mutually exclusive interaction zones for complex nested components.
