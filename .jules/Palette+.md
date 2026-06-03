## Palette+ — Harmonized Fusions Modal Layout
**Learning:** Reusing existing `.flip-card` rendering within a localized modal context requires careful management of internal state variables (`_domNodeCache`, `_cardHtmlCache`) to accurately reflect state boundaries.
**Action:** Always clear internal rendering cache variables before forcing layout renders via Playwright `page.evaluate()` or manual injection.

## Palette+ — Terminal Interaction State Polish
**Learning:** A rigid color swap without an interpolation curve creates a harsh interaction edge on terminal feedback nodes.
**Action:** Injected a fast but fluid `0.2s ease-in-out` interpolation curve into terminal feedback indicators to soften visual feedback without destroying user attention.

## 2026-03-09 - [Empty State Visual Polish]
**Learning:** `js/UI/EmptyState/EmptyState.js` had a broken class name `empty-title-mutated` that disrupted the visual layout and style definitions for the empty state titles.
**Action:** Reverted the `className` back to `empty-title` to resolve broken empty state styling, maintaining consistent and accurate UI across the platform.

## 2026-03-09 - [Component Layout Alignment]
**Learning:** Reusing utility classes (like `card p-6`) doesn't always scale nicely when a specific component layout requires unique maximum-widths and centering logic to match its peer components (like `.fusion-lab-container`).
**Action:** Replaced utility classes with explicit CSS defining `.singularity-builder` container rules inside the component's internal `<style>` block to guarantee dimensional parity without side-effects.
## 2026-05-09 - [Hide Unavailable Agents in Fusion Index]
**Learning:** `js/Features/Fusion/FusionIndex.js` failed to filter out missing combinations (`""` values) from `customAgents`, rendering empty slots and counting them towards the total. Modifying build artifacts like `roster-payload.json` during the PR process violates repo constraints and creates unnecessary bloat.
**Action:** Implemented a targeted value filter during the `sortedKeys` rendering loop and the `updateProgress` loop, correctly filtering out falsy string definitions. Dropped `roster-payload.json` modifications via `git reset/checkout` before submitting.
## 2026-05-10 - [AgentPicker Inline Styles Removal]
**Learning:** Hardcoded inline styles like `animation-delay: ${delay}ms` and `grid-template-columns: repeat(${columns}, 1fr)` create rigid presentation states and bloat HTML strings inside JavaScript files.
**Action:** Created CSS utility classes for delays (e.g. `.delay-30`, `.delay-60`) and grid columns (e.g. `.grid-cols-4`), and replaced the inline styles in `AgentPicker.js` with these classes.
