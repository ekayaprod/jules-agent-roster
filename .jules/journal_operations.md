# Prompt Engineer — Journal

## Prompt Engineer — The Structural Upgrade (Summarized)

**Learning & Action:** Added <thinking> blocks and CRITICAL NEGATIVE CONSTRAINTs to Architect to prevent non-deterministic output.

## Prompt Engineer — The Prompt Evolutionist

**Learning:** The Iconographer prompt lacked explicit Chain-of-Thought reasoning, allowing it to blindly replace emojis without assessing the agent's specific domain, and its negative boundaries were functionally weak.
**Action:** Injected a mandatory `<thinking>` block directive prior to emoji selection and prefixed boundary violations with `CRITICAL NEGATIVE CONSTRAINT:` to mathematically bind its scope exclusively to emoji assignment.

## 2024-05-18 - 🤺 Adversary - [Fraudulent Test Eliminated: FusionCompiler.test.js]
**Learning:** `.toBeDefined()` checks on deeply nested mapped keys can pass even if the key order transformation logic breaks and results in undefined object properties.
**Action:** Replace existence checks on mapped properties with explicit value assertions corresponding to the mapped property structure.

## 2026-03-12 - 🩻 Coroner - [Excised: Dead Barrel Re-Exports]
**Learning:** Found unused barrel `index.js` files across the codebase that only served to re-export modules without providing any abstraction, acting as artificial dead weight. These were kept alive solely by internal test files importing from them rather than the direct source modules.
**Action:** When acting as Coroner, trace internal test imports referencing barrel files, sever the references by pointing tests directly to the module implementations, and safely delete the unreferenced barrel files to achieve a mathematically proven zero-reference state.

## 2026-03-03 - 🪄 Illusionist - [Agent Roster Perceived Performance]
**Learning:** Rendering massive DOM lists synchronously (like 170+ AgentCards) freezes the main thread. Implementing asynchronous chunking using `requestAnimationFrame` fixes this, but can introduce race conditions if the render function is called multiple times quickly (like during search filtering).
**Action:** When implementing chunked asynchronous rendering, track the active loop with a unique identifier (like a `Symbol`) to cleanly cancel old render passes if a new one is initiated, preventing DOM corruption. Always ensure CSS loading animations include a `@media (prefers-reduced-motion: reduce)` block.

## 2026-02-23 - [Polished & Protected UI: Download Dropdown]
**Learning:** Simulated keyboard events (e.g., `Enter` on a button) in headless Playwright environments may not reliably trigger native `click` or `keydown` events due to focus timing or browser quirks. Explicit `keydown` handlers for activation keys (Enter/Space) provide robustness, but testing them may require workarounds (like using `.click()` to open) while still verifying the listener logic via other keys (Escape/Arrows).
**Action:** Always include explicit `keydown` handlers for interactive elements to ensure accessibility compliance, even if native `<button>` behavior covers it in most browsers. Use verification scripts that isolate specific behaviors (e.g., testing `Escape` key logic separately from activation logic).

## 2026-02-23 - [Polished & Protected UI: Download Dropdown Focus Trap]
**Learning:** Testing menu navigation keys (Home/End) requires at least two focusable items to verify focus movement; single-item menus yield misleading test results. Additionally, relying solely on `keydown` for `Tab` key behavior is insufficient; implementing a `focusout` listener on the container ensures robust closing behavior when focus naturally leaves the component via Tab or click.
**Action:** When testing list navigation, always inject a dummy second item if the default state has only one. Use `focusout` listeners to manage "close on blur" interactions instead of intercepting `Tab` keydown, which can interfere with natural focus flow.

## 2026-02-26 - [Polished & Protected UI: Agent Picker]
**Learning:** Playwright's Python `expect().to_have_class()` assertion strictly requires strings or regular expressions; lambdas are not supported, causing test failures even when logic is correct. Also, `role="button"` inside a grid/listbox context should avoid `aria-selected`; `role="option"` with Roving Tabindex is the semantic gold standard for single-select grids.
**Action:** Use `re.compile(r"pattern")` for flexible class assertions in Python tests. Implement Roving Tabindex manually for composite widgets to ensure keyboard navigation (Arrows/Home/End) works predictably across screen readers.

## 2026-02-28 - [Polished & Protected UI: Fusion Index Shelf]
**Learning:** When retrofitting interactive behavior onto `div` elements, explicit `keydown` listeners for `Enter` and `Space` are mandatory for keyboard accessibility; relying on `click` is insufficient as browsers do not auto-trigger clicks on non-buttons via keyboard. Furthermore, testing `localStorage` hydration requires careful sequencing: navigating to the page, injecting the data, and then reloading the page ensures the application initializes with the correct state.
**Action:** Always pair `role="button"` with `tabindex="0"` and an explicit `keydown` handler (`Enter`/`Space`) when upgrading non-semantic elements. For state-dependent tests, favor a "Load → Inject → Reload" pattern to guarantee clean state initialization.

## 2026-03-01 - [Polished & Protected UI: Tooltip Focus States]
**Learning:** When implementing pure CSS tooltips using `::after` pseudo-elements, relying on `:focus` to trigger visibility creates an accessibility trap for mouse users (the tooltip remains permanently visible after clicking until another element is focused). Furthermore, using a `<span>` with `role="tooltip"` and `tabindex="0"` is an anti-pattern for the *trigger* element itself.
**Action:** Always upgrade interactive tooltip triggers to semantic `<button type="button">` elements. Bind the tooltip visibility strictly to `:hover` and `:focus-visible` (never `:focus`), and ensure the button has a distinct, high-contrast `:focus-visible` ring.

