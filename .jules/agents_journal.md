# Jules Agents Journal

## 2024-05-20 - 🔣 Iconographer - [Emoji Taxonomy Refined]

**Learning:** Found multiple distinct agents sharing generic or duplicated emojis (e.g., Echo and Polyglot both using 🗣️, Test Pilot and Autopilot both using ✈️, Blackbox and Registrar both using 🗃️, Standardizer and Iconographer both using 🔣). This created semantic ambiguity and visual duplication.
**Action:** Refined the visual taxonomy by assigning unique, context-specific emojis to each affected agent (Echo 🔊, Polyglot 🗺️, Test Pilot 🛩️, Autopilot 🧭, Blackbox 💾, Standardizer 📝) directly in their markdown headers to ensure distinct visual identities.

## 2024-05-24 - 🎧 Vibe - Focus Trap Modal A11y

**Learning:** When integrating focus management libraries like `focus-trap` into dynamically populated DOM elements (e.g., virtualized grids or lists using Clusterize.js), `trap.activate()` must be invoked only after the inner HTML has been fully updated and rendered (e.g., inside the rendering timeout block) to ensure correct initial focus allocation.
**Action:** When implementing modal accessibilty, avoid brute-forcing `activate()` on empty nodes. Defer activation until DOM painting is complete, and supply a `fallbackFocus` configuration for safety.

## 2026-03-12 - 🧫 Mitosis - [Parallelized Logic: SearchController]

**Learning:** Offloading `Fuse.js` initialization and `.search()` operations across a massive payload (>5000 items) to a background Web Worker drastically improves the main UI thread's responsiveness, preventing scrolling/typing lag during queries.
**Action:** Extract heavy iterative operations to a `Worker` file (importing required libraries via `importScripts`), wrap the execution in a Promise map tied to a unique `searchId`, handle racing overlaps gracefully by discarding stale results, and maintain a synchronous fallback block when `typeof Worker === 'undefined'` to ensure Node.js compatibility for test suites.

## 2026-03-12 - 🧑‍🏫 Assessor - [Test Methodology Upgrade]

**Learning:** Legacy tests were asserting against internal component structures and using third-party polyfills like `@xmldom/xmldom` instead of native APIs.
**Action:** Migrated tests to assert visible outputs, ensured strict DOM validation, and leveraged `jsdom` to replace external polyfills with native `DOMParser`.

## 2026-03-13 - 🧑‍🏫 Assessor - [Test Methodology Upgrade: PromptParser]

**Learning:** `prompt-parser.test.js` was relying on the external `@xmldom/xmldom` polyfill to test `DOMParser` logic, creating brittle dependency reliance instead of testing the native browser API behavior.
**Action:** Upgraded the test file to use the native JSDOM environment by injecting `/** @jest-environment jsdom */` and purging the `@xmldom/xmldom` dependency, aligning the test methodology with native web standards.

## 2026-10-24 - 🧑‍🏫 Assessor - [Test Methodology Upgrade: ToastNotification]

**Learning:** `ToastNotification.test.js` relied on archaic `document.querySelector` and `classList.contains` lookups to verify component behavior. Event dispatching was also brittle, relying on manual `MouseEvent` configurations instead of semantic user interactions.
**Action:** Refactored tests to use `@testing-library/dom` (`screen.getByRole`, `screen.getByText`) and `@testing-library/jest-dom` matchers (`toHaveClass`, `toHaveAttribute`). Migrated manual events to `fireEvent.click`, `fireEvent.pointerEnter`, ensuring the tests evaluate user-visible accessibility attributes and outputs rather than internal HTML structure.

## 2024-05-20 - 🎧 Vibe - Feature Materialized: PR Queue Panel

**Learning:** Found an implied missing feature in the execution interface: the ability to monitor the open pull requests of a targeted repository.
**Action:** Implemented `getPullRequests` in `JulesService` and a corresponding rendering panel `julesPRPanel` under the Jules Runner Panel, pulling data directly via the GitHub API to increase system observability without leaving the interface.

## 2025-05-20 - 🕴️ Hitman - [Client non-response/rejected targets]

