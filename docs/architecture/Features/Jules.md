# Jules Manager Architecture

The **Jules Manager** handles the integration between the Roster application and the Jules Agent Execution API. It is responsible for authenticating the user, managing GitHub source repositories, and providing a real-time polling interface for launching and monitoring agent task sessions.

## Core Responsibilities

- **Authentication & Initialization:** Captures and stores the user's Jules API Key via the UI, subsequently bootstrapping the internal `window.julesService`.
- **Source Management:** Fetches and populates available GitHub repositories authorized for the current Jules account.
- **Session Execution:** Dispatches user tasks accompanied by AI Agent instructions to target repositories.
- **Real-Time Polling & Dashboard:** Continuously polls active session states, updating the Jules Terminal UI with live agent progress, input requests, error states, and finalized Pull Request links.

## Architecture Flow

### 1. Initialization (`init`)

The system starts by attempting to load an existing `jules_api_key` from local storage. If present, it connects to the `julesService` immediately; otherwise, it surfaces the Settings Modal to request credentials.

### 2. Loading Sources (`loadSources`)

Once authenticated, the manager queries the API for configured GitHub repositories and populates the runner panel selection dropdown (`#julesRepoPicker`).

### 3. Session Management (`launchSession` & `loadActiveSessionsForRepo`)

When an agent is triggered, the manager creates a temporary session placeholder in the UI and calls the backend to formally `createSession`. Simultaneously, it initializes a 5-second polling interval on `getSessions` to pull the latest history and synchronize the dashboard list (excluding manually dismissed or finalized PR sessions).

### 4. Real-Time Terminal Polling (`startTerminalPolling`)

For every active session rendered in the UI, an independent 3-second polling loop fetches detailed activity logs (`getActivities`). It processes these logs chronologically to:

- Detect updated progress messages.
- Pause and prompt the user if input is required.
- Flag errors and visually mark failures.
- Transition the session to "Completed" when an artifact (such as a Drafted PR) is finalized.

### 5. Cleanup (`cleanup`)

When navigating away or resetting the view, all active polling intervals and tracking sets are explicitly cleared to prevent memory leaks and redundant network requests.
