# 🧭 Project Roadmap

> "A roadmap is a promise. The destination must be clear." - Navigator

This document outlines the strategic direction for the **Jules Agent Roster**.

## 📍 Phase 1: Stabilization & Foundation (Current)

<p><em>Focus: Accessibility, Portability, and Core Agent Quality</em></p>

- [x] **Single-File Portability**: Ensure the entire roster remains a single `index.html` for easy deployment/usage.
- [x] **Accessibility First**: Maintain high A11y standards (ARIA labels, keyboard navigation, reduced motion support).
- [x] **Agent Verification**: Manually verify that all agent prompts adhere to the "Plus" philosophy. (Verified in v0.1.1)
- [x] **Documentation**: Ensure `README.md` accurately reflects the latest agent capabilities.

## 🚀 Phase 2: Expansion & Specialization (Q3)

<p><em>Focus: Broadening the Roster</em></p>

- [ ] **Interactive Jules API Dashboard Modal**: Make all active processes in the dashboard clickable to display a full modal thread. When Jules API pauses and requires user input (`Needs Input` status), the modal should provide a chat-like interface to reply and continue the execution thread.
  - *Estimation*: ~250-300 LOC. Requires creating a new modal UI, rendering markdown for full activity history, and adding `replyToSession` (POST) network methods to `JulesAPI.js`.
- [ ] **New Agent Categories**: Explore specialized agents for Data Science, DevOps, and Mobile dev.
- [ ] **Framework-Specific Variants**: Create variants of agents for specific stacks (e.g., Next.js vs. Remix vs. Vue).
- [ ] **Community Contributions**: Streamline the process for community submitted agents.
- [x] **Dark/Light Mode**: Add toggle (currently Dark only). (Shipped: b70bd3f)
- [x] **Persistence**: Add LocalStorage support for "Favorites" or "Recently Used".

## 🛠️ Phase 3: Tooling & Automation (Future)

<p><em>Focus: Quality Assurance</em></p>

- [ ] **Prompt Validation**: Implement scripts to parse and validate the JSON/Markdown structure within agent prompts.
- [x] **Automated Testing**: Add basic tests for the `index.html` UI logic (search, filtering, copying).
- [ ] **CLI Tool**: Potential CLI to fetch specific agents directly into the terminal.

## 📦 Backlog (Unscheduled)

- [ ] (Empty)

## 🧪 Innovation Backlog (Spark)

- [ ] [DX] Idea: Adopt `emoji-regex` via CDN to replace brittle custom string utilities in `js/utils/StringUtils.js` for emoji handling, standardizing Unicode processing and reducing error-prone custom regex logic. (Source: github.com/mathiasbynens/emoji-regex)
- [UX] Idea: Custom agent tile layout, allowing users to put their favourite fusion agent cards on the main page for easy access - using local storage (Source: User Request)
- [x] [UX] Idea: Adopt `fuse.js` (20k stars) for fuzzy search to fix strict typo failures. (Source: fusejs.io)
- [ ] [Security] Idea: Integrate `DOMPurify` to sanitize Fusion Lab output and prevent XSS. (Source: github.com/cure53/DOMPurify)
- [x] [Performance] Idea: Implement debounce pattern for search input to prevent layout thrashing on every keystroke. (Source: lodash) (Shipped: [Commit 73228b7](https://github.com/google/jules/commit/73228b7))
- [ ] [DX] Idea: Standardize clipboard logic with `clipboard-polyfill` to replace deprecated execCommand. (Source: github.com/lgarron/clipboard-polyfill)
- [ ] [Performance] Idea: Adopt `UnoCSS` via CDN to eliminate >600 lines of inline CSS in index.html while maintaining the zero-build-step requirement. (Source: unocss.dev)
- [ ] [DX] Idea: Adopt `lit-html` via CDN to replace brittle manual string concatenation (innerHTML) in AgentCard.js and FusionLab.js, standardizing templating safely without a build step. (Source: lit.dev)
- [x] [DX] Idea: Introduce a standard `package.json` to define npm scripts for verification and task running, replacing scattered manual python scripts and unifying DX. (Shipped: [Commit 861d7fd](https://github.com/google/jules/commit/861d7fd57cbf9aa816fe84fefb62ce9b89a3896d))
- [x] [Performance] Idea: Implement virtualized lists via `Clusterize.js` (via CDN) to render large agent rosters without layout thrashing, resolving the 'Missing pagination' audit finding while maintaining the zero-build-step constraint. (Source: clusterize.js.org) (Shipped: [Commit b1e678d](https://github.com/google/jules/commit/b1e678d225e476d060b19451f3fc25871fc1e27f))
- [UX] Idea: Adopt `focus-trap` via CDN to standardize keyboard navigation and modal accessibility in FusionLab, replacing brittle custom roving tabindex logic (`handleGridKeydown`). (Source: github.com/focus-trap/focus-trap)
