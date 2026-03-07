## 2024-05-24 - 🧶 Untangler - [Flattened Logic in JulesManager Rendering Loop]
**Learning:** Dense UI rendering logic and state comparisons embedded inside long polling loops lead to severe cognitive overhead and makes conditional rendering of UI actions (like dismissal features) nearly impossible to maintain.
**Action:** Extract rendering and state updates into distinct, strictly typed `_processSession` methods that enforce early returns on known/ignored states before allocating or modifying UI containers.
## 2025-03-07 - 🧶 Untangler - [Flattened Logic in JulesManager.js]
**Learning:** Dense `else if` chains within loops and state evaluation blocks obscure intent and increase cognitive complexity in frontend polling logic.
**Action:** Extract the body of loops into parameter-driven local helper functions, replacing nested conditionals with top-level guard clauses to improve code clarity and maintainability.
