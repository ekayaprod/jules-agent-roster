## Bolt+ — O(n²) Array Eradication & Waterfall Collapse
**Bottleneck:** Nested O(n²) array search in Agent validation and sequential blocking I/O on primary application boot sequence waiting for Github.
**Optimization:** Replaced validCategories linear `.includes()` array search with an O(1) Set dictionary lookup. Unblocked RosterApp boot thread by rewriting the blocking `await this.loadSources()` network initialization into a parallel, background fire-and-forget promise.
## Bolt+ — The Buffer Allocation
**Bottleneck:** String concatenation in a tight loop generating transient string allocations inside `js/UI/JulesTerminal/TerminalPolling.js` where fullHistoryMarkdown was being built repetitively using `+=`.
**Optimization:** Replaced repetitive string concatenations with an allocated buffer stream using `const historyBuffer = []; historyBuffer.push(...)` and subsequently `historyBuffer.join('')`. Prevents transient garbage collection sweeps and scales well with large activity payloads.
