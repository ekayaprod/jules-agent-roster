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
   */
  init(agents, customAgents, fusionMatrix = {}) {
    this.agents = agents;
    this.agentMap = new Map((agents || []).map((a) => [a.name, a]));
    this.compiler = new FusionCompiler(agents, customAgents, fusionMatrix);
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
        resetLabBtn: document.getElementById("resetLabBtn"),
        // ⚡ Bolt+: Cached fusionLabContent query to prevent repeated DOM lookups during high-frequency reset/fusion interactions.
        labContent: document.getElementById("fusionLabContent"),
    };

    if (this.elements.slotACard) {
        this.elements.slotACard.addEventListener("click", () => {
            if (this.picker) this.picker.openPicker("slotA", this.state.slotA);
        });
        this.elements.slotACard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (this.picker) this.picker.openPicker("slotA", this.state.slotA);
            }
        });
    }
    if (this.elements.slotBCard) {
        this.elements.slotBCard.addEventListener("click", () => {
            if (this.picker) this.picker.openPicker("slotB", this.state.slotB);
        });
        this.elements.slotBCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (this.picker) this.picker.openPicker("slotB", this.state.slotB);
            }
        });
    }

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
          ClipboardUtils.animateButtonSuccess(btn,
"Copied!");
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
                <span class="slot-icon-placeholder">${FormatUtils.escapeHTML(agent.emoji)}</span>
                <span class="slot-label">${FormatUtils.escapeHTML(agent.name)}</span>
            `;
        } else {
            card.classList.add("empty");
            card.classList.remove("filled");
            card.setAttribute("aria-label", slotId === "slotA" ? "Select Primary Protocol" : "Select Secondary Protocol");
            content.innerHTML = `
                <span class="slot-icon-placeholder">+</span>
                <span class="slot-label">${slotId === "slotA" ?
"Initiate Primary Protocol" : "Initiate Secondary Protocol"}</span>
            `;
        }
    };

    updateSlotUI("slotA", this.state.slotA);
    updateSlotUI("slotB", this.state.slotB);

    this.updateState();
    // Update button state
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

    const key = AgentUtils.getFusionKey(agentA.name, agentB.name);

    if (this.fusionIndex && this.fusionIndex.isUnlocked(key)) {
        const result = this.compiler.fuse(agentA, agentB);
        const iconHtml = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
        const nameHtml = FormatUtils.extractDisplayName(result);

        return `
            <div class="preview-badge">Already Discovered</div>
            <div class="preview-content">
                <span class="preview-icon">${FormatUtils.escapeHTML(iconHtml)}</span>
                <span class="preview-name">${FormatUtils.escapeHTML(nameHtml)}</span>
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
      fuseBtn.setAttribute("aria-disabled", String(!isReady));
      if (!isReady) {
        let msg = "Select Protocols";
        if (!this.state.slotA && this.state.slotB) msg = "Select Agent A";
        else if (this.state.slotA && !this.state.slotB) msg = "Select Agent B";
        DOMUtils.setButtonState(fuseBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.DISABLED : "disabled", msg);
      } else {
        DOMUtils.setButtonState(fuseBtn, "ready", "Ignite Fusion Protocol");
      }
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

    // Error Handling
    if (result.name === "Error") {
      let msg = result.prompt;
      // Virtuoso: Empathetic & Actionable Error Copy
      const ERROR_MAP = {
        "Invalid agents selected.":
          "Select two distinct agents to initiate the fusion protocol.",
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
        const key = AgentUtils.getFusionKey(agentA.name, agentB.name);
        // Check if it's a known custom fusion
        let isKnown = false;
        if (this.fusionIndex.customAgents && this.fusionIndex.customAgents[key]) {
            isKnown = true;
        }

        if (isKnown) {
          this.fusionIndex.unlock(key);
        }
      } catch (e) {
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
    const names = AgentUtils.splitFusionKey(key);
    if (names.length !== 2) return;

    const agentA = this.agentMap.get(names[0]);
    const agentB = this.agentMap.get(names[1]);

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
    if (container) {
      container.classList.add("hidden");
      container.classList.remove("fusion-revealed");
      container.innerHTML = "";
      // Clear previous

      if (typeof AgentCard !== "undefined") {
        // Find the custom agent key by finding the matching object in customAgentsMap
        // ⚡ Bolt+: Replaced O(N) array allocation overhead from Object.entries() with a direct for...in dictionary lookup.
        let keyStr = "fusion-result";
        let resolvedFusionName = result.name;
        for (const mKey in this.compiler.fusionMatrixMap) {
            if (this.compiler.fusionMatrixMap[mKey] === resolvedFusionName) {
                keyStr = mKey;
                break;
            }
        }

        const card = AgentCard.create(result, keyStr, 0);
        card.classList.remove("pop-in");

        if (result.name === "Adversary") {
          card.addEventListener("click", () => {
            const now = Date.now();
            if (now - this.lastAdversaryClickTime < 300) {
              this.adversaryClickCount++;
            } else {
              this.adversaryClickCount = 1;

            }
            this.lastAdversaryClickTime = now;

            if (this.adversaryClickCount >= 7) {
              this.unlockMatrix();
              this.adversaryClickCount = 0; // Reset after trigger
            }
          });
        }

        container.appendChild(card);
      }
    }
  }

  unlockMatrix() {
    const styleId = "shatter-glitch-style";
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes shatter {
          0% { transform: translate(0, 0) rotate(0deg);
          opacity: 1; filter: blur(0); }
          20% { transform: translate(-5px, 5px) rotate(-2deg);
          opacity: 0.8; filter: blur(2px) hue-rotate(90deg); }
          40% { transform: translate(5px, -5px) rotate(2deg);
          opacity: 0.9; filter: blur(1px) invert(100%); }
          60% { transform: translate(-10px, -2px) rotate(-5deg);
          opacity: 0.5; filter: blur(4px) contrast(200%); }
          80% { transform: translate(10px, 2px) rotate(5deg);
          opacity: 0.8; filter: blur(1px) sepia(100%); }
          100% { transform: translate(0, 0) rotate(0deg);
          opacity: 1; filter: blur(0); }
        }
      `;
      document.head.appendChild(style);
    }

    if (this.elements.labContent) {
        this.elements.labContent.style.animation = "shatter 0.5s ease-in-out infinite";
    }

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    overlay.style.color = "#0f0";
    overlay.style.fontFamily = "monospace";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    overlay.style.fontSize = "1.5rem";
    overlay.innerHTML = "[TRAP SPRUNG] Authentication logic sabotaged. All agents accessible.";
    document.body.appendChild(overlay);
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        if (this.elements.labContent) {
            this.elements.labContent.style.animation = "";
        }
    }, 3000);
    if (this.fusionIndex && typeof this.fusionIndex.unlockAll === 'function') {
        this.fusionIndex.unlockAll();
    }
  }

  /**
   * Resets the lab state for another fusion.
   */
  resetLab() {
    this.state.slotA = null;
    this.state.slotB = null;

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
   */
  showResult() {
    const fuseBtn = this.elements.fuseBtn;
    if (fuseBtn) {
      DOMUtils.setButtonState(fuseBtn, "ready", "Ignite Fusion Protocol");
    }

    const container = this.elements.fusionResultContainer;
    const resetBtn = this.elements.resetLabBtn;
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("fusion-revealed");
      if (resetBtn) {
          resetBtn.classList.remove("hidden");
      }

      // Ensure the card inside gets focused for accessibility
      const cardTitle = container.querySelector(".agent-title");
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
