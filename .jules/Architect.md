## Architect — Structural reinforcement of JulesManager

**Learning:** Monolith components managing complex state machines (e.g. JulesManager) can be safely split into distinct domain modules (JulesModals, TerminalPolling). However, when doing so in a Vanilla JS application without a bundler, ensure that the newly split dependencies are correctly loaded in the HTML and explicitly attached to the global scope during jsdom test setups to prevent undefined reference errors.
**Action:** Always map back test suite failures after an extraction to the underlying module boundaries and ensure proper DI instantiation inside the parent constructor.
