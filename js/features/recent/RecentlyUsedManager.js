/**
 * RecentlyUsedManager
 *
 * Manages the persistence and state of user's recently used agents using localStorage.
 */
class RecentlyUsedManager {
    constructor() {
        this.storageKey = "jules_recently_used_agents";
        this.maxItems = 10;
        this.recent = [];
        this.init();
    }

    /**
     * Initializes the manager by loading saved recent agents from localStorage.
     */
    init() {
        const storedKeys = StorageUtils.getJsonArrayItem(this.storageKey, "RECENTLY_USED_LOAD_FAILED");
        this.recent = storedKeys || [];
    }

    /**
     * Saves the current set of recently used agents to localStorage.
     */
    save() {
        StorageUtils.setJsonItem(this.storageKey, this.recent, "RecentlyUsedManager");
    }

    /**
     * Adds an agent to the recently used list.
     * @param {string} key - The unique identifier of the agent.
     */
    addRecent(key) {
        if (!key && key !== 0) return;
        const keyStr = String(key);

        // Remove if it already exists to put it at the front
        const index = this.recent.indexOf(keyStr);
        if (index > -1) {
            this.recent.splice(index, 1);
        }

        this.recent.unshift(keyStr);

        // Cap to maxItems
        if (this.recent.length > this.maxItems) {
            this.recent = this.recent.slice(0, this.maxItems);
        }

        this.save();
    }

    /**
     * Retrieves all recently used agent keys.
     * @returns {Array<string>} An array of recent keys.
     */
    getRecent() {
        return Array.from(this.recent);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecentlyUsedManager;
}
