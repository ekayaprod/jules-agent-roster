## Librarian — Unified Taxonomy & Intact References
**Learning:** Moving nested `.md` files without resolving deep relative paths will result in broken markdown anchors and links. Proper search and replace logic needs to factor in the absolute depth of the file making the reference versus the new location of the target markdown file. Using generic script files inside the repository should be removed to avoid pollution.
**Action:** When performing `mv` operations for `.md` files out of deeply nested `js/` folders into `docs/architecture/`, ensure the regex search-and-replace routine maps old relative pointers to accurately calculated new relative paths (`../../../` instead of `../../../../`).

## Scholar — [Missing Macro-Architecture Synthesis]
**Learning:** Foundational macro-documentation files referenced by inline `@see` tags may be entirely absent from the file system. Relying solely on inline comments creates isolated knowledge silos that break the synchronization and cross-referencing intent. Modifying `@see` tags to point to locally generated `README.md` files maintains a single source of truth within a feature's scope.
**Action:** Always scan for the existence of files referenced in `@see` tags. Synthesize missing macro architectural markdown files locally within the module, replacing deep relative `@see` paths to accurately link to the new local documentation.