## 2026-03-01 - [Visual Bloat Purged: Tier Badge CSS]
**Learning:** Found an orphaned set of CSS classes `.fusion-tier-badge.*` remaining in `index.html` after a layout refactor. The UI was using `.meta-tag.*` instead to apply identical background colors.
**Action:** Always scan for duplicate style applications across CSS selectors (e.g. `.fusion-tier-badge.tier-common, .meta-tag.tier-common { ... }`). If one selector is no longer found in HTML/JS, it can be safely pruned to reduce visual bloat and keep CSS lean.

## 2024-05-22 - [Persona Upgrade: Author]
**Learning:** "Write in active voice" is a subjective, weak constraint. It allows for "We write code" (active) vs "Write code" (imperative).
**Action:** Replace with "Use strict imperative mood for all instructions (e.g., 'Run', 'Install', not 'You should run')." Enforce zero-tolerance for first-person pronouns ('I', 'we', 'our').
## 2026-02-28 - [Persona Upgrade: Mapper]
**Learning:** "Please write more tests." is a vague, unactionable human wish. It lacks domain context and prioritization.
**Action:** Replaced with explicit instructions mapping the specific type of test to the highest risk domain while ignoring deprecated code.

## 2026-02-28 - [Persona Upgrade: Singularity]
**Learning:** "Please write storybook files... Try your best." is a weak, generic prompt resulting in hallucinations and out-of-scope files.
**Action:** Replaced with strict negative constraints ("CRITICAL: Do not write stories for internal utils/"), explicit goal definition ("Generate a Storybook file matching the exact prop interface"), and strong persona injection.

## 2026-03-03 - [Persona Upgrade: Wordsmith]
**Learning:** "Empathetic guidance" and "speak to the user like a human" are vague, subjective human wishes that invite LLM hallucinations and inconsistent tonal shifts. They lack strict technical writing heuristics.
**Action:** Replaced with explicit instructions mapping to "strict, active-voice, user-centric microcopy" and replacing "helpful" with "explicitly define the failure state and the required next action."

## Prompt Engineer — [Persona Upgrade: Echo]
**Learning:** "Sweep the entire body of the file... and replace" is a risky instruction without a chain-of-thought constraint; it leads to blind regex replacements that inadvertently destroy structural markdown emojis (like ❌/✅).
**Action:** Injected a `<thinking>` block directive explicitly forcing the agent to reason through potential false positives and edge cases prior to executing the replacement. Formalized "Never do" rules into `CRITICAL NEGATIVE CONSTRAINT` to mathematically bind the AI from modifying the header or structural markers.

## 2024-05-24 - 🎧 Vibe - Focus Trap Modal A11y
**Learning:** When integrating focus management libraries like `focus-trap` into dynamically populated DOM elements (e.g., virtualized grids or lists using Clusterize.js), `trap.activate()` must be invoked only after the inner HTML has been fully updated and rendered (e.g., inside the rendering timeout block) to ensure correct initial focus allocation.
**Action:** When implementing modal accessibilty, avoid brute-forcing `activate()` on empty nodes. Defer activation until DOM painting is complete, and supply a `fallbackFocus` configuration for safety.

# Yggdrasil Learnings

## 2024-05-18 - 🌳 Yggdrasil - [Paradigm Mutated: js/utils/PromptParser.js]

**Learning:** Legacy imperative DOM manipulation (`for (let i = 0...`) can be cleanly and defensively rewritten using standard `Array.from()` to cast a `NodeList` to a functional array, enabling a declarative pipeline via `.filter()` and `.map()`.
**Action:** Always favor converting `NodeList` to Array. Keep extraction functional and avoid hidden state inside loop bodies.

## 2025-02-13 - 🌳 Yggdrasil - [Mutated FusionCompiler from OOP to Functional Pipeline]

**Learning:** Legacy Object-Oriented classes that strictly provide data normalization and pure logical operations (like string stitching) are prone to `this.` context leakage and imperative boilerplate loops (e.g., `Object.keys(data).forEach()`).
**Action:** Reincarnated `FusionCompiler` into a pure functional module (factory closure) returning a frozen object interface. Replaced `forEach` push mutations with declarative `Object.fromEntries(Object.entries().map(...))` pipelines. This perfectly preserved the public API (passing all Jest tests via `new FusionCompiler()`) while eliminating hidden state mutations.

## 2025-02-13 - 🌳 Yggdrasil - [Paradigm Mutated: js/Features/Pinned/PinnedManager.js]

**Learning:** Object-Oriented classes managing internal mutable state (e.g. `this.pinned = new Set()`) can be cleanly mutated into pure functional closures. The state is sequestered inside the closure instead of attached to `this`, preventing external mutation and `this` context issues, while the factory function returns an `Object.freeze` containing the public API methods to perfectly maintain backward compatibility with `new ClassName()`.
**Action:** Always favor factory functions returning frozen objects over ES6 classes for singleton state managers to strictly control state access and eliminate `this` context binding overhead.

## 2025-02-13 - 🌳 Yggdrasil - [Paradigm Mutated: js/Features/Fusion/FusionAnimation.js]

**Learning:** Legacy classes relying heavily on internal state mutation (`this.elements`) and imperative iteration (`for (let i = 0...`) can be reincarnated into pure functional modules. Using declarative array manipulation (`Array.from({length}).map(...)`) combined with a factory closure and `Object.freeze()` preserves the original API contract without leaking internal state.
**Action:** Replace `class` structures with factory closures returning `Object.freeze({ ...methods })`. Target imperative DOM rendering loops and convert them into declarative pipeline transformations.
