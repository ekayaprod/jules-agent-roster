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

    if (slotA) slotA.addEventListener("change", () => this.updateState());
    if (slotB) slotB.addEventListener("change", () => this.updateState());
    if (fuseBtn) fuseBtn.addEventListener("click", () => this.handleFusion());

    if (copyFusionBtn) {
      copyFusionBtn.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        if (this.lastFusionResult && this.lastFusionResult.prompt) {
          await this.copyText(this.lastFusionResult.prompt);
          this.animateButtonSuccess(btn, "Copied!");
        }
      });
    }
  }

  /**
   * Copies text to clipboard and triggers a global toast if available.
   * @param {string} text
   */
  async copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      if (window.rosterApp && window.rosterApp.showToast) {
        window.rosterApp.showToast("Fusion copied!");
      }
    } catch (err) {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      if (window.rosterApp && window.rosterApp.showToast) {
        window.rosterApp.showToast("Fusion copied!");
      }
    }
  }

  /**
   * Animates a button to indicate success.
   * @param {HTMLElement} btn
   * @param {string} msg
   */
  animateButtonSuccess(btn, msg) {
    const span = btn.querySelector("span");
    const copyIcon = btn.querySelector(".copy-icon");
    const checkIcon = btn.querySelector(".check-icon");
    const originalText = span.innerText;

    btn.classList.add("success-state");
    span.innerText = msg;
    if (copyIcon) copyIcon.style.display = "none";
    if (checkIcon) {
      checkIcon.style.display = "block";
      checkIcon.classList.add("animate");
    }

    setTimeout(() => {
      btn.classList.remove("success-state");
      span.innerText = originalText;
      if (copyIcon) copyIcon.style.display = "block";
      if (checkIcon) {
        checkIcon.style.display = "none";
        checkIcon.classList.remove("animate");
      }
    }, 2000);
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
   * Handles the fusion logic when the Fuse button is clicked.
   */
  async handleFusion() {
    const slotA = document.getElementById("slotA");
    const slotB = document.getElementById("slotB");
    const fuseBtn = document.getElementById("fuseBtn");
    const errorEl = document.getElementById("fusionError");
    const emptyState = document.getElementById("fusionEmptyState");

    const nameA = slotA.value;
    const nameB = slotB.value;

    if (!nameA || !nameB) return;

    // Reset UI states
    if (errorEl) errorEl.hidden = true;
    if (fuseBtn) {
      fuseBtn.classList.remove("error");
      fuseBtn.classList.add("loading");
      fuseBtn.innerText = "Stabilizing...";
      fuseBtn.disabled = true;
    }

    // UX Delay
    await new Promise((r) => setTimeout(r, 400));

    const agentA = this.agents.find((a) => a.name === nameA);
    const agentB = this.agents.find((a) => a.name === nameB);

    const result = this.compiler.fuse(agentA, agentB);
    this.lastFusionResult = result;

    // Error Handling
    if (result.name === "Error") {
      if (fuseBtn) {
        fuseBtn.classList.remove("loading");
        fuseBtn.classList.add("error");
        fuseBtn.innerText = "Ignite Fusion Protocol";
        fuseBtn.disabled = false;
      }
      if (errorEl) {
        errorEl.hidden = false;
        const msg =
          result.prompt === "Cannot fuse an agent with itself."
            ? "Self-fusion unstable. Select distinct protocols."
            : result.prompt;
        const textSpan = errorEl.querySelector("span") || errorEl;
        textSpan.innerText = msg;
      }
      return;
    }

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

    fuseBtn.disabled = true;
    if (controls) controls.classList.add("fusing");

    // Start Animation
    overlay.classList.add("active");

    requestAnimationFrame(() => {
      overlay.classList.add("phase-1");
    });

    setTimeout(() => {
      overlay.classList.add("phase-2");
    }, 1500);

    setTimeout(() => {
      overlay.classList.add("phase-3");
    }, 2000);

    setTimeout(() => {
      overlay.classList.remove("active", "phase-1", "phase-2", "phase-3");
      fuseBtn.disabled = false;
      if (controls) controls.classList.remove("fusing");

      this.showResult();
    }, 3500);
  }
}
