class FusionIndex {
  /**
   * Manages the collectible shelf of fusion agents.
   * @param {string} containerId - The ID of the container element.
   * @param {Object} customAgentsData - The map of custom agent fusions.
   * @param {Function} onSelectCallback - Function to call when an unlocked slot is clicked.
   */
  constructor(containerId, customAgentsData, onSelectCallback) {
    this.containerId = containerId;
    this.customAgentsData = customAgentsData;
    this.onSelectCallback = onSelectCallback;
    this.storageKey = "fusion_discovery_state";
    this.unlockedKeys = new Set();
  }

  /**
   * Initializes the Fusion Index.
   */
  init() {
    this.loadState();
    this.render();
  }

  /**
   * Loads discovered fusions from localStorage.
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const keys = JSON.parse(stored);
        if (Array.isArray(keys)) {
          this.unlockedKeys = new Set(keys);
        }
      }
    } catch (e) {
      console.warn("FusionIndex: Failed to load state from localStorage", e);
    }
  }

  /**
   * Saves discovered fusions to localStorage.
   */
  saveState() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(Array.from(this.unlockedKeys)),
      );
    } catch (e) {
      console.warn("FusionIndex: Failed to save state to localStorage", e);
    }
  }

  /**
   * Extracts the emoji from a fusion name.
   * @param {string} name - The fusion name (e.g., "Void 🕳️").
   * @returns {string} The extracted emoji or a fallback.
   */
  getEmoji(name) {
    if (!name) return "❓";
    const parts = name.trim().split(" ");
    const last = parts[parts.length - 1];
    if (last && !/^[a-zA-Z0-9]+$/.test(last)) {
      return last;
    }
    return "❓";
  }

  /**
   * Renders the Fusion Index shelf.
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = "";
    container.className = "fusion-index-wrapper";

    // Header
    const header = document.createElement("h3");
    header.innerText = "Fusion Index";
    header.className = "fusion-index-header";
    container.appendChild(header);

    // Grid
    const grid = document.createElement("div");
    grid.className = "fusion-shelf-grid";

    Object.keys(this.customAgentsData).forEach((key) => {
      const agentData = this.customAgentsData[key];
      const isUnlocked = this.unlockedKeys.has(key);
      const emoji = this.getEmoji(agentData.name);

      const slot = document.createElement("div");
      slot.className = `fusion-slot ${isUnlocked ? "unlocked" : "locked"}`;
      if (isUnlocked && agentData.tier) {
          slot.classList.add(`tier-${agentData.tier.toLowerCase()}`);
      }
      slot.setAttribute("data-key", key);
      slot.setAttribute("title", isUnlocked ? agentData.name : "Locked Protocol");
      slot.innerHTML = `<span class="slot-icon">${emoji}</span>`;

      if (isUnlocked) {
        // 💎 Jeweler: A11y Polish
        slot.setAttribute("role", "button");
        slot.setAttribute("tabindex", "0");
        slot.setAttribute("aria-label", `Load ${agentData.name} Protocol`);

        const handleSelect = () => {
          if (this.onSelectCallback) this.onSelectCallback(key);
        };

        slot.addEventListener("click", handleSelect);
        slot.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        });

      }

      grid.appendChild(slot);
    });

    container.appendChild(grid);

    // Progress Counter
    const progress = document.createElement("div");
    progress.className = "fusion-progress";
    this.updateProgress(progress);
    container.appendChild(progress);
    this.progressEl = progress;
  }

  /**
   * Updates the progress counter.
   */
  updateProgress(element) {
    const total = Object.keys(this.customAgentsData).length;
    const current = this.unlockedKeys.size;
    element.innerText = `${current} / ${total} Protocols Discovered`;
  }

  /**
   * Unlocks a fusion slot.
   * @param {string} key - The fusion key.
   */
  unlock(key) {
    if (!this.customAgentsData[key]) return;

    if (!this.unlockedKeys.has(key)) {
      this.unlockedKeys.add(key);
      this.saveState();
      this.updateSlot(key);
      if (this.progressEl) this.updateProgress(this.progressEl);
    }
  }

  /**
   * Updates a specific slot UI to unlocked state.
   * @param {string} key - The fusion key.
   */
  updateSlot(key) {
    const safeKey = key.replace(/"/g, '\\"');
    const slot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
    if (slot) {
      const agentData = this.customAgentsData[key];
      slot.classList.remove("locked");
      slot.classList.add("unlocked", "just-unlocked");
      if (agentData.tier) {
          slot.classList.add(`tier-${agentData.tier.toLowerCase()}`);
      }
      slot.setAttribute("title", agentData.name);

      // Re-bind click event
      // 💎 Jeweler: A11y Polish for newly unlocked slots
      slot.setAttribute("role", "button");
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("aria-label", `Load ${agentData.name} Protocol`);

      const handleSelect = () => {
        if (this.onSelectCallback) this.onSelectCallback(key);
      };

      slot.addEventListener("click", handleSelect);
      slot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      });

      // Remove animation class after animation
      setTimeout(() => {
        slot.classList.remove("just-unlocked");
      }, 1000);
    }
  }

  /**
   * Checks if a fusion is unlocked.
   * @param {string} key - The fusion key.
   * @returns {boolean}
   */
  isUnlocked(key) {
    return this.unlockedKeys.has(key);
  }
}
