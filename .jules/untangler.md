## 2024-05-24 - 🧶 Untangler - [Flattened Logic in JulesManager Rendering Loop]
**Learning:** Dense UI rendering logic and state comparisons embedded inside long polling loops lead to severe cognitive overhead and makes conditional rendering of UI actions (like dismissal features) nearly impossible to maintain.
**Action:** Extract rendering and state updates into distinct, strictly typed `_processSession` methods that enforce early returns on known/ignored states before allocating or modifying UI containers.
