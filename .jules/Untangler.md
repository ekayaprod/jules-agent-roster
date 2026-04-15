# 🧶 Untangler - Persistent Journal

**Axioms of Structural Simplification:**
* **The Inverted Validation Guard**: Always exit early on falsy dependencies or invalid conditions to prevent wrapping happy paths in deep condition blocks.
* **Flattened Iteration Contexts**: Do not wrap logic blocks inside `if` statements inside `for` loops. Reverse the condition and `continue` or `return` early.

## Untangler — Arrow Code Eradicated in EventBinder
**Target Lock:** `js/core/events/EventBinder.js`
**Learning:** Dense click-delegation architectures natively invite deeply nested arrow code. Extracting conditions into inverse return/continue clauses keeps the file vertically readable.
**Action:** Unknotted massive `fusionsTarget` (2.5 Open Fusions Modal) block, `frontTarget` (4. Flip Card Front), `mouseover` listener, `keydown` Escape handler, and `change` handler in `EventBinder.js` by reversing conditions into flat guard clauses. Reduced 14 levels of cyclomatic nesting to 3 levels in peak complexity functions.
