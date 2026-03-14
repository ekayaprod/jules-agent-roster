/**
 * Configuration options for Fuse.js fuzzy matching.
 * @type {Object}
 * @see README.md#fuzzy-matching
 */
const FUSE_OPTIONS = {
    keys: ["agent.name", "agent.short_description"],
    threshold: 0.4
};

/**
 * Configuration options for Clusterize.js virtual scrolling.
 * @type {Object}
 * @see README.md#virtual-scrolling
 */
const SEARCH_CLUSTERIZE_OPTIONS = {
    scrollId: 'searchResultsScrollArea',
    contentId: 'searchResultsGrid'
};

/**
 * ⏱️ CALIBRATE: Hoisted static mapper to prevent inline arrow function allocations on every search.
 */
const MAP_AGENT_TO_SEARCH_ITEM = (agent, index) => ({ agent, keyOrIndex: index });

/**
 * ⏱️ CALIBRATE: Hoisted inline regex to prevent re-compilation in massive mapping loops.
 */
const ANIMATION_DELAY_REGEX = /animation-delay:\s*0ms;?/;

/**
 * Controller responsible for orchestrating search operations, fuzzy matching, and virtual DOM rendering.
 * @see README.md#searchcontroller-architecture
 */
class SearchController {
  /**
   * Initializes the SearchController with the application context.
   * @param {Object} app - The main RosterApp instance providing global state and DOM elements.
   * @see README.md#initialization
   */
  constructor(app) {
    this.app = app;
    this.clusterize = null;
    this.searchId = 0;
    this._resolveMap = new Map();

    // 🧫 Mitosis: Initialize Web Worker for background fuzzy searching
    if (typeof Worker !== 'undefined') {
        this.worker = new Worker('js/UI/SearchController/searchWorker.js');
        this.worker.onmessage = (e) => {
            const { type, results, searchId, message } = e.data;
            if (this._resolveMap.has(searchId)) {
                if (type === 'results') {
                    this._resolveMap.get(searchId)(results);
                } else if (type === 'error') {
                    console.error("Search Worker Error:", message);
                    this._resolveMap.get(searchId)([]);
                }
                this._resolveMap.delete(searchId);
            }
        };
    }
  }

  /**
   * Filters the agent roster based on a fuzzy search query and updates the virtual scroll view.
   * Manages DOM visibility toggling and caching of the search index to prevent layout thrashing.
   * @param {string} query - The search string provided by the user.
   * @returns {Promise<void>}
   * @see README.md#search-mechanics
   */
  async filterAgents(query) {
    const search = query.toLowerCase();
    const searchModeContainer = this.app.elements.searchModeContainer;

    if (query.length > 0) {
      this.app.elements.clearBtn?.classList.add("visible");
      searchModeContainer?.classList.remove("hidden");

      // ⚡ Bolt+: Pass pre-cached NodeLists from this.app.elements instead of repeatedly querying the DOM
      DOMUtils.setElementsDisplay(this.app.elements.grid || CONFIG.selectors.grid, "none", "searchResultsGrid");
      DOMUtils.setElementsDisplay(this.app.elements.sectionHeader || CONFIG.selectors.sectionHeader, "none", "search-mode-header");
    } else {
      this.app.elements.clearBtn?.classList.remove("visible");
      searchModeContainer?.classList.add("hidden");

      DOMUtils.setElementsDisplay(this.app.elements.grid || CONFIG.selectors.grid, "", "searchResultsGrid");
      DOMUtils.setElementsDisplay(this.app.elements.sectionHeader || CONFIG.selectors.sectionHeader, "", "search-mode-header");

      this.app.elements.emptyState?.classList.remove("visible");
      if (this.app.elements.announcer) this.app.elements.announcer.textContent = "";
      return;
    }

    let visibleCount = 0;
    const currentUnlockedSize = (this.app.fusionLab && this.app.fusionLab.fusionIndex) ? this.app.fusionLab.fusionIndex.unlockedKeys.size : 0;

    if (!this.app._searchCache ||
        this.app._searchCache.agentCount !== this.app.agents.length ||
        this.app._searchCache.unlockedSize !== currentUnlockedSize) {

        const allAgents = this.app.agents.map(MAP_AGENT_TO_SEARCH_ITEM);
        if (this.app.fusionLab && this.app.fusionLab.fusionIndex) {
            this.app.fusionLab.fusionIndex.unlockedKeys.forEach(key => {
                let agent = this.app.getCustomAgent(key) || this.app.fusionLab.compiler.customAgentsMap[key];
                if (agent) {
                    allAgents.push({ agent, keyOrIndex: key });
                }
            });
        }

        if (this.worker) {
             this.worker.postMessage({ type: 'init', data: allAgents, options: FUSE_OPTIONS });
             this.app._searchCache = {
                 agentCount: this.app.agents.length,
                 unlockedSize: currentUnlockedSize,
                 useWorker: true
             };
        } else {
             const fuse = new Fuse(allAgents, FUSE_OPTIONS);
             this.app._searchCache = {
                 agentCount: this.app.agents.length,
                 unlockedSize: currentUnlockedSize,
                 fuseInstance: fuse,
                 useWorker: false
             };
        }
    }

    const currentSearchId = ++this.searchId;
    let results;

    if (this.app._searchCache.useWorker) {
        // 🧫 Mitosis: Async Web Worker background processing
        results = await new Promise(resolve => {
            this._resolveMap.set(currentSearchId, resolve);
            this.worker.postMessage({ type: 'search', query: search, searchId: currentSearchId });
        });

        // Discard stale search results
        if (currentSearchId !== this.searchId) return;
    } else {
        // Fallback for purely synchronous environments without Web Worker support
        results = this.app._searchCache.fuseInstance.search(search);
    }

    const htmlResults = results.map(result => {
        const { agent, keyOrIndex } = result.item;
        let cardHtml = this.app._cardHtmlCache.get(keyOrIndex);
        if (!cardHtml) {
            const card = AgentCard.create(agent, keyOrIndex, 0);
            cardHtml = card.outerHTML || '';
            this.app._cardHtmlCache.set(keyOrIndex, cardHtml);
        }
        const delay = `${Math.min(visibleCount * 30, 600)}ms`;
        const renderedHtml = typeof cardHtml === 'string' ? cardHtml.replace(ANIMATION_DELAY_REGEX, `animation-delay: ${delay};`) : '';
        visibleCount++;
        return renderedHtml;
    });

    if (!this.clusterize) {
      this.clusterize = new Clusterize({
        ...SEARCH_CLUSTERIZE_OPTIONS,
        rows: htmlResults
      });
    } else {
      this.clusterize.update(htmlResults);
    }

    if (results.length === 0) {
      this.app.elements.emptyState?.classList.add("visible");
      searchModeContainer?.classList.add("hidden");
    } else {
      this.app.elements.emptyState?.classList.remove("visible");
    }

    if (this.app.elements.announcer) {
      this.app.elements.announcer.textContent = results.length === 0 ? "No protocols found." : `Found ${results.length} protocols.`;
    }
  }

  /**
   * Clears the current search query, resets the input field, and restores the default agent grid layout.
   * @returns {void}
   * @see README.md#search-mechanics
   */
  clearSearch() {
    if (this.app.elements.searchInput) {
      this.app.elements.searchInput.value = "";
      this.filterAgents("");
    }
    const nav = this.app.elements["category-nav"];
    if (nav) nav.classList.remove("search-active");
  }
}
