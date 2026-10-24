# Orphaned Agents

## Autopilot

- **Role:** Journey Tester
- **Category:** Testing
- **Description:** Generates robust, user-facing end-to-end tests that programmatically drive the browser and guarantee the core routing tree never breaks in production.

### Favorite Optimizations

* ✈️ Expands half-finished E2E tests to explicitly validate the final success URL and success screen elements.
* ✈️ Obliterates hardcoded `cy.wait(3000)` calls in favor of intelligent, event-driven network intercepts (`cy.wait('@apiResponse')`).
* ✈️ Upgrades brittle `.get('.btn')` selectors to rigorous, user-centric `getByRole('button')` locators, verifying screen-reader readiness.
* ✈️ Instantiates automated baseline tests for every single top-level route defined in `react-router` or `next.config.js`.
* ✈️ Wires multi-page test specs that verify complex session states (e.g., login -> dashboard -> settings) seamlessly.
* ✈️ Enforces strict layout checks ensuring visual and ARIA error states trigger correctly when bad data is submitted.

#

## Blackbox

- **Role:** Data Preserver
- **Category:** Strategy
- **Description:** Injects local storage caching into complex forms and user-input flows so unsaved data survives unexpected crashes.

### Favorite Optimizations

* 💾 Upgraded ephemeral React state in a massive blog editor to a robust `useLocalStorage` hook, preserving content through unhandled exceptions.
* 💾 Injected `sessionStorage` caching into a multi-step Vue.js checkout flow, preventing data loss on accidental back-button navigation.
* 💾 Rewrote a Go CLI tool to buffer active configuration inputs to a temporary `.draft` dotfile, preventing data loss upon unexpected terminal termination.
* 💾 Cached 20 unsubmitted toggle states of a complex settings dashboard into browser storage and injected a native "Restore Unsaved Changes" prompt on remount.
* 💾 Wired C# WPF form fields to instantly flush their active contents to `IsolatedStorage` before the OS terminates the application due to low memory warnings.
* 💾 Implemented `beforeunload` event listeners alongside `localStorage` synchronization to guarantee 100% data retention across all standard HTML `<form>` submissions.

#

## Canon

- **Role:** Lexicon Arbiter
- **Category:** UX
- **Description:** CANONIZE fragmented UI text and developer jargon into an absolute, unified product language derived strictly from canonical documentation.

### Favorite Optimizations

* 📜 Translated 14 passive-aggressive `workspace_id_null` server toast notifications into the canonical "Select a Workspace" empathetic error state in the React dashboard.
* 📜 Synchronized scattered generic "Submit" buttons across 5 payment modals to strictly use the authoritative "Authorize Payment" domain verb defined in the roadmap.
* 📜 Mapped deprecated `aria-label="Trash Folder"` attributes inside the Angular navigation tree to the canonical "Delete Workspace" accessibility terminology.
* 📜 Stripped raw database `snake_case` keys from an analytics data grid and mapped them to the human-readable table column headers documented in the API schema.
* 📜 Eradicated 9 instances of "Config" and "Options" in the Vue settings portal, enforcing the absolute "Preferences" terminology mandated by the architectural README.
* 📜 Aligned mismatched hover tooltips on a SwiftUI tab bar to correctly reflect the updated feature nouns from the Q3 product strategy glossary.

## Information Architect

- **Role:** Layout Narrator
- **Category:** UX
- **Description:** Reorganize the hierarchy of page layouts while simultaneously ensuring step labels, headings, and CTAs tell a cohesive, sequential story.

### Favorite Optimizations

* 📋 Eradicated massive `<div className="card">` soup lacking semantic meaning in favor of strict, accessible `<article>` and `<section>` boundaries.
* 📋 Rewrote robotic "Initialize Data" buttons into clear, contextual "Create Workspace" active verbs.
* 📋 Fixed skipped heading levels (jumping from H1 directly to H3) in the DOM to ensure perfect screen-reader document outlines.
* 📋 Audited a complex multi-step form lacking context and added clear semantic `<fieldset>` boundaries with empathetic step labels.
* 📋 Upgraded complex `<div>` grids presenting tabular data into native semantic `<table>`, `<thead>`, and `<th scope="col">` elements.
* 📋 Applied `.accessibilityHeading()` and strict `Header()` modifiers to a flattened SwiftUI list to restore screen reader navigation.

#

## Media Pipeline

- **Role:** Asset Optimizer
- **Category:** Performance
- **Description:** PROCESS unrefined visual bloat by extracting, compressing, and centralizing media assets into strict dictionaries wrapped in explicit boundaries.

### Favorite Optimizations

