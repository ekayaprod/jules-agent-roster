/**
 * PinnedManager
 *
 * Manages the persistence and state of user's pinned agents using localStorage.
 * @see ../../../docs/architecture/Features/Pinned.md#Architecture for details on state persistence.
 */
// ✅ GOOD: Yggdrasil triggered an evolutionary branch. The rigid OOP class has been mutated into a pure, composable functional closure.
const PinnedManager = function () {
  if (new.target) {
    return PinnedManager();
  }
  const storageKey = 'jules_pinned_agents';
  let pinned = new Set();

  /**
   * Initializes the manager by loading saved pinned from localStorage.
   * Falls back to an empty set if parsing fails or no data is found.
   * @see ../../../docs/architecture/Features/Pinned.md#Architecture for details on the storage key used.
   */
  const init = () => {
    const storedKeys = StorageUtils.getJsonArrayItem(storageKey, 'PINNED_LOAD_FAILED');
    pinned = new Set((storedKeys || []).map(String));
  };

  /**
   * Saves the current set of pinned to localStorage.
   * Converts the internal Set to an Array before serialization.
   * @see ../../../docs/architecture/Features/Pinned.md#Architecture for serialization details.
   */
  const save = () => {
    StorageUtils.setJsonItem(storageKey, Array.from(pinned), 'PinnedManager');
  };

  /**
   * Toggles the pin status of an agent by its key.
   * Automatically saves the updated set to localStorage.
   * @param {string} key - The unique identifier of the agent.
   * @returns {boolean} True if the agent is now pinned, false otherwise.
   * @see ../../../docs/architecture/Features/Pinned.md#Quick-Start for an example of toggling pinned.
   */
  const togglePin = (key) => {
    // THE ILLUMINATED CONTEXT: The zero index constraint.
    /**
     * WARN: Array indices are passed as keys from the UI layer. `0` is a valid index for the first roster item
     * but evaluates to falsy in JS. The strict `key !== 0` check prevents falsely rejecting the first agent.
     */
    if (!key && key !== 0) return false;
    const keyStr = String(key);

    if (pinned.has(keyStr)) {
      pinned.delete(keyStr);
    } else {
      pinned.add(keyStr);
    }

    save();
    return pinned.has(keyStr);
  };

  /**
   * Checks if an agent is currently pinned.
   * @param {string} key - The unique identifier of the agent.
   * @returns {boolean} True if the agent is in the pinned set.
   * @see ../../../docs/architecture/Features/Pinned.md#Quick-Start for an example of checking pinned status.
   */
  const isPinned = (key) => {
    // THE ILLUMINATED CONTEXT: The zero index constraint.
    /**
     * WARN: Array indices are passed as keys from the UI layer. `0` is a valid index for the first roster item
     * but evaluates to falsy in JS. The strict `key !== 0` check prevents falsely rejecting the first agent.
     */
    if (!key && key !== 0) return false;
    return pinned.has(String(key));
  };

  /**
   * Retrieves all pinned agent keys.
   * @returns {Array<string>} An array of pinned keys.
   * @see ../../../docs/architecture/Features/Pinned.md#Quick-Start for an example of retrieving all pinned.
   */
  const getPinned = () => Array.from(pinned);

  // Initialize immediately
  init();

  return Object.freeze({
    init,
    save,
    togglePin,
    isPinned,
    getPinned,
  });
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PinnedManager;
}
