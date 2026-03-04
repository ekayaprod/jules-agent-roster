/**
 * FavoritesManager
 *
 * Manages the persistence and state of user's favorite agents using localStorage.
 */
class FavoritesManager {
    constructor() {
        this.storageKey = "jules_favorite_agents";
        this.favorites = new Set();
        this.init();
    }

    /**
     * Initializes the manager by loading saved favorites from localStorage.
     */
    init() {
        let stored = null;
        try {
            if (typeof localStorage === 'undefined') return;
            stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const keys = JSON.parse(stored);
                if (Array.isArray(keys)) {
                    this.favorites = new Set(keys);
                }
            }
        } catch (error) {
            console.error(JSON.stringify({
                event: "FAVORITES_LOAD_FAILED",
                stored: stored,
                error: error.message
            }));
            this.favorites = new Set();
        }
    }

    /**
     * Saves the current set of favorites to localStorage.
     */
    save() {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.favorites)));
        } catch (error) {
            console.warn("FavoritesManager: Failed to save to localStorage", error);
        }
    }

    /**
     * Toggles the favorite status of an agent by its key.
     * @param {string} key - The unique identifier of the agent.
     * @returns {boolean} True if the agent is now a favorite, false otherwise.
     */
    toggleFavorite(key) {
        if (!key && key !== 0) return false;
        const keyStr = String(key);

        if (this.favorites.has(keyStr)) {
            this.favorites.delete(keyStr);
        } else {
            this.favorites.add(keyStr);
        }

        this.save();
        return this.favorites.has(keyStr);
    }

    /**
     * Checks if an agent is currently favorited.
     * @param {string} key - The unique identifier of the agent.
     * @returns {boolean} True if favorited.
     */
    isFavorite(key) {
        if (!key && key !== 0) return false;
        return this.favorites.has(String(key));
    }

    /**
     * Retrieves all favorited agent keys.
     * @returns {Array<string>} An array of favorited keys.
     */
    getFavorites() {
        return Array.from(this.favorites);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}
