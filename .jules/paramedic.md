## 2026-03-06 - 🚨 Paramedic - [Unnecessary CSS Escaping on document.getElementById]
**Learning:** When generating unique dynamic IDs for DOM elements that could contain numbers (like index `0`), applying `CSS.escape()` to the index produces an invalid literal string for `document.getElementById` (e.g., `\\30 `).
**Action:** Only use `CSS.escape()` when constructing CSS selectors for query APIs like `querySelector`. Pass literal, unescaped string IDs directly to `document.getElementById`.

## 2024-03-07 - 🚨 Paramedic - [Clusterize Visibility Bug in AgentPicker]
**Learning:** Clusterize.js relies on reading the container's scroll height and dimensions to render virtual rows. If its parent container (like a `<dialog>` modal) is hidden and then re-shown, Clusterize does not automatically re-render its items, resulting in a blank list for the user.
**Action:** Always call `instance.refresh(true)` on Clusterize instances when they undergo a state transition from hidden to visible within UI elements.

## 2024-03-11 - 🚨 Paramedic - [Nested Category Config Triage]
**Learning:** When loading custom agent data mapped by nested category arrays (like `custom_agents.json`), assuming a flat key-value object structure for iterative logic causes parsing failures during fusion graph synthesis.
**Action:** Iteration logic for configurations must correctly differentiate between flat arrays and nested categorization wrappers to ensure deeply structured items are properly extracted and flattened before key normalization.