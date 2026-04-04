## Vector — The Single-Pass Pipeline Optimization
**Learning:** Flattening multi-pass array iterations (`.filter().reverse().slice()`) into a single bare-metal backward loop with early exit mechanisms eliminates unnecessary intermediate memory allocations and loop overhead in high-throughput data processing paths.
**Action:** Always scrutinize chained Array prototype methods on high-value data paths. Replace winding logic with a simple, direct `for` loop that implements filtering and data limitations concurrently.

## Information Architect — The Layout Narrator
**Learning:** Identified that generic `div` soup in the layout reduces hierarchical semantic meaning, especially in nested structural blocks like modals.
**Action:** Replaced the generic `<div id="julesPRModal">` container and its nested `.modal-content` wrapper with semantic `<section>` and `<article>` tags respectively to improve document outline and screen reader accessibility within the isolated modal layout.

## Coroner — The Dead Investigator
**Learning:** A legacy class `fusion-slot` used in older layouts was lingering in tests (`benchmark.js`) and CSS (`Fusion.css`), acting as a ghost constraint after the source changed to `fusion-item`.
**Action:** Always unify class names between source code, tests, and style sheets during architectural refactors to prevent dead selectors from causing test or build failures.
