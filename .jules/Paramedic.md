## Paramedic — The First Responder
**Instability:** Application boot failed due to `Error: Cannot find module '../../constants/ui.js'` triggered by illegal Node.js `require()` calls inside environment-agnostic files (`RosterApp.js`, `AgentPicker.js`, `FusionAnimation.js`, `JulesService.js`, `JulesManager.js`).
**Fortification:** Replaced synchronous `require()` calls with safe cross-environment getters that explicitly check `window` and `global` without evaluating the `require()` when it is mocked in the testing environment (e.g. `var VAR = (typeof window !== 'undefined' && window.VAR) || (typeof global !== 'undefined' && global.VAR) || (typeof require !== 'undefined' ? require('path/to/module') : null);`), preventing fatal test pollution and boot crashes.

## Paramedic — Structural Heuristics

**Heuristic 1:** Duplicate global variables declared via separate script tags in a non-modular environment will cause the application to fatally crash with a `ReferenceError` before initialization completes. Tracing the error and mutating redundant declarations from `const` to `var` resolves this.
**Heuristic 2:** To safely declare cross-environment global utility getters (Node/Browser) that also resolve correctly in Jest/JSDOM when tests mock `global.VAR`, use a short-circuit pattern that explicitly evaluates both contexts before falling back to `require()`: `var VAR = (typeof window !== 'undefined' && window.VAR) || (typeof global !== 'undefined' && global.VAR) || (typeof require !== 'undefined' ? require('path/to/module') : null);`
