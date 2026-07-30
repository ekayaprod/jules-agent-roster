class SingularityBespokeBuilder {
  constructor(julesTerminal) {
    this.julesTerminal = julesTerminal;
    this.container = document.getElementById("singularityBuilderContainer");
    this.showAdvanced = false;
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="sg-builder">

        <div class="sg-header" id="sgHeaderToggle">
          <div class="sg-header-content">
            <span class="sg-header-icon">🌌</span>
            <div>
              <h3 class="agent-title">Singularity Meta-Forge</h3>
              <p class="description mt-1">Define your agent below — Singularity will scan your repo and forge the rest.</p>
            </div>
          </div>
        </div>

        <div class="sg-body" id="sgForgeContainer">

          <div class="sg-section">
            <div class="sg-section-header">
              <label class="sg-label" for="sgMission">Core Mission</label>
              <span class="sg-label-note">Describe what you want the agent to do</span>
            </div>
            <textarea id="sgMission" class="sg-textarea transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none hover:shadow-sm" placeholder="e.g., Build a python script to parse logs, or find and delete unused css files..."></textarea>
            <div id="sgErrorWrapper" class="fusion-error-alert transition-all duration-300 ease-in-out hidden mt-2">
              <svg class="fusion-error-icon shrink-0 mt-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="fusion-error-content">
                <p class="fusion-error-title">Forge Error</p>
                <p id="sgErrorText" class="fusion-error-desc">An error occurred while forging.</p>
              </div>
            </div>
          </div>

        </div>

        <div class="sg-footer-divider"></div>

        <div class="sg-footer">
          <p class="sg-outcome-note">
            Singularity will scan your repository and deliver a new agent file via pull request to <code>.jules/agents/</code>
          </p>
          <button class="sg-submit transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" id="sgSubmit">🌌 Forge Bespoke Agent</button>
        </div>

      </div>
    `;

    this.elements = {
      missionInput: document.getElementById("sgMission"),
      submitBtn:    document.getElementById("sgSubmit"),
      errorWrapper: document.getElementById("sgErrorWrapper"),
      errorText:    document.getElementById("sgErrorText"),
    };
  }

  bindEvents() {
    if (this.elements.submitBtn) {
      this.elements.submitBtn.addEventListener("click", () => this.handleForge());
    }

    const forgeContainer = document.getElementById("sgForgeContainer");
    const headerToggle = document.getElementById("sgHeaderToggle");
    if (headerToggle && forgeContainer) {
      headerToggle.addEventListener("click", () => {
         forgeContainer.classList.toggle("expanded");
      });
    }
  }

  async handleForge() {
    let mission = this.elements.missionInput.value.trim() || "";

    if (this.elements.errorWrapper) {
      this.elements.errorWrapper.classList.add("hidden");
    }
    if (this.elements.missionInput) {
      this.elements.missionInput.classList.remove("border-error");
    }

    const uiState = {
      original: this.elements.submitBtn.innerHTML,
      setOptimistic: () => {
        if (typeof DOMUtils !== "undefined") {
          DOMUtils.setButtonState(
            this.elements.submitBtn,
            typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading",
            "Forging Agent..."
          );
        } else {
          this.elements.submitBtn.innerHTML = "Forging Agent...";
          this.elements.submitBtn.disabled  = true;
        }
      },
      rollback: () => {
        if (typeof DOMUtils !== "undefined") {
          DOMUtils.setButtonState(
            this.elements.submitBtn,
            typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready",
            "🌌 Forge Bespoke Agent"
          );
        } else {
          this.elements.submitBtn.innerHTML = uiState.original;
          this.elements.submitBtn.disabled  = false;
        }
      },
    };

    uiState.setOptimistic();

    try {
      let r;
      if (typeof NetworkUtils !== "undefined") {
        r = await NetworkUtils.fetchWithRetry("js/Features/Singularity/Singularity.md", { throwOn404: false });
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try {
          r = await fetch("js/Features/Singularity/Singularity.md", { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }
      }

      const template = r.ok ? await r.text() : null;

      if (!template) {
        if (window.rosterApp?.showToast) {
          window.rosterApp.showToast("Unable to load the Singularity template. Please try again.");
        }
        uiState.rollback();
        return;
      }

      const payloadPrompt = template
        .replace(/{{UI_MISSION_STATEMENT}}/g, mission);

      const agentPayload = {
        emoji:    "🌌",
        isCustom: true,
        name:     "Singularity",
        prompt:   payloadPrompt,
        role:     "Meta-Architect",
      };

      if (this.julesTerminal) {
        this.julesTerminal.launchSession(agentPayload, this.elements.submitBtn);
      } else {
        uiState.rollback();
        const tu = window.TelemetryUtils;
        if (tu) {
            tu.dispatchEvent("BUILDER_MISSING_TERMINAL", new Error("julesTerminal instance is missing"));
        }
      }
    } catch (error) {
      uiState.rollback();
      if (this.elements.errorWrapper && this.elements.errorText) {
        this.elements.errorWrapper.classList.remove("hidden");
        this.elements.errorText.innerText = error.message || "Unknown error";
        this.elements.errorWrapper.setAttribute("aria-live", "assertive");
      }
      if (this.elements.missionInput) {
        this.elements.missionInput.classList.add("border-error");
        this.elements.missionInput.focus();
      }
      const forgeError = new Error(`Singularity Forge Error: ${error.message}`);
      forgeError.cause = error;
      const tu = window.TelemetryUtils;
      if (tu) {
          tu.dispatchEvent("BUILDER_FORGE_ERROR", forgeError);
      } else {
          const globalTu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
          if (globalTu) globalTu.dispatchEvent("BUILDER_FORGE_ERROR", forgeError);
      }
      if (window.rosterApp?.showToast) {
        window.rosterApp.showToast(`Unable to forge bespoke agent: ${error.message || "Unknown error"}`);
      }
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SingularityBespokeBuilder;
}
