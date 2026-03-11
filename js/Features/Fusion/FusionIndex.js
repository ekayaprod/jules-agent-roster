class FusionIndex {
  /**
   * Manages the collectible shelf of fusion agents.
   * @param {string} containerId - The ID of the container element.
   * @param {Object} customAgents - The map of custom agent fusions.
   * @param {Function} onSelectCallback - Function to call when an unlocked slot is clicked.
   * @see README.md#fusion-index
   */
  constructor(containerId, customAgents, onSelectCallback) {
    this.containerId = containerId;
    this.customAgents = customAgents;
    this.onSelectCallback = onSelectCallback;
    this.storageKey = "fusion_discovery_state";
    this.unlockedKeys = new Set();
    this.elements = {};
  }

  /**
   * Initializes the Fusion Index.
   */
  init() {
    // 🚨 RESUSCITATE: Explicitly verifies environment context before executing boot logic.
    if (typeof document === 'undefined') return;

    this.elements.container = document.getElementById(this.containerId);
    this.loadState();
    this.render();
  }

  /**
   * Loads discovered fusions from localStorage.
   */
  loadState() {
    const storedKeys = StorageUtils.getJsonArrayItem(this.storageKey, "FUSION_INDEX_PARSE_FAILED");
    this.unlockedKeys = new Set(storedKeys ?? []);
  }

  /**
   * Saves discovered fusions to localStorage.
   */
  saveState() {
    StorageUtils.setJsonItem(this.storageKey, Array.from(this.unlockedKeys), "FusionIndex");
  }

  /**
   * Extracts the emoji from a fusion agent.
   * @param {Object} agent - The custom agent object.
   * @returns {string} The extracted emoji or a fallback.
   */
  getEmoji(agent) {
    // 🧬 Helix: Use centralized utility for consistent icon extraction
    return FormatUtils.extractIcon(agent, '❓');
  }

  /**
   * Helper to retrieve a custom agent from the nested or flat dictionary.
   */
  getCustomAgent(key) {
      if (!this.customAgents) return undefined;
      const isCategorized = Object.values(this.customAgents).some(val => val && typeof val === "object" && val.name === undefined);
      if (isCategorized) {
          for (const category of Object.values(this.customAgents)) {
              if (category[key]) return category[key];
          }
      } else {
          if (this.customAgents[key]) return this.customAgents[key];
      }
      return undefined;
  }

  /**
   * Renders the Fusion Index shelf.
   */
  render() {
    const container = this.elements.container ?? document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = "";
    container.className = "fusion-index-wrapper";

    // Header
    const header = document.createElement("h3");
    header.innerText = "Fusion Index";
    header.className = "fusion-index-header";
    container.appendChild(header);

    // Handle both categorized (nested) and flat structures
    const customAgentsSafe = this.customAgents || {};
    const isCategorized = Object.values(customAgentsSafe).some(val => val && typeof val === "object" && val.name === undefined);

    if (isCategorized) {
        Object.entries(customAgentsSafe).forEach(([categoryName, categoryAgents]) => {
            if (categoryAgents && typeof categoryAgents === "object") {
                // Category Header
                const catHeader = document.createElement("h4");
                catHeader.className = "fusion-category-header";
                catHeader.innerText = categoryName;
                container.appendChild(catHeader);

                // Category Grid
                const grid = document.createElement("div");
                grid.className = "fusion-shelf-grid";
                container.appendChild(grid);

                Object.entries(categoryAgents).forEach(([key, agentData]) => {
                    this._renderSlot(grid, key, agentData);
                });
            }
        });
    } else {
        // Fallback for flat structure
        const grid = document.createElement("div");
        grid.className = "fusion-shelf-grid";
        container.appendChild(grid);

        Object.entries(customAgentsSafe).forEach(([key, agentData]) => {
             this._renderSlot(grid, key, agentData);
        });
    }

    // Progress Counter
    const progress = document.createElement("div");
    progress.className = "fusion-progress";
    this.updateProgress(progress);
    container.appendChild(progress);
    this.progressEl = progress;
  }

  /**
   * Helper to render an individual fusion slot.
   * @private
   */
  _renderSlot(grid, key, agentData) {
      const isUnlocked = this.unlockedKeys.has(key);
      const emoji = this.getEmoji(agentData);

      const slot = document.createElement("div");
      slot.className = `fusion-slot ${isUnlocked ? "unlocked" : "locked"}`;
      if (isUnlocked && agentData?.tier) {
          slot.classList.add(`tier-${agentData.tier.toLowerCase()}`);
      }
      slot.setAttribute("data-key", key);
      slot.setAttribute("title", isUnlocked ? agentData.name : "Locked Protocol");
      slot.innerHTML = `<span class="slot-icon">${emoji}</span>`;

      if (isUnlocked) {
        this._bindSlotInteractions(slot, agentData, key);
      }

      grid.appendChild(slot);
  }

  /**
   * Updates the progress counter.
   */
  updateProgress(element) {
    let total = 0;
    if (this.customAgents) {
        const isCategorized = Object.values(this.customAgents).some(val => val && typeof val === "object" && val.name === undefined);
        if (isCategorized) {
            Object.values(this.customAgents).forEach(cat => {
                if (cat && typeof cat === "object") {
                    total += Object.keys(cat).length;
                }
            });
        } else {
            total = Object.keys(this.customAgents).length;
        }
    }
    const current = this.unlockedKeys.size;
    element.innerText = `${current} / ${total} Protocols Discovered`;
  }

  /**
   * Binds interaction events and accessibility attributes to a fusion slot.
   * @param {HTMLElement} slot - The DOM element.
   * @param {Object} agentData - The custom agent data.
   * @param {string} key - The fusion key.
   * @private
   */
  _bindSlotInteractions(slot, agentData, key) {
    // 💎 Jeweler: A11y Polish
    slot.setAttribute("role", "button");
    slot.setAttribute("tabindex", "0");
    slot.setAttribute("aria-label", `Load ${agentData.name} Protocol`);

    const handleSelect = () => {
      this.onSelectCallback?.(key);
    };

    slot.addEventListener("click", handleSelect);
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    });
  }

  /**
   * Unlocks a fusion slot.
   * @param {string} key - The fusion key.
   */
  unlock(key) {
    if (!this.getCustomAgent(key)) return;

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
    const safeKey = key.replace(/["\\]/g, '\\$&');
    const slot = document.querySelector(`.fusion-slot[data-key="${safeKey}"]`);
    if (slot) {
      const agentData = this.getCustomAgent(key);
      if (!agentData) return;
      slot.classList.remove("locked");
      slot.classList.add("unlocked", "just-unlocked");
      if (agentData?.tier) {
          slot.classList.add(`tier-${agentData.tier.toLowerCase()}`);
      }
      slot.setAttribute("title", agentData.name);

      // Re-bind click event
      this._bindSlotInteractions(slot, agentData, key);

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionIndex;
}
