## 2024-03-01 - [CSS Global Dictionary Discovery] **Learning:** Found a custom CSS root map in `index.html`. It looks like it does not yet contain a typography scale. **Action:** Next, add a typography scale to `:root` to map chaotic rem/em/px values.

## 2024-03-03 - [Typographic Hierarchy Extension]
**Learning:** `index.html`'s `:root` map had `--text-4xl` as its max text size and was missing typographic weight extensions (like extrabold/black) and explicit line-height definitions (`--leading-*`), leading developers to manually inject hardcoded values (`3.5rem`, `800`, `1.5`, etc.) throughout inline styles and CSS selectors.
**Action:** Extended the global typography dictionary in `:root` by adding `--text-5xl`, `--text-6xl`, `--weight-extrabold`, `--weight-black`, and a full `--leading-*` scale. Enforced the usage of these root variables across the codebase to ensure consistent spacing and weighting without arbitrarily hardcoded integers.