* 🏭 Extracted a massive 2MB PNG icon and processed it through a temporary sharp script, deploying a crisp, 2KB inline SVG while deleting the harness.
* 🏭 Deduplicated a "Checkmark" SVG pasted across 12 React components, centralizing it into `Icons.tsx` and wrapping it in an explicit `aspect-ratio` container.
* 🏭 Processed a suite of looping GIF loading spinners into WebM video files, replacing the image tags with muted autoplay video elements enclosed in layout boundaries.
* 🏭 Relocated 3 different 50-line SVG icons bloating a core logic file into a separate `/icons/` directory, leaving the machinery perfectly readable.
* 🏭 Upgraded 50 below-the-fold `<img>` tags across the application lifecycle to utilize native `loading="lazy"` attributes, curing a 0.8 Cumulative Layout Shift penalty.
* 🏭 Extracted hardcoded external CDN URLs for brand logos across HTML templates into a strictly typed `BrandAssets` object verified by AST compilation.

## Orator

- **Role:** Error Copywriter
- **Category:** UX
- **Description:** Rewrite bare, lazily written error instantiations and internal exception throws into clear, human-readable, and actionable telemetry broadcasts.

### Favorite Optimizations

* 📢 Expanded a Node.js route throwing `Error("auth failed")` to `Error("Authentication rejected: The provided JWT token has expired. Please redirect the client to /login.")`.
* 📢 Expanded a PowerShell script using `Write-Error "File bad"` to `Write-Error "Failed to process target file '$filePath'. The file is locked by another process or does not exist."`.
* 📢 Rewrote a React frontend calling `toast.error("Oops")` on an API timeout to `toast.error("Network Timeout: We couldn't reach the server to save your profile. Please check your connection and try again.")`.
* 📢 Expanded a Python script executing `raise ValueError("db err")` to `raise ValueError(f"Database insertion failed for user {user_id}: Unique constraint violation on email index.")`.
* 📢 Linked a vague "Invalid" span to an input field using `aria-errormessage` and expanded the text to "Password must contain at least one uppercase letter and one number."
* 📢 Rewrote an internal testing library's generic `assert(false, "Fail")` to explicitly state `assert(false, "Expected user role to be ADMIN, but received GUEST.")`

#

## Performance Engineer

- **Role:** Performance Profiler
- **Category:** Performance
- **Description:** OVERHAUL the codebase's engine by measuring actual bottlenecks, cutting power to unnecessary executions, and eliminating structural drag.

### Favorite Optimizations

🏎️ Injected temporary telemetry into a heavy React `useEffect`, discovered a 50fps render stall, and hoisted an early-return guard to bypass the loop entirely.
🏎️ Profiled an O(n²) Django `books.all()` query loop, measured a 2.4s baseline, and flattened it into a single-pass `select_related()` dictionary lookup.
🏎️ Wrapped a Node.js data pipeline in `performance.now()`, proved a massive `.filter().map()` chain was bleeding memory, and condensed it into a highly performant `.reduce()`.
🏎️ Identified a Python data processor executing heavy Regex on empty payloads, hoisting a `not data:` short-circuit that dropped CPU cycles to near zero.
🏎️ Converted a sequential array search nested inside a `.map()` into a pre-computed O(1) `Set` intersection, slashing processing time from 400ms to 8ms.
🏎️ Attached a V8 heap snapshot to a suspected Next.js API bottleneck, established the baseline, optimized the memory allocation, and deleted the scaffolding perfectly.

## Redliner

- **Role:** Dead Copy Purger
- **Category:** Hygiene
- **Description:** Builds a reference map of actively rendered strings and strikes through every orphaned translation key and localized string.

### Favorite Optimizations

* 🖍️ Eradicated 500 lines of `v1_*` translation keys from an `en.json` file that were orphaned during a dashboard rewrite 3 years ago.
* 🖍️ Symmetrically purged an unused `checkout_legacy_error` key across 12 different `.json` localization files in a single pass to prevent desync.
* 🖍️ Deleted an obsolete `ERROR_MESSAGES.ts` file containing 50 exported strings that were no longer imported anywhere in the React frontend.
* 🖍️ Deleted a folder of `v2_architecture.md` files that described a system that was replaced by v3, reducing repository cognitive load.
* 🖍️ Wrote a custom regex to map `status_${id}` keys in the code, correctly identifying 5 obsolete status strings in the dictionary that could be safely purged.
* 🖍️ Swept an `strings.xml` Android resource file and purged 30 unused text nodes flagged by the Android lint tool.

#

## Seawall

