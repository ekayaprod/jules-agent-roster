# Jules Manager Feature

## Purpose

The Jules Manager is a domain-specific module responsible for managing interactions with the Jules Execution API (v1alpha). It abstracts the complexities of API key configuration, asynchronous AI session polling, and stateful UI reconciliation to present active agent executions cleanly within the `#julesTerminal` interface.

## Architecture

The application handles asynchronous execution and state management without relying on WebSockets, by using high-frequency polling (`setInterval`) for tracking agent activities.

- **State Tracking:** The `JulesManager` class actively maintains memory of active polling intervals (`julesPollingIntervals`) to avoid memory leaks. It strictly controls which sessions are rendered (`renderedSessionIds`) and tracks users' active UI dismissals (`dismissedSessionIds`) to prevent server-polled sessions from re-rendering in the UI once closed.
- **UI Reconciliation:** Instead of destructively overwriting the `#julesTerminal` with `innerHTML` (which would orphaned DOM listeners and active timers), the manager uses targeted DOM manipulation (`appendChild`, `insertBefore`, `remove`) to fluidly update individual session items (`.dashboard-item`) based on ID tracking.
- **Error Boundaries:** The module upgrades generic throws by immediately manifesting errors within the respective session's UI badge and metadata, converting them into actionable user feedback rather than silent console failures.

## Lifecycle

1. **`init`**: Bootstraps the manager by verifying and configuring the user's API key. If the key is valid, it immediately triggers the next phase.
2. **`loadSources`**: Fetches the available GitHub repositories associated with the user's API key to populate the repository picker dropdown, allowing them to define the execution context.
3. **`launchSession`**: Upon user command, this method triggers an AI agent execution via the Jules API `createSession` endpoint. It instantly creates a temporary optimistic UI component while awaiting the real session ID from the server.
4. **`startTerminalPolling`**: Once a valid session ID is acquired, this method sets up a recurring interval to poll `getActivities`. It parses the asynchronous event stream to update the dashboard item progressively from "In Progress" to "Completed" (or "Failed"), eventually rendering a direct link to any drafted Pull Requests.
