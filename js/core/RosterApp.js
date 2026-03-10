const OBSERVER_OPTIONS = {
    rootMargin: "-80px 0px -60% 0px",
    threshold: 0
};

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
    this.searchController = new SearchController(this);
    this.exportController = new ExportController(this);
  }

  /**
   * Bootstraps the application by concurrently resolving external dependencies,
   * injecting placeholder skeletons to mask latency, and triggering the rendering loop.
   * @see README.md#rosterapp-architecture for the Boot/Fetch lifecycle.
   * @returns {Promise<void>} Resolves when initialization is complete.
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
   * Caches critical DOM elements locally via `document.querySelector`.
   * Executed strictly once during boot to prevent continuous N-time DOM traversal penalties.
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
    this.categoryLookup = {};
    Object.keys(CONFIG.categories).forEach((key) => {
      const gridId = CONFIG.categories[key];
      this.categoryElements[key] = document.getElementById(gridId);
      this.categoryLookup[gridId] = key;
    });

    // Cache static elements used frequently during high-frequency events or initialization
    const staticIds = [
      "searchInput", "clearBtn", "fusionLabSkeleton", "fusionLabContent", "clearSearchEmptyBtn", "julesRepoPicker",
      "julesTerminal", "masterDropdownBtn", "masterDropdownMenu", "masterCopyBtn",
      "masterDownloadCoreBtn", "masterCopyFusionsBtn", "masterDownloadFusionsBtn",
      "searchModeContainer", "searchResultsGrid", "category-nav", "searchTriggerBtn"
    ];
    staticIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
  }

  /**
   * Synchronously injects CSS loading skeletons into all predefined grid containers
   * to provide immediate visual feedback before asynchronous fetches resolve.
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
   * Orchestrates the rendering of agent cards into their respective grid containers.
   * Flattens and chunks the 3D card generation using `requestAnimationFrame` to
   * prevent the main thread from locking up under heavy DOM hydration.
   * Handles pin-status sorting and cache invalidation automatically.
   * @see README.md#rosterapp-architecture
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
             if (!isNaN(key)) return;

             let agent = (this.customAgents && this.customAgents[key]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[key]);
             if (!agent) return;

             const category = agent.category || "strategy";
             if (!categorizedAgents[category]) return;
             categorizedAgents[category].push({ agent, indexOrKey: key });
        });
    }

    const flattenedAgents = [];
    // ⚡ Bolt+: Implemented Schwartzian transform to reduce O(N log N) Set lookups to O(N) during sorting.
    // Why: We cache the pin state (`isPinned`) for each agent before sorting. This avoids
    // calling `this.pinnedManager.isPinned(item.indexOrKey)` inside the `sort` comparator,
    // which would otherwise be executed `O(N log N)` times, causing a performance bottleneck.
    Object.keys(categorizedAgents).forEach(category => {
       const mapped = categorizedAgents[category].map(item => ({
           original: item,
           isPinned: this.pinnedManager ? this.pinnedManager.isPinned(item.indexOrKey) : false
       }));
       mapped.sort((a, b) => {
           if (a.isPinned && !b.isPinned) return -1;
           if (!a.isPinned && b.isPinned) return 1;
           return 0;
       });
       flattenedAgents.push(...mapped.map(m => m.original));
    });

    const currentRenderId = Symbol();
    this.currentRenderId = currentRenderId;

    let globalIndex = 0;
    const CHUNK_SIZE = 15;
    let agentIndex = 0;

    // WARN: Do NOT convert this recursive `requestAnimationFrame` loop into a synchronous `.map()` or `.forEach()`.
    // Why: Rendering all DOM nodes synchronously blocks the main thread, causing layout popping,
    // frozen UI, and delayed skeleton removal. The `requestAnimationFrame(() => setTimeout(..., 0))`
    // pattern yields control to the browser between chunks to keep the interface responsive.
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
   * Centralizes all event binding into a single delegation pattern at the `document` level.
   * Prevents attaching individual handlers to thousands of interactive child nodes.
   * Intercepts and delegates actions based on the `data-action` attribute.
   * @see README.md#rosterapp-architecture
   */
  bindEvents() {
    if (this.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => this.filterAgents(query), 300);
      this.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
    }
    
    this.elements.searchTriggerBtn?.addEventListener("click", (e) => {
      const nav = this.elements["category-nav"];
      if (nav) {
        nav.classList.add("search-active");
        setTimeout(() => this.elements.searchInput?.focus(), 50);
      }
    });

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
      // Close search if clicked outside and input is empty
      const nav = this.elements["category-nav"];
      if (nav && nav.classList.contains("search-active")) {
          if (!nav.contains(e.target) && (!this.elements.searchInput || this.elements.searchInput.value.trim() === "")) {
              this.clearSearch();
          }
      }

      // 1. Close master dropdown if clicked outside
      if (masterDropMenu?.classList.contains("visible") && !masterDropMenu.contains(e.target) && !masterDropBtn.contains(e.target)) {
          masterDropMenu.classList.remove("visible");
      }

      // 2. Close specific card dropdowns if clicked outside
      // ⚡ Bolt+: Replaced document.querySelectorAll with document.querySelector inside a while loop to halt DOM traversal early upon the first match, preventing unnecessary NodeList memory allocation on every click.
      let visibleMenu;
      while ((visibleMenu = document.querySelector('.card-dropdown-menu.visible, .dropdown-menu.visible'))) {
          if (visibleMenu.id !== 'masterDropdownMenu' && !visibleMenu.contains(e.target) && !e.target.closest('[data-action="toggle-card-dropdown"]')) {
              closeDropdownMenu(visibleMenu);
          } else {
              break;
          }
      }

      // 3. Toggle Pin
      const pinTarget = e.target.closest('[data-action="toggle-pin"]');
      if (pinTarget) {
          const card = pinTarget.closest('.flip-card');
          if (card && card.classList.contains('flipped')) return;
          e.stopPropagation();
          e.preventDefault();

          const index = pinTarget.dataset.index;
          if (!index) return;

          const isPinned = this.pinnedManager.togglePin(index);

          // ⚡ Bolt+: Eliminated redundant DOM query and mutation; state is fully updated by the immediate this.renderAgents() call below.
          if (this._domNodeCache) this._domNodeCache.delete(String(index));

          this.renderAgents();
          this.showToast(isPinned ? "Pinned" : "Unpinned");

          if (this._cardHtmlCache) {
              this._cardHtmlCache.delete(String(index));
              this._cardHtmlCache.delete(Number(index));
          }
          return;
      }

      // 4. Flip Card Front (Open)
      const frontTarget = e.target.closest('[data-action="flip-card"]');
      if (frontTarget) {
          const card = frontTarget.closest('.flip-card');
          if (!card) return;

          const index = frontTarget.dataset.index;
          const safeIndex = CSS.escape(String(index));
          const promptArea = card.querySelector(`#prompt-content-${safeIndex}`);

          if (promptArea && !promptArea.innerHTML.trim()) {
              let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
              if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
              if (agent) {
                  promptArea.innerHTML = '';
                  promptArea.appendChild(AgentCard.getPromptNode(agent));
              }
          }
          card.classList.add('flipped');
          return;
      }

      // 5. Flip Card Back (Close)
      const backTarget = e.target.closest('[data-action="flip-card-back"]');
      if (backTarget && !e.target.closest('.prompt-scroll-area') && !e.target.closest('.card-actions')) {
          e.stopPropagation();
          const card = backTarget.closest('.flip-card');
          if (!card) return;
          card.classList.remove('flipped');
          return;
      }

      // 6. Action Dropdown Toggle (For individual cards)
      const toggleTarget = e.target.closest('[data-action="toggle-card-dropdown"]');
      if (toggleTarget) {
          e.stopPropagation();
          const index = toggleTarget.dataset.index;
          const dropdown = document.getElementById(`card-dropdown-${index}`);
          
          // Close others
          // ⚡ Bolt+: Replaced document.querySelectorAll with document.querySelector inside a while loop to halt DOM traversal early.
          let otherMenu;
          while ((otherMenu = document.querySelector('.dropdown-menu.visible:not(#masterDropdownMenu)'))) {
              if (otherMenu !== dropdown) {
                  closeDropdownMenu(otherMenu);
              } else {
                  break;
              }
          }

          if (!dropdown) return;
          const isVisible = dropdown.classList.toggle('visible');
          toggleTarget.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
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

          const action = actionBtn.dataset.action;
          if (action === "copy-agent") {
              this.copyAgent(index, actionBtn);
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'));
              return;
          }
          if (action === "download-agent") {
              DownloadUtils.downloadTextFile(agent.prompt, `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'));
              return;
          }
          if (action === "launch-jules") {
              this.julesManager.launchSession(agent, actionBtn);
              return;
          }
      }
    });

    // Close search on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const nav = this.elements["category-nav"];
            if (nav && nav.classList.contains("search-active")) {
                this.clearSearch();
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
   * Executes a fuzzy match against all loaded agents using the provided query string.
   * Initializes or updates a virtual scrolling `Clusterize.js` instance to render
   * matches without triggering massive native DOM reflows.
   * @param {string} query - The search query string.
   * @see README.md#search-mechanics
   */
  filterAgents(query) {
    if (this.searchController) {
        this.searchController.filterAgents(query);
    }
  }

  /**
   * Clears the active search query, destroys the search results view,
   * and resets the UI back to the default categorized master layout.
   * @see README.md#search-mechanics
   */
  clearSearch() {
    if (this.searchController) {
        this.searchController.clearSearch();
    }
  }

  /**
   * Retrieves an agent's prompt text and pushes it to the system clipboard.
   * Triggers a temporary success animation on the executing button via `ClipboardUtils`.
   * @param {string|number} index - The unique identifier or index of the agent.
   * @param {HTMLElement} btn - The button element that triggered the action.
   * @returns {Promise<void>}
   */
  async copyAgent(index, btn) {
    if (this.exportController) {
        return this.exportController.copyAgent(index, btn);
    }
  }

  /**
   * Triggers a browser download of the user's unlocked custom fusions
   * formatted as a structured JSON backup.
   * @param {HTMLElement} btn - The interacting element to animate on success.
   */
  downloadCustomAgents(btn) {
    if (this.exportController) {
        this.exportController.downloadCustomAgents(btn);
    }
  }

  /**
   * Compiles all master and unlocked custom agent prompts into a single concatenated
   * markdown payload and forces a file download.
   * @param {HTMLElement} btn - The interacting element to animate on success.
   */
  downloadAll(btn) {
    if (this.exportController) {
        this.exportController.downloadAll(btn);
    }
  }

  /**
   * Compiles all master and custom agent prompts into a single string
   * and pushes the payload directly to the user's system clipboard.
   * @param {HTMLElement} btn - The interacting element to animate on success.
   * @returns {Promise<void>}
   */
  async copyAll(btn) {
    if (this.exportController) {
        return this.exportController.copyAll(btn);
    }
  }

  /**
   * Initializes an `IntersectionObserver` to trigger the active state of navigation pills
   * natively as the user scrolls past each categorized grid section.
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
      OBSERVER_OPTIONS
    );

    Object.keys(CONFIG.sectionMap).forEach((gridId) => {
      // ⚡ Bolt+: Utilize cached category elements and O(1) reversed lookups to prevent repeated query execution.
      const catKey = this.categoryLookup[gridId];
      const el = catKey ? this.categoryElements[catKey] : document.getElementById(gridId);
      if (el) observer.observe(el);
    });
  }

  /**
   * Intercepts string messages and passes them to the dedicated `ToastNotification` system
   * for accessible, auto-dismissing feedback alerts.
   * @param {string} message - The notification payload to display.
   */
  showToast(message) {
      this.toast.show(message);
  }
}
