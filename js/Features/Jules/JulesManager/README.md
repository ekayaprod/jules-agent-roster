# JulesManager Architecture

## Overview

The `JulesManager` orchestrates all macro-interactions between the frontend UI and the backend Jules APIs via `JulesService`. It manages repository source selection, active execution sessions, terminal polling updates, and pull request aggregations.

The scope of this module is to translate complex backend polling and HTTP communication into a seamless, single-line terminal output paradigm where GitHub directly handles final completions.

## Core Workflows

### 1. Initialization and Authentication

`JulesManager.init()` loads stored API keys (`jules_api_key`, `github_api_key`). If missing, it renders the Settings Modal to enforce connection initialization before allowing repository access.

### 2. Repository Source Selection

`JulesManager.loadSources()` fetches connected GitHub repositories and populates the primary repository dropdown. Selecting a source triggers simultaneous requests to load open Pull Requests and active Jules Sessions for the specified repository.

### 3. Session Launching

The `launchSession` method orchestrates creating a new Jules execution block. It constructs an optimistic UI skeleton loader (`skeleton-pulse`) in the terminal while synchronously awaiting the backend `createSession` response, gracefully removing the UI block and reverting to the original state if the API creation fails.

### 4. Active Sessions Polling

The `loadActiveSessionsForRepo` workflow initiates a synchronized loop that pings the backend for in-progress tasks, filtering them against terminal states (completed, failed) and dynamically mapping agent IDs to matching UI emojis via `CORE_EMOJIS` or custom sets. It sets up an internal interval managed by `activeSessionsInterval` to ensure the terminal stays current.

### 5. Terminal State Updates

When a session is active, `JulesManager` polls the backend every 3-5 seconds using `startTerminalPolling()`.

- **Active State:** The terminal outputs processing logs dynamically.
- **Input State:** If a session suspends awaiting human-in-the-loop input, `_showInteractionModal()` interrupts the flow, capturing and transmitting user text via `JulesService`.
- **Terminal State:** Upon task success, failure, or PR creation, the specific session stream is halted. The UI clears the line and awaits GitHub to aggregate the output.

### 6. Pull Request Rendering

Rather than persisting old successful jobs on the frontend, `JulesManager` leverages `loadPullRequestsForRepo()` to pull active/open GitHub PRs into the terminal. This guarantees the UI is synchronized perfectly with the actual version control state.

### 7. Memory Management

The `cleanup()` method ensures no orphaned polling timers or zombie callbacks remain active. It ruthlessly sweeps through `julesPollingIntervals`, terminates the `activeSessionsInterval`, and nullifies DOM ID trackers when the user changes contexts or resets the application state.
