class FusionIndex {
  /**
   * Manages the collectible shelf of fusion agents.
   * @param {string} containerId - The ID of the container element.
   * @param {Object} customAgents - The map of custom agent fusions.
   * @param {Function} onSelectCallback - Function to call when an unlocked slot is clicked.
   * @see ../../../docs/architecture/Features/Fusion.md#fusion-index
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
   * Renders the Fusion Index shelf.
   */
  render() {
    const container = this.elements.container ?? document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = "";
    container.className = "fusion-index-wrapper";

    // Header
    const header = document.createElement("h3");
    header.textContent = "Fusion Index";
    header.className = "fusion-index-header";
    container.appendChild(header);

    // Handle both categorized (nested) and flat structures
    const customAgentsSafe = this.customAgents || {};

    const grid = document.createElement("div");
    grid.className = "fusion-shelf-grid";
    container.appendChild(grid);

    // Render slots for all custom agents without grouping
    // ⚡ Bolt+: Eliminated unnecessary closure and array allocations from Object.entries().forEach() by using a direct for...in loop
    for (const key in customAgentsSafe) {
        if (Object.prototype.hasOwnProperty.call(customAgentsSafe, key)) {
            this._renderSlot(grid, key, customAgentsSafe[key]);
        }
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
      let safeData = agentData && agentData.name ? agentData : { name: this.customAgents[key] || key };

      if (!agentData || !agentData.tier) {
          if (this.fullCustomAgents && typeof AgentUtils !== 'undefined') {
              const fullData = AgentUtils.getCustomAgent(this.fullCustomAgents, safeData.name);
              if (fullData) safeData = fullData;
          }
      }

      const isUnlocked = this.unlockedKeys.has(key);
      const emoji = this.getEmoji(safeData);

      const slot = document.createElement("div");
      slot.className = `fusion-item ${isUnlocked ? "unlocked" : "locked"}`;
      if (isUnlocked && safeData?.tier) {
          slot.classList.add(`tier-${safeData.tier.toLowerCase()}`);
      }
      slot.setAttribute("data-key", key);
      slot.setAttribute("title", isUnlocked ? safeData.name : "Locked Protocol");
      slot.innerHTML = `<span class="slot-icon">${emoji}</span>`;

      if (isUnlocked) {
        this._bindSlotInteractions(slot, safeData, key);
      }

      grid.appendChild(slot);
  }

  /**
   * Updates the progress counter.
   */
  updateProgress(element) {
    let total = 0;
    if (this.customAgents) {
        total = Object.keys(this.customAgents).length;
    }
    const current = this.unlockedKeys.size;
    element.textContent = `${current} / ${total} Protocols Discovered`;
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
    const fusionName = this.customAgents[key];
    if (!fusionName) return;

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
    // 🛡️ Bastion: Use safe selector escaping to prevent querySelector injection attacks
    const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key.replace(/(["\\])/g, '\\$1');
    const slot = this.elements.container?.querySelector(`.fusion-item[data-key="${safeKey}"]`) || document.querySelector(`.fusion-item[data-key="${safeKey}"]`);
    if (slot) {
      const fusionName = this.customAgents[key];
      // lookup full agent data
      const agentData = typeof AgentUtils !== 'undefined' && this.fullCustomAgents ? AgentUtils.getCustomAgent(this.fullCustomAgents, fusionName) : { name: fusionName };
      const safeData = agentData && agentData.name ? agentData : { name: fusionName || "Unknown" };

      slot.classList.remove("locked");
      slot.classList.add("unlocked", "just-unlocked");
      if (safeData?.tier) {
          slot.classList.add(`tier-${safeData.tier.toLowerCase()}`);
      }
      slot.setAttribute("title", safeData.name);

      // Re-bind click event
      this._bindSlotInteractions(slot, safeData, key);

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
