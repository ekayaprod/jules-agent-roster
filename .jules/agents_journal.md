# Agents Journal

## 2026-03-03 - 🪄 Illusionist - [Perceived Performance: Agent Cards]

**Learning:** Loading skeletons serve no purpose if they are injected *after* the blocking asynchronous operations they are meant to mask. In `RosterApp.js`, `renderSkeletons()` was called after `await this.agentRepo.fetchAgents()`, resulting in users seeing a blank screen during the fetch rather than the skeleton UI.
**Action:** Move the `renderSkeletons()` execution block to occur synchronously *before* the `try/catch` block containing the primary data fetch promises, guaranteeing the UI is painted before the JavaScript engine yields to the network request.

## 2026-03-03 - 🪄 Illusionist - [Perceived Performance: AgentPicker & Animation]

**Learning:** Rendering massive DOM lists synchronously freezes the main thread. Implementing asynchronous chunking (using `requestAnimationFrame`) fixes this, but requires careful active loop tracking to prevent race conditions.
**Action:** Offload large list DOM generation to asynchronous chunks and mask latency with CSS skeletons.

## 202X-XX-XX - 🪄 Illusionist - [Perceived Performance: Initial Page Loading]

**Learning:** Initial DOM rendering of complex list applications can cause a blank screen or layout thrashing before the main UI paints. Repeatedly tearing down and recreating identical DOM nodes during re-renders (like pinning an item) exacerbates this by locking the main thread.
**Action:** Inject a synchronous, lightweight CSS loading overlay in the HTML payload to immediately mask the blank screen while the JS executes. Simultaneously, memoize heavy component DOM nodes using a local cache (`Map`) to recycle elements during state changes instead of rebuilding them from scratch, drastically reducing layout thrashing.

## 2026-03-04 - 🎧 Vibe - [Feature Materialized: Recently Used Feature]

**Learning:** When generating standalone logic managers in this specific project's architecture (like a new `RecentlyUsedManager.js`), they must be manually injected as script tags into the core HTML layout, and also dynamically imported into `benchmark.js` (using `loadClass`) and bound to the `global` object. Failing to do so causes ReferenceErrors during `npm run test` because standard module loaders or bundlers are intentionally absent.
**Action:** When writing standalone script classes, always add a script tag into `index.html` before the application script (`RosterApp.js`), and strictly update `benchmark.js` to `loadClass` and bind the class globally.

## 2024-05-24 - 🪧 Wayfinder - [Navigation Context Enhanced: AgentPicker Modal]

**Learning:** The Agent Picker modal `<dialog>` creates an "invisible" dead end by overlaying the UI without modifying the browser's history state, causing the native back button to bypass the modal and unintentionally navigate the user away from the app.
**Action:** Injected a `history.pushState` operation when opening the modal, and added a global `popstate` event listener to intercept the browser's back button and safely close the modal without losing the underlying application state.

## 2024-05-24 - 🦉 Scholar - [Macro/Micro Documentation Synthesized: Architectural Synthesis]

**Learning:** Core application modules and UI Components often lack explicit architectural mappings and lifecycle documentation, resulting in isolated methods.
**Action:** Always map the core lifecycle and architectural constraints in a high-level module `README.md` first, then generate granular, strictly typed JSDoc across all major class methods linking back via `@see README.md#Section` to ensure the macro and micro contexts are permanently synchronized.

## 2024-05-24 - 🦉 Scholar - [Macro/Micro Documentation Synthesized: UI Components]

**Learning:** Specific implementation details for UI components (like `AgentCard` lazy loading, `ClipboardUtils` fallbacks, and `ToastNotification` accessibility rules) were hidden within isolated JSDoc comments or completely undocumented, leading to developer confusion regarding system interaction.
**Action:** Wrote meticulous JSDoc outlining parameter constraints and accessibility patterns for the UI modules (`js/ui/`), and cross-linked them explicitly to newly structured architectural sections within `js/ui/README.md` to ensure the logic and macro intent never drift out of sync.

## 2026-03-05 - 📰 Publisher - [Responsive Layout Enforced: Raw CSS Media Queries]

**Learning:** The project relies on raw vanilla CSS without standard utility frameworks, meaning responsive standard breakpoints (like `sm:` or `md:`) must be manually defined via `@media (min-width: 640px)` to transition from fluid mobile constraints (`100%` width) to fixed dimensions on larger screens, rather than injecting utility classes.
**Action:** Always manually define and enforce `min-width` media queries in the CSS files (e.g., `fusion.css` and inline styles) instead of attempting to use Tailwind-like prefixes when working in vanilla CSS environments.

## 2024-05-24 - 🧑‍🎨 Muse - [Contextual FTUE: Agent Picker Modal]

**Learning:** When injecting an empty state into a picker modal, it's not enough to simply state "No results." A blank screen is a canvas. It needs to include an inspiring icon, empathetic copy, and an actionable Call-To-Action (like a clear search button) to prevent user dead ends and inspire exploration.
**Action:** Always ensure that Empty State components mimic the structural dimensions of the layout they replace and contain a clear, actionable CTA to guide the user to the next step.

## 2026-03-06 - ☄️ Tachyon - [Absence of Synchronous LLM Targets]

