# PinnedManager Architecture

## Architecture

The `PinnedManager` manages the state and persistence of a user's pinned agents across application sessions. It relies on standard browser `localStorage` as its data layer.

- **State Persistence:** The internal state is managed via a JavaScript `Set` to enforce uniqueness of the pinned agent identifiers.
- **Storage Key:** The data is stored under the exact local storage key `jules_pinned_agents`.
- **Serialization:** When saving to `localStorage`, the internal `Set` is explicitly converted to an array before being stringified to JSON by `StorageUtils`. During initialization, the parsed JSON array is hydrated back into the runtime `Set`.

## Quick Start

The functional API exposes strict methods to interact with the pinned agents.

```javascript
// Toggling a pin
const isNowPinned = window.julesManager.app.pinnedManager.togglePin("agent_123");

// Checking if an agent is pinned
const pinnedStatus = window.julesManager.app.pinnedManager.isPinned("agent_123");

// Retrieving all pinned agents
const allPinnedKeys = window.julesManager.app.pinnedManager.getPinned();
// -> ["agent_123", "agent_456"]
```
