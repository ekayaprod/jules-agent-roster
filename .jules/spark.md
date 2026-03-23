# ⚡ Spark's Journal
> "Innovation without execution is hallucination."

## 2026-02-24 - Brittle String Templating (XSS Risks)
**Learning:** Extensive manual string concatenation using `innerHTML` (as seen in `AgentCard.js` and `FusionLab.js`) is both a DX friction point (hard to maintain multi-line templates) and a security risk (XSS).
**Action:** When encountering manual UI templating, always suggest adopting a modern lightweight templating engine like `lit-html` via CDN that safely sanitizes input and standardizes syntax without requiring a build step.

## Spark — The Visionary & Innovation Lead
**Learning:** Extensive manual string concatenation using `innerHTML` (as seen in `AgentCard.js` and `FusionLab.js`) is both a DX friction point (hard to maintain multi-line templates) and a security risk (XSS).
**Action:** When encountering manual UI templating, always suggest adopting a modern lightweight templating engine like `lit-html` via CDN that safely sanitizes input and standardizes syntax without requiring a build step.
