## 2024-03-07 - 🚨 Paramedic - [Clusterize Visibility Bug in AgentPicker]
**Learning:** Clusterize.js relies on reading the container's scroll height and dimensions to render virtual rows. If its parent container (like a `<dialog>` modal) is hidden and then re-shown, Clusterize does not automatically re-render its items, resulting in a blank list for the user.
**Action:** Always call `instance.refresh(true)` on Clusterize instances when they undergo a state transition from hidden to visible within UI elements.

## 2024-03-11 - 🚨 Paramedic - [Nested Category Config Triage]
**Learning:** When loading custom agent data mapped by nested category arrays (like `custom_agents.json`), assuming a flat key-value object structure for iterative logic causes parsing failures during fusion graph synthesis.
**Action:** Iteration logic for configurations must correctly differentiate between flat arrays and nested categorization wrappers to ensure deeply structured items are properly extracted and flattened before key normalization.

## 2024-05-20 - 🚨 Paramedic - [Boot Race Condition Cure in AgentRepository]
**Learning:** Computing relational attributes (like Rarity Tier) during concurrent network fetches (`Promise.all`) creates a fatal race condition if the computation depends on sibling data streams (like `this.agents`) that haven't fully resolved.
**Action:** Extract all relational attribute computations out of concurrent fetch loops and inject them into a synchronous post-processing phase that explicitly executes only after all dependent data arrays are fully initialized.