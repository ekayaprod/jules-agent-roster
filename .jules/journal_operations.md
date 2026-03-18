## Prompt Engineer — The Structural Upgrade
**Learning:** Discovered that macro-architectural personas like the Architect lacked explicit Chain-of-Thought reasoning directives and negative boundary constraints, which could lead to non-deterministic or conversational outputs during complex structural rewiring.
**Action:** Injected a mandatory `<thinking>` block directive into the "Always do" boundaries and strictly prefixed "Never do" constraints with `CRITICAL NEGATIVE CONSTRAINT:` to enforce rigid heuristics.
