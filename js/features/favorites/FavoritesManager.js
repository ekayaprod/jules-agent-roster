/**
 * FavoritesManager
 *
 * Manages the persistence and state of user's favorite agents using localStorage.
 * @see README.md#Architecture for details on state persistence.
 */
class FavoritesManager {
    /**
     * Constructs a new FavoritesManager instance.
     * Initializes the favorites set from localStorage.
     * @see README.md#Quick-Start for an initialization example.
     */
    constructor() {
        this.storageKey = "jules_favorite_agents";
        this.favorites = new Set();
        this.init();
    }

    /**
     * Initializes the manager by loading saved favorites from localStorage.
     * Falls back to an empty set if parsing fails or no data is found.
     * @see README.md#Architecture for details on the storage key used.
     */
    init() {
        const storedKeys = StorageUtils.getJsonArrayItem(this.storageKey, "FAVORITES_LOAD_FAILED");
        if (storedKeys) {
            this.favorites = new Set(storedKeys);
        } else {
            this.favorites = new Set();
        }
    }

    /**
     * Saves the current set of favorites to localStorage.
     * Converts the internal Set to an Array before serialization.
     * @see README.md#Architecture for serialization details.
     */
    save() {
        StorageUtils.setJsonItem(this.storageKey, Array.from(this.favorites), "FavoritesManager");
    }

    /**
     * Toggles the favorite status of an agent by its key.
     * Automatically saves the updated set to localStorage.
     * @param {string} key - The unique identifier of the agent.
     * @returns {boolean} True if the agent is now a favorite, false otherwise.
     * @see README.md#Quick-Start for an example of toggling favorites.
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
     * @returns {boolean} True if the agent is in the favorites set.
     * @see README.md#Quick-Start for an example of checking favorite status.
     */
    isFavorite(key) {
        if (!key && key !== 0) return false;
        return this.favorites.has(String(key));
    }

    /**
     * Retrieves all favorited agent keys.
     * @returns {Array<string>} An array of favorited keys.
     * @see README.md#Quick-Start for an example of retrieving all favorites.
     */
    getFavorites() {
        return Array.from(this.favorites);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}
