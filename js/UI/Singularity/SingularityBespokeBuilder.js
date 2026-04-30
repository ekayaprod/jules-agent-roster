class SingularityBespokeBuilder {
  constructor(julesTerminal) {
    this.julesTerminal = julesTerminal;
    this.container = document.getElementById("singularityBuilderContainer");
    this.elements = {};
    this.showAdvanced = false;
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <style>
        .singularity-builder .quick-fill-pill {
          font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 1rem; border: 1px solid var(--mythic); background: transparent; color: var(--mythic); cursor: pointer; transition: all 0.2s ease-in-out;
        }
        .singularity-builder .quick-fill-pill:hover, .singularity-builder .quick-fill-pill:focus-visible {
          background: rgba(217, 70, 239, 0.1); outline: none; transform: translateY(-1px);
        }
        .singularity-builder #singularitySubmitBtn {
          width: 100%; background: var(--mythic); color: #000; font-weight: bold; border: none; padding: 0.75rem; border-radius: 0.25rem; cursor: pointer; transition: all 0.2s ease-in-out;
        }
        .singularity-builder #singularitySubmitBtn:not(:disabled):hover, .singularity-builder #singularitySubmitBtn:not(:disabled):focus-visible {
          filter: brightness(1.1); transform: translateY(-1px); outline: 2px solid var(--mythic); outline-offset: 2px;
        }
        .singularity-builder #singularitySubmitBtn:not(:disabled):active {
          transform: scale(0.98);
        }
        .singularity-builder #singularitySubmitBtn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .singularity-builder #singularityAdvancedToggle {
          font-size: 0.875rem; font-weight: 600; background: transparent; border: none; color: var(--mythic); cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; transition: all 0.2s ease-in-out; text-decoration: underline;
        }
        .singularity-builder #singularityAdvancedToggle:hover, .singularity-builder #singularityAdvancedToggle:focus-visible {
          background: rgba(217, 70, 239, 0.1); outline: none; text-decoration: none;
        }
      </style>
      <div class="singularity-builder card p-6 tier-epic" style="background: var(--card-bg);">
        <h3 style="color: var(--mythic); display: flex; align-items: center; gap: 0.5rem; margin-top: 0;">
          <span style="font-size: 1.5rem;">🌌</span> Singularity Meta-Forge
        </h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Configure a bespoke micro-agent by defining its parameters below. Singularity will forge the agent.
        </p>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label for="singularityAgentName" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Agent Name</label>
              <input type="text" id="singularityAgentName" placeholder="e.g., Code Sweeper" class="modal-input" style="width: 100%;" />
            </div>
            <div style="width: 4rem;">
              <label for="singularityAgentEmoji" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Emoji</label>
              <input type="text" id="singularityAgentEmoji" placeholder="🧹" class="modal-input" style="width: 100%; text-align: center;" maxlength="2" />
            </div>
          </div>

          <div>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
              <button class="quick-fill-pill" data-mission="Refactor legacy code to modern standards." data-constraints="Match Existing Styling, Do not modify tests">✨ Refactor Legacy</button>
              <button class="quick-fill-pill" data-mission="Enforce strict typing and add validation guards." data-constraints="No UI Mutations, Match Existing Styling">🛡️ Enforce Types</button>
              <button class="quick-fill-pill" data-mission="Prune dead code and remove unused files." data-constraints="No UI Mutations">🧹 Prune Dead Code</button>
            </div>
            <label for="singularityMission" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
              Core Mission
              <span id="singularityArchetypeBadge" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; background: var(--details-bg); border: 1px solid var(--border);">🛠️ Maker</span>
            </label>
            <textarea id="singularityMission" placeholder="Describe the specific task this agent must perform..." class="modal-input" style="width: 100%; min-height: 4rem; resize: vertical;"></textarea>
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Safety Constraints</label>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="singularityConstraints">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="Read-only Database" /> Read-only Database
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="No UI Mutations" /> No UI Mutations
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="Do not modify tests" /> Do not modify tests
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="No New Dependencies" /> No New Dependencies
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="Match Existing Styling" /> Match Existing Styling
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                <input type="checkbox" value="Dry-Run Only (Generate Report)" /> Dry-Run Only (Generate Report)
              </label>
            </div>
          </div>

          <div>
            <button id="singularityAdvancedToggle">
              Advanced Options <span>▼</span>
            </button>
            <div id="singularityAdvancedOptions" class="advanced-options" style="visibility: hidden; opacity: 0; transform: translateY(-10px); transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease, max-height 0.3s ease, margin-top 0.3s ease; max-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 1rem; margin-top: 0;">
              <div>
                <label for="singularityTechStack" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Primary Tech Stack (Optional)</label>
                <input type="text" id="singularityTechStack" placeholder="e.g., React, Node.js, Python" class="modal-input" style="width: 100%;" />
              </div>
              <div>
                <label for="singularityTargets" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Target Directories (Optional)</label>
                <input type="text" id="singularityTargets" placeholder="e.g., src/components, lib/utils" class="modal-input" style="width: 100%;" />
              </div>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <button id="singularitySubmitBtn">
              Forge Bespoke Agent
            </button>
          </div>
        </div>
      </div>
    `;

    this.elements = {
      nameInput: document.getElementById("singularityAgentName"),
      emojiInput: document.getElementById("singularityAgentEmoji"),
      missionInput: document.getElementById("singularityMission"),
      archetypeBadge: document.getElementById("singularityArchetypeBadge"),
      quickFillPills: this.container.querySelectorAll(".quick-fill-pill"),
      constraintsContainer: document.getElementById("singularityConstraints"),
      advancedToggleBtn: document.getElementById("singularityAdvancedToggle"),
      advancedOptionsDiv: document.getElementById("singularityAdvancedOptions"),
      techStackInput: document.getElementById("singularityTechStack"),
      targetsInput: document.getElementById("singularityTargets"),
      submitBtn: document.getElementById("singularitySubmitBtn")
    };
  }

  bindEvents() {
    if (this.elements.submitBtn) {
      this.elements.submitBtn.addEventListener("click", () => this.handleForge());
    }

    if (this.elements.advancedToggleBtn && this.elements.advancedOptionsDiv) {
      this.elements.advancedToggleBtn.addEventListener("click", () => {
        this.showAdvanced = !this.showAdvanced;

        // 🪄 CONJURE: GPU Sleight of Hand using pure CSS transform and opacity rather than expensive display reflows.
        if (this.showAdvanced) {
          this.elements.advancedOptionsDiv.style.visibility = "visible";
          this.elements.advancedOptionsDiv.style.opacity = "1";
          this.elements.advancedOptionsDiv.style.transform = "translateY(0)";
          this.elements.advancedOptionsDiv.style.maxHeight = "500px";
          this.elements.advancedOptionsDiv.style.marginTop = "1rem";
        } else {
          this.elements.advancedOptionsDiv.style.visibility = "hidden";
          this.elements.advancedOptionsDiv.style.opacity = "0";
          this.elements.advancedOptionsDiv.style.transform = "translateY(-10px)";
          this.elements.advancedOptionsDiv.style.maxHeight = "0";
          this.elements.advancedOptionsDiv.style.marginTop = "0";
        }

        const span = this.elements.advancedToggleBtn.querySelector("span");
        if (span) span.textContent = this.showAdvanced ? "▲" : "▼";
      });
    }

    if (this.elements.quickFillPills && this.elements.missionInput) {
      this.elements.quickFillPills.forEach(pill => {
        pill.addEventListener("click", (e) => {
          e.preventDefault();
          const missionText = pill.getAttribute("data-mission");
          const constraintsAttr = pill.getAttribute("data-constraints");

          if (missionText) {
            this.elements.missionInput.value = missionText;
            // Manually trigger input event to update the badge
            this.elements.missionInput.dispatchEvent(new Event("input"));
          }

          if (constraintsAttr && this.elements.constraintsContainer) {
            const constraintsToSet = constraintsAttr.split(",").map(c => c.trim());
            const checkboxes = this.elements.constraintsContainer.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(cb => {
              cb.checked = constraintsToSet.includes(cb.value);
            });
          }
        });
      });
    }

    if (this.elements.missionInput && this.elements.archetypeBadge) {
      this.elements.missionInput.addEventListener("input", (e) => {
        const text = e.target.value;
        if (/delete|remove|clean|prune/i.test(text)) {
          this.elements.archetypeBadge.innerHTML = "🗡️ Assassin";
        } else if (/enforce|guard|validate/i.test(text)) {
          this.elements.archetypeBadge.innerHTML = "🛡️ Sentinel";
        } else if (/document|read|analyze/i.test(text)) {
          this.elements.archetypeBadge.innerHTML = "🔮 Oracle";
        } else {
          this.elements.archetypeBadge.innerHTML = "🛠️ Maker";
        }
      });
    }
  }

  async handleForge() {
    const name = this.elements.nameInput.value.trim() || "";
    const emoji = this.elements.emojiInput.value.trim() || "";
    const mission = this.elements.missionInput.value.trim() || "";
    const targets = this.elements.targetsInput.value.trim() || "";
    const techStack = this.elements.techStackInput ? (this.elements.techStackInput.value.trim() || "") : "";

    const checkboxes = this.elements.constraintsContainer.querySelectorAll("input[type='checkbox']:checked");
    const constraintsList = Array.from(checkboxes).map(cb => cb.value);
    const constraints = constraintsList.length > 0 ? constraintsList.join(", ") : "";

    // 🪄 CONJURE: Updating the UI instantly using optimistic state, masking network latency.
    const uiState = {
      originalBtnText: this.elements.submitBtn.innerHTML,
      setOptimistic: () => {
        if (typeof DOMUtils !== "undefined") {
          DOMUtils.setButtonState(this.elements.submitBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Forging Agent...");
        } else {
          this.elements.submitBtn.innerHTML = "<span class='skeleton-pulse'>Forging Agent...</span>";
          this.elements.submitBtn.disabled = true;
        }
      },
      rollback: () => {
        if (typeof DOMUtils !== "undefined") {
          DOMUtils.setButtonState(this.elements.submitBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Forge Bespoke Agent");
        } else {
          this.elements.submitBtn.innerHTML = uiState.originalBtnText;
          this.elements.submitBtn.disabled = false;
        }
      }
    };

    uiState.setOptimistic();

    const fetchPromise = typeof NetworkUtils !== 'undefined' ?
      NetworkUtils.fetchWithRetry("prompts/system/Singularity.md", { throwOn404: false }).then(res => res.ok ? res.text() : null) :
      fetch("prompts/system/Singularity.md").then(res => res.ok ? res.text() : null);

    try {
      let template = await fetchPromise;

      if (!template) {
          if (window.rosterApp && window.rosterApp.showToast) {
              window.rosterApp.showToast("Failed to load Singularity template");
          }
          uiState.rollback();
          return;
      }

      const payloadPrompt = template
        .replace(/{{UI_AGENT_NAME}}/g, name)
        .replace(/{{UI_AGENT_EMOJI}}/g, emoji)
        .replace(/{{UI_MISSION_STATEMENT}}/g, mission)
        .replace(/{{UI_CHECKLIST_CONSTRAINTS}}/g, constraints)
        .replace(/{{UI_TARGET_DIRECTORIES}}/g, targets)
        .replace(/{{UI_TECH_STACK}}/g, techStack);

      const agentPayload = {
        name: "Singularity",
        emoji: "🌌",
        role: "Meta-Architect",
        prompt: payloadPrompt,
        isCustom: true
      };

      if (this.julesTerminal) {
        this.julesTerminal.launchSession(agentPayload, this.elements.submitBtn);
      } else {
          uiState.rollback();
          console.warn("Singularity Builder: julesTerminal is missing");
      }
    } catch (error) {
      uiState.rollback();
      console.error("Failed to forge agent:", error);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SingularityBespokeBuilder;
}
