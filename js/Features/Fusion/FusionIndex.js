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
    this.storageKey = 'fusion_discovery_state';
    this.unlockedKeys = new Set();
    this.unlockedAgents = new Set();
    this.elements = {};
  }

  /**
   * Initializes the Fusion Index.
   * @returns {void}
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
   * @returns {void}
   */
  loadState() {
    const storedKeys = StorageUtils.getJsonArrayItem(this.storageKey, 'FUSION_INDEX_PARSE_FAILED');
    this.unlockedKeys = new Set(storedKeys ?? []);
    this.unlockedAgents = new Set();
    // 🧬 COLLAPSE: Converted imperative loop to functional pipeline.
    Array.from(this.unlockedKeys).forEach(key => typeof key === 'string' && this._addUnlockedAgentsFromKey(key));
  }

  /**
   * Helper to add unlocked agents from a comma-separated key without creating intermediate arrays.
   * @param {string} key - The fusion key.
   * @private
   * @returns {void}
   */
  _addUnlockedAgentsFromKey(key) {
    if (!key) return;

    // ⚡ Bolt+: Eliminated The Garbage Generator. Replaced intermediate key.split(',') array allocations
    // with a high-performance linear index scan to directly extract string values into the Set.
    let start = 0;
    let idx = key.indexOf(',');

    while (idx !== -1) {
      const trimmed = key.substring(start, idx).trim();
      if (trimmed) {
        this.unlockedAgents.add(trimmed);
      }
      start = idx + 1;
      idx = key.indexOf(',', start);
    }

    const trimmed = key.substring(start).trim();
    if (trimmed) {
      this.unlockedAgents.add(trimmed);
    }
  }

  /**
   * Saves discovered fusions to localStorage.
   * @returns {void}
   */
  saveState() {
    StorageUtils.setJsonItem(this.storageKey, Array.from(this.unlockedKeys), 'FusionIndex');
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
   * @returns {void}
   */
  render() {
    const container = this.elements.container ?? document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = '';
    container.className = 'fusion-index-wrapper';

    const header = document.createElement('h3');
    header.textContent = 'Fusion Index';
    header.className = 'fusion-index-header';
    container.appendChild(header);

    // Handle both categorized (nested) and flat structures
    const customAgentsSafe = this.customAgents || {};

    const grid = document.createElement('div');
    grid.className = 'fusion-shelf-grid';
    container.appendChild(grid);

    // 🧬 COLLAPSE: Collapsed sprawling imperative logic into highly dense, declarative functional pipelines.
    const sortedKeys = Object.keys(customAgentsSafe).filter(key => customAgentsSafe[key] !== '');

    sortedKeys.sort((a, b) => {
      const nameA = customAgentsSafe[a] || a;
      const nameB = customAgentsSafe[b] || b;
      return nameA.localeCompare(nameB);
    });

    const fragment = document.createDocumentFragment();
    for (const key of sortedKeys) {
      this._renderSlot(fragment, key, customAgentsSafe[key]);
    }
    grid.appendChild(fragment);

    const progress = document.createElement('div');
    progress.className = 'fusion-progress';
    this.updateProgress(progress);
    container.appendChild(progress);
    this.progressEl = progress;
  }

  /**
   * Helper to render an individual fusion slot.
   * @private
   * @returns {void}
   */
  _renderSlot(fragment, key, agentData) {
    let safeData =
      agentData && agentData.name ? agentData : { name: this.customAgents[key] || key };

    if (!agentData || !agentData.tier) {
      if (this.fullCustomAgents && typeof AgentUtils !== 'undefined') {
        const fullData = AgentUtils.getCustomAgent(this.fullCustomAgents, safeData.name);
        if (fullData) safeData = fullData;
      }
    }

    const isUnlocked = this.unlockedKeys.has(key);
    const emoji = safeData.name === 'Singularity' ? '🌌' : this.getEmoji(safeData);

    const slot = document.createElement('div');
    slot.className = `fusion-item ${isUnlocked ? 'unlocked' : 'locked'} transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 active:scale-95`;
    if (isUnlocked && safeData?.tier) {
      slot.classList.add(`tier-${safeData.tier.toLowerCase()}`);
    }
    slot.setAttribute('data-key', key);

    const iconSpan = document.createElement('span');
    iconSpan.className = 'slot-icon';
    iconSpan.textContent = emoji;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'slot-label';

    if (isUnlocked) {
      labelSpan.textContent = safeData.name;
      slot.appendChild(iconSpan);
      slot.appendChild(labelSpan);
      this._bindSlotInteractions(slot, safeData, key);
    } else {
      labelSpan.textContent = 'Locked Protocol';
      slot.appendChild(iconSpan);
      slot.appendChild(labelSpan);
    }

    fragment.appendChild(slot);
  }

  /**
   * Updates the progress counter.
   * @returns {void}
   */
  updateProgress(element) {
    if (this._totalCustomAgentsCache === undefined) {
      if (this.customAgents) {
        // 🧬 COLLAPSE: Collapsed sprawling imperative logic into highly dense, declarative functional pipelines.
        this._totalCustomAgentsCache = Object.keys(this.customAgents).reduce((acc, key) => {
            return acc + (this.customAgents[key] !== '' ? 1 : 0);
        }, 0);
      } else this._totalCustomAgentsCache = 0;
    }
    // ⚡ Bolt+: The Algorithmic Trap. Cached the O(n) total calculation to O(1) to prevent repetitive linear scans on every progress update.
    element.textContent = `${this.unlockedKeys.size} / ${this._totalCustomAgentsCache} Protocols Discovered`;
  }

  /**
   * Binds interaction events and accessibility attributes to a fusion slot.
   * @param {HTMLElement} slot - The DOM element.
   * @param {Object} agentData - The custom agent data.
   * @param {string} key - The fusion key.
   * @private
   * @returns {void}
   */
  _bindSlotInteractions(slot, agentData, key) {
    // 💎 Jeweler: A11y Polish
    slot.setAttribute('role', 'button');
    slot.setAttribute('tabindex', '0');
    slot.setAttribute('aria-label', `Load ${agentData.name} Protocol`);

    const handleSelect = () => {
      if (
        agentData.name === 'Singularity' &&
        window.rosterApp &&
        window.rosterApp.singularityBuilderContainer
      ) {
        window.rosterApp.singularityBuilderContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else {
        this.onSelectCallback?.(key);
      }
    };

    slot.addEventListener('click', handleSelect);
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });
  }

  /**
   * Unlocks all fusions.
   * @returns {void}
   */
  unlockAll() {
    if (this.customAgents) {
      // 🧬 COLLAPSE: Converted imperative loop to functional pipeline.
      Object.keys(this.customAgents).forEach(key => {
        this.unlockedKeys.add(key);
        if (typeof key === 'string') this._addUnlockedAgentsFromKey(key);
      });
      this.saveState();
      this.render();
    }
  }

  /**
   * Unlocks a fusion slot.
   * @param {string} key - The fusion key.
   * @returns {void}
   */
  unlock(key) {
    const fusionName = this.customAgents[key];
    if (!fusionName) return;

    if (!this.unlockedKeys.has(key)) {
      this.unlockedKeys.add(key);
      if (typeof key === 'string') {
        this._addUnlockedAgentsFromKey(key);
      }
      this.saveState();
      this.updateSlot(key);
      if (this.progressEl) this.updateProgress(this.progressEl);
    }
  }

  /**
   * Updates a specific slot UI to unlocked state.
   * @param {string} key - The fusion key.
   * @returns {void}
   */
  updateSlot(key) {
    // 🛡️ Bastion: Use safe selector escaping to prevent querySelector injection attacks
    const safeKey =
      typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key.replace(/(["\\])/g, '\\$1');
    const slot =
      this.elements.container?.querySelector(`.fusion-item[data-key="${safeKey}"]`) ||
      document.querySelector(`.fusion-item[data-key="${safeKey}"]`);
    if (slot) {
      const fusionName = this.customAgents[key];
      // lookup full agent data
      const agentData =
        typeof AgentUtils !== 'undefined' && this.fullCustomAgents
          ? AgentUtils.getCustomAgent(this.fullCustomAgents, fusionName)
          : { name: fusionName };
      const safeData = agentData && agentData.name ? agentData : { name: fusionName || 'Unknown' };

      slot.classList.remove('locked');
      slot.classList.add('unlocked', 'just-unlocked');
      if (safeData?.tier) {
        slot.classList.add(`tier-${safeData.tier.toLowerCase()}`);
      }

      // Re-bind pointerdown event
      this._bindSlotInteractions(slot, safeData, key);

      // Remove animation class after animation
      setTimeout(() => {
        slot.classList.remove('just-unlocked');
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
