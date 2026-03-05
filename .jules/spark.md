# ⚡ Spark's Journal
> "Innovation without execution is hallucination."

## 2026-02-23 - Single-File Constraint
**Learning:** The project enforces "Single-File Portability" (ROADMAP.md Phase 1). Libraries must be loadable via CDN without a build step to maintain this constraint.
**Action:** When suggesting innovations, prioritize CDN-loaded libraries or zero-dependency solutions over npm dependencies that require a complex build pipeline.

## 2026-02-24 - Brittle String Templating (XSS Risks)
**Learning:** Extensive manual string concatenation using `innerHTML` (as seen in `AgentCard.js` and `FusionLab.js`) is both a DX friction point (hard to maintain multi-line templates) and a security risk (XSS).
**Action:** When encountering manual UI templating, always suggest adopting a modern lightweight templating engine like `lit-html` via CDN that safely sanitizes input and standardizes syntax without requiring a build step.

## 2024-05-24 - Brittle Custom Roving Tabindex
**Learning:** The project relies on custom JavaScript logic (`handleGridKeydown` in `FusionLab.js`) to manage roving tabindexes for modal grid navigation. This is a recurring DX friction point that often leads to WCAG accessibility violations if edge cases are missed.
**Action:** When auditing custom accessibility logic for complex grids or modals, always cross-reference against battle-tested libraries like `focus-trap` or `roving-tabindex` to ensure robust keyboard navigation without reinventing the wheel.

## 2024-05-24 - Custom Agent Layouts
**Learning:** Users need a way to personalize their workspace by pinning frequently used or favorite fusion agent cards for quicker access.
**Action:** When considering UX enhancements, prioritize features that allow for user customization and persistence (e.g., via LocalStorage) without complicating the single-file deployment constraint.

## 2024-05-24 - 💡 Spark - [Stagnant Custom Emoji Logic]
**Learning:** The project relies on custom, error-prone Regex logic in `js/utils/StringUtils.js` for emoji handling. This is a DX friction point that fails on Unicode edge cases and creates unnecessary technical debt.
**Action:** When encountering reinvented string manipulation logic for Unicode/emojis, always suggest adopting a robust standard library like `emoji-regex` via CDN to ensure safe processing and standardize DX.
