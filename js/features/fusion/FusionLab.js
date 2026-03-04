class FusionLab {
  constructor() {
    this.agents = [];
    this.compiler = null;
    this.lastFusionResult = null;
    this.picker = null;
    // Internal State for Selection
    this.state = {
      slotA: null,
      slotB: null,
    };
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
    const fuseBtn = document.getElementById("fuseBtn");
    const copyFusionBtn = document.getElementById("copyFusionBtn");

    // Slot Interactions
    const slotACard = document.getElementById("slotACard");
    const slotBCard = document.getElementById("slotBCard");

    if (slotACard) slotACard.addEventListener("click", () => {
        if (this.picker) this.picker.openPicker("slotA", this.state.slotA);
    });
    if (slotBCard) slotBCard.addEventListener("click", () => {
        if (this.picker) this.picker.openPicker("slotB", this.state.slotB);
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
    const fuseBtn = document.getElementById("fuseBtn");

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
    const errorEl = document.getElementById("fusionError");
    const textSpan = document.getElementById("fusionErrorText");
    const fuseBtn = document.getElementById("fuseBtn");

    if (fuseBtn) {
      fuseBtn.classList.remove("loading");
      fuseBtn.classList.add("error");
      fuseBtn.innerText = "Ignite Fusion Protocol";
      fuseBtn.disabled = false;
      fuseBtn.setAttribute("aria-disabled", "false");
      fuseBtn.setAttribute("aria-busy", "false");
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
    const errorEl = document.getElementById("fusionError");
    const fuseBtn = document.getElementById("fuseBtn");

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
    const fuseBtn = document.getElementById("fuseBtn");

    const agentA = this.state.slotA;
    const agentB = this.state.slotB;

    if (!agentA || !agentB) return;

    // Reset UI states
    this.clearError();
    if (fuseBtn) {
      fuseBtn.classList.add("loading");
      fuseBtn.innerText = "Igniting Protocol...";
      fuseBtn.disabled = true;
      fuseBtn.setAttribute("aria-disabled", "true");
      fuseBtn.setAttribute("aria-busy", "true");
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

    this.runAnimation(agentA, agentB, result);
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

    const container = document.getElementById("fusionResultContainer");
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
   * Reveals the fusion result with smooth transitions.
   */
  showResult() {
    const fuseBtn = document.getElementById("fuseBtn");
    if (fuseBtn) {
      fuseBtn.innerText = "Ignite Fusion Protocol";
      fuseBtn.classList.remove("loading");
      fuseBtn.disabled = false;
      fuseBtn.setAttribute("aria-disabled", "false");
      fuseBtn.setAttribute("aria-busy", "false");
    }

    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) {
      wrapper.classList.add("open");

      // Ensure the card inside gets focused for accessibility
      const cardTitle = wrapper.querySelector(".agent-title");
      if (cardTitle) {
          cardTitle.setAttribute("tabindex", "-1");
          cardTitle.focus();
          cardTitle.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  /**
   * Orchestrates the fusion animation sequence.
   */
  async runAnimation(agentA, agentB, result) {
    const overlay = document.getElementById("fusionAnimationOverlay");
    const iconLeft = overlay.querySelector(".anim-icon.left");
    const iconRight = overlay.querySelector(".anim-icon.right");
    const iconResult = overlay.querySelector(".anim-icon.result");
    const animResult = overlay.querySelector(".anim-result");
    const fuseBtn = document.getElementById("fuseBtn");
    const controls = document.getElementById("fusionLabContent"); // Updated class

    // Close result if open
    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) wrapper.classList.remove("open");

    // Dynamic Tier Styling & Particle Generation
    const tier = result.tier || "Common";
    const tierClass = `tier-${tier.toLowerCase()}`;

    // Clean up previous tier classes
    overlay.className = "fusion-animation-overlay";
    overlay.classList.add(tierClass);

    const particlesContainer = overlay.querySelector(".anim-particles");
    if (particlesContainer) {
      particlesContainer.innerHTML = ""; // Clear previous particles

      let particleCount = 0;
      let speedMultiplier = 1;

      switch (tier) {
        case "Common": particleCount = 0; speedMultiplier = 1; break;
        case "Uncommon": particleCount = 20; speedMultiplier = 1; break;
        case "Rare": particleCount = 40; speedMultiplier = 1.2; break;
        case "Epic": particleCount = 160; speedMultiplier = 1.5; break;
        case "Legendary": particleCount = 300; speedMultiplier = 2; break;
      }

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "anim-particle";
        // Randomize angle and distance for the particle explosion
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150; // pixels to travel
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.style.animationDuration = `${0.8 / speedMultiplier}s`;
        // Delay slightly for Legendary to create a fountain effect
        if (tier === "Legendary" || tier === "Epic") {
            particle.style.animationDelay = `${1.5 + Math.random() * 1.5}s`;
        } else {
            particle.style.animationDelay = `1.5s`;
        }

        particlesContainer.appendChild(particle);
      }
    }

    // Setup Animation Data
    iconLeft.innerHTML = agentA.emoji;
    iconRight.innerHTML = agentB.emoji;

    const icon = FormatUtils.extractIcon(result, `${agentA.emoji}${agentB.emoji}`);
    const displayName = FormatUtils.extractDisplayName(result);

    // Set result name with highlighted text and separate emoji
    animResult.innerHTML = `<span class="highlight">${displayName}</span> ${icon}`;

    // Determine Result Icon
    if (result.isCustom && result.name) {
      if (iconResult) iconResult.innerHTML = icon;
    } else {
      // Standard Fusion: Emoji Kitchen
      const iconA = agentA.emoji.trim();
      const iconB = agentB.emoji.trim();

      // Use Emoji Kitchen API
      const imgUrl = `${CONFIG.emojiKitchenPrefix}${iconA}_${iconB}?size=128`;

      if (iconResult) {
        // Gallerist: Premium Asset Loading
        iconResult.innerHTML = ""; // Clear previous content

        // Create Container
        const wrapper = document.createElement("div");
        wrapper.className = "img-wrapper";
        wrapper.style.fontSize = "inherit"; // Inherit font size from parent

        // Create Placeholder
        // 💊 Placebo: Use skeleton pulse to mask latency
        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder skeleton-pulse";
        wrapper.appendChild(placeholder);

        iconResult.appendChild(wrapper);

        // 💊 Placebo: Resilient Image Loading with Exponential Backoff
        const loadImageWithRetry = (url, retries = 3, backoff = 300) => {
          const img = new Image();
          img.src = url;
          img.alt = result.name;
          img.loading = "eager";
          img.className = "img-loading";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";

          img.onload = () => {
            wrapper.appendChild(img);
            // Trigger reflow to ensure CSS transition applies
            void img.offsetWidth;
            img.classList.remove("img-loading");
            img.classList.add("img-loaded");
            placeholder.classList.add("hidden");
            // Remove placeholder after transition
            setTimeout(() => {
              if (placeholder.parentNode) placeholder.remove();
            }, 300);
          };

          img.onerror = () => {
            if (retries > 0) {
              console.warn(`💊 Placebo: Image load failed. Retrying... (${retries} left)`);
              setTimeout(() => loadImageWithRetry(url, retries - 1, backoff * 2), backoff);
            } else {
              // Structured logging for hard failures
              console.error(JSON.stringify({
                  event: "EMOJI_KITCHEN_API_FAILURE",
                  url: url,
                  reason: "All retries exhausted",
                  timestamp: new Date().toISOString()
              }));
              wrapper.remove();
              // Graceful Fallback
              iconResult.innerText = `${iconA}${iconB}`;
            }
          };
        };

        // Start async load without blocking the 3500ms timeline
        loadImageWithRetry(imgUrl);
      }
    }

    fuseBtn.disabled = true;
    fuseBtn.setAttribute("aria-disabled", "true");
    if (controls) controls.classList.add("fusing");

    // Start Animation
    overlay.classList.add("active");

    await new Promise(resolve => setTimeout(resolve, 3500));

    overlay.classList.remove("active");
    fuseBtn.disabled = false;
    fuseBtn.setAttribute("aria-disabled", "false");
    if (controls) controls.classList.remove("fusing");

    this.showResult();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FusionLab;
}
