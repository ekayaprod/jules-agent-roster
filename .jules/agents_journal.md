
## 2026-03-03 - 🍸 Mixologist - [Blended & Tested: StringUtils]
**Learning:** Extracting emoji prefix and suffix logic revealed hidden coupling. The initial fallback logic in `AgentRepository.js` contained duplicate, un-testable logic that silently masked failures if `StringUtils` went missing.
**Action:** When extracting shared utilities, rigorously purge all duplicate fallback logic in consumer files to ensure the new utility remains the *single source of truth*, while substituting safe, hardcoded defaults (`'🤖'`) to prevent environment fragility. Tests should strictly use Node.js `require()` instead of `eval()` hacks by appending `module.exports` conditionals directly in the utility scripts.
## 2024-05-24 - ⬜ Minimalist - CSS Grid Animations Require Inner Overflow Control
**Learning:** When attempting to flatten DOM wrappers by moving `overflow: hidden` to a parent CSS grid container (used for `0fr` to `1fr` transitions), the animation will break. The grid accordion trick strictly requires the *direct grid item* to have `overflow: hidden` or `min-height: 0` to control the collapsing height accurately.
**Action:** When purging redundant visual wrappers within animated CSS grids, ensure the `overflow` property is applied directly to the inner grid item, not the outer grid wrapper, before deleting structural DOM nodes.

## 2026-03-03 - 💊 Placebo - Masked Latency & Resilient Retries for Emoji Kitchen API
**Learning:** External API dependencies like Emoji Kitchen can be flaky or slow, causing the image loading sequence to either break silently or freeze the user experience. By attempting to load images synchronously within a strictly timed animation loop, the user loses trust and the interface suffers layout shifts on hard failure.
**Action:** Wrapped the image fetch in a 3x exponential backoff retry loop, injected a 'skeleton-pulse' placeholder to mask the latency dynamically, and ensured the image load initiates asynchronously without blocking the primary 3500ms CSS transition. Structured logging handles the final hard failure before falling back gracefully to text emojis.

## 2026-03-03 - 🌌 Singularity - [Bespoke Zero-Build-Step Testing Constraints]
**Learning:** The repository enforces strict single-file portability and zero-build-step constraints. Traditional heavy testing frameworks (like Jest, Mocha, or Vitest) are prohibited. Instead, unit tests must rely purely on native Node assertions with explicit `module.exports` fallbacks appended to source files for clean importing, or use Python Playwright to inject and evaluate scripts in an `about:blank` page when browser APIs (like `DOMParser`) are required.
**Action:** All future spawned child agents tasked with writing, running, or verifying test coverage must be strictly constrained to use this bespoke in-house testing methodology. Never bootstrap foreign package managers or introduce heavy test dependencies.
