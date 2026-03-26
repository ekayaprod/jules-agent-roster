# Search Controller Architecture

## Purpose

The `SearchController` manages the fuzzy matching and virtual scrolling logic required to parse and render large agent datasets instantly. By isolating the search operations, it prevents the main application from suffering layout thrashing and massive DOM reflows when processing complex query filters.

## <a id="searchcontroller-architecture"></a> Architecture

The controller employs a dual-library strategy to ensure high performance without locking the main thread.

### <a id="fuzzy-matching"></a> 1. Fuzzy Matching (`Fuse.js`)

It utilizes `Fuse.js` for fast, lightweight fuzzy matching against standard and custom (fusion) agent data.

- The `FUSE_OPTIONS` strictly target the `agent.name` and `agent.short_description` fields.
- The search index is cached in `this.app._searchCache`. The controller only rebuilds the index when a state boundary changes (e.g., when a new fusion protocol unlocks or the base agent length differs), preventing constant memory reallocation.
- **Web Worker Offloading:** To prevent the main thread from locking up during complex queries on large datasets, the actual initialization and search execution of the `Fuse.js` instance are offloaded to a dedicated Web Worker (`SearchWorker.js`). The controller communicates with the worker asynchronously via `postMessage`.

### <a id="virtual-scrolling"></a> 2. Virtual Scrolling (`Clusterize.js`)

To prevent the browser from crashing when a user queries hundreds of matches, the controller dynamically proxies rendering through `Clusterize.js`.

- Instead of injecting all matched `AgentCard` nodes into the DOM simultaneously, it recycles a small pool of active row wrappers defined by `SEARCH_CLUSTERIZE_OPTIONS`.
- This gives the illusion of an infinite, un-paginated list while consuming almost zero active memory, seamlessly scaling regardless of dataset size.

### <a id="search-mechanics"></a> 3. Search Mechanics & State Management

- **Pre-cached DOM:** Interactions dynamically toggle the visibility of containers utilizing `DOMUtils.setElementsDisplay` against pre-cached elements (like `this.app.elements.grid`), bypassing expensive N-time `document.querySelectorAll()` traversals.
- **Visual Feedback:** It automatically transitions CSS display states for the search input (X to clear), the zero-state empty container, and an invisible live-region announcer (`app.elements.announcer`) for screen reader support.

### <a id="initialization"></a> 4. Initialization

The `SearchController` is typically instantiated within `RosterApp.js` and maintains a weak reference to the application context to trigger these layout transformations safely.

## Quick Start

To instantiate and bind the `SearchController`:

```javascript
// 1. Instantiate within the main App constructor
this.searchController = new SearchController(this);

// 2. Bind debounced input events
const searchInput = document.getElementById('search-box');
const handleSearch = PerformanceUtils.debounce((e) => {
    this.searchController.filterAgents(e.target.value);
}, 300);

searchInput.addEventListener('input', handleSearch);

// 3. Clear search state
document.getElementById('clear-btn').addEventListener('click', () => {
    this.searchController.clearSearch();
});
```
