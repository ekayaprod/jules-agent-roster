## Paramedic — The First Responder
**Instability:** Application boot failed due to `Error: Cannot find module '../../constants/ui.js'` triggered by illegal Node.js `require()` calls inside environment-agnostic files (`RosterApp.js`, `AgentPicker.js`, `FusionAnimation.js`).
**Fortification:** Replaced synchronous `require()` calls with safe cross-environment getters (`typeof window !== 'undefined' ? window.VAR : global.VAR`) and updated `js/constants/ui.js` to use `var` declarations, ensuring global scope binding in browser contexts.
