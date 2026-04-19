## Palette+ — Harmonized Fusions Modal Layout
**Learning:** Reusing existing `.flip-card` rendering within a localized modal context requires careful management of internal state variables (`_domNodeCache`, `_cardHtmlCache`) to accurately reflect state boundaries.
**Action:** Always clear internal rendering cache variables before forcing layout renders via Playwright `page.evaluate()` or manual injection.

## Palette+ — Terminal Interaction State Polish
**Learning:** A rigid color swap without an interpolation curve creates a harsh interaction edge on terminal feedback nodes.
**Action:** Injected a fast but fluid `0.2s ease-in-out` interpolation curve into terminal feedback indicators to soften visual feedback without destroying user attention.

## 2026-03-09 - [Empty State Visual Polish]
**Learning:** `js/UI/EmptyState/EmptyState.js` had a broken class name `empty-title-mutated` that disrupted the visual layout and style definitions for the empty state titles.
**Action:** Reverted the `className` back to `empty-title` to resolve broken empty state styling, maintaining consistent and accurate UI across the platform.
