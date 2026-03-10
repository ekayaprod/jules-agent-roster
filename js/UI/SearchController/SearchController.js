const FUSE_OPTIONS = {
    keys: ["agent.name", "agent.short_description"],
    threshold: 0.4
};

const SEARCH_CLUSTERIZE_OPTIONS = {
    scrollId: 'searchResultsScrollArea',
    contentId: 'searchResultsGrid'
};

class SearchController {
  constructor(app) {
    this.app = app;
    this.clusterize = null;
  }

  filterAgents(query) {
    const search = query.toLowerCase();
    const searchModeContainer = this.app.elements.searchModeContainer;
    const searchResultsGrid = this.app.elements.searchResultsGrid;
    const categoryNav = this.app.elements["category-nav"];

    if (query.length > 0) {
      this.app.elements.clearBtn?.classList.add("visible");
      searchModeContainer?.classList.remove("hidden");

      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "none", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "none", "search-mode-header");
    } else {
      this.app.elements.clearBtn?.classList.remove("visible");
      searchModeContainer?.classList.add("hidden");

      DOMUtils.setElementsDisplay(CONFIG.selectors.grid, "", "searchResultsGrid");
      DOMUtils.setElementsDisplay(CONFIG.selectors.sectionHeader, "", "search-mode-header");

      this.app.elements.emptyState?.classList.remove("visible");
      if (this.app.elements.announcer) this.app.elements.announcer.textContent = "";
      return;
    }

    let visibleCount = 0;
    const currentUnlockedSize = (this.app.fusionLab && this.app.fusionLab.fusionIndex) ? this.app.fusionLab.fusionIndex.unlockedKeys.size : 0;

    if (!this.app._searchCache ||
        this.app._searchCache.agentCount !== this.app.agents.length ||
        this.app._searchCache.unlockedSize !== currentUnlockedSize) {

        const allAgents = this.app.agents.map((agent, index) => ({ agent, keyOrIndex: index }));
        if (this.app.fusionLab && this.app.fusionLab.fusionIndex) {
            this.app.fusionLab.fusionIndex.unlockedKeys.forEach(key => {
                let agent = this.app.customAgents[key] || this.app.fusionLab.compiler.customAgentsMap[key];
                if (agent) {
                    allAgents.push({ agent, keyOrIndex: key });
                }
            });
        }

        const fuse = new Fuse(allAgents, FUSE_OPTIONS);

        this.app._searchCache = {
            agentCount: this.app.agents.length,
            unlockedSize: currentUnlockedSize,
            fuseInstance: fuse
        };
    }

    const results = this.app._searchCache.fuseInstance.search(search);

    const htmlResults = results.map(result => {
        const { agent, keyOrIndex } = result.item;
        let cardHtml = this.app._cardHtmlCache.get(keyOrIndex);
        if (!cardHtml) {
            const card = AgentCard.create(agent, keyOrIndex, 0);
            cardHtml = card.outerHTML || '';
            this.app._cardHtmlCache.set(keyOrIndex, cardHtml);
        }
        const delay = `${Math.min(visibleCount * 30, 600)}ms`;
        const renderedHtml = typeof cardHtml === 'string' ? cardHtml.replace(/animation-delay:\s*0ms;?/, `animation-delay: ${delay};`) : '';
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

  clearSearch() {
    if (this.app.elements.searchInput) {
      this.app.elements.searchInput.value = "";
      this.filterAgents("");
    }
    const nav = this.app.elements["category-nav"];
    if (nav) nav.classList.remove("search-active");
  }
}
