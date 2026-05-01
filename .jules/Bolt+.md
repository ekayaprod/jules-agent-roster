## Bolt+ — O(n) Allocation Eradication
**Bottleneck:** Object.entries().forEach() created redundant arrays and closures inside the custom agent loop in AgentRepository.js.
**Optimization:** Refactored the array mapping iteration into a native for...in loop with Object.prototype.hasOwnProperty.call() to prevent transient closure allocations and array object creation.
## Bolt+ — The Waterfall Collapse
**Bottleneck:** Synchronous remote prompt resolution blocked the primary application thread during session launch in `JulesTerminal.js` and `JulesManager.js`.
**Optimization:** Shifted the synchronous prompt fetch into the background execution queue (`this.sessionQueue.push`), unblocking the primary thread and immediately rendering the optimistic UI block.
## Bolt+ — The Waterfall Collapse
**Bottleneck:** Exporting agents caused waterfall delays by sequentially fetching agent prompts and then performing clipboard operations.
**Optimization:** Replaced the sequential \`await\` of \`_fetchMissingPrompts\` or \`_resolveAgentPrompt\` and \`ClipboardUtils\` with a unified Promise execution block, collapsing the waterfall latency.
