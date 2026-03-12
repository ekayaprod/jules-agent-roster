# JulesManager Architecture

## Overview
The `JulesManager` orchestrates all macro-interactions between the frontend UI and the backend Jules APIs via `JulesService`. It manages repository source selection, active execution sessions, terminal polling updates, and pull request aggregations.

The scope of this module is to translate complex backend polling and HTTP communication into a seamless, single-line terminal output paradigm where GitHub directly handles final completions.

## Core Workflows

### 1. Initialization and Authentication
`JulesManager.init()` loads stored API keys (`jules_api_key`, `github_api_key`). If missing, it renders the Settings Modal to enforce connection initialization before allowing repository access.

### 2. Repository Source Selection
`JulesManager.loadSources()` fetches connected GitHub repositories and populates the primary repository dropdown. Selecting a source triggers simultaneous requests to load open Pull Requests and active Jules Sessions for the specified repository.

### 3. Polling and Session Management
When a session is active, `JulesManager` polls the backend every 3-5 seconds using `startTerminalPolling()`.
- **Active State:** The terminal outputs processing logs dynamically.
- **Input State:** If a session suspends awaiting human-in-the-loop input, `_showInteractionModal()` interrupts the flow, capturing and transmitting user text via `JulesService`.
- **Terminal State:** Upon task success, failure, or PR creation, the specific session stream is halted. The UI clears the line and awaits GitHub to aggregate the output.

### 4. Pull Request Rendering
Rather than persisting old successful jobs on the frontend, `JulesManager` leverages `loadPullRequestsForRepo()` to pull active/open GitHub PRs into the terminal. This guarantees the UI is synchronized perfectly with the actual version control state.
