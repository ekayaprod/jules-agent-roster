const OBSERVER_OPTIONS = {
    rootMargin: "-80px 0px -60% 0px",
    threshold: 0
};

const LOADING_OVERLAY_DISMISS_MS = 500;
const SEARCH_DEBOUNCE_MS = 300;

// Helper for closing a dropdown menu and syncing its aria-expanded state
function closeDropdownMenu(menu, appContext) {
    if (!menu) return;
    menu.classList.remove('visible');
    const toggleBtn = document.querySelector(`[aria-controls="${menu.id}"]`);
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    if (appContext && appContext.activeDropdowns) {
        appContext.activeDropdowns.delete(menu);
    }
}


// --- ROSTER APP ---
/**
 * Main application class for the Autonomous Protocol Matrix.
 * Orchestrates the primary application flow, emphasizing asynchronous non-blocking operations and event delegation.
 * @see ../../docs/architecture/core/README.md#rosterapp-architecture for the core lifecycle and architecture details.
 */
class RosterApp {
  /**
   * Initializes the RosterApp instance, setting up empty states and service dependencies.
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture
   */
  constructor() {
    this.agents = [];
    this.customAgents = {};
    this.elements = {};
    this.activeDropdowns = new Set();
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
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture for the Boot/Fetch lifecycle.
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
            this.agentRepo.fetchAgents().catch(err => {
                console.warn("AgentRepository API failed to initialize, providing safe fallback.", err);
                return { agents: [], customAgents: {} };
            }),
            this.julesManager.init().catch(err => {
                console.warn("JulesManager API failed to initialize.", err);
            })
        ];

        const [agentData] = await Promise.all(initTasks);
        const { agents, customAgents, fusionMatrix } = agentData || { agents: [], customAgents: {}, fusionMatrix: {} };
        this.agents = agents;
        this.customAgents = customAgents;
        this.fusionMatrix = fusionMatrix;

