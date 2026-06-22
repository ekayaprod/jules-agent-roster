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
      const fetchPromise = typeof NetworkUtils !== "undefined"
        ? NetworkUtils.fetchWithRetry("js/Features/Singularity/Singularity.md", { throwOn404: false }).then(r => r.ok ? r.text() : null)
        : fetch("js/Features/Singularity/Singularity.md").then(r => r.ok ? r.text() : null);

      const template = await fetchPromise;

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
        name:     "Singularity",
        emoji:    "🌌",
        role:     "Meta-Architect",
        prompt:   payloadPrompt,
        isCustom: true,
      };

      if (this.julesTerminal) {
        this.julesTerminal.launchSession(agentPayload, this.elements.submitBtn);
      } else {
        uiState.rollback();
        const tu = window.TelemetryUtils;
        if (tu) {
            tu.dispatchEvent("BUILDER_MISSING_TERMINAL", new Error("julesTerminal instance is missing"));
        } else {
            console.warn("Singularity Builder: julesTerminal instance is missing.");
        }
      }
    } catch (error) {
      uiState.rollback();
      const forgeError = new Error(`Singularity Forge Error: ${error.message}`);
      forgeError.cause = error;
      const tu = window.TelemetryUtils;
      if (tu) {
          tu.dispatchEvent("BUILDER_FORGE_ERROR", forgeError);
      } else {
          console.error("Unable to forge bespoke agent:", forgeError);
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
