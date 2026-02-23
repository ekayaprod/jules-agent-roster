# 🧭 Project Roadmap

> "A roadmap is a promise. The destination must be clear." - Navigator

This document outlines the strategic direction for the **Jules Agent Roster**.

## 📍 Phase 1: Stabilization & Foundation (Current)
*Focus: Accessibility, Portability, and Core Agent Quality*

- [x] **Single-File Portability**: Ensure the entire roster remains a single `index.html` for easy deployment/usage.
- [x] **Accessibility First**: Maintain high A11y standards (ARIA labels, keyboard navigation, reduced motion support).
- [x] **Agent Verification**: Manually verify that all agent prompts adhere to the "Plus" philosophy. (Verified in v0.1.1)
- [x] **Documentation**: Ensure `README.md` accurately reflects the latest agent capabilities.

## 🚀 Phase 2: Expansion & Specialization (Q3)
*Focus: Broadening the Roster*

- [ ] **New Agent Categories**: Explore specialized agents for Data Science, DevOps, and Mobile dev.
- [ ] **Framework-Specific Variants**: Create variants of agents for specific stacks (e.g., Next.js vs. Remix vs. Vue).
- [ ] **Community Contributions**: Streamline the process for community submitted agents.
- [ ] **Dark/Light Mode**: Add toggle (currently Dark only).
- [ ] **Persistence**: Add LocalStorage support for "Favorites" or "Recently Used".

## 🛠️ Phase 3: Tooling & Automation (Future)
*Focus: Quality Assurance*

- [ ] **Prompt Validation**: Implement scripts to parse and validate the JSON/Markdown structure within agent prompts.
- [x] **Automated Testing**: Add basic tests for the `index.html` UI logic (search, filtering, copying).
- [ ] **CLI Tool**: Potential CLI to fetch specific agents directly into the terminal.

## 📦 Backlog (Unscheduled)
- [ ] (Empty)

## 🧪 Innovation Backlog (Spark)
- [ ] [UX] Idea: Adopt `fuse.js` (20k stars) for fuzzy search to fix strict typo failures. (Source: fusejs.io)
- [ ] [Security] Idea: Integrate `DOMPurify` to sanitize Fusion Lab output and prevent XSS. (Source: github.com/cure53/DOMPurify)
- [ ] [Performance] Idea: Implement debounce pattern for search input to prevent layout thrashing on every keystroke. (Source: lodash)
- [ ] [DX] Idea: Standardize clipboard logic with `clipboard-polyfill` to replace deprecated execCommand. (Source: github.com/lgarron/clipboard-polyfill)
