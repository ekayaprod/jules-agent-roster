## Palette+ — Harmonized Fusions Modal Layout
**Learning:** Reusing existing `.flip-card` rendering within a localized modal context requires careful management of internal state variables (`_domNodeCache`, `_cardHtmlCache`) to accurately reflect state boundaries.
**Action:** Always clear internal rendering cache variables before forcing layout renders via Playwright `page.evaluate()` or manual injection.
