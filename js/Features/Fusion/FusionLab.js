class FusionLab {
  constructor() {
    this.agents = [];
    this.agentMap = new Map();
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
    this.adversaryClickCount = 0;
    this.lastAdversaryClickTime = 0;
  }

  /**
   * Initializes the Fusion Lab component.
   * @param {Array} agents - The list of agents.
   * @param {Object} customAgents - The map of custom agent fusions.
   * @returns {void}
   */
  init(agents, customAgents, fusionMatrix = {}) {
    this.agents = agents;
    this.agentMap = new Map((agents || []).map((a) => [a.name, a]));
    this.compiler = new FusionCompiler(agents, customAgents, fusionMatrix);
    this.events = typeof FusionLabEvents !== "undefined" ? new FusionLabEvents(this) : null;
    this.renderer = typeof FusionLabRenderer !== "undefined" ? new FusionLabRenderer(this) : null;

    // Initialize Fusion Index (Collectible Shelf)
    if (typeof FusionIndex !== "undefined") {
      this.fusionIndex = new FusionIndex(
        "fusionIndexContainer",
        this.compiler.fusionMatrixMap,
        (key) => this.handleShelfSelection(key),
      );
      // Give it the full custom agent map so it can look up details
      this.fusionIndex.fullCustomAgents = this.compiler.customAgentsMap;
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
   * @returns {void}
   */
  bindEvents() {
    if (this.events) {
      this.events.bindEvents();
    }
  }

  /**
   * Renders the visual state of the slots based on this.state.
   * @returns {void}
   */
  renderSlots() {
    if (this.renderer) {
      this.renderer.renderSlots();
    }
  }


  /**
   * Handles selection from the picker.
   * @param {string} slotKey - The slot key being populated
   * @param {Object} agent - The selected agent
   * @returns {void}
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
    if (this.renderer) {
      return this.renderer.getPreMergePreviewHTML(selectedAgent);
    }
    return null;
  }

  /**
   * Updates the state of the Fusion button and visual indicators.
   * @returns {void}
   */
  updateState() {
    const fuseBtn = this.elements.fuseBtn;
    if (fuseBtn) {
      const isReady = this.state.slotA !== null && this.state.slotB !== null;
      fuseBtn.setAttribute("aria-disabled", String(!isReady));

      let msg = "Select Protocols";
      if (isReady) msg = "Ignite Fusion Protocol";
      else if (!this.state.slotA && this.state.slotB) msg = "Select Agent A";
      else if (this.state.slotA && !this.state.slotB) msg = "Select Agent B";

      const btnState = isReady ? "ready" : (typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.DISABLED : "disabled");
      DOMUtils.setButtonState(fuseBtn, btnState, msg);
    }
  }

  /**
   * Displays an error message in the Fusion Lab.
   * @param {string} message - The error message to display.
   * @returns {void}
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

      // Empathetic Recovery Path: Guide user back to missing input
      let targetSlot = null;
      if (!this.state.slotA && this.elements.slotACard) targetSlot = this.elements.slotACard;
      else if (!this.state.slotB && this.elements.slotBCard) targetSlot = this.elements.slotBCard;
      if (targetSlot) {
        targetSlot.focus();
        targetSlot.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  /**
   * Clears the error state.
   * @returns {void}
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
      fuseBtn.removeAttribute("aria-live");
      fuseBtn.removeAttribute("aria-busy");
    }
  }

  /**
   * Handles the fusion logic when the Fuse button is clicked.
   * @returns {Promise<void>}
   */
  async handleFusion() {
    const fuseBtn = this.elements.fuseBtn;
    const labContent = this.elements.labContent;

    const agentA = this.state.slotA;
    const agentB = this.state.slotB;

    if (!agentA || !agentB) {
        this.showError("Select both protocols to initiate fusion.");
        return;
    }

    // Reset UI states
    this.clearError();
    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "loading", "Igniting Protocol...");
      fuseBtn.setAttribute("aria-live", "polite");
      fuseBtn.setAttribute("aria-busy", "true");
    }

    const result = this.compiler.fuse(agentA, agentB);

    if (result.name === "Error") {
      const ERROR_MAP = { "Invalid agents selected.": "Select two distinct agents to initiate the fusion protocol." };
      this.showError(ERROR_MAP[result.prompt] || result.prompt);
      return;
    }

    if (labContent) {
        labContent.classList.add("hidden");
    }

    // Unlock in Index if it's a valid fusion
    if (this.fusionIndex) {
      try {
        const key = AgentUtils.getFusionKey(agentA.name, agentB.name);
        // Check if it's a known custom fusion
        let isKnown = false;
        if (this.fusionIndex.customAgents && this.fusionIndex.customAgents[key]) {
            isKnown = true;
        }

        if (isKnown) {
          this.fusionIndex.unlock(key);
        }

        // Notify the app state about Cortex x Cortex state change
        if (key === "Cortex,Cortex" && window.rosterApp) {
          if (window.rosterApp.singularityBuilderContainer) {
            window.rosterApp.singularityBuilderContainer.classList.remove("hidden");
          }
        }
      } catch (e) {
        const unlockError = new Error("FusionLab: Failed to unlock agent in index");
        unlockError.cause = e;
        const tu = typeof getTelemetryUtils !== "undefined" ? getTelemetryUtils() : (typeof window !== "undefined" ? window.TelemetryUtils : null);
        if (tu) tu.dispatchEvent("FUSION_LAB_INDEX_UNLOCK_FAILED", unlockError, { agentA: agentA.name, agentB: agentB.name });

        if (labContent) {
          labContent.classList.remove("hidden");
        }
        this.showError("FusionLab: Failed to unlock agent in index");
        return;
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
   * @returns {void}
   */
  handleShelfSelection(key) {
    const names = AgentUtils.splitFusionKey(key);
    if (names.length !== 2) return;

    const agentA = this.agentMap.get(names[0]);
    const agentB = this.agentMap.get(names[1]);

    if (!agentA || !agentB) {
      const tu = typeof getTelemetryUtils !== "undefined" ? getTelemetryUtils() : (typeof window !== "undefined" ? window.TelemetryUtils : null);
      if (tu) tu.dispatchEvent("FUSION_LAB_AGENTS_NOT_FOUND", "Could not find agents for key", { key });
      return;
    }

    // Update Visual Slots to reflect selection (UX Polish)
    this.state.slotA = agentA;
    this.state.slotB = agentB;
    this.renderSlots();

    // Clear any previous errors
    this.clearError();

    const result = this.compiler.fuse(agentA, agentB);

    // Do not render Singularity as a standard card.


    this.renderFusionResult(result);
    this.showResult();
  }

  /**
   * Renders the fusion result into the DOM.
   * @param {Object} result - The fusion result object.
   * @returns {void}
   */
  renderFusionResult(result) {
    if (this.renderer) {
      this.renderer.renderFusionResult(result);
    }
  }

  unlockMatrix() {
    if (this.elements.labContent) {
        this.elements.labContent.classList.add("shatter-animation");
    }

    const overlay = document.createElement("div");
    overlay.className = "fusion-trap-overlay";
    overlay.innerHTML = "[TRAP SPRUNG] Authentication logic sabotaged. All agents accessible.";
    document.body.appendChild(overlay);
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        if (this.elements.labContent) {
            this.elements.labContent.classList.remove("shatter-animation");
        }
    }, 3000);
    if (this.fusionIndex && typeof this.fusionIndex.unlockAll === 'function') {
        this.fusionIndex.unlockAll();
    }
  }

  /**
   * Resets the lab state for another fusion.
   * @returns {void}
   */
  resetLab() {
    this.state.slotA = null;
    this.state.slotB = null;

    this.returnToLab();
  }

  /**
   * ☕ CAFFEINATED: Preserves slot context so the user can modify one agent without restarting.
   * @returns {void}
   */
  returnToLab() {
    const resetBtn = this.elements.resetLabBtn;
    const labContent = this.elements.labContent;
    const container = this.elements.fusionResultContainer;

    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fusion-revealed");
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
   * @returns {void}
   */
  showResult() {
    if (this.renderer) {
      this.renderer.showResult();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionLab;
}