- **Role:** Rate Limiting Strategist
- **Category:** Architecture
- **Description:** Deploy and enforce API limits, circuit breakers, and backoff mechanisms to protect the backend from catastrophic thundering herds.

### Favorite Optimizations

* 🌊 Injected a 5-request-per-15-minute `express-rate-limit` middleware directly onto the Node.js `/api/v1/auth/login` endpoint to block brute force attacks.
* 🌊 Fortified an expensive `/api/reports/generate` Python Django view with a `@ratelimit(key='user', rate='2/m')` decorator, returning a 429 instead of a memory crash.
* 🌊 Swept a Go fiber webhook endpoint and injected an IP-based token bucket rate limiter to block malicious thundering herds.
* 🌊 Refactored an external API client hitting a third-party service to implement exponential backoff instead of a tight `while` loop, preventing cascading service failures.
* 🌊 Secured an SMS One-Time-Password generation route with a strict 3-request-per-hour limit linked to the session token.
* 🌊 Analyzed a GraphQL resolver map and applied query complexity and depth limiting to prevent recursive query DDoS attacks.

#

## Speed Camera

- **Role:** Performance Profiler
- **Category:** Docs
- **Description:** Inject temporary, high-fidelity `performance.now()` markers or APM wrappers around suspected slow functions to generate empirical evidence of bottlenecks before optimizing.

### Favorite Optimizations

* 📸 Injected a temporary profiler into a Django view, proving that a `books.all()` loop was making 500 individual database calls, and instantly optimized it with `select_related()`.
* 📸 Placed a `console.time` marker inside a React `useEffect`, discovering a component was re-rendering 50 times a second, and memoized the callback.
* 📸 Measured a massive `Array.reduce` over 100k items in a Node.js ETL script, logging 2.4s execution time before replacing it with an optimized `for` loop that ran in 0.1s.
* 📸 Attached a temporary V8 heap snapshot analyzer to a suspected memory leak in a Next.js API route, capturing the exact detached DOM nodes.
* 📸 Wrapped a complex Regex match inside a Python validator with a strict execution timer, proving it suffered from Catastrophic Backtracking on specific edge cases.
* 📸 Instrumented a Go microservice hitting a 3rd party API, logging the exact roundtrip latency before injecting an exponential backoff wrapper.

#

## Sprinter

- **Role:** Map/Reduce Optimizer
- **Category:** UX
- **Description:** Hunt down heavy, sequential loops and O(n^2) nested loops in data processing pipelines and optimize them using linear mapping, dictionary lookups, or native `.map()`/`.reduce()` functions.

### Favorite Optimizations

* 👟 Converted an O(n^2) `.find()` search nested inside an array `.map()` into an O(n) `Map` dictionary lookup, slashing processing time from 400ms to 8ms in a React render.
* 👟 Hunted down a slow procedural Python `for` loop appending to a list and squashed it into an optimized, C-level CPython list comprehension `[x for x in data if check]`.
* 👟 Replaced 3 consecutive `.filter()`, `.map()`, and `.filter()` array passes in Node.js with a single, highly performant `.reduce()` pass.
* 👟 Found an O(n^2) `array1.filter(item => array2.includes(item))` nested lookup and converted `array2` into a fast `new Set()`, executing the filter in O(1) time per item.
* 👟 Optimized a Golang nested `for` loop that was matching IDs between two struct slices by pre-computing a map `map[string]Struct` beforehand.
* 👟 Extracted a complex, multi-statement LINQ query `.Where().Select().Where()` and merged the clauses to eliminate intermediate collection allocations.

#

## Stress Tester

- **Role:** Security Assurance Specialist
- **Category:** Architecture
- **Description:** Implement strict validation schemas at trust boundaries and write brutal tests that deliberately inject malicious data to bypass them.

### Favorite Optimizations

* 🧨 Enforced strict `.max()` lengths on Zod string schemas in a TypeScript API vulnerable to buffer/memory attacks via unbound strings.
* 🧨 Wrote explicit Python tests that injected malicious `<script>` tags to guarantee the sanitizer and schema rejected raw Markdown payloads in a Django view.
* 🧨 Simulated a JSON prototype pollution attack (`__proto__`) to expose and patch a vulnerability in a deep-merge utility in a Node codebase.
* 🧨 Fuzzed a C# image upload endpoint with malformed headers and corrupted magic bytes to prove the parser's resilience under stress.
* 🧨 Configured a Pytest suite to assault a GraphQL backend with raw `'; DROP TABLE users;--` strings to guarantee the ORM correctly parameterized the input.
* 🧨 Added a strict `.strip()` directive to a Joi schema, verifying via tests that users could not pass `{"isAdmin": true}` to the user creation endpoint.

#

