## 2024-05-24 - 🧶 Untangler - [Flattened Logic in JulesManager Rendering Loop]
**Learning:** Dense UI rendering logic and state comparisons embedded inside long polling loops lead to severe cognitive overhead and makes conditional rendering of UI actions (like dismissal features) nearly impossible to maintain.
**Action:** Extract rendering and state updates into distinct, strictly typed `_processSession` methods that enforce early returns on known/ignored states before allocating or modifying UI containers.
## 2025-03-07 - 🧶 Untangler - [Flattened Logic in JulesManager.js]
**Learning:** Dense `else if` chains within loops and state evaluation blocks obscure intent and increase cognitive complexity in frontend polling logic.
**Action:** Extract the body of loops into parameter-driven local helper functions, replacing nested conditionals with top-level guard clauses to improve code clarity and maintainability.
## $(date +%Y-%m-%d) - 🧶 Untangler - [Flattened Logic in RosterApp.js and MarkdownRenderer.js]
**Learning:** In a vanilla JS event delegation pattern (like `handleGlobalClick`), using early returns for matched actions cleanly flattens the long sequence of `else if` checks. In `.forEach` loops mapping to `Array.prototype`, `return` behaves identically to `continue` in a standard `for` loop, safely allowing guard clauses.
**Action:** When identifying nested `if` chains inside `forEach` or `map`, aggressively use `return` guard clauses to prune the scope before actual business logic is applied. Ensure `else if` chains evaluating distinct string prefixes (`startsWith`) are broken out into individual `if` blocks with immediate `return`s.