**Learning:** Target Dossier executed. Client authorized elimination of targets 8, 9, and 10. Targets 1-7, 11, and 12 were implicitly rejected.
**Action:** Targets 8, 9, 10 (Scope Creep Category C - Extra Utility Scripts) were destroyed along with the contract file. I will not propose the rejected targets in future sweeps unless conditions drastically change.

## 2024-05-20 - ⬜ Minimalist - [Visual Bloat Purged: AgentCard Wrappers]

**Learning:** Found an unused CSS class `.picker-search` and an empty nested wrapper `.title-wrapper` inside the AgentCard component that contributed only to visual bloat and a bloated DOM. A flexbox wrapper with a single element child doesn't accomplish anything special relative to layout.
**Action:** Flattened empty DOM structure in `AgentCard.js` by dropping `.title-wrapper` and removing dead CSS classes to shrink file sizes. Use native `npx purgecss` to verify orphaned CSS references prior to removing them.

## 2026-03-09 - 👷 Foreman - [Enforced Utility File Naming Convention]

**Learning:** Found a mixed casing convention inside the `js/Utils/` folder where files were improperly using `PascalCase` despite being utility files.
**Action:** Renamed all `.js` and `.test.js` utility files in `js/Utils/` to strictly follow `kebab-case` naming convention using `git mv` (e.g. `DOMUtils.js` -> `dom-utils.js`). Safely updated all global references without modifying internal exported class names. Handled dynamic module imports in `benchmark.js` where file basenames are matched and properly converted to PascalCase class exports, adding special casing for `DOMUtils`.

2026-03-12
**Title**: Fusion Lab Protocol Error State Injection
**Learning**: The Fusion Lab component possessed functional error handling in JS (`FusionLab.js`) but lacked the corresponding DOM structure (`#fusionError`), causing failure states to silently fail visually.
**Action**: Sculpted a native-stack error card (`#fusionError`) complete with active-voice microcopy, warning icons, and ARIA `role="alert"` directly into the layout, ensuring technical issues communicate explicit recovery paths ("Please verify your selections and try again").

2024-03-12
**Title**: 🦎 Chameleon: [Interactive State Mutation: .nav-pill]
**Learning**: Discovered that `.nav-pill` links and buttons in the main navigation completely lacked tactile feedback for keyboard navigation (`focus-visible`) and active interaction (`active`), breaking accessibility expectations.
**Action**: Spliced `.nav-pill:focus-visible` with a distinct `outline` and `.nav-pill:active` with a subtle organic `transform: scale(0.95)` to ensure the interface responds to every tactile input.

## 2026-03-12 - 🩻 Coroner - [Excised: Dead Barrel Re-Exports]

**Learning:** Found unused barrel `index.js` files across the codebase that only served to re-export modules without providing any abstraction, acting as artificial dead weight. These were kept alive solely by internal test files importing from them rather than the direct source modules.
**Action:** When acting as Coroner, trace internal test imports referencing barrel files, sever the references by pointing tests directly to the module implementations, and safely delete the unreferenced barrel files to achieve a mathematically proven zero-reference state.

## 2026-03-12 - 🧽 Steward - [Bumped & Purged: @xmldom/xmldom]

**Learning:** Found `@xmldom/xmldom` being used as a polyfill in tests because the underlying node environment natively lacked `DOMParser` (which is used safely in the browser). Updating Jest to align with `jest-environment-jsdom` 30.3.0 and injecting `/** @jest-environment jsdom */` allowed us to safely purge the polyfill, using native browser API emulation instead.
**Action:** When tests mock standard web APIs using custom packages, check if updating the test environment (like JSDOM) can provide the APIs natively, allowing the removal of the dependency and complex mocking boilerplate.

2026-03-13
**Title**: ⏱️ Millisecond: [Native Stack Render Optimization Bypass]
**Learning**: Discovered that the codebase strictly follows a Vanilla JS architecture (`js/UI/README.md:37`) without utilizing Virtual DOM frameworks like React. Attempting to inject `useCallback`, `useMemo`, or `React.memo` would bootstrap foreign frameworks and violate the mandate to adapt to the native stack.
**Action**: Unilaterally `[Skip]`ped React-specific render execution optimizations since there are no functional components or Virtual DOM reconciliation loops to stabilize.

