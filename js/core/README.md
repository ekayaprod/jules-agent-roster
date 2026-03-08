# Core Application Orchestration

## Purpose

The `js/core` directory houses the primary orchestrator for the Autonomous Protocol Matrix application. It coordinates sub-systems, manages the central state, and ensures that asynchronous data fetching and high-performance UI rendering operate harmoniously.

## Architecture & Lifecycle

### <a id="rosterapp-architecture"></a> RosterApp Architecture

The `RosterApp` class is the central nervous system of the application. It follows a strict initialization lifecycle designed to maximize perceived performance and minimize layout thrashing.

1. **Boot (`constructor` & `cacheElements`)**: The application boots by allocating empty state arrays (`agents`, `customAgents`) and immediately caching critical DOM elements via `document.querySelector` to avoid repetitive N-time lookups during the render cycle.
2. **Fetch (`init`)**: It concurrently initializes external service dependencies (`AgentRepository` and `JulesManager`).
3. **Render (`renderSkeletons` & `renderAgents`)**: To mask network latency, lightweight CSS skeletons are synchronously injected into the DOM. Once the agent data resolves, `renderAgents` chunks the generation of 3D flip-cards using `requestAnimationFrame`, preventing the main thread from locking up when hydrating thousands of DOM nodes.
4. **Listen (`bindEvents`)**: Rather than attaching individual event listeners to every card, a single global `click` listener is attached to the `document`. It uses `e.target.closest('[data-action="..."]')` to delegate interactions, drastically reducing memory overhead.

### <a id="search-mechanics"></a> Search & Filter Mechanics

The application utilizes a composite search pattern for instantaneous results without native DOM reflow penalties.

1. **Fuzzy Matching**: `Fuse.js` is employed against the `agent.name` and `agent.short_description` fields.
2. **Virtual Scrolling**: To prevent the browser from crashing when a user queries hundreds of matches, `Clusterize.js` creates a virtual scroll window (`searchResultsScrollArea`). It dynamically recycles a small pool of DOM nodes, giving the illusion of an infinite, un-paginated list while consuming almost zero memory.

### <a id="service-integrations"></a> Integration Boundaries

`RosterApp` acts as the coordinator between distinct functional domains:

- **Jules API (`julesManager`)**: Passes user tasks and targeted prompts to the backend execution runner.
- **Fusion Lab (`fusionLab`)**: Delegates agent-combining logic to a discrete namespace, keeping the core roster pure.
- **Persistence (`pinnedManager`)**: Synchronizes the user's localized 'pinned' preferences to override default rendering sorts.
