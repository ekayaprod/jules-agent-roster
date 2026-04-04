## Coroner — The Dead Investigator
**Learning:** An unused `index.js` barrel file in `js/Features/Jules/JulesManager/` was artificially kept alive by its own test imports, despite `core/RosterApp.js` relying on standard `script` inclusion rather than CommonJS exports for domain bootstrapping.
**Action:** Scrutinize barrel files that exist solely to proxy test file `require()` imports; delete the dead barrel files and route test dependencies directly to the underlying source modules.

## Vector — The Single-Pass Pipeline Optimization
**Learning:** Flattening multi-pass array iterations (`.filter().reverse().slice()`) into a single bare-metal backward loop with early exit mechanisms eliminates unnecessary intermediate memory allocations and loop overhead in high-throughput data processing paths.
**Action:** Always scrutinize chained Array prototype methods on high-value data paths. Replace winding logic with a simple, direct `for` loop that implements filtering and data limitations concurrently.

## Information Architect — The Layout Narrator
**Learning:** Identified that generic `div` soup in the layout reduces hierarchical semantic meaning, especially in nested structural blocks like modals.
**Action:** Replaced the generic `<div id="julesPRModal">` container and its nested `.modal-content` wrapper with semantic `<section>` and `<article>` tags respectively to improve document outline and screen reader accessibility within the isolated modal layout.
