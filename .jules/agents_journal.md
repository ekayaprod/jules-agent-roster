## 2026-03-12 - 🧑‍🏫 Assessor - [Test Methodology Upgrade: JulesManager.test.js]
**Learning:** Legacy tests in `JulesManager.test.js` were asserting against internal component structures and variables rather than user-visible DOM changes. This led to extremely brittle tests that broke purely because of how they asserted state instead of what they asserted.
**Action:** Migrated brittle tests into tests that execute logic and check for changes in visible output strings, specific classes added to the DOM based on user flows, and correct DOM API manipulations based on system inputs. Removed redundant inner logic tests for deleted components and ensured strict DOM output validation.

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

## 2024-05-24 - 🦉 Scholar - [JulesManager Architecture Synthesis]
**Learning:** Documenting the `JulesManager` highlighted that attempting to modify tests immediately reveals deeply coupled UI rendering logic not built for isolation. Writing documentation must be constrained strictly to describing the state of the system, not trying to enforce execution tests that are currently broken by previous architectural changes.
**Action:** When acting as Scholar, focus solely on synthesizing standard `@see` cross-linked JSDoc and `README.md` artifacts. Never attempt to "fix" the tests, as altering functional assertions constitutes code execution modification.
2024-03-12
**Title**: 🦉 Scholar: [AgentCard Module Synthesis]
**Learning**: Discovered an orphaned inline JSDoc reference (`@see README.md#agentcard-architecture`) in `AgentCard.js` where the target `README.md` file did not exist in the module directory.
**Action**: Synthesized a comprehensive macro architecture `README.md` mapping the DOM structure, event delegation, contextual actions, and render throttling, and strictly typed/cross-linked the inline JSDoc comments to establish a verified single source of truth.

2024-03-12
**Title**: 🦎 Chameleon: [Interactive State Mutation: .nav-pill]
**Learning**: Discovered that `.nav-pill` links and buttons in the main navigation completely lacked tactile feedback for keyboard navigation (`focus-visible`) and active interaction (`active`), breaking accessibility expectations.
**Action**: Spliced `.nav-pill:focus-visible` with a distinct `outline` and `.nav-pill:active` with a subtle organic `transform: scale(0.95)` to ensure the interface responds to every tactile input.
