# 🧭 Project Roadmap

> "A roadmap is a promise. The destination must be clear." - Navigator

This document outlines the strategic direction for the **Jules Agent Roster**.

## 📍 Phase 1: Stabilization & Foundation (Current)

<p><em>Focus: Accessibility, Portability, and Core Agent Quality</em></p>

- [x] **Single-File Portability**: Ensure the entire roster remains a single `index.html` for easy deployment/usage.
- [x] **Accessibility First**: Maintain high A11y standards (ARIA labels, keyboard navigation, reduced motion support).
- [x] **Agent Verification**: Manually verify that all agent prompts adhere to the "Plus" philosophy. (Verified in v1.0.0)
- [x] **Documentation**: Ensure `README.md` accurately reflects the latest agent capabilities.

## 🚀 Phase 2: Expansion & Specialization (Q3)

<p><em>Focus: Broadening the Roster</em></p>

- [x] **Interactive Jules API Dashboard Modal**: Make all active processes in the dashboard clickable to display a full modal thread. When Jules API pauses and requires user input (`Needs Input` status), the modal should provide a chat-like interface to reply and continue the execution thread. (Shipped: [Commit 25c76bd](https://github.com/ekayaprod/jules-agent-roster/commit/25c76bd))
  - _Estimation_: ~250-300 LOC. Requires creating a new modal UI, rendering markdown for full activity history, and adding `replyToSession` (POST) network methods to `JulesAPI.js`.
- [ ] **New Agent Categories**: Explore specialized agents for Data Science, DevOps, and Mobile dev.
- [ ] **Framework-Specific Variants**: Create variants of agents for specific stacks (e.g., Next.js vs. Remix vs. Vue).
- [ ] **Community Contributions**: Streamline the process for community submitted agents.
- [x] **Dark/Light Mode**: Add toggle (currently Dark only). (Shipped: [Commit b70bd3f](https://github.com/ekayaprod/jules-agent-roster/commit/b70bd3f))
- [x] **Persistence**: Add LocalStorage support for "Favorites" or "Recently Used". (Shipped: [Commit 9bdba40](https://github.com/ekayaprod/jules-agent-roster/commit/9bdba40))

## 🛠️ Phase 3: Tooling & Automation (Future)

<p><em>Focus: Quality Assurance</em></p>

- [x] **Prompt Validation**: Implement scripts to parse and validate the JSON/Markdown structure within agent prompts. (Shipped: [Commit ce27775](https://github.com/ekayaprod/jules-agent-roster/commit/ce27775))
- [x] **Automated Testing**: Add basic tests for the `index.html` UI logic (search, filtering, copying). (Shipped: [Commit 253f2d9](https://github.com/ekayaprod/jules-agent-roster/commit/253f2d9))
- [x] **Standardize Testing Assertions**: Adopt `@testing-library/jest-dom` to enforce semantic assertions, decoupling tests from structural CSS/DOM implementation details. (Shipped: [Commit a07a675](https://github.com/ekayaprod/jules-agent-roster/commit/a07a675))
- [x] **Refactor JulesManager Monolith**: Extract shared logic and distinct functional domains into standalone utility classes or specialized sub-controllers. (Shipped: [Commit 532bb64](https://github.com/ekayaprod/jules-agent-roster/commit/532bb64))
- [x] **Decentralize Core RosterApp Monolith**: Extract distinct sub-domains into specialized delegate classes leaving `RosterApp` strictly as an event-driven orchestrator. (Shipped: [Commit 51ef57b](https://github.com/ekayaprod/jules-agent-roster/commit/51ef57b))
- [ ] **CLI Tool**: Potential CLI to fetch specific agents directly into the terminal.

## 📦 Backlog (Unscheduled)

- [ ] (Empty)

## 🧪 Innovation Backlog (Spark)

### Migrate Core Logic to TypeScript

**The Problem:** The application relies heavily on dynamic type coercion (e.g. `typeof window !== 'undefined'`) and lacks type safety across complex JSON payloads and UI interactions, leading to brittle unit tests and runtime `TypeError` issues.
**The Solution:** Adopt `TypeScript` across the core services and UI components.
**The Benefit:** Standardizes data models via interfaces, strictly typing network payloads, resolving ambiguous object assignments, and eradicating null-reference bugs at compile-time.

- [x] [UX] Idea: Custom agent tile layout, allowing users to put their favourite fusion agent cards on the main page for easy access - using local storage (Source: User Request) (Shipped: [Commit feeca72](https://github.com/ekayaprod/jules-agent-roster/commit/feeca72))
- [x] [UX] Idea: Adopt `fuse.js` (20k stars) for fuzzy search to fix strict typo failures. (Source: fusejs.io) (Shipped: [Commit a54cf1e](https://github.com/ekayaprod/jules-agent-roster/commit/a54cf1e))
- [x] [Performance] Idea: Implement debounce pattern for search input to prevent layout thrashing on every keystroke. (Source: lodash) (Shipped: [Commit 73228b7](https://github.com/ekayaprod/jules-agent-roster/commit/73228b7))

### Standardize Unicode Processing with `emoji-regex`

**The Problem:** The project relies on custom, error-prone Regex logic for emoji handling, causing DX friction and failing on Unicode edge cases.
**The Solution:** Adopt `emoji-regex` via CDN.
**The Benefit:** Standardizes Unicode processing safely and eliminates brittle custom logic.

### Integrate `DOMPurify` for XSS Prevention

**The Problem:** The application lacks a robust, standardized way to sanitize dynamically rendered outputs in Fusion Lab, leaving potential XSS vulnerabilities.
**The Solution:** Integrate `DOMPurify` via CDN.
**The Benefit:** Standardizes sanitization with a vetted, security-focused library without requiring a build step.

### Standardize Clipboard Logic with `clipboard-polyfill`

**The Problem:** The application relies on the deprecated `document.execCommand('copy')` as a fallback, which causes silent failures in modern browsers.
**The Solution:** Adopt `clipboard-polyfill` via CDN.
**The Benefit:** Provides a robust, standard-compliant fallback for clipboard operations.

### Adopt `UnoCSS` for Utility Styling

**The Problem:** The `index.html` file contains excessive inline CSS, making maintenance difficult and causing style duplication across components.
**The Solution:** Adopt `UnoCSS` via CDN.
**The Benefit:** Eliminates inline CSS bloat through on-demand utility classes while maintaining the strict zero-build-step requirement.

### Standardize UI Templating

**The Problem:** The application relies on brittle manual string concatenation (`innerHTML`) in UI components like `AgentCard.js` and `FusionLab.js`, causing DX friction and XSS risks.
**The Solution:** Adopt a lightweight, vetted templating engine (e.g., `lit-html`) via CDN.
**The Benefit:** Standardizes templating safely, preventing XSS, and eliminates multi-line string errors without requiring a build step.

- [x] [DX] Idea: Introduce a standard `package.json` to define npm scripts for verification and task running, replacing scattered manual python scripts and unifying DX. (Shipped: [Commit 861d7fd](https://github.com/ekayaprod/jules-agent-roster/commit/861d7fd))
- [x] [Performance] Idea: Implement virtualized lists via `Clusterize.js` (via CDN) to render large agent rosters without layout thrashing, resolving the 'Missing pagination' audit finding while maintaining the zero-build-step constraint. (Source: clusterize.js.org) (Shipped: [Commit b1e678d](https://github.com/ekayaprod/jules-agent-roster/commit/b1e678d))
- [x] [UX] Idea: Adopt `focus-trap` via CDN to standardize keyboard navigation and modal accessibility in FusionLab, replacing brittle custom roving tabindex logic (`handleGridKeydown`). (Source: github.com/focus-trap/focus-trap) (Shipped: [Commit 572a514](https://github.com/ekayaprod/jules-agent-roster/commit/572a514))

### Migrate Date Utilities to `date-fns`

**The Problem:** The app manually formats dates using complex, scattered Date object math across multiple domains (e.g., polling timers, dashboard timestamps), leading to brittle tests and inconsistent display logic.
**The Solution:** Adopt `date-fns` (or similar utility) via CDN.
**The Benefit:** Standardizes time-based math and formatting safely, eliminating custom drift and natively supporting precise, edge-case tested timestamp manipulations.

### Decentralize `index.html` Structural Monolith

**The Problem:** The `index.html` file has grown to over 900 lines, becoming a structural monolith that tightly couples layout, inline scripts, and disparate UI domains.
**The Solution:** Decentralize `index.html` by extracting distinct functional domains into domain-specific templates or colocated components.
**The Benefit:** Standardizes domain boundaries, drastically improves maintainability, and prevents future merge conflicts in the core entry point.
