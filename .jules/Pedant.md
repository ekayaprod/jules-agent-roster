## Pedant — Extracting Magic Numbers
**Learning:** Hardcoded literal values like network timeouts (`10000`), backoff delays (`300`), retry limits (`3`), animation delays (`30`, `600`), loading overlay dismiss timings (`500`), and debounce delays (`300`) were scattered directly in method arguments and body implementations across files like `RosterApp.js`. This creates stylistic entropy and prevents external modules (like test suites) from referencing the single source of truth.
**Action:** Always extract such literal boundaries into properly typed and scoped global constants (e.g., `REQUEST_TIMEOUT_MS`, `DEFAULT_BACKOFF_MS`, `MAX_RETRIES`, `ANIMATION_DELAY_STEP_MS`, `ANIMATION_DELAY_MAX_MS`, `LOADING_OVERLAY_DISMISS_MS`, `SEARCH_DEBOUNCE_MS`) and export them if needed in testing to maintain absolute structural predictability.

## Pedant — Tightening Typings in JulesService.js
**Learning:** A loose `any` return typing was found in the `_githubRequest` docblock within `JulesService.js`, which undermines typological stringency.
**Action:** Enforced code predictability by tightening the type from `Promise<any>` to `Promise<Object|Array>`.

## Pedant — Tightening Typings for Pinning Fusion Cards
**Learning:** Loose global `isNaN()` checks were being used in `AgentCard.js` and `RosterApp.js` to assert whether an agent index mapped to a fusion agent string. This introduces dangerous type coercion boundary conditions since `isNaN(undefined)`, `isNaN({})`, and `isNaN('foo')` can resolve unpredictably.
**Action:** Enforced absolute typological safety by strictly asserting `typeof index === 'string' && Number.isNaN(Number(index))` wherever fusion card keys were dynamically verified for pinning.
