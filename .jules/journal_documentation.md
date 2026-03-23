## Librarian — Unified Taxonomy & Intact References
**Learning:** Moving nested `.md` files without resolving deep relative paths will result in broken markdown anchors and links. Proper search and replace logic needs to factor in the absolute depth of the file making the reference versus the new location of the target markdown file. Using generic script files inside the repository should be removed to avoid pollution.
**Action:** When performing `mv` operations for `.md` files out of deeply nested `js/` folders into `docs/architecture/`, ensure the regex search-and-replace routine maps old relative pointers to accurately calculated new relative paths (`../../../` instead of `../../../../`).

## Scholar — [Dynamic Architecture Taxonomy]
**Learning:** Hardcoding documentation paths (like `docs/architecture/`) creates brittle agents that fail across different repositories. Each repository has a unique taxonomy that must be discovered dynamically before synthesizing files.
**Action:** When synthesizing new macro documentation, ALWAYS analyze the specific repository's taxonomy first (e.g., scan for dedicated `docs/` or `architecture/` directories). Generate macro blueprints centrally within that dynamically discovered location to maintain an unpolluted execution tree, defaulting to local module directories only if no central structure exists.
## Scholar — UI Controller Alignment
**Learning:** Missing JSDoc tags on tightly coupled UI animation components can cause developers to misinterpret where logic is managed. Ensuring that these visual orchestrators cross-reference the macro documentation explicitly enforces UI boundaries and provides context on feature colocation.
**Action:** When documenting UI-driven controllers like `FusionAnimation.js`, cross-reference the macro `docs/` guides directly within the inline `@see` annotations, to connect granular interaction handling back to the broader structural blueprint.

## 2024-05-24 - 📚 Archivist - [Missing Security Context in AgentRepository.js]
**Learning:** The core `AgentRepository.js` module contained critical defense-in-depth logic (XSS regex) and parsing safety (`safeJsonParse`) that was undocumented inline and disconnected from the high-level `ARCHITECTURE.md`.
**Action:** Injected explanatory JSDoc with specific `@see` links and appended matching macro architectural sections (`Data Integrity & Parsing`, `Security Model`) to `ARCHITECTURE.md` to permanently link the micro-context to the macro-vision.

## 2026-02-18
- **Dependency Conflict**: Removed stale reference to `agents.js` in `index.html`. File does not exist.
