class FusionLab {
  constructor() {
    this.agents = [];
    this.compiler = null;
    this.lastFusionResult = null;
  }

  /**
   * Initializes the Fusion Lab component.
   * @param {Array} agentsData - The list of agents.
   * @param {Object} customAgentsData - The map of custom agent fusions.
   */
  init(agentsData, customAgentsData) {
    this.agents = agentsData;
    this.compiler = new FusionCompiler(agentsData, customAgentsData);
    this.populateDropdowns();
    this.bindEvents();
  }

  /**
   * Binds event listeners for the Fusion Lab.
   */
  bindEvents() {
    const slotA = document.getElementById("slotA");
    const slotB = document.getElementById("slotB");
    const fuseBtn = document.getElementById("fuseBtn");
    const copyFusionBtn = document.getElementById("copyFusionBtn");

    if (slotA) {
      slotA.addEventListener("change", () => {
        this.updateState();
        this.clearError();
      });
    }
    if (slotB) {
      slotB.addEventListener("change", () => {
        this.updateState();
        this.clearError();
      });
    }
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
   * Populates the Fusion Lab dropdowns with base agents.
   */
  populateDropdowns() {
    const slotA = document.getElementById("slotA");
    const slotB = document.getElementById("slotB");
    const fuseBtn = document.getElementById("fuseBtn");

    if (!slotA || !slotB) return;

    const options = this.compiler.baseAgents
      .map(
        (agent) =>
          `<option value="${agent.name}">${agent.icon} ${agent.name}</option>`,
      )
      .join("");

    slotA.innerHTML =
      '<option value="">Select Base Agent...</option>' + options;
    slotB.innerHTML =
      '<option value="">Select Modifier Agent...</option>' + options;

    if (fuseBtn) {
      fuseBtn.disabled = true;
      fuseBtn.innerText = "Ignite Fusion Protocol";
    }
  }

  /**
   * Updates the state of the Fusion button and visual indicators.
   */
  updateState() {
    const slotA = document.getElementById("slotA");
    const slotB = document.getElementById("slotB");
    const fuseBtn = document.getElementById("fuseBtn");
    const plusIcon = document.querySelector(".fusion-plus");

    if (slotA && slotB && fuseBtn) {
      const isReady = slotA.value !== "" && slotB.value !== "";
      fuseBtn.disabled = !isReady;

      if (plusIcon) {
        if (isReady) {
          plusIcon.classList.add("ready-pulse");
          plusIcon.style.color = "#a855f7";
        } else {
          plusIcon.classList.remove("ready-pulse");
          plusIcon.style.color = "var(--text-secondary)";
        }
      }
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
    const slotA = document.getElementById("slotA");
    const slotB = document.getElementById("slotB");
    const fuseBtn = document.getElementById("fuseBtn");
    const emptyState = document.getElementById("fusionEmptyState");

    const nameA = slotA.value;
    const nameB = slotB.value;

    if (!nameA || !nameB) return;

    // Reset UI states
    this.clearError();
    if (fuseBtn) {
      fuseBtn.classList.add("loading");
      fuseBtn.innerText = "Igniting Protocol...";
      fuseBtn.disabled = true;
    }

    const agentA = this.agents.find((a) => a.name === nameA);
    const agentB = this.agents.find((a) => a.name === nameB);

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

      this.showError(msg);
      return;
    }

    this.lastFusionResult = result;
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
      output.insertBefore(descEl, fusionCode);
    }
    descEl.innerText = result.description || "";

    // Parse and render prompt (XML or Legacy)
    if (typeof PromptParser !== "undefined") {
      const parsed = PromptParser.parsePrompt(result.prompt);
      if (parsed.format === "xml") {
        const sections = parsed.sections
          .map((sec) => {
            let label = "";
            if (sec.tag === "system") label = "System Role";
            else if (sec.tag === "task") label = "Mission";
            else if (sec.tag === "step")
              label = `Step ${sec.id || "?"}: ${sec.name || ""}`;
            else if (sec.tag === "output") label = "Output Format";
            else label = sec.tag.toUpperCase();

            return `
              <div class="prompt-section prompt-section--${sec.tag}">
                  <div class="prompt-section-label">${label}</div>
                  <div class="prompt-section-body">${sec.content}</div>
              </div>
            `;
          })
          .join("");
        fusionCode.innerHTML = `<div class="prompt-structured">${sections}</div>`;
      } else {
        fusionCode.innerText = result.prompt;
      }
    } else {
      fusionCode.innerText = result.prompt;
    }

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
   * Reveals the fusion result with smooth transitions.
   */
  showResult() {
    const fuseBtn = document.getElementById("fuseBtn");
    if (fuseBtn) {
      fuseBtn.innerText = "Ignite Fusion Protocol";
      fuseBtn.classList.remove("loading");
      fuseBtn.disabled = false;
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
    const controls = document.querySelector(".fusion-controls");

    // Close result if open
    const wrapper = document.getElementById("fusionOutputWrapper");
    if (wrapper) wrapper.classList.remove("open");

    // Setup Animation Data
    iconLeft.innerHTML = agentA.icon;
    iconRight.innerHTML = agentB.icon;
    animResult.innerText = result.name;

    // Determine Result Icon
    if (result.isCustom && result.name) {
      // Extract emoji from end of name string (e.g. "The Void ☠️")
      const parts = result.name.trim().split(" ");
      const lastPart = parts[parts.length - 1];
      // Simple check if it looks like an emoji/icon (not a word)
      if (lastPart && !/^[A-Za-z0-9]+$/.test(lastPart)) {
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
        // Fallback handled by onerror
        iconResult.innerHTML = `<img src="${imgUrl}" alt="${result.name}" style="width: 1em; height: 1em; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerText='${iconA}${iconB}'" />`;
      }
    }

    fuseBtn.disabled = true;
    if (controls) controls.classList.add("fusing");

    // Start Animation
    overlay.classList.add("active");

    setTimeout(() => {
      overlay.classList.remove("active");
      fuseBtn.disabled = false;
      if (controls) controls.classList.remove("fusing");

      this.showResult();
    }, 3500);
  }
}
