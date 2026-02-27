class FusionLab {
  constructor() {
    this.agents = [];
    this.compiler = null;
    this.lastFusionResult = null;
    // Internal State for Selection
    this.state = {
      slotA: null,
      slotB: null,
    };

    // Sub-components
    this.picker = new FusionPicker((slot, agent) =>
      this.handlePickerSelection(slot, agent),
    );
    this.animator = new FusionAnimator(CONFIG);
    this.renderer = new FusionRenderer();
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

    this.bindEvents();
    this.renderSlots(); // Initial render
  }

  /**
   * Binds event listeners for the Fusion Lab.
   */
  bindEvents() {
    const fuseBtn = document.getElementById("fuseBtn");
    const copyFusionBtn = document.getElementById("copyFusionBtn");

    // Slot Interactions
    const slotACard = document.getElementById("slotACard");
    const slotBCard = document.getElementById("slotBCard");

    if (slotACard)
      slotACard.addEventListener("click", () => {
        this.openPicker("slotA");
      });
    if (slotBCard)
      slotBCard.addEventListener("click", () => {
        this.openPicker("slotB");
      });

    if (fuseBtn) fuseBtn.addEventListener("click", () => this.handleFusion());

    if (copyFusionBtn) {
      copyFusionBtn.addEventListener("click", async (e) => {
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
      const card = document.getElementById(slotId + "Card");
      if (!card) return;

      const content = card.querySelector(".slot-content");

      if (agent) {
        card.classList.remove("empty");
        card.classList.add("filled");
        card.setAttribute(
          "aria-label",
          `Selected: ${agent.name}. Click to change.`,
        );
        content.innerHTML = `
                <span class="slot-icon-placeholder">${agent.icon}</span>
                <span class="slot-label">${agent.name}</span>
            `;
      } else {
        card.classList.add("empty");
        card.classList.remove("filled");
        card.setAttribute(
          "aria-label",
          slotId === "slotA"
            ? "Initiate Primary Protocol"
            : "Initiate Secondary Protocol",
        );
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
   * Opens the agent picker modal for a specific slot.
   * @param {string} slotKey - "slotA" or "slotB"
   */
  openPicker(slotKey) {
    const otherSlot = slotKey === "slotA" ? "slotB" : "slotA";
    const otherAgent = this.state[otherSlot];
    const currentAgent = this.state[slotKey];

    this.picker.open(slotKey, this.compiler.baseAgents, currentAgent, otherAgent);
  }

  /**
   * Handles selection from the picker.
   */
  handlePickerSelection(slotKey, agent) {
    if (slotKey) {
      this.state[slotKey] = agent;
      this.renderSlots();
      this.renderer.clearError();
    }
  }

  /**
   * Updates the state of the Fusion button and visual indicators.
   */
  updateState() {
    const fuseBtn = document.getElementById("fuseBtn");

    if (fuseBtn) {
      const isReady = this.state.slotA !== null && this.state.slotB !== null;
      fuseBtn.disabled = !isReady;
    }
  }

  /**
   * Handles the fusion logic when the Fuse button is clicked.
   */
  async handleFusion() {
    const fuseBtn = document.getElementById("fuseBtn");

    const agentA = this.state.slotA;
    const agentB = this.state.slotB;

    if (!agentA || !agentB) return;

    // Reset UI states
    this.renderer.clearError();
    if (fuseBtn) {
      fuseBtn.classList.add("loading");
      fuseBtn.innerText = "Igniting Protocol...";
      fuseBtn.disabled = true;
    }

    const result = this.compiler.fuse(agentA, agentB);

    // Error Handling
    if (result.name === "Error") {
      let msg = result.prompt;
      // Virtuoso: Empathetic & Actionable Error Copy
      const ERROR_MAP = {
        "Cannot fuse an agent with itself.":
          "Unstable Reaction: Fusing an agent with itself creates a feedback loop. Select a different partner to stabilize.",
        "Invalid agents selected.":
          "Missing Components: Two distinct agents are required to initiate the fusion protocol.",
      };

      if (ERROR_MAP[result.prompt]) {
        msg = ERROR_MAP[result.prompt];
      }

      this.renderer.showError(msg);
      return;
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

    this.lastFusionResult = result;
    this.renderer.render(result);

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      this.renderer.show();
    } else {
      this.animator.run(agentA, agentB, result, () => this.renderer.show());
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
    this.renderer.clearError();

    const result = this.compiler.fuse(agentA, agentB);
    this.lastFusionResult = result;
    this.renderer.render(result);
    this.renderer.show();
  }
}
