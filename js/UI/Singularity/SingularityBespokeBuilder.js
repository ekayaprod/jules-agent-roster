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
      <div class="singularity-builder card p-6" style="border: 2px solid var(--mythic); background: var(--card-bg); box-shadow: 0 0 15px rgba(255, 0, 255, 0.2);">
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
              <button class="quick-fill-pill" data-mission="Refactor legacy code to modern standards." data-constraints="Match Existing Styling, Do not modify tests" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 1rem; border: 1px solid var(--mythic); background: transparent; color: var(--mythic); cursor: pointer;">✨ Refactor Legacy</button>
              <button class="quick-fill-pill" data-mission="Enforce strict typing and add validation guards." data-constraints="No UI Mutations, Match Existing Styling" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 1rem; border: 1px solid var(--mythic); background: transparent; color: var(--mythic); cursor: pointer;">🛡️ Enforce Types</button>
              <button class="quick-fill-pill" data-mission="Prune dead code and remove unused files." data-constraints="No UI Mutations" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 1rem; border: 1px solid var(--mythic); background: transparent; color: var(--mythic); cursor: pointer;">🧹 Prune Dead Code</button>
            </div>
            <label for="singularityMission" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
              Core Mission
              <span id="singularityArchetypeBadge" style="font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; background: var(--surface-2); border: 1px solid var(--border-color);">🛠️ Maker</span>
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
            <button id="singularityAdvancedToggle" style="font-size: 0.875rem; font-weight: 600; background: transparent; border: none; color: var(--mythic); cursor: pointer; padding: 0; text-decoration: underline;">
              Advanced Options <span>▼</span>
            </button>
            <div id="singularityAdvancedOptions" class="advanced-options" style="display: none; flex-direction: column; gap: 1rem; margin-top: 1rem;">
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
            <button id="singularitySubmitBtn" style="width: 100%; background: var(--mythic); color: #000; font-weight: bold; border: none; padding: 0.75rem; border-radius: 0.25rem; cursor: pointer;">
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
        this.elements.advancedOptionsDiv.style.display = this.showAdvanced ? "flex" : "none";
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

    const fetchPromise = typeof NetworkUtils !== 'undefined' ?
      NetworkUtils.fetchWithRetry("prompts/system/Singularity.md", { throwOn404: false }).then(res => res.ok ? res.text() : null) :
      fetch("prompts/system/Singularity.md").then(res => res.ok ? res.text() : null);

    let template = await fetchPromise;

    if (!template) {
        if (window.rosterApp && window.rosterApp.showToast) {
            window.rosterApp.showToast("Failed to load Singularity template");
        }
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
        console.warn("Singularity Builder: julesTerminal is missing");
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SingularityBespokeBuilder;
}
