// 🕯️ CHRONICLE: AST reasoning explains the logic; Git history explains the business intent.

/**
 * Encapsulates the UI logic and generation pipeline for the Singularity Meta-Forge.
 * Parses user input to generate custom bespoke agents directly from the UI.
 * * Historical Intent: Added via 6073b10d (Apr 2026) to migrate Singularity to an Unlockable UI.
 */
class SingularityBespokeBuilder {
  constructor(julesTerminal) {
    this.julesTerminal = julesTerminal;
    this.container = document.getElementById("singularityBuilderContainer");
    this.elements = {};
    this.showAdvanced = false;
    this._selectedArchetype = null;
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `


      <div class="sg-forge" id="sgForgeContainer">

        <div class="sg-header sg-forge-inner" id="sgHeaderToggle">
          <div class="front-content-wrapper">
            <div class="card-top">
              <div class="card-top-left">
                <div class="emoji-hero">🌌</div>
              </div>
              <div class="card-top-right">
                <div class="title-group">
                  <h3 class="agent-title">Singularity Meta-Forge</h3>
                  <span class="role-tag">Meta-Architect</span>
                </div>
              </div>
            </div>
            <div class="description mt-3">Define your agent below — Singularity will scan your repo and forge the rest.</div>
          </div>
          <div class="flip-hint sg-expand-hint" aria-label="Tap to view forge" >↓</div>
        </div>

        <div class="sg-body">

          <div>
            <label class="sg-label">Agent Archetype</label>
            <div class="sg-archetype-grid">
              <button class="sg-archetype-card transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-type="MAKER">
                <span class="sg-archetype-icon">🛠️</span>
                <span>
                  <span class="sg-archetype-name">Maker</span>
                  <span class="sg-archetype-desc">Builds, refactors, or transforms existing code</span>
                </span>
              </button>
              <button class="sg-archetype-card transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-type="ASSASSIN">
                <span class="sg-archetype-icon">🗡️</span>
                <span>
                  <span class="sg-archetype-name">Assassin</span>
                  <span class="sg-archetype-desc">Deletes, prunes, or eliminates dead weight</span>
                </span>
              </button>
              <button class="sg-archetype-card transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-type="SENTINEL">
                <span class="sg-archetype-icon">🛡️</span>
                <span>
                  <span class="sg-archetype-name">Sentinel</span>
                  <span class="sg-archetype-desc">Guards quality — tests, linting, validation</span>
                </span>
              </button>
              <button class="sg-archetype-card transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-type="ORACLE">
                <span class="sg-archetype-icon">🔮</span>
                <span>
                  <span class="sg-archetype-name">Oracle</span>
                  <span class="sg-archetype-desc">Reads and documents — never mutates source</span>
                </span>
              </button>
            </div>
          </div>

          <div>
            <div class="sg-mission-header">
              <div class="sg-mission-title-group">
                <label class="sg-label sg-mission-label" for="sgMission">Core Mission</label>
                <span id="sgPredictionBadge" class="sg-prediction-badge">🛠️ Maker</span>
              </div>
              <div class="sg-pills">
                <button class="sg-pill transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-archetype="MAKER"
                  data-mission="Refactor legacy code to modern standards."
                  data-constraints="Match Existing Styling,Do not modify tests">✨ Refactor Legacy</button>
                <button class="sg-pill transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-archetype="SENTINEL"
                  data-mission="Enforce strict typing and add validation guards."
                  data-constraints="No New Dependencies,Match Existing Styling">🛡️ Add Type Guards</button>
                <button class="sg-pill transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-archetype="ASSASSIN"
                  data-mission="Prune dead code and remove all unused files and exports."
                  data-constraints="No UI Mutations">🗡️ Prune Dead Code</button>
                <button class="sg-pill transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" data-archetype="ORACLE"
                  data-mission="Audit and document all public API endpoints and their return types."
                  data-constraints="No UI Mutations,Dry-Run Only (Generate Report)">📖 Document API</button>
              </div>
            </div>
            <textarea id="sgMission" class="sg-textarea"
              placeholder="Describe what this agent should do. Be specific — what file types, what patterns, what outcome?"></textarea>
            <p class="sg-mission-hint">💡 Tip: Generic missions produce generic agents. Mention the language, the pattern, and the end goal.</p>
          </div>

          <div>
            <label class="sg-label">Safety Constraints</label>
            <div class="sg-constraints-grid">
              <label class="sg-constraint">
                <input type="checkbox" value="Read-only Database" />
                <span>
                  <span class="sg-constraint-label">Read-only Database</span>
                </span>
              </label>
              <label class="sg-constraint">
                <input type="checkbox" value="No UI Mutations" />
                <span>
                  <span class="sg-constraint-label">No UI Mutations</span>
                  <span class="sg-constraint-sub">Changes restricted to non-visual logic only</span>
                </span>
              </label>
              <label class="sg-constraint">
                <input type="checkbox" value="Do not modify tests" />
                <span>
                  <span class="sg-constraint-label">Do Not Modify Tests</span>
                </span>
              </label>
              <label class="sg-constraint">
                <input type="checkbox" value="No New Dependencies" />
                <span>
                  <span class="sg-constraint-label">No New Dependencies</span>
                </span>
              </label>
              <label class="sg-constraint">
                <input type="checkbox" value="Match Existing Styling" />
                <span>
                  <span class="sg-constraint-label">Match Existing Styling</span>
                  <span class="sg-constraint-sub">New code must follow the repo's style conventions</span>
                </span>
              </label>
              <label class="sg-constraint">
                <input type="checkbox" value="Dry-Run Only (Generate Report)" />
                <span>
                  <span class="sg-constraint-label">Dry-Run Only</span>
                  <span class="sg-constraint-sub">Generate a report — write no changes</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label class="sg-label">Agent Identity
              <span class="sg-label-note">Optional — Singularity invents one if left blank</span>
            </label>
            <div class="sg-identity-row">
              <div class="sg-identity-name">
                <input type="text" id="sgAgentName" class="sg-input" placeholder="e.g., The Syntax Reaper" />
              </div>
              <div class="sg-identity-emoji">
                <input type="text" id="sgAgentEmoji" class="sg-input sg-input-emoji" placeholder="💀" maxlength="2" />
              </div>
            </div>
          </div>

          <div>
            <button class="sg-advanced-btn transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95" id="sgAdvancedBtn">
              Advanced Options <span class="sg-chevron" id="sgChevron">▼</span>
            </button>
            <div class="sg-advanced-panel" id="sgAdvancedPanel">
              <div>
                <label class="sg-label" for="sgTechStack">Primary Tech Stack</label>
                <input type="text" id="sgTechStack" class="sg-input" placeholder="e.g., React, Node.js, Python" />
              </div>
              <div>
                <label class="sg-label" for="sgTargets">Target Directories</label>
                <input type="text" id="sgTargets" class="sg-input" placeholder="e.g., src/components, lib/utils" />
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
      archetypeCards:       this.container.querySelectorAll(".sg-archetype-card"),
      missionInput:         document.getElementById("sgMission"),
      predictionBadge:      document.getElementById("sgPredictionBadge"),
      pills:                this.container.querySelectorAll(".sg-pill"),
      constraintsContainer: this.container.querySelector(".sg-constraints-grid"),
      nameInput:            document.getElementById("sgAgentName"),
      emojiInput:           document.getElementById("sgAgentEmoji"),
      advancedBtn:          document.getElementById("sgAdvancedBtn"),
      advancedPanel:        document.getElementById("sgAdvancedPanel"),
      chevron:              document.getElementById("sgChevron"),
      techStackInput:       document.getElementById("sgTechStack"),
      targetsInput:         document.getElementById("sgTargets"),
      submitBtn:            document.getElementById("sgSubmit"),
    };
  }

  setArchetype(type) {
    this._selectedArchetype = type;
    this.elements.archetypeCards.forEach(card => {
      card.classList.toggle("selected", card.dataset.type === type);
    });
  }

  bindEvents() {
    // Archetype card selection
    this.elements.archetypeCards.forEach(card => {
      card.addEventListener("click", () => this.setArchetype(card.dataset.type));
    });

    // Quick-fill pills — set mission, archetype, and constraints in one click
    this.elements.pills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();
        const mission      = pill.dataset.mission;
        const archetype    = pill.dataset.archetype;
        const constraints  = pill.dataset.constraints;

        if (mission) {
          this.elements.missionInput.value = mission;
          this.elements.missionInput.dispatchEvent(new Event('input')); // Trigger regex badge update
        }
        if (archetype)   this.setArchetype(archetype);
        if (constraints && this.elements.constraintsContainer) {
          const toSet = new Set(constraints.split(",").map(c => c.trim()));
          this.elements.constraintsContainer
            .querySelectorAll("input[type='checkbox']")
            .forEach(cb => { cb.checked = toSet.has(cb.value); });
        }
      });
    });

    // Real-time Archetype Prediction Logic
    const debouncedMissionInput = typeof PerformanceUtils !== 'undefined' ? PerformanceUtils.debounce((text) => {
      const badge = this.elements.predictionBadge;
      if (!badge) return;

      badge.className = 'sg-builder-mode-badge';
      if (/delete|remove|clean|prune|strip/i.test(text)) {
        badge.innerHTML = '🗡️ Assassin';
        badge.classList.add('sg-mode-assassin');
      } else if (/enforce|guard|validate|test|lint/i.test(text)) {
        badge.innerHTML = '🛡️ Sentinel';
        badge.classList.add('sg-mode-sentinel');
      } else if (/document|read|analyze|audit/i.test(text)) {
        badge.innerHTML = '🔮 Oracle';
        badge.classList.add('sg-mode-oracle');
      } else {
        // Default to Maker for build/update/refactor intents
        badge.innerHTML = '🛠️ Maker';
        badge.classList.add('sg-mode-maker');
      }
    }, 300) : (text) => {
      const badge = this.elements.predictionBadge;
      if (!badge) return;

      badge.className = 'sg-builder-mode-badge';
      if (/delete|remove|clean|prune|strip/i.test(text)) {
        badge.innerHTML = '🗡️ Assassin';
        badge.classList.add('sg-mode-assassin');
      } else if (/enforce|guard|validate|test|lint/i.test(text)) {
        badge.innerHTML = '🛡️ Sentinel';
        badge.classList.add('sg-mode-sentinel');
      } else if (/document|read|analyze|audit/i.test(text)) {
        badge.innerHTML = '🔮 Oracle';
        badge.classList.add('sg-mode-oracle');
      } else {
        // Default to Maker for build/update/refactor intents
        badge.innerHTML = '🛠️ Maker';
        badge.classList.add('sg-mode-maker');
      }
    };

    this.elements.missionInput.addEventListener('input', (e) => {
      debouncedMissionInput(e.target.value.toLowerCase());
    });

    // Advanced panel toggle
    if (this.elements.advancedBtn && this.elements.advancedPanel) {
      this.elements.advancedBtn.addEventListener("click", () => {
        this.showAdvanced = !this.showAdvanced;
        this.elements.advancedPanel.classList.toggle("open", this.showAdvanced);
        this.elements.chevron.classList.toggle('rotated', this.showAdvanced);
      });
    }

    // Submit
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
    const name      = this.elements.nameInput.value.trim()      || "";
    const emoji     = this.elements.emojiInput.value.trim()     || "";
    const techStack = this.elements.techStackInput?.value.trim() || "";
    const targets   = this.elements.targetsInput?.value.trim()   || "";

    let mission = this.elements.missionInput.value.trim() || "";
    if (this._selectedArchetype) {
      mission += `\n\n[ARCHETYPE OVERRIDE: ${this._selectedArchetype}]`;
    }

    const checkboxes  = this.elements.constraintsContainer.querySelectorAll("input[type='checkbox']:checked");
    const constraints = Array.from(checkboxes).map(cb => cb.value).join(", ");

    // Optimistic UI update
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
      // ⚡ Bolt+: The Waterfall Collapse. Unblocked UI thread during validation by deferring asynchronous I/O wait until strictly required for payload generation.
      const fetchPromise = typeof NetworkUtils !== "undefined"
        ? NetworkUtils.fetchWithRetry("prompts/system/Singularity.md", { throwOn404: false }).then(r => r.ok ? r.text() : null)
        : fetch("prompts/system/Singularity.md").then(r => r.ok ? r.text() : null);

      const template = await fetchPromise;

      if (!template) {
        if (window.rosterApp?.showToast) {
          window.rosterApp.showToast("Unable to load the Singularity template. Please try again.");
        }
        uiState.rollback();
        return;
      }

      const payloadPrompt = template
        .replace(/{{UI_AGENT_NAME}}/g,            name)
        .replace(/{{UI_AGENT_EMOJI}}/g,           emoji)
        .replace(/{{UI_MISSION_STATEMENT}}/g,      mission)
        .replace(/{{UI_CHECKLIST_CONSTRAINTS}}/g,  constraints)
        .replace(/{{UI_TARGET_DIRECTORIES}}/g,     targets)
        .replace(/{{UI_TECH_STACK}}/g,             techStack);

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
      // 🩺 RESUSCITATE: Intent deduced. The error is caught, enriched with context, and explicitly passed to the boundary.
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
