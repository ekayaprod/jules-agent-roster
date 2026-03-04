# Favorites Feature

## Purpose
This directory encapsulates the persistence and state management logic for user's favorite agents. It isolates the local storage interactions and provides a clean interface for toggling and querying favorite statuses.

## Quick Start
To manage favorites, simply instantiate the manager. It will automatically load existing favorites from `localStorage`.

```javascript
// 1. Instantiate the manager
const favoritesManager = new FavoritesManager();

// 2. Toggle a favorite status
const isNowFavorite = favoritesManager.toggleFavorite('agent_123');

// 3. Check if an agent is a favorite
if (favoritesManager.isFavorite('agent_123')) {
    console.log("Agent 123 is a favorite!");
}

// 4. Retrieve all favorite keys
const allFavorites = favoritesManager.getFavorites();
```

## Architecture
The Favorites feature relies on a simple, vanilla JavaScript class that acts as a wrapper around the browser's `localStorage` via the `StorageUtils` helper class.

1. **`FavoritesManager.js`**: The core logic engine. It uses a JavaScript `Set` internally to ensure uniqueness of favorite keys. It handles the serialization to and from `localStorage` under the key `jules_favorite_agents`.

The class is designed to be a singleton in practice, usually instantiated once at the application root and passed down or accessed globally, although it can be instantiated multiple times safely as they all read from and write to the same `localStorage` key.
