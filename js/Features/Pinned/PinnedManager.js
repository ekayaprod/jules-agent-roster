/**
 * PinnedManager
 *
 * Manages the persistence and state of user's pinned agents using localStorage.
 * @see README.md#Architecture for details on state persistence.
 */
class PinnedManager {
    /**
     * Constructs a new PinnedManager instance.
     * Initializes the pinned set from localStorage.
     * @see README.md#Quick-Start for an initialization example.
     */
    constructor() {
        this.storageKey = "jules_pinned_agents";
        this.pinned = new Set();
        this.init();
    }

    /**
     * Initializes the manager by loading saved pinned from localStorage.
     * Falls back to an empty set if parsing fails or no data is found.
     * @see README.md#Architecture for details on the storage key used.
     */
    init() {
        const storedKeys = StorageUtils.getJsonArrayItem(this.storageKey, "PINNED_LOAD_FAILED");
        if (storedKeys) {
            this.pinned = new Set(storedKeys);
        } else {
            this.pinned = new Set();
        }
    }

    /**
     * Saves the current set of pinned to localStorage.
     * Converts the internal Set to an Array before serialization.
     * @see README.md#Architecture for serialization details.
     */
    save() {
        StorageUtils.setJsonItem(this.storageKey, Array.from(this.pinned), "PinnedManager");
    }

    /**
     * Toggles the pin status of an agent by its key.
     * Automatically saves the updated set to localStorage.
     * @param {string} key - The unique identifier of the agent.
     * @returns {boolean} True if the agent is now pinned, false otherwise.
     * @see README.md#Quick-Start for an example of toggling pinned.
     */
    togglePin(key) {
        if (!key && key !== 0) return false;
        const keyStr = String(key);

        if (this.pinned.has(keyStr)) {
            this.pinned.delete(keyStr);
        } else {
            this.pinned.add(keyStr);
        }

        this.save();
        return this.pinned.has(keyStr);
    }

    /**
     * Checks if an agent is currently pinned.
     * @param {string} key - The unique identifier of the agent.
     * @returns {boolean} True if the agent is in the pinned set.
     * @see README.md#Quick-Start for an example of checking pinned status.
     */
    isPinned(key) {
        if (!key && key !== 0) return false;
        return this.pinned.has(String(key));
    }

    /**
     * Retrieves all pinned agent keys.
     * @returns {Array<string>} An array of pinned keys.
     * @see README.md#Quick-Start for an example of retrieving all pinned.
     */
    getPinned() {
        return Array.from(this.pinned);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinnedManager;
}
