class SingularityBespokeBuilder {
  constructor(julesTerminal) {
    this.julesTerminal = julesTerminal;
    this.container = document.getElementById("singularityBuilderContainer");
    this.elements = {};
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
            <label for="singularityMission" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Core Mission</label>
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
            </div>
          </div>

          <div>
            <label for="singularityTargets" style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Target Directories (Optional)</label>
            <input type="text" id="singularityTargets" placeholder="e.g., src/components, lib/utils" class="modal-input" style="width: 100%;" />
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
      constraintsContainer: document.getElementById("singularityConstraints"),
      targetsInput: document.getElementById("singularityTargets"),
      submitBtn: document.getElementById("singularitySubmitBtn")
    };
  }

  bindEvents() {
    if (this.elements.submitBtn) {
      this.elements.submitBtn.addEventListener("click", () => this.handleForge());
    }
  }

  async handleForge() {
    const name = this.elements.nameInput.value.trim() || "Bespoke Agent";
    const emoji = this.elements.emojiInput.value.trim() || "🤖";
    const mission = this.elements.missionInput.value.trim() || "Analyze the target directories and execute based on your deduced archetype.";
    const targets = this.elements.targetsInput.value.trim() || "tree -L 3 or find . -maxdepth 3 -type d";

    const checkboxes = this.elements.constraintsContainer.querySelectorAll("input[type='checkbox']:checked");
    const constraintsList = Array.from(checkboxes).map(cb => cb.value);
    const constraints = constraintsList.length > 0 ? constraintsList.join(", ") : "Standard safety protocols apply.";

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
      .replace(/{{UI_TARGET_DIRECTORIES}}/g, targets);

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
