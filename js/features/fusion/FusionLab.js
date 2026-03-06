class FusionLab {
  constructor() {
    this.agents = [];
    this.compiler = null;
    this.lastFusionResult = null;
    this.picker = null;
    this.animation = typeof FusionAnimation !== "undefined" ? new FusionAnimation() : null;
    // Internal State for Selection
    this.state = {
      slotA: null,
      slotB: null,
    };
    this.elements = {};
  }

  /**
   * Initializes the Fusion Lab component.
   * @param {Array} agentsData - The list of agents.
   * @param {Object} customAgentsData - The map of custom agent fusions.
   */
  init(agentsData, customAgentsData) {
    this.agents = agentsData;
    this.compiler = new FusionCompiler(agentsData, customAgentsData);

    // Initialize Fusion Index (Collectible Shelf)
    if (typeof FusionIndex !== "undefined") {
      this.fusionIndex = new FusionIndex(
        "fusionIndexContainer",
        this.compiler.customAgentsMap,
        (key) => this.handleShelfSelection(key),
      );
      this.fusionIndex.init();
    }

    if (typeof AgentPicker !== "undefined") {
      this.picker = new AgentPicker(
        this.compiler.baseAgents,
        (slotKey, agent) => this.handlePickerSelection(slotKey, agent),
        (selectedAgent) => this.getPreMergePreviewHTML(selectedAgent)
      );
    }

    this.bindEvents();
    this.renderSlots(); // Initial render
  }

  /**
   * Binds event listeners for the Fusion Lab.
   */
  bindEvents() {
    // ⚡ Bolt+: Extracted redundant DOM queries outside of individual methods and cached them here to prevent layout thrashing and repeated execution overhead.
    this.elements = {
        fuseBtn: document.getElementById("fuseBtn"),
        copyFusionBtn: document.getElementById("copyFusionBtn"),
        slotACard: document.getElementById("slotACard"),
        slotBCard: document.getElementById("slotBCard"),
        errorEl: document.getElementById("fusionError"),
        textSpan: document.getElementById("fusionErrorText"),
        fusionResultContainer: document.getElementById("fusionResultContainer"),
        fusionOutputWrapper: document.getElementById("fusionOutputWrapper"),
        resetLabBtn: document.getElementById("resetLabBtn"),
    };

    if (this.elements.slotACard) this.elements.slotACard.addEventListener("click", () => {
        if (this.picker) this.picker.openPicker("slotA", this.state.slotA);
    });
    if (this.elements.slotBCard) this.elements.slotBCard.addEventListener("click", () => {
        if (this.picker) this.picker.openPicker("slotB", this.state.slotB);
    });

    if (this.elements.fuseBtn) this.elements.fuseBtn.addEventListener("click", () => this.handleFusion());

    if (this.elements.resetLabBtn) {
        this.elements.resetLabBtn.addEventListener("click", () => this.resetLab());
    }

    if (this.elements.copyFusionBtn) {
      this.elements.copyFusionBtn.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        if (this.lastFusionResult && this.lastFusionResult.prompt) {
          await ClipboardUtils.copyText(this.lastFusionResult.prompt);
          if (window.rosterApp && window.rosterApp.showToast) {
            window.rosterApp.showToast("Fusion copied to clipboard");
          }
          ClipboardUtils.animateButtonSuccess(btn, "Copied!");
        }
      });
    }

  }

  /**
   * Renders the visual state of the slots based on this.state.
   */
  renderSlots() {
    const updateSlotUI = (slotId, agent) => {
        const card = this.elements[slotId + "Card"];
        if (!card) return;

        const content = card.querySelector(".slot-content");

        if (agent) {
            card.classList.remove("empty");
            card.classList.add("filled");
            card.setAttribute("aria-label", `Selected: ${agent.name}. Click to change.`);
            content.innerHTML = `
                <span class="slot-icon-placeholder">${agent.emoji}</span>
                <span class="slot-label">${agent.name}</span>
            `;
        } else {
            card.classList.add("empty");
            card.classList.remove("filled");
            card.setAttribute("aria-label", slotId === "slotA" ? "Select Primary Protocol" : "Select Secondary Protocol");
            content.innerHTML = `
                <span class="slot-icon-placeholder">+</span>
                <span class="slot-label">${slotId === "slotA" ? "Initiate Primary Protocol" : "Initiate Secondary Protocol"}</span>
            `;
        }
    };

    updateSlotUI("slotA", this.state.slotA);
    updateSlotUI("slotB", this.state.slotB);

    this.updateState(); // Update button state
  }


  /**
   * Handles selection from the picker.
   * @param {string} slotKey - The slot key being populated
   * @param {Object} agent - The selected agent
   */
  handlePickerSelection(slotKey, agent) {
      this.state[slotKey] = agent;
      this.renderSlots();
      this.clearError();
  }

  /**
   * Returns the HTML string for the pre-merge "Known Recipe" preview if the resulting agent is already unlocked.
   * @param {Object} selectedAgent - The agent just selected in the picker.
   * @returns {string|null} - The HTML string or null if not previewable.
   */
  getPreMergePreviewHTML(selectedAgent) {
    const tempState = { ...this.state };
    if (this.picker && this.picker.activePickerSlot) {
        tempState[this.picker.activePickerSlot] = selectedAgent;
    }

    const agentA = tempState.slotA;
    const agentB = tempState.slotB;

    if (!agentA || !agentB || agentA.name === agentB.name) {
        return null;
    }

    const key = [agentA.name, agentB.name].sort().join(",");

    if (this.fusionIndex && this.fusionIndex.isUnlocked(key)) {
        const result = this.compiler.fuse(agentA, agentB);
        const iconHtml = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
        const nameHtml = FormatUtils.extractDisplayName(result);

        return `
            <div class="preview-badge">Already Discovered</div>
            <div class="preview-content">
                <span class="preview-icon">${iconHtml}</span>
                <span class="preview-name">${nameHtml}</span>
            </div>
        `;
    }
    return null;
  }

  /**
   * Updates the state of the Fusion button and visual indicators.
   */
  updateState() {
    const fuseBtn = this.elements.fuseBtn;

    if (fuseBtn) {
      const isReady = this.state.slotA !== null && this.state.slotB !== null;
      fuseBtn.disabled = !isReady;
      fuseBtn.setAttribute("aria-disabled", String(!isReady));
    }
  }

  /**
   * Displays an error message in the Fusion Lab.
   * @param {string} message - The error message to display.
   */
  showError(message) {
    const errorEl = this.elements.errorEl;
    const textSpan = this.elements.textSpan;
    const fuseBtn = this.elements.fuseBtn;

    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "error", "Ignite Fusion Protocol");
    }

    if (errorEl) {
      errorEl.hidden = false;
      errorEl.setAttribute("aria-live", "assertive");
      if (textSpan) textSpan.innerText = message;
    }
  }

  /**
   * Clears the error state.
   */
  clearError() {
    const errorEl = this.elements.errorEl;
    const fuseBtn = this.elements.fuseBtn;

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.removeAttribute("aria-live");
    }

    if (fuseBtn) {
      fuseBtn.classList.remove("error");
    }
  }

  /**
   * Handles the fusion logic when the Fuse button is clicked.
   */
  async handleFusion() {
    const fuseBtn = this.elements.fuseBtn;
    const labContent = document.getElementById("fusionLabContent");

    const agentA = this.state.slotA;
    const agentB = this.state.slotB;

    if (!agentA || !agentB) return;

    // Reset UI states
    this.clearError();
    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "loading", "Igniting Protocol...");
    }

    const result = this.compiler.fuse(agentA, agentB);

    // Error Handling
    if (result.name === "Error") {
      let msg = result.prompt;
      // Virtuoso: Empathetic & Actionable Error Copy
      const ERROR_MAP = {
        "Invalid agents selected.":
          "Missing Components: Two distinct agents are required to initiate the fusion protocol.",
      };

      if (ERROR_MAP[result.prompt]) {
        msg = ERROR_MAP[result.prompt];
      }

      this.showError(msg);
      return;
    }

    if (labContent) {
        labContent.classList.add("hidden");
    }

    // Unlock in Index if it's a valid fusion
    if (this.fusionIndex) {
      try {
        const key = [agentA.name, agentB.name].sort().join(",");
        // Check if it's a known custom fusion
        if (this.fusionIndex.customAgentsData[key]) {
          this.fusionIndex.unlock(key);
        }
      } catch (e) {
        console.warn("FusionLab: Failed to unlock index", e);
      }
    }

    this.renderFusionResult(result);

    if (this.animation) {
      this.animation.runAnimation(agentA, agentB, result, () => this.showResult());
    }
  }

  /**
   * Handles selection from the Fusion Index shelf.
   * Recreates the fusion result without the long animation.
   * @param {string} key - The fusion key (AgentA,AgentB).
   */
  handleShelfSelection(key) {
    const names = key.split(",");
    if (names.length !== 2) return;

    const agentA = this.agents.find((a) => a.name === names[0].trim());
    const agentB = this.agents.find((a) => a.name === names[1].trim());

    if (!agentA || !agentB) {
      console.warn("FusionLab: Could not find agents for key", key);
      return;
    }

    // Update Visual Slots to reflect selection (UX Polish)
    this.state.slotA = agentA;
    this.state.slotB = agentB;
    this.renderSlots();

    // Clear any previous errors
    this.clearError();

    const result = this.compiler.fuse(agentA, agentB);
    this.renderFusionResult(result);
    this.showResult();
  }

  /**
   * Renders the fusion result into the DOM.
   * @param {Object} result - The fusion result object.
   */
  renderFusionResult(result) {
    this.lastFusionResult = result;

    const container = this.elements.fusionResultContainer;
    const wrapper = this.elements.fusionOutputWrapper;
    if (wrapper) {
      wrapper.classList.remove("open");
      wrapper.classList.add("hidden");
    }

    if (container) {
      container.innerHTML = ""; // Clear previous

      if (typeof AgentCard !== "undefined") {
        // Find the custom agent key by finding the matching object in customAgentsMap
        let keyStr = "fusion-result";
        for (const [key, val] of Object.entries(this.compiler.customAgentsMap)) {
            if (val.name === result.name) {
                keyStr = key;
                break;
            }
        }

        const card = AgentCard.create(result, keyStr, 0);
        card.classList.remove("pop-in");
        container.appendChild(card);
      }
    }
  }

  /**
   * Resets the lab state for another fusion.
   */
  resetLab() {
    this.state.slotA = null;
    this.state.slotB = null;

    const wrapper = this.elements.fusionOutputWrapper;
    const resetBtn = this.elements.resetLabBtn;
    const labContent = document.getElementById("fusionLabContent");
    const container = this.elements.fusionResultContainer;

    if (wrapper) {
      wrapper.classList.remove("open");
      wrapper.classList.add("hidden");
    }

    if (resetBtn) {
      resetBtn.classList.add("hidden");
    }

    if (labContent) {
      labContent.classList.remove("hidden");
    }

    if (container) {
      container.innerHTML = "";
    }

    this.renderSlots();
  }

  /**
   * Reveals the fusion result with smooth transitions.
   */
  showResult() {
    const fuseBtn = this.elements.fuseBtn;
    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "ready", "Ignite Fusion Protocol");
    }

    const wrapper = this.elements.fusionOutputWrapper;
    const resetBtn = this.elements.resetLabBtn;

    if (wrapper) {
      wrapper.classList.remove("hidden");
      wrapper.classList.add("open");

      if (resetBtn) {
          resetBtn.classList.remove("hidden");
      }

      // Ensure the card inside gets focused for accessibility
      const cardTitle = wrapper.querySelector(".agent-title");
      if (cardTitle) {
          cardTitle.setAttribute("tabindex", "-1");
          cardTitle.focus();
          cardTitle.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionLab;
}
