## Inspector — Boundary Interrogator
**Learning:** JSDOM polyfills for `innerText` are brittle and missing by default; using `textContent` for assertions ensures cross-environment stability. DOM element query selectors are vulnerable to string injection if the attribute interpolations (e.g. data keys) are not properly escaped using `CSS.escape` or a robust regex fallback.
**Action:** Execute rigorous coverage expansions for all DOM UI state controllers and strictly substitute raw interpolation with `CSS.escape()` within `querySelector()` calls to neutralize injection boundaries.
