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

    if (slotACard) slotACard.addEventListener("click", () => {
        this.openPicker("slotA");
    });
    if (slotBCard) slotBCard.addEventListener("click", () => {
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

    // Modal Events
    const modal = document.getElementById("agentPickerModal");
    const closeBtn = document.getElementById("closePickerBtn");
    const searchInput = document.getElementById("pickerSearch");

    if (modal) {
        // Close on backdrop click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) this.closePicker();
        });
    }
    if (closeBtn) closeBtn.addEventListener("click", () => this.closePicker());
    if (searchInput) {
        // ⚡ Bolt+: Debounce picker search
        const debouncedFilter = PerformanceUtils.debounce((query) => {
            this.filterPicker(query);
        }, 300);
        searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));

        const clearPickerSearchEmptyBtn = document.getElementById("clearPickerSearchEmptyBtn");
        if (clearPickerSearchEmptyBtn) {
            clearPickerSearchEmptyBtn.addEventListener("click", () => {
                searchInput.value = "";
                this.filterPicker("");
                searchInput.focus();
            });
        }
    }


    // 💎 Jeweler: Grid Keyboard Navigation
    const pickerGrid = document.getElementById("pickerGrid");
    if (pickerGrid) {
        pickerGrid.addEventListener("keydown", (e) => this.handleGridKeydown(e));
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
                <span class="slot-icon-placeholder">${agent.icon}</span>
                <span class="slot-label">${agent.name}</span>
            `;
        } else {
            card.classList.add("empty");
            card.classList.remove("filled");
            card.setAttribute("aria-label", slotId === "slotA" ? "Initiate Primary Protocol" : "Initiate Secondary Protocol");
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
    this.activePickerSlot = slotKey;
    const modal = document.getElementById("agentPickerModal");
    const grid = document.getElementById("pickerGrid");
    const searchInput = document.getElementById("pickerSearch");

    if (!modal || !grid) {
        console.error("Picker modal or grid not found");
        return;
    }

    // Determine current selections
    const otherSlot = slotKey === "slotA" ? "slotB" : "slotA";
    const otherAgent = this.state[otherSlot];
    const currentAgent = this.state[slotKey];

    // Reset Search
    if (searchInput) searchInput.value = "";

    // Hide empty state initially
    const emptyState = document.getElementById("pickerEmptyState");
    if (emptyState) emptyState.hidden = true;

    // Populate Grid
    grid.innerHTML = "";
    this.compiler.baseAgents.forEach((agent, index) => {
        const item = document.createElement("div");
        item.className = "mini-agent-card pop-in";
        item.style.animationDelay = `${Math.min(index * 30, 300)}ms`;

        item.setAttribute("role", "option");
        // 💎 Jeweler: Roving Tabindex - Only first item is focusable initially
        item.setAttribute("tabindex", index === 0 ? "0" : "-1");
        item.setAttribute("data-name", agent.name.toLowerCase()); // For filtering

        // Check if agent is currently selected in THIS slot
        const isCurrent = currentAgent && currentAgent.name === agent.name;
        if (isCurrent) {
            item.classList.add("selected");
            item.setAttribute("aria-selected", "true");
        }

        item.innerHTML = `
            <span class="mini-icon">${agent.icon}</span>
            <span class="mini-name">${agent.name}</span>
            <span class="mini-role">${agent.role}</span>
        `;

        item.addEventListener("click", () => this.handlePickerSelection(agent));
        // Keydown handled by grid container

        grid.appendChild(item);
    });

    modal.showModal();
    modal.setAttribute("open", "");

    // Focus search
    if (searchInput) searchInput.focus();
  }

  /**
   * Closes the picker modal.
   */
  closePicker() {
      const slotKey = this.activePickerSlot;
      const modal = document.getElementById("agentPickerModal");
      if (modal) {
          modal.close();
      }
      this.activePickerSlot = null;

      // Return focus to trigger
      if (slotKey) {
          const btn = document.getElementById(slotKey + "Card");
          // Palette+: Wrap in timeout to ensure modal teardown doesn't interfere
          setTimeout(() => {
              if (btn) btn.focus();
          }, 50);
      }
  }

  /**
   * Handles selection from the picker.
   */
  handlePickerSelection(agent) {
      if (this.activePickerSlot) {
          this.state[this.activePickerSlot] = agent;
          this.renderSlots();
          this.clearError();
          this.renderPreMergePreview();
      }
      this.closePicker();
  }

  /**
   * Renders the pre-merge "Known Recipe" preview if the resulting agent is already unlocked.
   */
  renderPreMergePreview() {
    const actionArea = document.querySelector(".fusion-action-area");
    if (!actionArea) return;

    let previewEl = document.getElementById("preMergePreview");

    const agentA = this.state.slotA;
    const agentB = this.state.slotB;

    if (!agentA || !agentB) {
        if (previewEl) previewEl.style.display = "none";
        return;
    }

    if (agentA.name === agentB.name) {
        if (previewEl) previewEl.style.display = "none";
        return;
    }

    const key = [agentA.name, agentB.name].sort().join(",");

    if (this.fusionIndex && this.fusionIndex.isUnlocked(key)) {
        const result = this.compiler.fuse(agentA, agentB);

        if (!previewEl) {
            previewEl = document.createElement("div");
            previewEl.id = "preMergePreview";
            previewEl.className = "pre-merge-preview";
            actionArea.appendChild(previewEl);
        }

        const parts = result.name.trim().split(" ");
        const lastPart = parts[parts.length - 1];
        const isEmoji = lastPart && !/^[A-Za-z0-9\-\.]+$/.test(lastPart);
        let iconHtml = result.isCustom && isEmoji ? lastPart : `${agentA.icon}${agentB.icon}`;
        let nameHtml = isEmoji ? parts.slice(0, -1).join(" ") : result.name;

        previewEl.innerHTML = `
            <div class="preview-badge">Already Discovered</div>
            <div class="preview-content">
                <span class="preview-icon">${iconHtml}</span>
                <span class="preview-name">${nameHtml}</span>
            </div>
        `;
        previewEl.style.display = "flex";
    } else {
        if (previewEl) previewEl.style.display = "none";
    }
  }

  /**
   * Filters the agent grid in the picker.
   */
  filterPicker(query) {
      const term = query.toLowerCase();
      const items = document.querySelectorAll(".mini-agent-card");
      let visibleCount = 0;
      let firstVisible = null;

      items.forEach(item => {
          const name = item.getAttribute("data-name");
          const match = name.includes(term);
          if (match) {
              item.style.display = "flex";
              if (!firstVisible) firstVisible = item;
              visibleCount++;
          } else {
              item.style.display = "none";
          }
          item.setAttribute("tabindex", "-1"); // Reset all
      });

      // 💎 Jeweler: Reset Roving Tabindex to first result
      if (firstVisible) {
          firstVisible.setAttribute("tabindex", "0");
      }

      // 💎 Jeweler: Live Region Announcement
      const announcer = document.getElementById("pickerAnnouncer");
      if (announcer) {
          announcer.innerText = `${visibleCount} protocols found`;
      }

      const emptyState = document.getElementById("pickerEmptyState");
      if (emptyState) {
          emptyState.hidden = visibleCount > 0;
      }
  }

  /**
   * 💎 Jeweler: Handles keyboard navigation within the grid (Roving Tabindex).
   */
  handleGridKeydown(e) {
      const target = e.target;
      if (!target.classList.contains("mini-agent-card")) return;

      const items = Array.from(document.querySelectorAll(".mini-agent-card")).filter(
          (el) => el.style.display !== "none"
      );
      const index = items.indexOf(target);

      let newIndex = index;

      switch (e.key) {
          case "ArrowRight":
          case "ArrowDown": // Simple grid navigation: next item
              newIndex = index + 1;
              if (newIndex >= items.length) newIndex = 0;
              e.preventDefault();
              break;
          case "ArrowLeft":
          case "ArrowUp": // Simple grid navigation: prev item
              newIndex = index - 1;
              if (newIndex < 0) newIndex = items.length - 1;
              e.preventDefault();
              break;
          case "Home":
              newIndex = 0;
              e.preventDefault();
              break;
          case "End":
              newIndex = items.length - 1;
              e.preventDefault();
              break;
          case "Enter":
          case " ":
              e.preventDefault();
              // Trigger click logic
              target.click();
              return;
          default:
              return;
      }

      // Apply Roving Tabindex
      if (newIndex !== index) {
          items[index].setAttribute("tabindex", "-1");
          const newFocus = items[newIndex];
          newFocus.setAttribute("tabindex", "0");
          newFocus.focus();
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
      fuseBtn.innerText = UI_TEXT.BUTTONS.IGNITE_FUSION;
      fuseBtn.disabled = false;
      fuseBtn.setAttribute("aria-disabled", "false");
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
      fuseBtn.innerText = UI_TEXT.BUTTONS.IGNITING_FUSION;
      fuseBtn.disabled = true;
      fuseBtn.setAttribute("aria-disabled", "true");
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

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      this.showResult();
    } else {
      this.runAnimation(agentA, agentB, result);
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
    // Empty state removed in HTML refactor, but kept here for safety if logic needed
    const emptyState = document.getElementById("fusionEmptyState");
    if (emptyState) emptyState.style.display = "none";

    const output = document.getElementById("fusionOutput");
    const header = output.querySelector("h3");
    const fusionCode = document.getElementById("fusionCode");

    header.innerText = result.name;

    // Add description under header
    let descEl = document.getElementById("fusionDesc");
    if (!descEl) {
      descEl = document.createElement("p");
      descEl.id = "fusionDesc";
      descEl.style.color = "var(--text-secondary)";
      descEl.style.marginTop = "0.5rem";
      descEl.style.marginBottom = "1.5rem";

      try {
        output.insertBefore(descEl, fusionCode);
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "FUSION_DOM_INSERT_FAILED",
            result: result.name,
            error: error.message,
          })
        );
        // Fallback: If fusionCode is not a child of output, try appending to fusionCode's parent or output
        try {
          if (fusionCode && fusionCode.parentNode) {
            fusionCode.parentNode.insertBefore(descEl, fusionCode);
          } else {
            output.appendChild(descEl);
          }
        } catch (fallbackError) {
          console.error(
            JSON.stringify({
              event: "FUSION_DOM_INSERT_FALLBACK_FAILED",
              result: result.name,
              error: fallbackError.message,
            })
          );
          if (output) {
            try {
              output.appendChild(descEl);
            } catch (finalError) {
              // Gracefully degrade by swallowing since we already logged the failure
            }
          }
        }
      }
    }
    descEl.innerText = result.description || "";

    // Parse and render prompt (XML or Legacy)
    if (typeof PromptParser !== "undefined") {
      const parsed = PromptParser.parsePrompt(result.prompt);
      if (parsed.format === "xml" && typeof PromptRenderer !== 'undefined') {
        const structuredHtml = PromptRenderer.renderXml(parsed);
        if (structuredHtml) {
            fusionCode.innerHTML = structuredHtml;
        } else {
            fusionCode.innerText = result.prompt;
        }
      } else {
        fusionCode.innerText = result.prompt;
      }
    } else {
      fusionCode.innerText = result.prompt;
    }
  }

  /**
   * Reveals the fusion result with smooth transitions.
   */
  showResult() {
    const fuseBtn = document.getElementById("fuseBtn");
    if (fuseBtn) {
      fuseBtn.innerText = UI_TEXT.BUTTONS.IGNITE_FUSION;
      fuseBtn.classList.remove("loading");
      fuseBtn.disabled = false;
      fuseBtn.setAttribute("aria-disabled", "false");
    }

    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) {
      wrapper.classList.add("open");
    } else {
      // Fallback
      const output = document.getElementById("fusionOutput");
      if (output) output.style.display = "block";
    }

    const resultHeader = document.getElementById("fusionName");
    if (resultHeader) {
      resultHeader.focus();
      resultHeader.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  /**
   * Orchestrates the fusion animation sequence.
   */
  runAnimation(agentA, agentB, result) {
    const overlay = document.getElementById("fusionAnimationOverlay");
    const iconLeft = overlay.querySelector(".anim-icon.left");
    const iconRight = overlay.querySelector(".anim-icon.right");
    const iconResult = overlay.querySelector(".anim-icon.result");
    const animResult = overlay.querySelector(".anim-result");
    const fuseBtn = document.getElementById("fuseBtn");
    const controls = document.querySelector(".fusion-visual-slots"); // Updated class

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

      let particleCount = 10;
      let speedMultiplier = 1;

      switch (tier) {
        case "Common": particleCount = 10; speedMultiplier = 1; break;
        case "Uncommon": particleCount = 20; speedMultiplier = 1; break;
        case "Rare": particleCount = 40; speedMultiplier = 1.2; break;
        case "Epic": particleCount = 80; speedMultiplier = 1.5; break;
        case "Legendary": particleCount = 150; speedMultiplier = 2; break;
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
    iconLeft.innerHTML = agentA.icon;
    iconRight.innerHTML = agentB.icon;
    // Determine if last part is an emoji/icon (not alphanumeric or basic punctuation)
    const parts = result.name.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    const isEmoji = lastPart && !/^[A-Za-z0-9\-\.]+$/.test(lastPart);

    // Set result name with highlighted text and separate emoji
    if (isEmoji) {
      const textPart = parts.slice(0, -1).join(" ");
      animResult.innerHTML = `<span class="highlight">${textPart}</span> ${lastPart}`;
    } else {
      animResult.innerHTML = `<span class="highlight">${result.name}</span>`;
    }

    // Determine Result Icon
    if (result.isCustom && result.name) {
      if (isEmoji) {
        if (iconResult) iconResult.innerHTML = lastPart;
      } else {
        if (iconResult) iconResult.innerHTML = agentA.icon + agentB.icon;
      }
    } else {
      // Standard Fusion: Emoji Kitchen
      const iconA = agentA.icon.trim();
      const iconB = agentB.icon.trim();

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
        const placeholder = document.createElement("div");
        placeholder.className = "img-placeholder";
        wrapper.appendChild(placeholder);

        // Create Image
        const img = new Image();
        img.src = imgUrl;
        img.alt = result.name;
        img.loading = "lazy";
        img.className = "img-loading";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        // Handle Load
        img.onload = () => {
          img.classList.remove("img-loading");
          img.classList.add("img-loaded");
          placeholder.classList.add("hidden");
          // Remove placeholder after transition
          setTimeout(() => {
            if (placeholder.parentNode) placeholder.remove();
          }, 300);
        };

        // Handle Error
        img.onerror = () => {
          console.warn("Gallerist: Image load failed, falling back to emoji.");
          wrapper.remove();
          iconResult.innerText = `${iconA}${iconB}`;
        };

        wrapper.appendChild(img);
        iconResult.appendChild(wrapper);
      }
    }

    fuseBtn.disabled = true;
    fuseBtn.setAttribute("aria-disabled", "true");
    if (controls) controls.classList.add("fusing");

    // Start Animation
    overlay.classList.add("active");

    setTimeout(() => {
      overlay.classList.remove("active");
      fuseBtn.disabled = false;
      fuseBtn.setAttribute("aria-disabled", "false");
      if (controls) controls.classList.remove("fusing");

      this.showResult();
    }, 3500);
  }
}
