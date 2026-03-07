// Helper for generating PR link buttons
function createPRLink(url) {
    const prLink = document.createElement("a");
    prLink.className = "pr-link-btn";
    prLink.href = url;
    prLink.target = "_blank";
    prLink.rel = "noopener noreferrer";
    prLink.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4h-4"/><path d="M12 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2"/><polyline points="15 8 18 5 21 8"/></svg>
        View PR
    `;
    return prLink;
}

// --- ROSTER APP ---
/**
 * Main application class for the Autonomous Protocol Matrix.
 * Orchestrates the primary application flow, emphasizing asynchronous non-blocking operations and event delegation.
 * @see README.md#rosterapp-architecture for the core lifecycle and architecture details.
 */
class RosterApp {
  /**
   * Initializes the RosterApp instance, setting up empty states and service dependencies.
   * @see README.md#rosterapp-architecture
   */
  constructor() {
    this.agents = [];
    this.customAgents = {};
    this.elements = {};
    this.agentRepo = new AgentRepository();
    this.toast = new ToastNotification(CONFIG.selectors.toast);
    this.pinnedManager = new PinnedManager();
    this.fusionLab = null;
    this._cardHtmlCache = new Map();
    this.julesPollingInterval = null;
  }

  /**
   * Bootstraps the application, fetching agent data and initializing UI components.
   * Executes the Initialization Flow, caching critical DOM elements and handling fallback states.
   * @returns {Promise<void>} Resolves when initialization is complete.
   * @see README.md#rosterapp-architecture for the Initialization Flow details.
   */
  async init() {
    this.cacheElements();
    this.renderSkeletons();
    await this.initJules(); // Boot up Jules API connection

    try {
        const { agents, customAgents } = await this.agentRepo.fetchAgents();
        this.agents = agents;
        this.customAgents = customAgents;

        this.fusionLab = new FusionLab();
        this.fusionLab.init(this.agents, this.customAgents);

        const skeleton = document.getElementById("fusionLabSkeleton");
        const content = document.getElementById("fusionLabContent");
        if (skeleton && content) {
            skeleton.style.opacity = '0';
            const revealContent = () => {
                skeleton.classList.add("hidden");
                content.style.opacity = '0';
                content.classList.remove("hidden");
                content.offsetHeight; // Force reflow
                content.style.opacity = '1';
            };

            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                revealContent();
            } else {
                setTimeout(revealContent, 500); 
            }
        }
    } catch (error) {
        if (this.elements.main) {
            const isDataError = error.message && (error.message.includes("JSON") || error.message.includes("configuration"));
            const errorTitle = "Unable to Load Protocols";
            const errorDesc = isDataError
              ? "Check your configuration file formatting and try again."
              : "Check your internet connection and refresh the page.";

            this.elements.main.innerHTML = `
              <div class="empty-state visible">
                <svg class="empty-icon" aria-hidden="true" width="64" height="64" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="empty-title">${errorTitle}</p>
                <p class="empty-desc">${errorDesc}</p>
                <button onclick="window.location.reload()" class="mt-6" aria-label="Refresh Page to Retry Loading">Refresh Page</button>
              </div>
            `;
        }
    }

    this.renderAgents();
    this.bindEvents();
    this.initObserver();
  }

  /**
   * Initializes the Jules API connection and Settings Modal logic.
   * @see README.md#rosterapp-architecture
   */
  async initJules() {
      const apiKey = StorageUtils.getItem("jules_api_key");
      const settingsModal = document.getElementById("settingsModal");
      const openBtn = document.getElementById("openSettingsBtn");
      const closeBtn = document.getElementById("closeSettingsBtn");
      const saveBtn = document.getElementById("saveSettingsBtn");
      const keyInput = document.getElementById("julesApiKeyInput");

      // Modal Toggles
      const toggleModal = (show) => {
          if (show) {
              keyInput.value = StorageUtils.getItem("jules_api_key");
              settingsModal.classList.add("visible");
          } else {
              settingsModal.classList.remove("visible");
          }
      };

      openBtn?.addEventListener("click", () => toggleModal(true));
      closeBtn?.addEventListener("click", () => toggleModal(false));

      // Save and Connect Logic
      saveBtn?.addEventListener("click", async () => {
          const key = keyInput.value.trim();
          if (!key) return this.toast.show("Please enter an API Key.");
          
          StorageUtils.setItem("jules_api_key", key);
          toggleModal(false);
          this.toast.show("Connecting to Jules...");
          
          if (window.julesService) {
              window.julesService.configure(key);
              await this.loadJulesSources();
          }
      });

      // Auto-connect if key exists, otherwise prompt user
      if (apiKey && window.julesService) {
          window.julesService.configure(apiKey);
          await this.loadJulesSources();
      } else {
          toggleModal(true);
      }
  }

  /**
   * Fetches available GitHub repos and populates the runner dropdown.
   * @see README.md#rosterapp-architecture
   */
  async loadJulesSources() {
      const picker = document.getElementById("julesRepoPicker");
      if (!picker || !window.julesService) return;

      const originalText = picker.options.length > 0 ? picker.options[0].textContent : "1. Select GitHub Repository...";
      picker.innerHTML = `<option value="">Loading repositories...</option>`;
      picker.disabled = true;

      try {
          const data = await window.julesService.getSources();
          if (data.sources) {
              picker.innerHTML = `<option value="">1. Select GitHub Repository...</option>`;
              data.sources.forEach(s => {
                  const opt = document.createElement("option");
                  opt.value = s.name;
                  opt.textContent = `${s.githubRepo.owner}/${s.githubRepo.repo}`;
                  picker.appendChild(opt);
              });
              this.toast.show("Jules Repositories Loaded");
          } else {
              picker.innerHTML = `<option value="">${originalText}</option>`;
          }
      } catch (err) {
          picker.innerHTML = `<option value="">${originalText}</option>`;
          this.toast.show("Failed to fetch Repos. Check API Key.", true);
          console.error("Jules Source Error:", err);
      } finally {
          picker.disabled = false;
      }
  }

  /**
   * Caches critical DOM elements.
   * Prevents query thrashing during initialization.
   * @see README.md#rosterapp-architecture
   */
  cacheElements() {
    Object.keys(CONFIG.selectors).forEach((key) => {
      const selector = CONFIG.selectors[key];
      this.elements[key] = selector.startsWith("#")
        ? document.getElementById(selector.substring(1))
        : document.querySelectorAll(selector);
    });

    // ⚡ Bolt+: Extracted redundant DOM queries outside of loops and cached the references on initialization.
    this.categoryElements = {};
    Object.keys(CONFIG.categories).forEach((key) => {
      this.categoryElements[key] = document.getElementById(CONFIG.categories[key]);
    });
  }

  /**
   * Injects CSS loading skeletons.
   * @see README.md#rosterapp-architecture
   */
  renderSkeletons() {
    Object.keys(CONFIG.categories).forEach((key) => {
      const container = this.categoryElements[key];
      if (container) {
        container.innerHTML = "";
        for (let i = 0; i < 12; i++) {
          const skeleton = DOMUtils.createSkeletonElement("card skeleton-card skeleton-pulse");
          container.appendChild(skeleton);
        }
      }
    });
  }

  /**
   * Renders agent cards into their grids.
   * Utilizes a batch rendering strategy to spread execution across frames using requestAnimationFrame, preventing the main thread from locking.
   * @see README.md#rosterapp-architecture for the Batch Rendering Strategy details.
   */
  renderAgents() {
    const categoryContainers = {};
    const fragments = {};
    const categorizedAgents = {};

    Object.keys(CONFIG.categories).forEach((key) => {
      const container = this.categoryElements[key];
      categoryContainers[key] = container;
      categorizedAgents[key] = [];
      if (container) {
        fragments[key] = document.createDocumentFragment();
      }
    });

    this.agents.forEach((agent, i) => {
      const category = agent.category || "strategy";
      if (categorizedAgents[category]) {
        categorizedAgents[category].push({ agent, indexOrKey: i });
      }
    });

    if (this.pinnedManager) {
        const pinnedKeys = this.pinnedManager.getPinned();
        pinnedKeys.forEach(key => {
             if (isNaN(key)) {
                let agent = (this.customAgents && this.customAgents[key]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[key]);
                if (agent) {
                   const category = agent.category || "strategy";
                   if (categorizedAgents[category]) {
                       categorizedAgents[category].push({ agent, indexOrKey: key });
                   }
                }
             }
        });
    }

    const flattenedAgents = [];
    Object.keys(categorizedAgents).forEach(category => {
       categorizedAgents[category].sort((a, b) => {
           const aPinned = this.pinnedManager ? this.pinnedManager.isPinned(a.indexOrKey) : false;
           const bPinned = this.pinnedManager ? this.pinnedManager.isPinned(b.indexOrKey) : false;
           if (aPinned && !bPinned) return -1;
           if (!aPinned && bPinned) return 1;
           return 0;
       });
       flattenedAgents.push(...categorizedAgents[category]);
    });

    const currentRenderId = Symbol();
    this.currentRenderId = currentRenderId;

    let globalIndex = 0;
    const CHUNK_SIZE = 15;
    let agentIndex = 0;

    const renderChunk = () => {
      if (this.currentRenderId !== currentRenderId) return;

      const end = Math.min(agentIndex + CHUNK_SIZE, flattenedAgents.length);

      for (let i = agentIndex; i < end; i++) {
        const { agent, indexOrKey } = flattenedAgents[i];
        const category = agent.category || "strategy";
        const container = categoryContainers[category];
        if (!container) continue;

        const card = AgentCard.create(agent, indexOrKey, globalIndex);
        globalIndex++;

        if (fragments[category]) {
          fragments[category].appendChild(card);
        }
      }

      agentIndex = end;

      if (agentIndex < flattenedAgents.length) {
        requestAnimationFrame(() => setTimeout(renderChunk, 0));
      } else {
        requestAnimationFrame(() => {
          if (this.currentRenderId !== currentRenderId) return;
          Object.keys(categoryContainers).forEach((key) => {
            if (categoryContainers[key]) categoryContainers[key].innerHTML = "";
          });
          Object.keys(fragments).forEach(key => {
            if (categoryContainers[key]) categoryContainers[key].appendChild(fragments[key]);
          });
        });
      }
    };

    requestAnimationFrame(() => setTimeout(renderChunk, 0));
  }

  /**
   * Attaches global event listeners.
   * Implements global event delegation, routing interactions securely via dataset actions and abandoning inner loop event listeners.
   * @see README.md#rosterapp-architecture for Global Event Delegation details.
   */
  bindEvents() {
    if (this.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => this.filterAgents(query), 300);
      this.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
    }
    
    this.elements.clearBtn?.addEventListener("click", () => this.clearSearch());
    document.getElementById("clearSearchEmptyBtn")?.addEventListener("click", () => this.clearSearch());

    document.getElementById('julesRepoPicker')?.addEventListener('change', (e) => {
        if (this._cardHtmlCache) this._cardHtmlCache.clear();
        this.renderAgents();

        const sourceName = e.target.value;
        if (sourceName) {
            this.loadActiveSessionsForRepo(sourceName);
        } else {
            const terminal = document.getElementById("julesTerminal");
            terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
            terminal.classList.remove('active');
            if (this.activeSessionsInterval) {
                clearInterval(this.activeSessionsInterval);
                this.activeSessionsInterval = null;
            }
            if (this.julesPollingIntervals) {
                Object.values(this.julesPollingIntervals).forEach(clearInterval);
                this.julesPollingIntervals = {};
            }
            if (this.renderedSessionIds) this.renderedSessionIds.clear();
            this.currentRepo = null;
        }
    });

    // Footer Master Export Controls
    const masterDropBtn = document.getElementById('masterDropdownBtn');
    const masterDropMenu = document.getElementById('masterDropdownMenu');
    
    masterDropBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        masterDropMenu.classList.toggle("visible");
    });

    // Global Click Delegation (Handles Dropdowns, Cards, etc.)
    document.addEventListener("click", (e) => {
      // 1. Close master dropdown if clicked outside
      if (masterDropMenu?.classList.contains("visible") && !masterDropMenu.contains(e.target) && !masterDropBtn.contains(e.target)) {
          masterDropMenu.classList.remove("visible");
      }

      // 2. Close specific card dropdowns if clicked outside
      document.querySelectorAll('.card-dropdown-menu.visible, .dropdown-menu.visible').forEach(menu => {
          if (menu.id !== 'masterDropdownMenu' && !menu.contains(e.target) && !e.target.closest('[data-action="toggle-card-dropdown"]')) {
              menu.classList.remove('visible');
              const toggleBtn = document.querySelector(`[aria-controls="${menu.id}"]`);
              if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
          }
      });

      // 3. Toggle Pin
      const pinTarget = e.target.closest('[data-action="toggle-pin"]');
      if (pinTarget) {
          const card = pinTarget.closest('.flip-card');
          if (card && card.classList.contains('flipped')) return;
          e.stopPropagation();
          e.preventDefault();
          const index = pinTarget.dataset.index;
          if (index) {
              const isPinned = this.pinnedManager.togglePin(index);
              document.querySelectorAll(`[data-action="toggle-pin"][data-index="${index}"]`).forEach(btn => {
                  if (isPinned) btn.classList.add('pinned');
                  else btn.classList.remove('pinned');
              });
              this.renderAgents();
              this.showToast(isPinned ? "Pinned" : "Unpinned");
              if (this._cardHtmlCache) {
                  this._cardHtmlCache.delete(String(index));
                  this._cardHtmlCache.delete(Number(index));
              }
          }
          return;
      }

      // 4. Flip Card Front (Open)
      const frontTarget = e.target.closest('[data-action="flip-card"]');
      if (frontTarget) {
          const card = frontTarget.closest('.flip-card');
          if (card) {
              const index = frontTarget.dataset.index;
              const safeIndex = CSS.escape(String(index));
              const promptArea = card.querySelector(`#prompt-content-${safeIndex}`);
              if (promptArea && !promptArea.innerHTML.trim()) {
                  let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
                  if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
                  if (agent) promptArea.innerHTML = AgentCard.getPromptHtml(agent);
              }
              card.classList.add('flipped');
          }
          return;
      }

      // 5. Flip Card Back (Close)
      const backTarget = e.target.closest('[data-action="flip-card-back"]');
      if (backTarget && !e.target.closest('.prompt-scroll-area') && !e.target.closest('.card-actions')) {
          e.stopPropagation();
          const card = backTarget.closest('.flip-card');
          if (card) card.classList.remove('flipped');
          return;
      }

      // 6. Action Dropdown Toggle (For individual cards)
      const toggleTarget = e.target.closest('[data-action="toggle-card-dropdown"]');
      if (toggleTarget) {
          e.stopPropagation();
          const index = toggleTarget.dataset.index;
          const dropdown = document.getElementById(`card-dropdown-${index}`);
          
          // Close others
          document.querySelectorAll('.dropdown-menu.visible').forEach(m => {
              if (m !== dropdown && m.id !== 'masterDropdownMenu') {
                  m.classList.remove('visible');
                  const otherToggle = document.querySelector(`[aria-controls="${m.id}"]`);
                  if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
              }
          });

          if (dropdown) {
              const isVisible = dropdown.classList.toggle('visible');
              toggleTarget.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
          }
          return;
      }

      // 7. General Action Buttons (Copy/Download/Launch)
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn && ["copy-agent", "download-agent", "launch-jules"].includes(actionBtn.dataset.action)) {
          e.preventDefault();
          e.stopPropagation();
          const index = actionBtn.dataset.index;
          let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
          if (!agent) return;

          if (actionBtn.dataset.action === "copy-agent") {
              this.copyAgent(index, actionBtn);
              const parentMenu = actionBtn.closest('.dropdown-menu');
              if (parentMenu) {
                  parentMenu.classList.remove('visible');
                  const toggleBtn = document.querySelector(`[aria-controls="${parentMenu.id}"]`);
                  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
              }
          } else if (actionBtn.dataset.action === "download-agent") {
              DownloadUtils.downloadTextFile(agent.prompt, `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              const parentMenu = actionBtn.closest('.dropdown-menu');
              if (parentMenu) {
                  parentMenu.classList.remove('visible');
                  const toggleBtn = document.querySelector(`[aria-controls="${parentMenu.id}"]`);
                  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
              }
          } else if (actionBtn.dataset.action === "launch-jules") {
              this.launchJulesSession(agent, actionBtn);
          }
      }
    });

    // Master Export bindings
    document.getElementById('masterCopyBtn')?.addEventListener("click", (e) => this.copyAll(e.currentTarget));
    document.getElementById('masterDownloadCoreBtn')?.addEventListener("click", (e) => {
        this.downloadAll(e.currentTarget);
        masterDropMenu.classList.remove("visible");
    });
    document.getElementById('masterCopyFusionsBtn')?.addEventListener("click", async (e) => {
        const validCustomAgents = Object.values(this.customAgents).filter(a => a.prompt && a.prompt.length > 0);
        if (validCustomAgents.length === 0) return this.toast.show("No custom agents unlocked yet.");
        const header = FormatUtils.CUSTOM_ROSTER_HEADER;
        const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(validCustomAgents));
        if (success) {
            this.toast.show("Fusions copied to clipboard");
            ClipboardUtils.animateButtonSuccess(e.currentTarget, "Copied!");
        }
        masterDropMenu.classList.remove("visible");
    });
    document.getElementById('masterDownloadFusionsBtn')?.addEventListener("click", (e) => {
        this.downloadCustomAgents(e.currentTarget);
        masterDropMenu.classList.remove("visible");
    });
  }

  /**
   * Loads active sessions for the selected repository and begins polling.
   * @param {string} sourceName - The target repository source.
   */
  async loadActiveSessionsForRepo(sourceName) {
      const terminal = document.getElementById("julesTerminal");
      terminal.classList.add('active');

      if (this.currentRepo !== sourceName) {
          if (this.julesPollingIntervals) {
              Object.values(this.julesPollingIntervals).forEach(clearInterval);
              this.julesPollingIntervals = {};
          }
          if (this.renderedSessionIds) this.renderedSessionIds.clear();

          terminal.innerHTML = `<div class="terminal-line" id="fetchingIndicator"><span class="terminal-time">[System]</span> Fetching active sessions...</div>`;
          this.currentRepo = sourceName;
      }

      if (this.activeSessionsInterval) {
          clearInterval(this.activeSessionsInterval);
      }

      const fetchAndRenderSessions = async () => {
          try {
              if (!window.julesService || !window.julesService.apiKey) return;

              const data = await window.julesService.getSessions(50);
              if (!data.sessions) {
                  if (document.getElementById('fetchingIndicator')) {
                      terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
                  }
                  return;
              }

              const repoSessions = data.sessions.filter(s => {
                  if (!s.sourceContext || s.sourceContext.source !== sourceName) return false;
                  // Filter out sessions that have a merged or closed PR
                  if (s.outputs && s.outputs.some(o => o.pullRequest && (o.pullRequest.state === 'MERGED' || o.pullRequest.state === 'CLOSED'))) {
                      return false;
                  }
                  return true;
              });
              const repoPath = sourceName.replace('sources/github/', '');

              // Remove the fetching placeholder if it's there
              const fetchingIndicator = document.getElementById('fetchingIndicator');
              if (fetchingIndicator) {
                  fetchingIndicator.remove();
              }

              if (repoSessions.length === 0 && terminal.children.length === 0) {
                  terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
                  return;
              }

              // Keep track of rendered sessions to avoid duplicates
              if (!this.renderedSessionIds) this.renderedSessionIds = new Set();
              const currentSessionIds = new Set(repoSessions.map(s => s.id));

              // Clean up removed sessions from UI and polling
              const existingItems = terminal.querySelectorAll('.dashboard-item');
              existingItems.forEach(item => {
                  const id = item.id.replace('session-', '');
                  if (!id.startsWith('temp-') && !currentSessionIds.has(id)) {
                      item.remove();
                      this.renderedSessionIds.delete(id);
                      if (this.julesPollingIntervals && this.julesPollingIntervals[id]) {
                          clearInterval(this.julesPollingIntervals[id]);
                          delete this.julesPollingIntervals[id];
                      }
                  }
              });

              if (repoSessions.length > 0 && terminal.querySelector('.terminal-line:not(#fetchingIndicator)')) {
                  const awaitingMsg = Array.from(terminal.querySelectorAll('.terminal-line')).find(el => el.textContent.includes('Awaiting Agent launch'));
                  if (awaitingMsg) awaitingMsg.remove();
              }

              // Render or update sessions
              for (const session of repoSessions) {
                  const isCompleted = session.outputs && session.outputs.some(o => o.pullRequest);

                  if (!this.renderedSessionIds.has(session.id)) {
                      this.renderedSessionIds.add(session.id);

                      const item = document.createElement("div");
                      item.className = "dashboard-item";
                      item.id = `session-${session.id}`;

                      const agentName = session.title || "Agent Task";
                      const prTitle = isCompleted ? session.outputs.find(o => o.pullRequest).pullRequest.title : agentName;

                      item.innerHTML = `
                          <div class="dashboard-info">
                              <span class="emoji-hero" style="font-size: 1.5rem; margin-right: 0.5rem;">🤖</span>
                              <div>
                                  <div class="dashboard-title">${agentName}</div>
                                  <div class="dashboard-meta">${isCompleted ? 'PR Drafted: ' + prTitle : repoPath}</div>
                              </div>
                          </div>
                          <div class="dashboard-status">
                              <span class="status-badge ${isCompleted ? 'status-completed' : 'status-in-progress'}" id="status-${session.id}">${isCompleted ? 'Completed' : 'Loading...'}</span>
                          </div>
                      `;

                      if (isCompleted) {
                          const prInfo = session.outputs.find(o => o.pullRequest).pullRequest;
                          if (prInfo && prInfo.url) {
                              const prLink = createPRLink(prInfo.url);
                              item.querySelector(".dashboard-status").appendChild(prLink);
                          }
                      }

                      terminal.insertBefore(item, terminal.firstChild);

                      if (!isCompleted) {
                          this.startTerminalPolling(session.id, item, repoPath);
                      }
                  } else if (isCompleted && document.getElementById(`status-${session.id}`)?.textContent !== "Completed") {
                      // Already rendered but state transitioned to completed
                      const statusBadge = document.getElementById(`status-${session.id}`);
                      if (statusBadge) {
                          statusBadge.className = "status-badge status-completed";
                          statusBadge.textContent = "Completed";
                          const prInfo = session.outputs.find(o => o.pullRequest).pullRequest;
                          const metaDiv = document.getElementById(`session-${session.id}`).querySelector(".dashboard-meta");
                          if (metaDiv && prInfo) {
                              metaDiv.textContent = 'PR Drafted: ' + prInfo.title;
                          }
                          if (prInfo && prInfo.url && !document.getElementById(`session-${session.id}`).querySelector(".pr-link-btn")) {
                              const prLink = createPRLink(prInfo.url);
                              document.getElementById(`session-${session.id}`).querySelector(".dashboard-status").appendChild(prLink);
                          }
                      }
                  }
              }

          } catch (err) {
              console.error("Failed to load active sessions:", err);
          }
      };

      await fetchAndRenderSessions();
      this.activeSessionsInterval = setInterval(fetchAndRenderSessions, 5000);
  }

  /**
   * Triggers a new session in the Jules API Runner.
   * @param {Object} agent - The agent data object.
   * @see README.md#rosterapp-architecture
   */
  async launchJulesSession(agent, btn = null) {
      const sourceName = document.getElementById("julesRepoPicker").value;
      const userTask = document.getElementById("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";
      
      if (!sourceName) {
          this.toast.show("Please select a target repository in the runner panel.", "error");
          document.getElementById("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
          document.getElementById("julesRepoPicker").focus();
          return;
      }

      document.getElementById("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
      const terminal = document.getElementById("julesTerminal");
      terminal.classList.add('active');

      // Clear the "Awaiting..." placeholder if it's the first execution
      if (terminal.innerHTML.includes("Awaiting Agent launch command")) {
          terminal.innerHTML = "";
      }

      // Generate a temporary ID for the new session
      const tempId = 'temp-' + Date.now();

      const item = document.createElement("div");
      item.className = "dashboard-item";
      item.id = tempId;

      const repoPath = sourceName.replace('sources/github/', '');

      item.innerHTML = `
          <div class="dashboard-info">
              <span class="emoji-hero" style="font-size: 1.5rem; margin-right: 0.5rem;">${agent.emoji}</span>
              <div>
                  <div class="dashboard-title">${agent.name}</div>
                  <div class="dashboard-meta">${repoPath}</div>
              </div>
          </div>
          <div class="dashboard-status">
              <span class="status-badge status-in-progress" id="status-${tempId}">Launching...</span>
          </div>
      `;
      terminal.appendChild(item);

      if (btn) {
          DOMUtils.setButtonState(btn, "loading", "Launching...");
      }

      try {
          const session = await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name} Execution`);

          // Update item with actual session ID
          item.id = `session-${session.id}`;
          const statusBadge = item.querySelector(`#status-${tempId}`);
          statusBadge.id = `status-${session.id}`;
          statusBadge.textContent = "In Progress";

          this.startTerminalPolling(session.id, item, repoPath);
          this.toast.show(`Session for ${agent.name} launched successfully!`, "success");
      } catch (err) {
          const statusBadge = item.querySelector(`#status-${tempId}`);
          statusBadge.className = "status-badge status-failed";
          statusBadge.textContent = "Failed";

          const metaDiv = item.querySelector(".dashboard-meta");
          metaDiv.textContent = `Launch Error: ${err.message}`;
          metaDiv.style.color = "#ef4444";

          this.toast.show(`Failed to launch session: ${err.message}`, "error");
      } finally {
          if (btn) {
              DOMUtils.setButtonState(btn, "ready", "Launch in Jules 🚀");
          }
      }
  }

  /**
   * Polls the Jules API activities endpoint and updates the visual terminal feed.
   * @param {string} sessionId - The current Jules session ID.
   * @param {HTMLElement} item - The DOM element representing the dashboard item for this session.
   * @param {string} repoPath - The repository path (e.g. 'owner/repo').
   * @see README.md#rosterapp-architecture
   */
  startTerminalPolling(sessionId, item, repoPath) {
      if (!this.julesPollingIntervals) this.julesPollingIntervals = {};
      if (this.julesPollingIntervals[sessionId]) clearInterval(this.julesPollingIntervals[sessionId]);
      
      const statusBadge = item.querySelector(`#status-${sessionId}`);
      const metaDiv = item.querySelector(".dashboard-meta");
      const statusContainer = item.querySelector(".dashboard-status");
      
      this.julesPollingIntervals[sessionId] = setInterval(async () => {
          try {
              const data = await window.julesService.getActivities(sessionId);
              if (!data.activities) return;

              // Sort chronologically
              const activities = data.activities.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

              let isCompleted = false;
              let hasError = false;
              let isWaitingForInput = false;
              let lastProgressTitle = metaDiv.textContent;

              activities.forEach(act => {
                  if (act.progressUpdated) {
                      lastProgressTitle = act.progressUpdated.title;
                  } else if (act.userActionRequired || act.requiresInput || (act.type && act.type.includes('INPUT'))) {
                      isWaitingForInput = true;
                      lastProgressTitle = act.title || "Waiting for Input...";
                  } else if (act.sessionCompleted) {
                      isCompleted = true;

                      if (act.artifacts && act.artifacts[0]?.changeSet?.gitPatch?.suggestedCommitMessage) {
                          const prTitle = act.artifacts[0].changeSet.gitPatch.suggestedCommitMessage.split('\n')[0];
                          lastProgressTitle = `PR Drafted: ${prTitle}`;
                      } else {
                          lastProgressTitle = "Session Completed Successfully.";
                      }
                  } else if (act.error) {
                      hasError = true;
                      lastProgressTitle = "Session Failed.";
                  }
              });

              metaDiv.textContent = lastProgressTitle;

              if (isCompleted) {
                  statusBadge.className = "status-badge status-completed";
                  statusBadge.textContent = "Completed";

                  // Add PR link
                  const prLink = createPRLink(`https://github.com/${repoPath}/pulls`);
                  statusContainer.appendChild(prLink);

                  clearInterval(this.julesPollingIntervals[sessionId]);
                  delete this.julesPollingIntervals[sessionId];
              } else if (hasError) {
                  statusBadge.className = "status-badge status-failed";
                  statusBadge.textContent = "Failed";
                  metaDiv.style.color = "#ef4444";

                  clearInterval(this.julesPollingIntervals[sessionId]);
                  delete this.julesPollingIntervals[sessionId];
              } else if (isWaitingForInput) {
                  statusBadge.className = "status-badge status-failed";
                  statusBadge.textContent = "Needs Input";
                  statusBadge.style.background = "rgba(245, 158, 11, 0.1)";
                  statusBadge.style.color = "#f59e0b";
                  statusBadge.style.borderColor = "rgba(245, 158, 11, 0.2)";
              }

          } catch (e) {
              console.error("Polling error", e);
          }
      }, 3000); // Poll every 3 seconds
  }

  /**
   * Filters the agent roster using fuzzy search and updates the UI.
   * Rebuilds the internal Fuse.js index only on state boundary changes, limiting results to eradicate layout thrashing.
   * @param {string} query - The search query string.
   * @see README.md#rosterapp-architecture for Search & Layout Thrashing Prevention details.
   */
  filterAgents(query) {
    const search = query.toLowerCase();
    const searchModeContainer = document.getElementById("searchModeContainer");
    const searchResultsGrid = document.getElementById("searchResultsGrid");
    const categoryNav = document.getElementById("category-nav");
    
    if (query.length > 0) {
      this.elements.clearBtn?.classList.add("visible");
      searchModeContainer.classList.remove("hidden");
      if(categoryNav) categoryNav.style.display = 'none';
      
      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "none", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "none", "search-mode-header");
    } else {
      this.elements.clearBtn?.classList.remove("visible");
      searchModeContainer.classList.add("hidden");
      if(categoryNav) categoryNav.style.display = 'flex';
      
      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "", "search-mode-header");
      
      this.elements.emptyState?.classList.remove("visible");
      if (this.elements.announcer) this.elements.announcer.textContent = "";
      return;
    }

    let visibleCount = 0;
    const currentUnlockedSize = (this.fusionLab && this.fusionLab.fusionIndex) ? this.fusionLab.fusionIndex.unlockedKeys.size : 0;

    if (!this._searchCache ||
        this._searchCache.agentCount !== this.agents.length ||
        this._searchCache.unlockedSize !== currentUnlockedSize) {

        const allAgents = this.agents.map((agent, index) => ({ agent, keyOrIndex: index }));
        if (this.fusionLab && this.fusionLab.fusionIndex) {
            this.fusionLab.fusionIndex.unlockedKeys.forEach(key => {
                let agent = this.customAgents[key] || this.fusionLab.compiler.customAgentsMap[key];
                if (agent) {
                    allAgents.push({ agent, keyOrIndex: key });
                }
            });
        }

        const fuse = new Fuse(allAgents, {
            keys: ["agent.name", "agent.short_description"],
            threshold: 0.4
        });

        this._searchCache = {
            agentCount: this.agents.length,
            unlockedSize: currentUnlockedSize,
            fuseInstance: fuse
        };
    }

    const results = this._searchCache.fuseInstance.search(search);

    const htmlResults = results.map(result => {
        const { agent, keyOrIndex } = result.item;
        let cardHtml = this._cardHtmlCache.get(keyOrIndex);
        if (!cardHtml) {
            const card = AgentCard.create(agent, keyOrIndex, 0);
            cardHtml = card.outerHTML || ''; 
            this._cardHtmlCache.set(keyOrIndex, cardHtml);
        }
        const delay = `${Math.min(visibleCount * 30, 600)}ms`;
        const renderedHtml = typeof cardHtml === 'string' ? cardHtml.replace(/animation-delay:\s*0ms;?/, `animation-delay: ${delay};`) : '';
        visibleCount++;
        return renderedHtml;
    });

    if (!this.searchClusterize) {
      this.searchClusterize = new Clusterize({
        rows: htmlResults,
        scrollId: 'searchResultsScrollArea',
        contentId: 'searchResultsGrid'
      });
    } else {
      this.searchClusterize.update(htmlResults);
    }

    if (results.length === 0) {
      this.elements.emptyState?.classList.add("visible");
      searchModeContainer.classList.add("hidden");
    } else {
      this.elements.emptyState?.classList.remove("visible");
    }

    if (this.elements.announcer) {
      this.elements.announcer.textContent = results.length === 0 ? "No protocols found." : `Found ${results.length} protocols.`;
    }
  }

  /**
   * Clears the current search query.
   * @see README.md#rosterapp-architecture
   */
  clearSearch() {
    if (this.elements.searchInput) {
      this.elements.searchInput.value = "";
      this.filterAgents("");
    }
  }

  /**
   * Copies a specific agent's prompt to clipboard.
   * @param {string|number} index - The index or key of the agent.
   * @param {HTMLElement} btn - The button element that triggered the action.
   * @see README.md#rosterapp-architecture
   */
  async copyAgent(index, btn) {
    let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
    if (!agent) return;

    const success = await ClipboardUtils.copyText(agent.prompt);
    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  /**
   * Downloads all custom agents as a single markdown file.
   * @param {HTMLElement} btn - The button element that triggered the action.
   * @see README.md#rosterapp-architecture
   */
  downloadCustomAgents(btn) {
    const header = FormatUtils.CUSTOM_ROSTER_HEADER;
    const validCustomAgents = Object.values(this.customAgents).filter(a => a.prompt && a.prompt.length > 0);
    if (validCustomAgents.length === 0) return this.toast.show("No custom agents available.");
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), "jules_custom_agents.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Downloads all standard agents as a single markdown file.
   * @param {HTMLElement} btn - The button element that triggered the action.
   * @see README.md#rosterapp-architecture
   */
  downloadAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(this.agents), "jules_roster.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Copies all standard agent prompts to the clipboard.
   * @param {HTMLElement} btn - The button element that triggered the action.
   * @see README.md#rosterapp-architecture
   */
  async copyAll(btn) {
    const header = FormatUtils.MASTER_ROSTER_HEADER;
    const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(this.agents));
    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  /**
   * Initializes the IntersectionObserver for category navigation pills.
   * @see README.md#rosterapp-architecture
   */
  initObserver() {
    const navPills = document.querySelectorAll(CONFIG.selectors.navPills);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetId = CONFIG.sectionMap[entry.target.id];
            navPills.forEach((pill) => {
              const href = pill.getAttribute("href").substring(1);
              pill.classList.toggle("active", href === targetId);
            });
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    Object.keys(CONFIG.sectionMap).forEach((gridId) => {
      const el = document.getElementById(gridId);
      if (el) observer.observe(el);
    });
  }

  /**
   * Displays a toast notification with the specified message.
   * @param {string} message - The message to display.
   * @see README.md#rosterapp-architecture
   */
  showToast(message) {
      this.toast.show(message);
  }
}
