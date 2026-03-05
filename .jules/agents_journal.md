## 2026-03-03 - 🪄 Illusionist - [Perceived Performance: Agent Cards]
**Learning:** Loading skeletons serve no purpose if they are injected *after* the blocking asynchronous operations they are meant to mask. In `RosterApp.js`, `renderSkeletons()` was called after `await this.agentRepo.fetchAgents()`, resulting in users seeing a blank screen during the fetch rather than the skeleton UI.
**Action:** Move the `renderSkeletons()` execution block to occur synchronously *before* the `try/catch` block containing the primary data fetch promises, guaranteeing the UI is painted before the JavaScript engine yields to the network request.

## 2026-03-03 - 🪄 Illusionist - [Perceived Performance: AgentPicker & Animation]
**Learning:** Rendering massive DOM lists synchronously freezes the main thread. Implementing asynchronous chunking (using `requestAnimationFrame`) fixes this, but requires careful active loop tracking to prevent race conditions.
**Action:** Offload large list DOM generation to asynchronous chunks and mask latency with CSS skeletons.

## 2026-03-04 - 🎧 Vibe - [Feature Materialized: Recently Used Feature]
**Learning:** When generating standalone logic managers in this specific project's architecture (like a new `RecentlyUsedManager.js`), they must be manually injected as script tags into the core HTML layout, and also dynamically imported into `benchmark.js` (using `loadClass`) and bound to the `global` object. Failing to do so causes ReferenceErrors during `npm run test` because standard module loaders or bundlers are intentionally absent.
**Action:** When writing standalone script classes, always add a script tag into `index.html` before the application script (`RosterApp.js`), and strictly update `benchmark.js` to `loadClass` and bind the class globally.

## 2024-05-24 - 🪧 Wayfinder - [Navigation Context Enhanced: AgentPicker Modal]
**Learning:** The Agent Picker modal `<dialog>` creates an "invisible" dead end by overlaying the UI without modifying the browser's history state, causing the native back button to bypass the modal and unintentionally navigate the user away from the app.
**Action:** Injected a `history.pushState` operation when opening the modal, and added a global `popstate` event listener to intercept the browser's back button and safely close the modal without losing the underlying application state.

## 2024-05-24 - 🦉 Scholar - [Macro/Micro Documentation Synthesized: FavoritesManager]
**Learning:** The persistence module `FavoritesManager` lacked context on its architectural role and how its local storage usage works.
**Action:** Synthesized a high-level `README.md` defining its singleton-like pattern and its usage of `StorageUtils` for `localStorage`, and added granular, strictly typed JSDoc comments to `FavoritesManager.js` using `@see` to link directly back to the `README.md` architecture and quick-start sections.

## 2026-03-05 - 📰 Publisher - [Responsive Layout Enforced: Raw CSS Media Queries]
**Learning:** The project relies on raw vanilla CSS without standard utility frameworks, meaning responsive standard breakpoints (like `sm:` or `md:`) must be manually defined via `@media (min-width: 640px)` to transition from fluid mobile constraints (`100%` width) to fixed dimensions on larger screens, rather than injecting utility classes.
**Action:** Always manually define and enforce `min-width` media queries in the CSS files (e.g., `fusion.css` and inline styles) instead of attempting to use Tailwind-like prefixes when working in vanilla CSS environments.

## 2024-05-24 - 🧑‍🎨 Muse - [Contextual FTUE: Agent Picker Modal]
**Learning:** When injecting an empty state into a picker modal, it's not enough to simply state "No results." A blank screen is a canvas. It needs to include an inspiring icon, empathetic copy, and an actionable Call-To-Action (like a clear search button) to prevent user dead ends and inspire exploration.
**Action:** Always ensure that Empty State components mimic the structural dimensions of the layout they replace and contain a clear, actionable CTA to guide the user to the next step.
