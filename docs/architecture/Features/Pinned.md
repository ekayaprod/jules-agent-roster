# Pinned Feature

## Purpose

This directory encapsulates the persistence and state management logic for user's pinned agents. It isolates the local storage interactions and provides a clean interface for toggling and querying pinned statuses.

## Quick Start

To manage pinned agents, simply instantiate the manager. It will automatically load existing pinned agents from `localStorage`.

```javascript
// 1. Instantiate the manager
const pinnedManager = new PinnedManager();

// 2. Toggle a pinned status
const isNowPinned = pinnedManager.togglePin('agent_123');

// 3. Check if an agent is pinned
if (pinnedManager.isPinned('agent_123')) {
  console.log('Agent 123 is pinned!');
}

// 4. Retrieve all pinned keys
const allPinned = pinnedManager.getPinned();
```

## Architecture

The Pinned feature relies on a simple, vanilla JavaScript class that acts as a wrapper around the browser's `localStorage` via the `StorageUtils` helper class.

1. **`PinnedManager.js`**: The core logic engine. It uses a JavaScript `Set` internally to ensure uniqueness of pinned keys. It handles the serialization to and from `localStorage` under the key `jules_pinned_agents`.

The class is designed to be a singleton in practice, usually instantiated once at the application root and passed down or accessed globally, although it can be instantiated multiple times safely as they all read from and write to the same `localStorage` key.
