
## 2026-03-03 - 🍸 Mixologist - [Blended & Tested: StringUtils]
**Learning:** Extracting emoji prefix and suffix logic revealed hidden coupling. The initial fallback logic in `AgentRepository.js` contained duplicate, un-testable logic that silently masked failures if `StringUtils` went missing.
**Action:** When extracting shared utilities, rigorously purge all duplicate fallback logic in consumer files to ensure the new utility remains the *single source of truth*, while substituting safe, hardcoded defaults (`'🤖'`) to prevent environment fragility. Tests should strictly use Node.js `require()` instead of `eval()` hacks by appending `module.exports` conditionals directly in the utility scripts.
## 2024-05-24 - ⬜ Minimalist - CSS Grid Animations Require Inner Overflow Control
**Learning:** When attempting to flatten DOM wrappers by moving `overflow: hidden` to a parent CSS grid container (used for `0fr` to `1fr` transitions), the animation will break. The grid accordion trick strictly requires the *direct grid item* to have `overflow: hidden` or `min-height: 0` to control the collapsing height accurately.
**Action:** When purging redundant visual wrappers within animated CSS grids, ensure the `overflow` property is applied directly to the inner grid item, not the outer grid wrapper, before deleting structural DOM nodes.

## 2024-05-24 - 🏁 Pacesetter - [Optimized & Locked: Roster & Picker Search Filtering]
**Learning:** Instantiating a fuzzy search index (like `Fuse.js`) inside an event handler creates massive execution latency. Every keystroke triggers an $O(n)$ mapping of 5000+ DOM elements and re-indexes them synchronously, blocking the main thread for over 3 seconds and violating the 50ms performance threshold.
**Action:** Extract search index instantiation out of the input event loop entirely. Cache the `Fuse` instance and the data mapping at the initialization or state-change boundary (e.g., when the agent count changes or when the modal opens), reducing the keystroke event to a pure `.search()` call and limiting DOM result rendering via `DocumentFragment`. Locked in place with a strict execution-time assertion boundary script.
## 2026-03-03 - 💊 Placebo - Masked Latency & Resilient Retries for Emoji Kitchen API
**Learning:** External API dependencies like Emoji Kitchen can be flaky or slow, causing the image loading sequence to either break silently or freeze the user experience. By attempting to load images synchronously within a strictly timed animation loop, the user loses trust and the interface suffers layout shifts on hard failure.
**Action:** Wrapped the image fetch in a 3x exponential backoff retry loop, injected a 'skeleton-pulse' placeholder to mask the latency dynamically, and ensured the image load initiates asynchronously without blocking the primary 3500ms CSS transition. Structured logging handles the final hard failure before falling back gracefully to text emojis.

## 2026-03-03 - 🌌 Singularity - [Bespoke Zero-Build-Step Testing Constraints]
**Learning:** The repository enforces strict single-file portability and zero-build-step constraints. Traditional heavy testing frameworks (like Jest, Mocha, or Vitest) are prohibited. Instead, unit tests must rely purely on native Node assertions with explicit `module.exports` fallbacks appended to source files for clean importing, or use Python Playwright to inject and evaluate scripts in an `about:blank` page when browser APIs (like `DOMParser`) are required.
**Action:** All future spawned child agents tasked with writing, running, or verifying test coverage must be strictly constrained to use this bespoke in-house testing methodology. Never bootstrap foreign package managers or introduce heavy test dependencies.

## 2024-05-24 - 📑 Registrar - [Barrel Exports & Discoverability Centralized: js/utils]
**Learning:** Shared utility files without a centralized barrel export lead to deep relative imports and hinder codebase discoverability, but in environments enforcing a single-file portability (zero-build-step) constraint, frontend components loaded via `<script>` tags don't benefit from standard ES Modules. However, backend testing environments still strictly require Node.js CommonJS `require()` support to maintain clean imports in tests.
**Action:** Always create an `index.js` (or `__init__.py`) barrel file at the root of major directories (`js/utils/`) combining all module exports. Update any test files or Node scripts to import cleanly from the barrel (`require('./index')`) rather than hardcoding deep paths to internal modules.

## 2026-03-03 - 🦉 Scholar - [RosterApp Architectural State Synthesized]
**Learning:** `RosterApp.js` executes massive asynchronous batch rendering (via `requestAnimationFrame` and `setTimeout`) and strictly throttles fuzzy search DOM manipulation. The existing JSDoc completely lacked insight into these anti-thrashing mechanisms, meaning developers could unknowingly strip these patterns and cause crippling layout shifts.
**Action:** Always link granular asynchronous UI performance optimizations in JSDoc via `@see` to a single macro architectural thesis (e.g. `README.md#rosterapp-architecture`) so developers understand *why* seemingly overly complex asynchronous chunking logic was implemented.

## 2024-05-24 - 📰 Publisher - [Responsive Layout Enforced: Category Navigation]
**Learning:** When using `overflow-x: auto` for horizontally scrollable flexbox containers (like `.category-nav`), `justify-content: space-between` causes items to be cut off and inaccessible on smaller viewports.
**Action:** Use `justify-content: flex-start` with a `gap` (e.g., `gap: 0.5rem`) instead, ensuring all items are accessible via scrolling without layout blowout.

## 2026-03-03 - 🗿 Sculptor - [Component Chiseled & Smoothed: Fusion Lab Skeleton]
**Learning:** Instantly swapping `.hidden` utility classes between loading skeletons and actual content creates a jarring, unpolished experience. CSS transitions on `opacity` won't execute if the `display: none` property (from `.hidden`) is instantly toggled without allowing a frame to render.
**Action:** When extracting or managing state transitions between skeletons and active components, use a `setTimeout` (or `transitionend` event) matching the CSS transition duration. Fade out the skeleton by setting `opacity: 0`, wait for the timeout, apply `.hidden` to the skeleton, remove `.hidden` from the content, force a layout reflow (e.g. `element.offsetHeight`), and finally set the content's `opacity: 1`.
