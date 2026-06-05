## 🐝 Hive Axioms
1. [RESILIENCE] All fetch calls must implement a 15s AbortController and handle transient network errors.
2. [HYGIENE] Prohibit empty catch blocks; use native logging.
3. [ARCHITECTURE] The physical file tree structure must directly mirror the exported PascalCase ES6 domain convention.
4. [VALIDATION] All JSON and storage parsing must be protected by explicit try/catch error boundaries.
5. [STABILITY] Limit integrations strictly to isolated, bounded contexts to prevent test collapse.
6. [UI/UX] Replace static disablement and generic errors with active, context-aware microcopy and proper aria attributes.
7. [PERFORMANCE] Flatten multi-pass array iterations into direct `for` loops for high-throughput data paths.
8. [HYGIENE] Do not commit build artifacts (like `roster-payload.json`); verify exact diffs via `git diff HEAD` before review.
9. [ARCHITECTURE] Rely on semantic locators (`getByRole`) over structural DOM checks (`querySelector`) in UI tests.
10. [ARCHITECTURE] Centralize utility functions (like `fetchWithRetry` or `getCustomAgent`) into single-source-of-truth modules.
11. [STABILITY] Ensure environment-specific globals (like `module.exports`) are strictly guarded to prevent crashes in mixed contexts.
12. [ARCHITECTURE] Extract monolithic event delegation and polling loops into distinct, decoupled static helper classes.
13. [PERFORMANCE] Prevent massive garbage collection spikes by avoiding chained map/filter mutations on large datasets.
14. [UI/UX] Replace absolute pixel constraints with responsive fluid utility classes (e.g., `w-full`) and utilize universal pointer events.

# Historical Archive

## 🧽 Steward — The Dependency Caretaker

**Knowledge Gap:** Moving nested `.md` files without resolving deep relative paths will result in broken markdown anchors and links. Proper search and replace logic needs to factor in the absolute depth of the file making the reference versus the new location of the target markdown file. Using generic script files inside the repository should be removed to avoid pollution. | **Clarity:** When performing `mv` operations for `.md` files out of deeply nested `js/` folders into `docs/architecture/`, ensure the regex search-and-replace routine maps old relative pointers to accurately calculated new relative paths (`../../../` instead of `../../../../`).

**Knowledge Gap:** Hardcoding documentation paths (like `docs/architecture/`) creates brittle agents that fail across different repositories. Each repository has a unique taxonomy that must be discovered dynamically before synthesizing files. | **Clarity:** When synthesizing new macro documentation, ALWAYS analyze the specific repository's taxonomy first (e.g., scan for dedicated `docs/` or `architecture/` directories). Generate macro blueprints centrally within that dynamically discovered location to maintain an unpolluted execution tree, defaulting to local module directories only if no central structure exists.

**Knowledge Gap:** Missing JSDoc tags on tightly coupled UI animation components can cause developers to misinterpret where logic is managed. Ensuring that these visual orchestrators cross-reference the macro documentation explicitly enforces UI boundaries and provides context on feature colocation. | **Clarity:** When documenting UI-driven controllers like `FusionAnimation.js`, cross-reference the macro `docs/` guides directly within the inline `@see` annotations, to connect granular interaction handling back to the broader structural blueprint.

**Knowledge Gap:** The core `AgentRepository.js` module contained critical defense-in-depth logic (XSS regex) and parsing safety (`safeJsonParse`) that was undocumented inline and disconnected from the high-level `ARCHITECTURE.md`. | **Clarity:** Injected explanatory JSDoc with specific `@see` links and appended matching macro architectural sections (`Data Integrity & Parsing`, `Security Model`) to `ARCHITECTURE.md` to permanently link the micro-context to the macro-vision.

**Knowledge Gap:** Removed stale reference to `agents.js` in `index.html`. File does not exist. | **Clarity:** Removed stale reference to `agents.js` in `index.html`. File does not exist.

**Knowledge Gap:** The `@xmldom/xmldom` polyfill was removed from the test suite because `jest-environment-jsdom` provides the `DOMParser` natively, but the macro architecture documentation still described the `PromptParser` component without explicitly mapping this dependency evolution and the removal of the legacy compatibility code. | **Clarity:** Updated `docs/architecture/Utils/README.md` to explicitly state that the native `DOMParser` is natively provided by `jest-environment-jsdom` (version 30.3.0+) and explicitly map the removal of the legacy `@xmldom/xmldom` polyfill, ensuring documentation reflects the actual native testing architecture.

**Knowledge Gap:** CONTRIBUTING.md contained ghost instructions telling developers to manually register agents in legacy `agents.json` and `custom_agents.json` files that no longer exist. | **Clarity:** Rewrote the setup instructions in `CONTRIBUTING.md` to map the new native architectural standard where Markdown YAML frontmatter is the sole source of truth and `roster-payload.json` is generated via `npm run build:roster`.
**Knowledge Gap:** The active architecture uses `JulesTerminal.js` and `JulesAPI.js`, but macro-documentation erroneously referred to `JulesManager` and `JulesService`. | **Clarity:** Ensure macro documentation (`ARCHITECTURE.md`) is completely synchronized with active module names instead of hallucinated abstractions or stale legacy nomenclature.