        this.fusionLab = new FusionLab();
        this.fusionLab.init(this.agents, this.customAgents, this.fusionMatrix);

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
                setTimeout(revealContent, LOADING_OVERLAY_DISMISS_MS);
            }
        }
    } catch (error) {
        if (this.elements.main) {
            const isDataError = error.message && (error.message.includes("JSON") || error.message.includes("configuration"));
            const errorTitle = "Unable to Load Protocols";
            const errorDesc = isDataError
              ? "Check your configuration file formatting and try again."
              : "Check your internet connection and refresh the page.";

            const emptyState = EmptyState.create({
                title: errorTitle,
                description: errorDesc,
                icon: EmptyState.ICONS.ERROR,
                action: {
                    text: "Refresh Page",
                    onClick: "typeof window !== 'undefined' && window.location.reload()",
                    ariaLabel: "Refresh Page to Retry Loading"
                }
            });

            this.elements.main.innerHTML = "";
            this.elements.main.appendChild(emptyState);
        }
    }

    this.renderAgents();
    this.bindEvents();
    this.initObserver();
  }


  /**
   * Caches critical DOM elements locally via `document.querySelector`.
   * Executed strictly once during boot to prevent continuous N-time DOM traversal penalties.
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture
   */
  cacheElements() {
    const selectors = CONFIG.selectors;
    for (const key in selectors) {
      if (Object.prototype.hasOwnProperty.call(selectors, key)) {
        const selector = selectors[key];
        this.elements[key] = selector.startsWith("#")
          ? document.getElementById(selector.substring(1))
          : document.querySelectorAll(selector);
      }
    }

    // ⚡ Bolt+: Extracted redundant DOM queries outside of loops and cached the references on initialization.
    this.categoryElements = {};
    this.categoryLookup = {};
    this.categoryKeys = [];
    // ⚡ Bolt+: Replaced Object.keys().forEach with a direct for...in lookup to eliminate array allocations on app startup.
    for (const key in CONFIG.categories) {
        if (Object.prototype.hasOwnProperty.call(CONFIG.categories, key)) {
            this.categoryKeys.push(key);
            const gridId = CONFIG.categories[key];
            this.categoryElements[key] = document.getElementById(gridId);
            this.categoryLookup[gridId] = key;
        }
    }

    // Cache static elements used frequently during high-frequency events or initialization
    const staticIds = [
      "searchInput", "clearBtn", "fusionLabSkeleton", "fusionLabContent", "clearSearchEmptyBtn", "julesRepoPicker",
      "julesTerminal", "masterDropdownBtn", "masterDropdownMenu", "masterCopyBtn",
      "masterDownloadCoreBtn", "masterCopyFusionsBtn", "masterDownloadFusionsBtn",
      "searchModeContainer", "searchResultsGrid", "category-nav", "searchTriggerBtn",
      "downloadParentFusionsBtn"
    ];
    staticIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    this.elements.navPills = document.querySelectorAll(CONFIG.selectors.navPills);
  }

  /**
   * Synchronously injects CSS loading skeletons into all predefined grid containers
   * to provide immediate visual feedback before asynchronous fetches resolve.
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture
   */
  renderSkeletons() {
    for (let i = 0; i < this.categoryKeys.length; i++) {
      const key = this.categoryKeys[i];
      const container = this.categoryElements[key];
      if (container) {
        container.innerHTML = "";
        for (let j = 0; j < 12; j++) {
          const skeleton = DOMUtils.createSkeletonElement("card skeleton-card skeleton-pulse");
          container.appendChild(skeleton);
        }
      }
    }
  }

  /**
   * Orchestrates the rendering of agent cards into their respective grid containers.
   * Flattens and chunks the 3D card generation using `requestAnimationFrame` to
   * prevent the main thread from locking up under heavy DOM hydration.
   * Handles pin-status sorting and cache invalidation automatically.
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture
   */
  renderAgents() {
    const categoryContainers = {};
    const fragments = {};
    const categorizedAgents = {};

    for (let i = 0; i < this.categoryKeys.length; i++) {
      const key = this.categoryKeys[i];
      const container = this.categoryElements[key];
      categoryContainers[key] = container;
      categorizedAgents[key] = [];
      if (container) {
        fragments[key] = document.createDocumentFragment();
      }
    }

    this.agents.forEach((agent, i) => {
      const category = agent.category || "strategy";
      if (categorizedAgents[category]) {
        categorizedAgents[category].push({ agent, indexOrKey: i });
      }
    });

    if (this.pinnedManager) {
        const pinnedKeys = this.pinnedManager.getPinned();
        pinnedKeys.forEach(key => {
             let agent = this.agents[key] || AgentUtils.getCustomAgent(this.customAgents, key) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[key]);

             // 🎧 FLOW: The Scaffold Realization.
             // Rebuild the pinned fusion agent card from scratch if it is an unlocked dynamic fusion not present in the static maps.
             if (!agent && this.fusionLab && this.fusionLab.fusionIndex && this.fusionLab.fusionIndex.isUnlocked(key)) {
                 const names = AgentUtils.splitFusionKey(key);
                 if (names.length === 2) {
                     const agentA = this.fusionLab.agentMap.get(names[0]);
                     const agentB = this.fusionLab.agentMap.get(names[1]);
                     if (agentA && agentB) {
                         agent = this.fusionLab.compiler.fuse(agentA, agentB);
                     }
                 }
             }

             if (!agent) return;

             if (!categorizedAgents["pinned"]) categorizedAgents["pinned"] = [];
             categorizedAgents["pinned"].push({ agent, indexOrKey: key });
        });
    }

    const flattenedAgents = [];
    // ↗️ VECTORIZE: The Single-Pass Pipeline. We bypass the redundant O(N) intermediate array creations
    // from the chained .map() calls. The static check for `pinnedManager` is hoisted out of the loop.
    // We instantiate a new array with the pinned state cached to avoid mutating the source data structures.
    for (let i = 0; i < this.categoryKeys.length; i++) {
        const categoryList = categorizedAgents[this.categoryKeys[i]];
        const mappedList = new Array(categoryList.length);

        for (let j = 0; j < categoryList.length; j++) {
            const item = categoryList[j];
            const isPinned = this.pinnedManager ? this.pinnedManager.isPinned(item.indexOrKey) : false;
            mappedList[j] = { original: item, isPinned };
        }

        mappedList.sort((a, b) => {
           if (a.isPinned && !b.isPinned) return -1;
           if (!a.isPinned && b.isPinned) return 1;
           const aTier = a.original && a.original.agent && a.original.agent.tier === "Plus" ? 1 : 0;
           const bTier = b.original && b.original.agent && b.original.agent.tier === "Plus" ? 1 : 0;
           if (aTier !== bTier) return bTier - aTier;
           return 0;
        });

        for (let j = 0; j < mappedList.length; j++) {
            flattenedAgents.push(mappedList[j].original);
        }
    }

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
            card.style.animationDelay = `${Math.min(globalIndex * AgentCard.ANIMATION_DELAY_STEP_MS, AgentCard.ANIMATION_DELAY_MAX_MS)}ms`;
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
          for (let i = 0; i < this.categoryKeys.length; i++) {
            const key = this.categoryKeys[i];
            const container = categoryContainers[key];
            if (container) {
              container.innerHTML = "";
              const fragment = fragments[key];
              const hasChildren = fragment && fragment.children.length > 0;
              if (fragment) container.appendChild(fragment);

              if (key === "pinned") {
                  const header = document.getElementById("pinned");
                  if (hasChildren) {
                      container.style.display = "";
                      container.classList.remove("empty");
                      if (header) header.style.display = "";
                  } else {
                      container.style.display = "none";
                      container.classList.add("empty");
                      if (header) header.style.display = "none";
                  }
              }
            }
          }

          // 🪄 Illusionist: Dismiss loading overlay after DOM is generated
          const overlay = document.getElementById("initial-loading-overlay");
          if (overlay && !overlay.classList.contains("hidden")) {
              overlay.classList.add("hidden");
              setTimeout(() => {
                  if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
              }, LOADING_OVERLAY_DISMISS_MS);
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
   * @see ../../docs/architecture/core/README.md#rosterapp-architecture
   */
  bindEvents() {
    if (this.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => this.filterAgents(query), SEARCH_DEBOUNCE_MS);
      this.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
    }
    
    this.elements.searchTriggerBtn?.addEventListener("click", () => {
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
            this.julesManager.loadPullRequestsForRepo(sourceName);
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
      this.activeDropdowns.forEach(menu => {
          if (menu.id !== 'masterDropdownMenu' && !menu.contains(e.target) && !e.target.closest('[data-action="toggle-card-dropdown"]')) {
              closeDropdownMenu(menu, this);
          }
      });

      // 2.5 Open Fusions Modal
      const fusionsTarget = e.target.closest('[data-action="open-fusions-modal"]');
      if (fusionsTarget) {
          e.stopPropagation();
          e.preventDefault();

          const index = fusionsTarget.dataset.index;
          let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (!agent) return;

          const modal = document.getElementById("fusionsModal");
          const contentArea = document.getElementById("fusionsModalContent");

          if (modal && contentArea && this.fusionLab && this.fusionLab.fusionIndex) {
              const unlockedKeys = this.fusionLab.fusionIndex.unlockedKeys;
              let listItems = '';

              // Dynamically resolve fusions from the live matrix map
              const allMatrixKeys = this.fusionLab.compiler.fusionMatrixMap ? Object.keys(this.fusionLab.compiler.fusionMatrixMap) : [];
              const potentialFusions = [];

              // Extract unique potential fusions for this agent dynamically
              const uniqueKeys = new Set(allMatrixKeys);
              for (const key of uniqueKeys) {
                  if (key.includes(agent.name)) {
                      potentialFusions.push(key);
                  }
              }

              for (const key of potentialFusions) {
                  const isUnlocked = typeof unlockedKeys.has === 'function'
                      ? unlockedKeys.has(key)
                      : unlockedKeys.includes(key);

                  if (isUnlocked) {
                      const fusionName = this.fusionLab.compiler.fusionMatrixMap[key];
                      const childAgent = AgentUtils.getCustomAgent(this.customAgents, fusionName) || this.fusionLab.compiler.customAgentsMap[fusionName];
                      if (childAgent) {
                          const childIcon = FormatUtils.extractIcon(childAgent);
                          const safeChildName = FormatUtils.escapeHTML(FormatUtils.extractDisplayName(childAgent));
                          listItems += `
                              <li style="list-style: none;">
                                  <button class="fusion-quick-btn" data-action="launch-jules" data-index="${key}" aria-label="Launch ${safeChildName}" title="${safeChildName}">
                                      ${childIcon}
                                  </button>
                              </li>
                          `;
                      }
                  }
              }

              const downloadBtn = document.getElementById("downloadParentFusionsBtn");
              if (listItems) {
                  contentArea.innerHTML = `<ul class="fusion-quick-list" style="padding: 0; margin: 0; display: flex; gap: 0.5rem; flex-wrap: wrap;">${listItems}</ul>`;
                  if (downloadBtn) {
                      downloadBtn.style.display = "";
                      downloadBtn.dataset.parentName = agent.name;
                  }
                  modal.classList.add("visible");
              } else if (downloadBtn) {
                  downloadBtn.style.display = "none";
              }
          }
          return;
      }

      const downloadParentFusionsBtn = e.target.closest('#downloadParentFusionsBtn');
      if (downloadParentFusionsBtn) {
          e.stopPropagation();
          e.preventDefault();
          const parentName = downloadParentFusionsBtn.dataset.parentName;
          if (parentName && this.exportController) {
              this.exportController.downloadCustomAgentsByParent(parentName, downloadParentFusionsBtn);
          }
          return;
      }

      const closeFusionsModalBtn = e.target.closest('#closeFusionsModalBtn');
      if (closeFusionsModalBtn) {
          e.stopPropagation();
          e.preventDefault();
          const modal = document.getElementById("fusionsModal");
          if (modal) modal.classList.remove("visible");
          return;
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
          // Validate agent exists before pinning
          let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
          if (!agent) return;

          const isPinned = this.pinnedManager.togglePin(index);

          const safeIndex = CSS.escape(String(index));
          const existingPins = document.querySelectorAll(`[data-action="toggle-pin"][data-index="${safeIndex}"]`);
          existingPins.forEach(pinBtn => {
              if (isPinned) {
                  pinBtn.classList.add('pinned');
                  pinBtn.setAttribute('aria-pressed', 'true');
              } else {
                  pinBtn.classList.remove('pinned');
                  pinBtn.setAttribute('aria-pressed', 'false');
              }
          });

          const nav = this.elements["category-nav"];
          if (nav && nav.classList.contains("search-active") && this.elements.searchInput) {
              this.filterAgents(this.elements.searchInput.value);
          }

          if (this._domNodeCache) this._domNodeCache.delete(String(index));

          this.renderAgents();

          // Re-trigger search view if active
          const searchInput = this.elements.searchInput;
          if (searchInput && searchInput.value.trim() !== "") {
              this.filterAgents(searchInput.value);
          }

          this.showToast(isPinned ? "Pinned" : "Unpinned");

          if (this._cardHtmlCache) {
              this._cardHtmlCache.delete(String(index));
              this._cardHtmlCache.delete(Number(index));
          }
          return;
      }

      // 4. Flip Card Front (Open)
      const frontTarget = e.target.closest('[data-action="flip-card"]');
      if (frontTarget && !e.target.closest('.fusion-quick-btn') && !e.target.closest('.pin-btn')) {
          const card = frontTarget.closest('.flip-card');
          if (!card) return;

          const index = frontTarget.dataset.index;
          const safeIndex = CSS.escape(String(index));
          const promptArea = card.querySelector(`#prompt-content-${safeIndex}`);

          if (promptArea && !promptArea.innerHTML.trim()) {
              let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
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
          const dropdownId = `card-dropdown-${index}`;
          const dropdown = document.getElementById(dropdownId);

          // Close others
          this.activeDropdowns.forEach(menu => {
              if (menu !== dropdown) {
                  closeDropdownMenu(menu, this);
              }
          });

          if (!dropdown) return;
          const isVisible = dropdown.classList.toggle('visible');
          if (isVisible) {
              this.activeDropdowns.add(dropdown);
          } else {
              this.activeDropdowns.delete(dropdown);
          }
          toggleTarget.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
          return;
      }

      // 7. General Action Buttons (Copy/Download/Launch)
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn && ["copy-agent", "download-agent", "launch-jules", "download-parent-fusions"].includes(actionBtn.dataset.action)) {
          e.preventDefault();
          e.stopPropagation();

          const action = actionBtn.dataset.action;

          if (action === "download-parent-fusions") {
              const parentName = actionBtn.dataset.parentName;
              if (parentName && this.exportController) {
                  this.exportController.downloadCustomAgentsByParent(parentName, actionBtn);
              }
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'), this);
              return;
          }

          const index = actionBtn.dataset.index;
          let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (index === "fusion-result" && this.fusionLab) agent = this.fusionLab.lastFusionResult;
          if (!agent) return;

          if (action === "copy-agent") {
              this.copyAgent(index, actionBtn);
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'), this);
              return;
          }
          if (action === "download-agent") {
              DownloadUtils.downloadTextFile(PromptParser.stripFrontmatter(agent.prompt), `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              closeDropdownMenu(actionBtn.closest('.dropdown-menu'), this);
              return;
          }
          if (action === "launch-jules") {
              this.julesManager.launchSession(agent, actionBtn);
              const modal = document.getElementById("fusionsModal");
              if (modal && modal.contains(actionBtn)) {
                  modal.classList.remove("visible");
              }
              return;
          }
      }
    });

    // Close search and active dropdowns on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            // Priority 1: Close active dropdowns
            if (this.activeDropdowns && this.activeDropdowns.size > 0) {
                this.activeDropdowns.forEach(menu => {
                    closeDropdownMenu(menu, this);
                    const toggleId = menu.id.replace('card-dropdown-', '');
                    const toggleBtn = document.querySelector(`[data-action="toggle-card-dropdown"][data-index="${toggleId}"]`);
                    if (toggleBtn) {
                        toggleBtn.focus();
                        toggleBtn.setAttribute('aria-expanded', 'false');
                    }
                });
                return;
            }

            // Priority 2: Close search
            const nav = this.elements["category-nav"];
            if (nav && nav.classList.contains("search-active")) {
                this.clearSearch();
            }
        }
    });

    // Jules Terminal Pull Tab & Toggle Bindings
    const pullTab = document.getElementById("julesPullTab");
    const runnerPanel = document.getElementById("julesRunnerPanel");
    if (pullTab && runnerPanel) {
        pullTab.addEventListener("click", () => {
            runnerPanel.classList.toggle("open");
        });
    }

    const activateToggle = document.getElementById("julesActivateToggle");
    const runnerInputs = document.getElementById("runnerInputsContainer");
    const julesTerminal = document.getElementById("julesTerminal");

    if (activateToggle) {
        activateToggle.addEventListener("change", async (e) => {
            if (e.target.checked) {
                if (runnerInputs) runnerInputs.classList.add("active");
                if (julesTerminal) julesTerminal.style.display = "";
                // Load sources if not loaded already but initialized
                if (this.julesManager && this.julesManager.initialized) {
                    try {
                        await this.julesManager.loadSources();
                    } catch (err) {
                        console.warn("JulesManager API failed to load sources after activation.", err);
                    }
                }
            } else {
                if (runnerInputs) runnerInputs.classList.remove("active");
                if (julesTerminal) julesTerminal.style.display = "none";
            }
        });
    }

    // Master Export bindings
    this.elements.masterCopyBtn?.addEventListener("click", (e) => this.copyAll(e.currentTarget));
    this.elements.masterDownloadCoreBtn?.addEventListener("click", (e) => {
        this.downloadAll(e.currentTarget);
        masterDropMenu?.classList.remove("visible");
    });
    this.elements.masterCopyFusionsBtn?.addEventListener("click", async (e) => {
        // ↗️ VECTORIZE: The Single-Pass Pipeline. We ignore the abstracted layers and execute the calculation in one direct pass.
        const validCustomAgents = AgentUtils.getValidCustomAgents(this.customAgents);

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
   * @see ../../docs/architecture/Features/Search/SearchController.md#search-mechanics
   */
  async filterAgents(query) {
    if (this.searchController) {
        await this.searchController.filterAgents(query);
    }
  }

  /**
   * Clears the active search query, destroys the search results view,
   * and resets the UI back to the default categorized master layout.
   * @see ../../docs/architecture/Features/Search/SearchController.md#search-mechanics
   */
  async clearSearch() {
    if (this.searchController) {
        await this.searchController.clearSearch();
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
    if (this.observer) {
        this.observer.disconnect();
    }

    // ⚡ Bolt+: Extracted redundant and repetitive DOM attribute parsing (getAttribute)
    // outside of the high-frequency intersection observer callback, caching the structured references in memory.
    // ↗️ VECTORIZE: The Single-Pass Pipeline. We ignore the abstracted array layers and map directly.
    const cachedPills = [];
    if (this.elements.navPills) {
        for (let i = 0; i < this.elements.navPills.length; i++) {
            const pill = this.elements.navPills[i];
            const href = pill.getAttribute("href");
            if (href) {
                cachedPills.push({
                    el: pill,
                    targetHref: href.substring(1)
                });
            }
        }
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetId = CONFIG.sectionMap[entry.target.id];
            cachedPills.forEach(({ el, targetHref }) => {
                el.classList.toggle("active", targetHref === targetId);
            });
          }
        });
      },
      OBSERVER_OPTIONS
    );

    // ⚡ Bolt+: Replaced Object.keys().forEach with a direct for...in lookup
    for (const gridId in CONFIG.sectionMap) {
      if (Object.prototype.hasOwnProperty.call(CONFIG.sectionMap, gridId)) {
        // ⚡ Bolt+: Utilize cached category elements and O(1) reversed lookups to prevent repeated query execution.
        const catKey = this.categoryLookup[gridId];
        const el = catKey ? this.categoryElements[catKey] : document.getElementById(gridId);
        if (el) this.observer.observe(el);
      }
    }
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RosterApp;
}
