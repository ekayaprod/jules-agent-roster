## Librarian — Unified Taxonomy & Intact References
**Learning:** Moving nested `.md` files without resolving deep relative paths will result in broken markdown anchors and links. Proper search and replace logic needs to factor in the absolute depth of the file making the reference versus the new location of the target markdown file. Using generic script files inside the repository should be removed to avoid pollution.
**Action:** When performing `mv` operations for `.md` files out of deeply nested `js/` folders into `docs/architecture/`, ensure the regex search-and-replace routine maps old relative pointers to accurately calculated new relative paths (`../../../` instead of `../../../../`).

## Scholar — [Centralized Architecture Documentation]
**Learning:** Component-specific architectural documentation (e.g., `README.md` files) must be centrally managed within the `docs/architecture/` hierarchy to maintain an unpolluted execution tree. Synthesizing documentation files directly inside the source code directories (e.g., `js/Features/...`) violates this repository standard.
**Action:** When synthesizing new macro documentation, ALWAYS create the files within the `docs/architecture/` directory, mirroring the source structure (e.g., `docs/architecture/Features/JulesManager.md`). Never create local `README.md` files alongside the source code.
