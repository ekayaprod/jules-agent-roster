
## 2026-03-03 - 🍸 Mixologist - [Blended & Tested: StringUtils]
**Learning:** Extracting emoji prefix and suffix logic revealed hidden coupling. The initial fallback logic in `AgentRepository.js` contained duplicate, un-testable logic that silently masked failures if `StringUtils` went missing.
**Action:** When extracting shared utilities, rigorously purge all duplicate fallback logic in consumer files to ensure the new utility remains the *single source of truth*, while substituting safe, hardcoded defaults (`'🤖'`) to prevent environment fragility. Tests should strictly use Node.js `require()` instead of `eval()` hacks by appending `module.exports` conditionals directly in the utility scripts.
## 2024-05-24 - ⬜ Minimalist - CSS Grid Animations Require Inner Overflow Control
**Learning:** When attempting to flatten DOM wrappers by moving `overflow: hidden` to a parent CSS grid container (used for `0fr` to `1fr` transitions), the animation will break. The grid accordion trick strictly requires the *direct grid item* to have `overflow: hidden` or `min-height: 0` to control the collapsing height accurately.
**Action:** When purging redundant visual wrappers within animated CSS grids, ensure the `overflow` property is applied directly to the inner grid item, not the outer grid wrapper, before deleting structural DOM nodes.
