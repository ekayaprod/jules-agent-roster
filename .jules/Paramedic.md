## Paramedic — The First Responder
**Instability:** Application boot failed due to `Error: Cannot find module '../../constants/ui.js'` triggered by illegal Node.js `require()` calls inside environment-agnostic files (`RosterApp.js`, `AgentPicker.js`, `FusionAnimation.js`).
**Fortification:** Replaced synchronous `require()` calls with safe cross-environment getters (`typeof window !== 'undefined' ? window.VAR : global.VAR`) and updated `js/constants/ui.js` to use `var` declarations, ensuring global scope binding in browser contexts.

**Instability:** The application was freezing on the initial loading screen when launched in the browser. Traced the root cause to a global variable redeclaration crash (`Identifier 'SafeUITimings' has already been declared`). The `const SafeUITimings` was defined in both `RosterApp.js` and `AgentPicker.js`, which share the global scope in the browser.
**Fortification:** Mutated `const SafeUITimings` to `var SafeUITimings` across all files sharing the global scope to prevent catastrophic `SyntaxError: Identifier has already been declared` exceptions on boot.

**Instability:** The application was freezing on the initial loading screen when launched in the browser. Traced the root cause to a global variable redeclaration crash (`Identifier 'SafeUITimings' has already been declared`). The `const SafeUITimings` was defined in multiple component scripts which shared the global scope in the browser.
**Fortification:** Mutated `const SafeUITimings` to `var SafeUITimings` across all files sharing the global scope to prevent catastrophic `SyntaxError: Identifier has already been declared` exceptions on boot.
## Paramedic — Structural Heuristics

**Heuristic 1:** Duplicate global variables declared via separate script tags in a non-modular environment will cause the application to fatally crash with a `ReferenceError` before initialization completes, leaving the user trapped on the loading screen.
**Heuristic 2:** To cure this, trace the error using live native execution, locate the duplicate variable across the `.js` files, and eliminate the redundant declaration.
