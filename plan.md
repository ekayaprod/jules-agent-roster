1. **Fix Panel Visibility Issue**
   - In `index.html`, change the CSS class `.jules-runner-panel` from `overflow: hidden;` to `overflow: visible;`. The hidden overflow is currently hiding `.jules-pull-tab` (which sits outside the right boundary).

2. **Fix Settings Button and Initialization**
   - The settings modal initialization logic is contained within `JulesManager.init()`. However, `RosterApp.js` currently defers calling `JulesManager.init()` until the `julesActivateToggle` switch is turned on.
   - We will modify `RosterApp.js` to unconditionally call `this.julesManager.init()` during the bootstrapping process in `RosterApp.init()` (e.g. inside the `try` block, alongside `FusionLab.init()`).
   - We will adjust the `julesActivateToggle` event listener to not call `init()` again, but instead to just conditionally toggle the UI and maybe `loadSources()`. Wait, actually, if `init()` initializes modal handlers, it's safer to let `init()` run on app start, but change `init()` in `JulesManager.js` so it binds the settings button event listeners without waiting for the terminal activate toggle.

3. **Complete pre commit steps to ensure proper testing, verification, review, and reflection are done.**
4. **Submit changes.**
