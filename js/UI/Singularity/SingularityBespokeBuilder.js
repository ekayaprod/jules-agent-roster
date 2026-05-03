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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        .sg-forge {
          --sg-mythic:   var(--mythic, #d946ef);
          --sg-card:     var(--card-bg, #0f0f14);
          --sg-border:   var(--border, rgba(255,255,255,0.08));
          --sg-muted:    var(--text-secondary, rgba(255,255,255,0.5));
          --sg-surface:  var(--details-bg, rgba(255,255,255,0.04));
          --sg-maker:    #60a5fa;
          --sg-assassin: #f87171;
          --sg-sentinel: #4ade80;
          --sg-oracle:   #facc15;

          background: var(--sg-card);
          border: 1px solid var(--sg-border);
          border-radius: 1.25rem;
          overflow: hidden;
          max-width: 48rem;
          margin: 3rem auto;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Header ── */
        .sg-header {
          position: relative;
          padding: 2rem 2rem 1.625rem;
          border-bottom: 1px solid var(--sg-border);
          text-align: center;
          overflow: hidden;
        }
        .sg-header-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% -20%, rgba(217,70,239,0.14) 0%, transparent 70%);
          pointer-events: none;
        }
        .sg-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--sg-mythic);
          letter-spacing: -0.02em;
          margin: 0 0 0.375rem;
          position: relative;
        }
        .sg-subtitle {
          font-size: 0.8125rem;
          color: var(--sg-muted);
          margin: 0;
          position: relative;
          line-height: 1.5;
        }

        /* ── Body ── */
        .sg-body {
          padding: 1.875rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.875rem;
        }

        .sg-label {
          display: block;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--sg-muted);
          margin-bottom: 0.625rem;
        }
        .sg-label-note {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.3);
          text-transform: none;
          margin-left: 0.5rem;
        }

        /* ── Archetype Cards ── */
        .sg-archetype-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .sg-archetype-card {
          --ac: rgba(255,255,255,0.15);
          background: var(--sg-surface);
          border: 1px solid var(--sg-border);
          border-radius: 0.625rem;
          padding: 0.75rem 0.875rem 0.75rem 0.75rem;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .sg-archetype-card::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--ac);
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .sg-archetype-card[data-type="MAKER"]    { --ac: var(--sg-maker);    }
        .sg-archetype-card[data-type="ASSASSIN"] { --ac: var(--sg-assassin); }
        .sg-archetype-card[data-type="SENTINEL"] { --ac: var(--sg-sentinel); }
        .sg-archetype-card[data-type="ORACLE"]   { --ac: var(--sg-oracle);   }
        
        .sg-archetype-card:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }
        .sg-archetype-card.selected {
          border-color: var(--ac);
          background: color-mix(in srgb, var(--ac) 9%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ac) 30%, transparent);
        }
        .sg-archetype-card.selected::after { opacity: 1; }
        .sg-archetype-card:focus-visible { outline: 2px solid var(--ac); outline-offset: 2px; }

        .sg-archetype-icon { font-size: 1.125rem; line-height: 1; flex-shrink: 0; margin-top: 1px; }
        .sg-archetype-name {
          font-size: 0.8125rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          display: block;
          margin-bottom: 0.125rem;
        }
        .sg-archetype-desc {
          font-size: 0.6875rem;
          color: var(--sg-muted);
          line-height: 1.4;
          display: block;
        }

        /* ── Mission & Prediction Badge ── */
        .sg-mission-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.625rem;
          flex-wrap: wrap;
        }
        .sg-mission-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sg-prediction-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 0.25rem;
          background: color-mix(in srgb, var(--sg-maker) 15%, transparent);
          color: var(--sg-maker);
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .sg-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }
        .sg-pill {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 2rem;
          border: 1px solid var(--sg-border);
          background: transparent;
          color: var(--sg-muted);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          line-height: 1.6;
        }
        .sg-pill:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.2); }
        .sg-pill[data-archetype="MAKER"]:hover    { border-color: var(--sg-maker);    color: var(--sg-maker);    }
        .sg-pill[data-archetype="ASSASSIN"]:hover { border-color: var(--sg-assassin); color: var(--sg-assassin); }
        .sg-pill[data-archetype="SENTINEL"]:hover { border-color: var(--sg-sentinel); color: var(--sg-sentinel); }
        .sg-pill[data-archetype="ORACLE"]:hover   { border-color: var(--sg-oracle);   color: var(--sg-oracle);   }
        .sg-pill:focus-visible { outline: 2px solid var(--sg-mythic); outline-offset: 2px; }

        .sg-textarea {
          width: 100%;
          min-height: 5.5rem;
          resize: vertical;
          background: var(--sg-surface);
          border: 1px solid var(--sg-border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.9);
          font-family: inherit;
          line-height: 1.6;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .sg-textarea:focus { outline: none; border-color: rgba(217,70,239,0.45); }
        .sg-textarea:focus-visible { outline: 2px solid rgba(217,70,239,0.45); outline-offset: 2px; }
        .sg-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .sg-mission-hint {
          margin-top: 0.4rem;
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.3);
          font-style: italic;
          line-height: 1.5;
        }

        /* ── Constraints ── */
        .sg-constraints-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.25rem;
        }
        .sg-constraint {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.5rem 0.625rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .sg-constraint:hover { background: rgba(255,255,255,0.03); }
        .sg-constraint input[type="checkbox"] {
          margin-top: 2px;
          flex-shrink: 0;
          accent-color: var(--sg-mythic);
          cursor: pointer;
        }
        .sg-constraint input[type="checkbox"]:focus-visible { outline: 2px solid var(--sg-mythic); outline-offset: 2px; }
        .sg-constraint-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          display: block;
        }
        .sg-constraint-sub {
          font-size: 0.675rem;
          color: var(--sg-muted);
          line-height: 1.35;
          display: block;
          margin-top: 0.1rem;
        }

        /* ── Identity ── */
        .sg-identity-row {
          display: flex;
          gap: 0.75rem;
        }
        .sg-identity-name  { flex: 1; }
        .sg-identity-emoji { width: 5rem; flex-shrink: 0; }

        .sg-input {
          width: 100%;
          background: var(--sg-surface);
          border: 1px solid var(--sg-border);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.9);
          font-family: inherit;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .sg-input:focus { outline: none; border-color: rgba(217,70,239,0.45); }
        .sg-input:focus-visible { outline: 2px solid rgba(217,70,239,0.45); outline-offset: 2px; }
        .sg-input::placeholder { color: rgba(255,255,255,0.2); }
        .sg-input-emoji { text-align: center; font-size: 1.25rem; }

        /* ── Advanced ── */
        .sg-advanced-btn {
          background: none;
          border: none;
          color: var(--sg-mythic);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.15s ease;
        }
        .sg-advanced-btn:hover { opacity: 0.7; }
        .sg-advanced-btn:focus-visible { outline: 2px solid var(--sg-mythic); outline-offset: 4px; border-radius: 0.125rem; }
        .sg-chevron {
          display: inline-block;
          font-size: 0.6rem;
          transition: transform 0.25s ease;
        }
        .sg-advanced-panel {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.3s ease, opacity 0.25s ease, margin-top 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          margin-top: 0;
        }
        .sg-advanced-panel.open {
          max-height: 200px;
          opacity: 1;
          margin-top: 1rem;
        }

        /* ── Footer ── */
        .sg-footer-divider {
          height: 1px;
          background: var(--sg-border);
        }
        .sg-footer {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .sg-outcome-note {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          text-align: center;
          line-height: 1.6;
        }
        .sg-outcome-note code {
          font-family: monospace;
          background: rgba(255,255,255,0.07);
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-size: 0.65rem;
        }
        .sg-submit {
          width: 100%;
          padding: 0.875rem;
          background: var(--sg-mythic);
          color: #000;
          font-weight: 800;
          font-size: 0.9375rem;
          font-family: 'Syne', system-ui, sans-serif;
          letter-spacing: 0.01em;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sg-submit:not(:disabled):hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(217,70,239,0.35);
        }
        .sg-submit:not(:disabled):active { transform: scale(0.985); }
        .sg-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .sg-submit:focus-visible { outline: 2px solid var(--sg-mythic); outline-offset: 2px; }
      </style>

      <div class="sg-forge">

        <div class="sg-header">
          <div class="sg-header-glow"></div>
          <h3 class="sg-title">🌌 Singularity Meta-Forge</h3>
          <p class="sg-subtitle">Define your agent below — Singularity will scan your repo and forge the rest.</p>
        </div>

        <div class="sg-body">

          <div>
            <label class="sg-label">Agent Archetype</label>
            <div class="sg-archetype-grid">
              <button class="sg-archetype-card" data-type="MAKER">
                <span class="sg-archetype-icon">🛠️</span>
                <span>
                  <span class="sg-archetype-name">Maker</span>
                  <span class="sg-archetype-desc">Builds, refactors, or transforms existing code</span>
                </span>
              </button>
              <button class="sg-archetype-card" data-type="ASSASSIN">
                <span class="sg-archetype-icon">🗡️</span>
                <span>
                  <span class="sg-archetype-name">Assassin</span>
                  <span class="sg-archetype-desc">Deletes, prunes, or eliminates dead weight</span>
                </span>
              </button>
              <button class="sg-archetype-card" data-type="SENTINEL">
                <span class="sg-archetype-icon">🛡️</span>
                <span>
                  <span class="sg-archetype-name">Sentinel</span>
                  <span class="sg-archetype-desc">Guards quality — tests, linting, validation</span>
                </span>
              </button>
              <button class="sg-archetype-card" data-type="ORACLE">
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
                <label class="sg-label" style="margin:0" for="sgMission">Core Mission</label>
                <span id="sgPredictionBadge" class="sg-prediction-badge">🛠️ Maker</span>
              </div>
              <div class="sg-pills">
                <button class="sg-pill" data-archetype="MAKER"
                  data-mission="Refactor legacy code to modern standards."
                  data-constraints="Match Existing Styling,Do not modify tests">✨ Refactor Legacy</button>
                <button class="sg-pill" data-archetype="SENTINEL"
                  data-mission="Enforce strict typing and add validation guards."
                  data-constraints="No New Dependencies,Match Existing Styling">🛡️ Add Type Guards</button>
                <button class="sg-pill" data-archetype="ASSASSIN"
                  data-mission="Prune dead code and remove all unused files and exports."
                  data-constraints="No UI Mutations">🗡️ Prune Dead Code</button>
                <button class="sg-pill" data-archetype="ORACLE"
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
            <button class="sg-advanced-btn" id="sgAdvancedBtn">
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
          <button class="sg-submit" id="sgSubmit">🌌 Forge Bespoke Agent</button>
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
          const toSet = constraints.split(",").map(c => c.trim());
          this.elements.constraintsContainer
            .querySelectorAll("input[type='checkbox']")
            .forEach(cb => { cb.checked = toSet.includes(cb.value); });
        }
      });
    });

    // Real-time Archetype Prediction Logic
    this.elements.missionInput.addEventListener('input', (e) => {
      const text = e.target.value.toLowerCase();
      const badge = this.elements.predictionBadge;
      if (!badge) return;

      if (/delete|remove|clean|prune|strip/i.test(text)) {
        badge.innerHTML = '🗡️ Assassin';
        badge.style.color = 'var(--sg-assassin)';
        badge.style.background = 'color-mix(in srgb, var(--sg-assassin) 15%, transparent)';
        badge.style.borderColor = 'color-mix(in srgb, var(--sg-assassin) 30%, transparent)';
      } else if (/enforce|guard|validate|test|lint/i.test(text)) {
        badge.innerHTML = '🛡️ Sentinel';
        badge.style.color = 'var(--sg-sentinel)';
        badge.style.background = 'color-mix(in srgb, var(--sg-sentinel) 15%, transparent)';
        badge.style.borderColor = 'color-mix(in srgb, var(--sg-sentinel) 30%, transparent)';
      } else if (/document|read|analyze|audit/i.test(text)) {
        badge.innerHTML = '🔮 Oracle';
        badge.style.color = 'var(--sg-oracle)';
        badge.style.background = 'color-mix(in srgb, var(--sg-oracle) 15%, transparent)';
        badge.style.borderColor = 'color-mix(in srgb, var(--sg-oracle) 30%, transparent)';
      } else {
        // Default to Maker for build/update/refactor intents
        badge.innerHTML = '🛠️ Maker';
        badge.style.color = 'var(--sg-maker)';
        badge.style.background = 'color-mix(in srgb, var(--sg-maker) 15%, transparent)';
        badge.style.borderColor = 'color-mix(in srgb, var(--sg-maker) 30%, transparent)';
      }
    });

    // Advanced panel toggle
    if (this.elements.advancedBtn && this.elements.advancedPanel) {
      this.elements.advancedBtn.addEventListener("click", () => {
        this.showAdvanced = !this.showAdvanced;
        this.elements.advancedPanel.classList.toggle("open", this.showAdvanced);
        this.elements.chevron.style.transform = this.showAdvanced ? "rotate(180deg)" : "";
      });
    }

    // Submit
    if (this.elements.submitBtn) {
      this.elements.submitBtn.addEventListener("click", () => this.handleForge());
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

    const fetchPromise = typeof NetworkUtils !== "undefined"
      ? NetworkUtils.fetchWithRetry("prompts/system/Singularity.md", { throwOn404: false }).then(r => r.ok ? r.text() : null)
      : fetch("prompts/system/Singularity.md").then(r => r.ok ? r.text() : null);

    try {
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
        console.warn("Singularity Builder: julesTerminal instance is missing.");
      }
    } catch (error) {
      uiState.rollback();
      console.error("Unable to forge bespoke agent:", error);
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SingularityBespokeBuilder;
}