2026-03-13
**Title**: Gap Spacing Modernization for Agent Cards
**Learning**: Identified a legacy structural spacing hack relying on magic negative margins (`margin-top: -0.5rem`) within a nested flexbox structure (`.front-content-wrapper` and `.flip-card-front`).
**Action**: Replaced fragile negative margins with an organic, mathematically predictable `gap: 0.5rem` on the parent flex container, enforcing structural integrity and responsive alignment.

## 2026-03-13 - 🪩 Vibe Check - [Synthetic Sludge Purged: PromptParser Tests]

**Learning:** Found the test suite `js/Utils/prompt-parser.test.js` importing a third-party package `@xmldom/xmldom` to polyfill `DOMParser` behavior. The dependency acts as synthetic sludge because `jest-environment-jsdom` provides the `DOMParser` natively and correctly reflects browser logic, making the polyfill a hallucinated and brittle dependency that causes build failures when missing.
**Action:** Uninstalled the hallucinated `@xmldom/xmldom` package entirely and removed its import/mocking logic from the tests. Adapted the test environment directly to the native JSDOM standard, removing the conversational logic and ensuring testing reflects reality.

## 2026-10-24 - 🗃️ Registrar - [Registry Synchronized: Illusionist]

**Learning:** Found a role mismatch for the fusion agent `Illusionist` (`Bolt+,Palette+`) between the Markdown source (`prompts/fusions/Illusionist.md`) specifying `Master of Perceived Performance` and the JSON registry (`custom_agents.json`) reflecting an older or incorrect value `Of Perceived Performance`.
**Action:** Autonomously updated `custom_agents.json` to align the `role` property with the Markdown source of truth, ensuring the JSON registry correctly reflects the agent's defined role.

## 2024-05-24 - 🎒 Proton Pack - [Memory Leak Eradicated: IntersectionObserver]

**Learning:** Found an `IntersectionObserver` leak in `RosterApp.js` where the `initObserver` function instantiated a new observer without disconnecting the previous one, potentially causing duplicate instances in memory during app reinitialization or lifecycle resets.
**Action:** Stored the `IntersectionObserver` instance on the class context (`this.observer`) and implemented a `.disconnect()` cleanup guard at the start of `initObserver()` to ensure only one active observer runs at a time.

## 2026-03-16 - 🗃️ Registrar - [Registry Synchronized: Curator]

**Learning:** Found a role and emoji mismatch in agents.json where Curator was labeled 'Payload Optimizer' with '🖼️' instead of 'Payload Conservator' with '🗂️' as defined in prompts/Curator.md.
**Action:** Automatically updated agents.json to perfectly reflect the markdown file's title line.

## 2026-03-16 - 🦉 Scholar - [Macro/Micro Documentation Synthesized: js/Utils Modules]

**Learning:** Prior documentation of `PerformanceUtils` and `StorageUtils` laid the groundwork for utility documentation. Extending this, multiple utility modules (`FormatUtils`, `DOMUtils`, `DownloadUtils`, and `MarkdownRenderer`) possessed standard JSDoc comments but lacked overarching architectural narratives defining their strategic value (e.g., mitigating layout thrashing, centralizing formatting, standardizing DOM transitions).
**Action:** Pruned scattered Scholar entries into a cohesive historical record. Expanded `js/Utils/README.md` to define architectural theses for all remaining core utilities and cross-linked their granular JSDoc entries using strictly typed `@see` tags, finalizing the macro/micro documentation synchronization for the entire `js/Utils` directory.

## 2024-05-24 - ⛑️ Guardian - [Hardened & Proven: getPullRequests]

**Learning:** Unbounded fetch calls missing a generic `catch` block (even when wrapped in a `try...finally`) can leak unhandled exceptions like `AbortError` directly to the caller during a network timeout, crashing the parent process or silently breaking UI state without providing a predictable fallback.
**Action:** Always verify that network requests have an explicit `catch` block preceding `finally`. In `JulesService.getPullRequests`, catching `AbortError` and returning a safe empty array `[]` ensures the application correctly handles latency and missing GitHub tokens without crashing.
