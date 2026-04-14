

var SafeUITimings = typeof window !== 'undefined' ? window.UI_TIMINGS : (typeof global !== 'undefined' ? global.UI_TIMINGS : null);
const OBSERVER_OPTIONS = {
    rootMargin: "-80px 0px -60% 0px",
    threshold: 0
};
const LOADING_OVERLAY_DISMISS_MS = 500;
const SEARCH_DEBOUNCE_MS = 300;

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
                requestAnimationFrame(revealContent);
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

    // Start pre-fetching core agent prompts in the background after UI initialization
    setTimeout(() => {
      this.agents.forEach(agent => {
        if (agent.prompt === undefined) {
          const url = AgentUtils.getPromptUrl(agent);
          this.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.").then(fetched => {
              agent.prompt = fetched;
          });
        }
      });
    }, 1000);
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
        this.elements[key] = (typeof selector === 'string' && selector.startsWith("#"))
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
             let agent = this.getAgentForUI(key);

             if (!agent) return;

             const isFusionKey = typeof key === 'string' && Number.isNaN(Number(key));
             const targetCategory = isFusionKey ? (agent.category ? agent.category.toLowerCase() : "strategy") : "pinned";

             if (!categorizedAgents[targetCategory]) categorizedAgents[targetCategory] = [];
             categorizedAgents[targetCategory].push({ agent, indexOrKey: key });
        });
    }

    const flattenedAgents = [];
    const hasPinnedManager = !!this.pinnedManager;
    // ⚡ Bolt+: Bypass redundant nested wrapper object creations and object spreading.
    // Flatten properties directly into the target object to prevent GC churn during rendering.
    for (let i = 0; i < this.categoryKeys.length; i++) {
        const categoryKey = this.categoryKeys[i];
        const categoryList = categorizedAgents[categoryKey];
        const catLen = categoryList.length;
        const mappedList = new Array(catLen);

        for (let j = 0; j < catLen; j++) {
            const item = categoryList[j];
            mappedList[j] = {
                ...item,
                gridCategory: categoryKey,
                _isPinned: hasPinnedManager ? this.pinnedManager.isPinned(item.indexOrKey) : false
            };
        }

        mappedList.sort((a, b) => {
           if (a._isPinned && !b._isPinned) return -1;
           if (!a._isPinned && b._isPinned) return 1;
           const aTier = a.agent && a.agent.tier === "Plus" ? 1 : 0;
           const bTier = b.agent && b.agent.tier === "Plus" ? 1 : 0;
           if (aTier !== bTier) return bTier - aTier;
           return 0;
        });

        for (let j = 0; j < catLen; j++) {
            const finalItem = mappedList[j];
            delete finalItem._isPinned;
            flattenedAgents.push(finalItem);
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
        const { agent, indexOrKey, gridCategory } = flattenedAgents[i];
        const category = gridCategory || agent.category || "strategy";
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
    if (typeof EventBinder !== 'undefined') {
        EventBinder.bind(this);
    }
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

  /**
   * Helper to retrieve an agent by index or key, dynamically reconstructing
   * unlocked fusion agents if they are not present in static maps.
   */
  getAgentForUI(index) {
      let agent = this.agents[index] || AgentUtils.getCustomAgent(this.customAgents, index) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
      if (index === "fusion-result" && this.fusionLab) return this.fusionLab.lastFusionResult;

      if (!agent && typeof index === 'string' && Number.isNaN(Number(index)) && this.fusionLab && this.fusionLab.fusionIndex && this.fusionLab.fusionIndex.isUnlocked(index)) {
          const names = AgentUtils.splitFusionKey(index);
          if (names.length === 2) {
              const agentA = this.fusionLab.agentMap.get(names[0]);
              const agentB = this.fusionLab.agentMap.get(names[1]);
              if (agentA && agentB) {
                  agent = this.fusionLab.compiler.fuse(agentA, agentB);
              }
          }
      }
      return agent;
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RosterApp;
}
