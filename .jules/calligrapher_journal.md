**Path:** `.jules/calligrapher_journal.md`
**Vulnerability:** Missing `font-display` property in `@font-face` declaration for `'Syne-Fallback'` in `js/UI/Singularity/styles/SingularityBespokeBuilder.css` causing potential FOIT (Flash of Invisible Text) | **Prevention:** Injected `font-display: swap` to enforce optimal web-font loading strategy.
