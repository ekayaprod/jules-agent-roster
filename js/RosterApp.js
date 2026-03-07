// Helper for closing a dropdown menu and syncing its aria-expanded state
function closeDropdownMenu(menu) {
    if (!menu) return;
    menu.classList.remove('visible');
    const toggleBtn = document.querySelector(`[aria-controls="${menu.id}"]`);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
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
    this._domNodeCache = new Map();
    this.julesManager = new JulesManager(this);
  }

  /**
   * Bootstraps the application, fetching agent data and initializing UI components.
   * Executes the Initialization Flow, caching critical DOM elements and handling fallback states.
   * @returns {Promise<void>} Resolves when initialization is complete.
   * @see README.md#rosterapp-architecture for the Initialization Flow details.
   */
  async init() {
    this.cacheElements();
    // 🪄 Illusionist: Render skeletons synchronously *before* yielding to network requests
    // to instantly mask network latency and eliminate layout popping.
    this.renderSkeletons();

    try {
        // Run concurrent initialization tasks
        const initTasks = [
            this.agentRepo.fetchAgents(),
            this.julesManager.init()
        ];

        const [agentData] = await Promise.all(initTasks);
        const { agents, customAgents } = agentData;
        this.agents = agents;
        this.customAgents = customAgents;

        this.fusionLab = new FusionLab();
        this.fusionLab.init(this.agents, this.customAgents);

        const skeleton = this.elements.fusionLabSkeleton;
        const content = this.elements.fusionLabContent;
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

    // Cache static elements used frequently during high-frequency events or initialization
    const staticIds = [
      "searchInput", "clearBtn", "fusionLabSkeleton", "fusionLabContent", "clearSearchEmptyBtn", "julesRepoPicker",
      "julesTerminal", "masterDropdownBtn", "masterDropdownMenu", "masterCopyBtn",
      "masterDownloadCoreBtn", "masterCopyFusionsBtn", "masterDownloadFusionsBtn",
      "searchModeContainer", "searchResultsGrid", "category-nav"
    ];
    staticIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
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

        let card = this._domNodeCache.get(String(indexOrKey));
        if (card) {
            // Re-use cached node but recalculate animation delay
            card.style.animationDelay = `${Math.min(globalIndex * 30, 600)}ms`;
        } else {
            card = AgentCard.create(agent, indexOrKey, globalIndex);
            this._domNodeCache.set(String(indexOrKey), card);
        }
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

          // 🪄 Illusionist: Dismiss loading overlay after DOM is generated
          const overlay = document.getElementById("initial-loading-overlay");
          if (overlay && !overlay.classList.contains("hidden")) {
              overlay.classList.add("hidden");
              setTimeout(() => {
                  if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
              }, 500);
          }
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
    this.elements.clearSearchEmptyBtn?.addEventListener("click", () => this.clearSearch());

    this.elements.julesRepoPicker?.addEventListener('change', (e) => {
        if (this._cardHtmlCache) this._cardHtmlCache.clear();
        if (this._domNodeCache) this._domNodeCache.clear();
        this.renderAgents();

        const sourceName = e.target.value;
        if (sourceName) {
            this.julesManager.loadActiveSessionsForRepo(sourceName);
        } else {
            const terminal = this.elements.julesTerminal;
            if (terminal) {
              terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
              terminal.classList.remove('active');
            }
            this.julesManager.cleanup();
        }
    });

    // Footer Master Export Controls
    const masterDropBtn = this.elements.masterDropdownBtn;
    const masterDropMenu = this.elements.masterDropdownMenu;
    
    masterDropBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        masterDropMenu?.classList.toggle("visible");
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
              closeDropdownMenu(menu);
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
              if (this._domNodeCache) {
                  this._domNodeCache.delete(String(index));
              }
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
                  closeDropdownMenu(m);
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
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'));
          } else if (actionBtn.dataset.action === "download-agent") {
              DownloadUtils.downloadTextFile(agent.prompt, `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'));
          } else if (actionBtn.dataset.action === "launch-jules") {
              this.julesManager.launchSession(agent, actionBtn);
          }
      }
    });

    // Master Export bindings
    this.elements.masterCopyBtn?.addEventListener("click", (e) => this.copyAll(e.currentTarget));
    this.elements.masterDownloadCoreBtn?.addEventListener("click", (e) => {
        this.downloadAll(e.currentTarget);
        masterDropMenu?.classList.remove("visible");
    });
    this.elements.masterCopyFusionsBtn?.addEventListener("click", async (e) => {
        const validCustomAgents = Object.values(this.customAgents).filter(a => a.prompt && a.prompt.length > 0);
        if (validCustomAgents.length === 0) return this.toast.show("No custom agents unlocked yet.");
        const header = FormatUtils.CUSTOM_ROSTER_HEADER;
        const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(validCustomAgents));
        if (success) {
            this.toast.show("Fusions copied to clipboard");
            ClipboardUtils.animateButtonSuccess(e.currentTarget, "Copied!");
        }
        masterDropMenu?.classList.remove("visible");
    });
    this.elements.masterDownloadFusionsBtn?.addEventListener("click", (e) => {
        this.downloadCustomAgents(e.currentTarget);
        masterDropMenu?.classList.remove("visible");
    });
  }




  /**
   * Filters the agent roster using fuzzy search and updates the UI.
   * Rebuilds the internal Fuse.js index only on state boundary changes, limiting results to eradicate layout thrashing.
   * @param {string} query - The search query string.
   * @see README.md#rosterapp-architecture for Search & Layout Thrashing Prevention details.
   */
  filterAgents(query) {
    const search = query.toLowerCase();
    const searchModeContainer = this.elements.searchModeContainer;
    const searchResultsGrid = this.elements.searchResultsGrid;
    const categoryNav = this.elements["category-nav"];
    
    if (query.length > 0) {
      this.elements.clearBtn?.classList.add("visible");
      searchModeContainer?.classList.remove("hidden");
      if(categoryNav) categoryNav.style.display = 'none';
      
      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "none", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "none", "search-mode-header");
    } else {
      this.elements.clearBtn?.classList.remove("visible");
      searchModeContainer?.classList.add("hidden");
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
      searchModeContainer?.classList.add("hidden");
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
      // ⚡ Bolt+: Utilize cached category elements to prevent repeated query execution
      const catKey = Object.keys(CONFIG.categories).find(k => CONFIG.categories[k] === gridId);
      const el = catKey ? this.categoryElements[catKey] : document.getElementById(gridId);
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
