
## 2026-03-12 - 🩻 Coroner - [Excised: Dead Barrel Re-Exports]
**Learning:** Found unused barrel `index.js` files across the codebase that only served to re-export modules without providing any abstraction, acting as artificial dead weight. These were kept alive solely by internal test files importing from them rather than the direct source modules.
**Action:** When acting as Coroner, trace internal test imports referencing barrel files, sever the references by pointing tests directly to the module implementations, and safely delete the unreferenced barrel files to achieve a mathematically proven zero-reference state.