**Learning:** Scanned the codebase for synchronous LLM SDK calls (OpenAI, Anthropic, Gemini) with missing `stream: true` flags and found none. The application uses the Jules API, which natively relies on session creation and asynchronous polling (`getActivities`) rather than synchronous monolithic completions.
**Action:** No streaming rewires can be safely executed. Concluding the task without arbitrary modifications to the transport layer.

## 2024-05-24 - 🎇 Hologram - [Generative UI Polish: Markdown to DOM]

**Learning:** Raw AI text streams lack visual structure and can cause layout shifts. However, `innerHTML` and `insertAdjacentHTML` with unescaped AI content streams causes severe XSS risks. Refactoring to Vanilla JS DOM nodes ensures complete safety, but introduces more verbose code structures.
**Action:** Always prefer a custom DOM-node based Markdown Renderer (using `document.createElement`, `document.createTextNode`, `textContent`) when injecting AI-generated payloads in Vanilla JS projects to maintain safety over code brevity. Include CSS transitions to prevent visual thrashing and simulate an organic growth vibe.

## 2024-05-24 - 🎇 Hologram - [Generative UI Polish: Agent Card Protocol Preview]

**Learning:** Rendering parsed markdown protocols natively inside `.innerHTML` (as seen in `AgentCard.js`) leaves the component exposed to XSS vectors or breaks styling on fast tokens, even when strings are escaped globally. Constructing UI components securely without frameworks requires pure DOM abstractions.
**Action:** Migrated the raw `getPromptHtml` to a secure `MarkdownRenderer` utility class that builds nodes directly via `document.createElement`. Injected the results safely via `appendChild()`, completely bypassing string-to-DOM template limits.

## 2026-03-06 - 🩰 Choreographer - [Fluid Transition Injected: Jules Repo Picker]

**Learning:** During the asynchronous fetch of Jules API sources (`loadJulesSources`), the repository dropdown remained frozen with its default "Select GitHub Repository..." text, offering no visual feedback that a network request was in progress.
**Action:** Injected a disabled loading state (`Loading repositories...`) on the `<select>` element prior to the `await` call, and cleanly restored the interactive state or default text upon Promise resolution or failure.

## 2026-03-07 - ⬜ Minimalist - [Visual Bloat Purged: Fusion Lab Wrapper]

**Learning:** Redundant layout wrappers (`<div id="fusionOutputWrapper">`) that solely exist to control visibility or basic flex alignment for a single dynamic child often create unnecessary DOM depth and brittle CSS rules (`#fusionOutputWrapper.open`). When child elements (like `#fusionResultContainer` and `#resetLabBtn`) can manage their own display states via simple utility classes (like `.hidden` and `.fusion-revealed`), the parent wrapper becomes visual dead weight.
**Action:** Always verify if a container `<div>` is actively controlling Grid/Flexbox positioning for *multiple* siblings that must move together. If the children can be toggled and styled individually without breaking the semantic layout flow, surgically flatten the DOM by deleting the wrapper and migrating the visibility controls directly to the target elements.

## 2026-03-07 - ⏱️ Millisecond - [Render Stability Optimized: Inline Objects Hoisted]

**Learning:** Even in a vanilla JS architecture, dynamically defining configuration objects (like `Fuse` options, `IntersectionObserver` properties, and `Clusterize` base states) inside loops or frequent cache-invalidation flows leads to continuous object recreation and garbage collection overhead.
**Action:** Extract all static `options` and `config` objects out of class methods and hoist them as top-level `const` references outside the class, preventing unnecessary memory allocation and thrashing during repetitive logic flows like fuzzy searching and chunked DOM generation.

## 2026-03-07 - 🔖 Lexicon - [Vocabulary Standardized: agentsData -> agents]

**Learning:** Found redundant domain drift across the Fusion Lab ecosystem (`FusionCompiler.js`, `FusionIndex.js`, `FusionLab.js`) and `AgentRepository.js` where the domain models were passed as `agentsData` and `customAgentsData`. The `Data` suffix is a redundant, ambiguous term when passing array/object collections of models.
**Action:** Applied AST-level standardization to rename all parameter and variable occurrences of `agentsData` and `customAgentsData` to exactly match their conceptual collections: `agents` and `customAgents`.

## 2024-05-24 - 🔖 Lexicon - [Vocabulary Standardized: data -> Typed Payloads]

**Learning:** Found redundant domain drift across `JulesManager.js` and `AgentRepository.js` where `data` was used ambiguously to store API responses and JSON payloads.
**Action:** Applied AST-level standardization to rename all parameter and variable occurrences of `data` to their contextual typed equivalents (`sourcesResponse`, `sessionsResponse`, `activitiesResponse`, and `agentPayload`) to improve domain clarity and prevent cognitive friction.
## 2026-03-08 - 🪙 Tokenizer - [Context Payload Optimized: FusionCompiler]
**Learning:** Minified the hardcoded JSON schema in `FusionCompiler.js`'s `stitch` function output template to eliminate non-essential whitespace and indentation tokens consumed by the context window when enforcing the structured JSON output schema on the LLM.
**Action:** Always minify hardcoded JSON schemas in output templates to save tokens.
