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
                <button onclick="window.location.reload()" class="mt-6">Refresh Page</button>
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
          }
      } catch (err) {
          this.toast.show("Failed to fetch Repos. Check API Key.", true);
          console.error("Jules Source Error:", err);
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
      if (backTarget) {
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
          const safeIndex = CSS.escape(String(index));
          const dropdown = document.getElementById(`card-dropdown-${safeIndex}`);
          
          // Close others
          document.querySelectorAll('.dropdown-menu.visible').forEach(m => {
              if (m !== dropdown && m.id !== 'masterDropdownMenu') m.classList.remove('visible');
          });

          if (dropdown) dropdown.classList.toggle('visible');
          return;
      }

      // 7. General Action Buttons (Copy/Download/Launch)
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn && ["copy-agent", "download-agent", "launch-jules"].includes(actionBtn.dataset.action)) {
          const index = actionBtn.dataset.index;
          let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
          if (!agent) return;

          if (actionBtn.dataset.action === "copy-agent") {
              this.copyAgent(index, actionBtn);
              actionBtn.closest('.dropdown-menu')?.classList.remove('visible');
          } else if (actionBtn.dataset.action === "download-agent") {
              DownloadUtils.downloadTextFile(agent.prompt, `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              actionBtn.closest('.dropdown-menu')?.classList.remove('visible');
          } else if (actionBtn.dataset.action === "launch-jules") {
              this.launchJulesSession(agent);
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
   * Triggers a new session in the Jules API Runner.
   * @param {Object} agent - The agent data object.
   * @see README.md#rosterapp-architecture
   */
  async launchJulesSession(agent) {
      const sourceName = document.getElementById("julesRepoPicker").value;
      const userTask = document.getElementById("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";
      
      if (!sourceName) {
          this.toast.show("Please select a target repository in the runner panel.", true);
          document.getElementById("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
          document.getElementById("julesRepoPicker").focus();
          return;
      }

      document.getElementById("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
      const terminal = document.getElementById("julesTerminal");
      terminal.classList.add('active');
      terminal.innerHTML = "";
      const line = document.createElement("div");
      line.className = "terminal-line";
      const timeSpan = document.createElement("span");
      timeSpan.className = "terminal-time";
      timeSpan.textContent = "[System]";
      line.appendChild(timeSpan);
      line.appendChild(document.createTextNode(` 🚀 Launching ${agent.name} (${agent.emoji})...`));
      terminal.appendChild(line);

      try {
          const session = await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name} Execution`);
          this.startTerminalPolling(session.id, terminal);
      } catch (err) {
          const errorLine = document.createElement("div");
          errorLine.className = "terminal-line terminal-error";
          const errorTimeSpan = document.createElement("span");
          errorTimeSpan.className = "terminal-time";
          errorTimeSpan.textContent = "[Error]";
          errorLine.appendChild(errorTimeSpan);
          errorLine.appendChild(document.createTextNode(` Failed to launch: ${err.message}`));
          terminal.appendChild(errorLine);
      }
  }

  /**
   * Polls the Jules API activities endpoint and updates the visual terminal feed.
   * @param {string} sessionId - The current Jules session ID.
   * @param {HTMLElement} terminal - The DOM element representing the terminal output.
   * @see README.md#rosterapp-architecture
   */
  startTerminalPolling(sessionId, terminal) {
      if (this.julesPollingInterval) clearInterval(this.julesPollingInterval);
      
      let knownActivityIds = new Set();
      
      this.julesPollingInterval = setInterval(async () => {
          try {
              const data = await window.julesService.getActivities(sessionId);
              if (!data.activities) return;

              // Sort chronologically
              const activities = data.activities.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

              activities.forEach(act => {
                  if (knownActivityIds.has(act.id)) return;
                  knownActivityIds.add(act.id);

                  const timeStr = new Date(act.createTime).toLocaleTimeString();
                  const lineDiv = document.createElement("div");
                  lineDiv.className = "terminal-line";

                  const timeSpan = document.createElement("span");
                  timeSpan.className = "terminal-time";
                  timeSpan.textContent = `[${timeStr}] `;
                  lineDiv.appendChild(timeSpan);
                  
                  if (act.progressUpdated) {
                      lineDiv.appendChild(document.createTextNode(act.progressUpdated.title));
                      if (act.progressUpdated.description) {
                           lineDiv.appendChild(document.createElement("br"));
                           const descSpan = document.createElement("span");
                           descSpan.style.color = "var(--text-secondary)";
                           descSpan.style.marginLeft = "1rem";
                           descSpan.textContent = `↳ ${act.progressUpdated.description}`;
                           lineDiv.appendChild(descSpan);
                      }
                  } else if (act.planGenerated) {
                      const planSpan = document.createElement("span");
                      planSpan.className = "terminal-plan";
                      planSpan.textContent = `📋 Plan Generated: ${act.planGenerated.plan.steps.length} steps outlined.`;
                      lineDiv.appendChild(planSpan);
                  } else if (act.sessionCompleted) {
                      const successSpan = document.createElement("span");
                      successSpan.className = "terminal-success";
                      successSpan.textContent = "✅ Session Completed Successfully.";
                      lineDiv.appendChild(successSpan);

                      if (act.artifacts && act.artifacts[0]?.changeSet?.gitPatch?.suggestedCommitMessage) {
                          lineDiv.appendChild(document.createElement("br"));
                          const prSpan = document.createElement("span");
                          prSpan.style.color = "#f8fafc";
                          prSpan.style.background = "#1e293b";
                          prSpan.style.padding = "0.2rem 0.5rem";
                          prSpan.style.marginTop = "0.2rem";
                          prSpan.style.display = "inline-block";
                          prSpan.textContent = `Drafted PR: ${act.artifacts[0].changeSet.gitPatch.suggestedCommitMessage.split('\n')[0]}`;
                          lineDiv.appendChild(prSpan);
                      }
                      clearInterval(this.julesPollingInterval);
                  } else {
                      lineDiv.appendChild(document.createTextNode("System Activity Logged."));
                  }
                  
                  terminal.appendChild(lineDiv);
                  terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
              });

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
      
      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "flex", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "block", "search-mode-header");
      
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
