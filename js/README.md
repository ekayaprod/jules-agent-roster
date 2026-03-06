# JavaScript Architecture

This directory contains the core application logic for the Jules Roster. The application is built with **Vanilla JavaScript** (ES6+) and does not require a build step.

## 🏗️ Architecture

The codebase is organized into modular components that separate concerns between data fetching, UI rendering, and complex business logic (Fusion).

### Core Logic (`/`)

*   **`RosterApp.js`**: The main entry point. Initializes the application, coordinates data fetching via `AgentRepository`, and manages the main agent grid UI.

#### <a id="rosterapp-architecture"></a>🧠 RosterApp Architecture (Core Lifecycle)
The `RosterApp` orchestrates the primary application flow, emphasizing asynchronous non-blocking operations and event delegation. It is completely isolated from native build steps, prioritizing Vanilla JS performance.

1.  **Initialization Flow (`init()`)**:
    *   Caches critical DOM elements to prevent query thrashing (`cacheElements()`).
    *   Fetches the JSON agent payload asynchronously via the injected `AgentRepository`.
    *   Bootstraps the `FusionLab` environment and delegates its setup.
    *   Uses a cascading fallback to display rigorous UI error states if JSON parsing or network operations fail.
2.  **Batch Rendering Strategy (`renderAgents()`)**:
    *   The `RosterApp` handles rendering hundreds of cards using asynchronous batch chunking.
    *   Execution is spread across frames using `requestAnimationFrame` and `setTimeout` (yield points) to prevent the massive `AgentCard` DOM injections from locking the main browser thread.
3.  **Search & Layout Thrashing Prevention (`filterAgents()`)**:
    *   Search operations are debounced to `300ms` limits.
    *   The internal `Fuse.js` index is memoized and only rebuilt on state boundary changes (e.g., when a new fusion protocol unlocks).
    *   Results are limited to 25 items and injected using a `DocumentFragment` to enforce strict DOM bounds and eradicate layout thrashing.
4.  **Global Event Delegation (`bindEvents()`)**:
    *   The app entirely abandons inner loop event listeners. Interactions on `AgentCard` buttons (e.g., Copy, Download) bubble up to a single document-level `click` listener in `RosterApp`, routed securely via `dataset.action`.

*   **`FusionLab.js`**: Manages the "Fusion Lab" UI component (the bottom section), handling agent selection, animation states, and fusion execution.
*   **`FusionCompiler.js`**: The brain of the fusion system. Contains the logic for combining two agent prompts into a single, cohesive "Fusion Protocol" (XML/JSON output).
*   **`utils/PromptParser.js`**: A utility for parsing and structuring raw Markdown prompts into machine-readable formats (e.g., XML sections).
*   **`FusionIndex.js`**: Manages the "Fusion Index" (the shelf), persisting discovered fusions to `localStorage` and unlocking them as users experiment.

### Services (`/services`)

*   **`AgentRepository.js`**: Responsible for fetching and parsing `agents.json` and `custom_agents.json`. It normalizes data and handles error states for network requests.

### UI Components (`/ui`)

*   **`AgentCard.js`**: A functional component that generates the HTML for individual agent cards. It handles efficient DOM updates and event delegation setup.
*   **`ToastNotification.js`**: A lightweight, accessible toast notification system for user feedback (e.g., "Copied to clipboard").
*   **`ClipboardUtils.js`**: A wrapper around the Clipboard API with fallbacks for older browsers. Handles the logic for copying prompts and animating buttons.

### Utilities (`/utils`)

*   **`PerformanceUtils.js`**: performance-critical helpers, such as `debounce`, used to optimize search inputs and scroll listeners.

## 🔄 Data Flow

1.  **Initialization**: `index.html` loads scripts in dependency order (Core -> Utils -> UI -> App).
2.  **Bootstrap**: `RosterApp` is instantiated and calls `init()`.
3.  **Data Fetching**: `AgentRepository` fetches `agents.json` and `custom_agents.json`.
4.  **Rendering**:
    *   `RosterApp` renders the main grid using `AgentCard`.
    *   `RosterApp` initializes `FusionLab` with the fetched agent data.
5.  **Interaction**:
    *   User selects agents in `FusionLab`.
    *   `FusionLab` calls `FusionCompiler.fuse(agentA, agentB)`.
    *   Result is displayed and optionally saved to `FusionIndex`.

## 🚀 Quick Start / Usage

Since there is no build step, you can edit these files directly.

**To add a new Logic Module:**

1.  Create your file (e.g., `js/MyModule.js`).
2.  Add a `<script>` tag to `index.html` *before* `RosterApp.js`.
3.  Instantiate or use it within `RosterApp.js` or `FusionLab.js`.

**To modify the Fusion Algorithm:**

*   Edit `js/FusionCompiler.js`. This class contains the specific rules for how prompt sections (Task, Context, Constraints) are merged.

## 🧪 Testing

There are no unit tests in this directory. All verification is done via the Python scripts in the `/verification` directory, which run end-to-end tests against the running application.
