// --- ROSTER APP ---
/**
 * Main application class for the Autonomous Protocol Matrix.
 */
class RosterApp {
  constructor() {
    this.agents = [];
    this.customAgents = {};
    this.elements = {};
    this.agentRepo = new AgentRepository();
    this.toast = new ToastNotification(CONFIG.selectors.toast);
    this.fusionLab = null;
  }


  async init() {
    this.cacheElements();

    try {
        const { agents, customAgents } = await this.agentRepo.getAgents();
        this.agents = agents;
        this.customAgents = customAgents;

        this.fusionLab = new FusionLab();
        this.fusionLab.init(this.agents, this.customAgents);

        const skeleton = document.getElementById("fusionLabSkeleton");
        const content = document.getElementById("fusionLabContent");
        if (skeleton && content) {
            skeleton.classList.add("hidden");
            content.classList.remove("hidden");
        }
    } catch (error) {
        if (this.elements.main) {
            const isDataError = error.message && error.message.includes("JSON");
            const errorTitle = "We couldn't load the agent roster";
            const errorDesc = isDataError
              ? "We encountered a problem reading the agent data files. Please check your configuration and try again."
              : "We're having trouble connecting to the network. Please check your connection and try refreshing.";

            this.elements.main.innerHTML = `
              <div class="empty-state visible">
                <svg class="empty-icon" aria-hidden="true" focusable="false" width="64" height="64" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="empty-title">${errorTitle}</p>
                <p class="empty-desc">${errorDesc}</p>
                <button onclick="window.location.reload()" class="mt-6">Refresh Page</button>
              </div>
            `;
        }
    }

    this.clearSkeletons();
    this.renderAgents();
    this.bindEvents();
    this.initObserver();
  }

  cacheElements() {
    Object.keys(CONFIG.selectors).forEach((key) => {
      const selector = CONFIG.selectors[key];
      this.elements[key] = selector.startsWith("#")
        ? document.getElementById(selector.substring(1))
        : document.querySelectorAll(selector);
    });
  }

  clearSkeletons() {
    Object.keys(CONFIG.categories).forEach((key) => {
      const container = document.getElementById(CONFIG.categories[key]);
      if (container) container.innerHTML = "";
    });
  }

  renderAgents() {
    const categoryContainers = {};
    const fragments = {};

    Object.keys(CONFIG.categories).forEach((key) => {
      const container = document.getElementById(CONFIG.categories[key]);
      categoryContainers[key] = container;
      if (container) {
        fragments[key] = document.createDocumentFragment();
      }
    });

    let globalIndex = 0;
    this.agents.forEach((agent, index) => {
      const container = categoryContainers[agent.category];
      if (!container) return;

      const card = AgentCard.create(agent, index, globalIndex);
      globalIndex++;

      if (fragments[agent.category]) {
        fragments[agent.category].appendChild(card);
      }
    });

    Object.keys(fragments).forEach(key => {
      if (categoryContainers[key]) {
        categoryContainers[key].appendChild(fragments[key]);
      }
    });
  }

  bindEvents() {
    if (this.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => {
        this.filterAgents(query);
      }, 300);
      this.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
    }
    
    this.elements.clearBtn?.addEventListener("click", () => this.clearSearch());

    const clearSearchEmptyBtn = document.getElementById("clearSearchEmptyBtn");
    if (clearSearchEmptyBtn) {
      clearSearchEmptyBtn.addEventListener("click", () => this.clearSearch());
    }

    // Footer Master Export Controls
    const masterDropBtn = document.getElementById('masterDropdownBtn');
    const masterDropMenu = document.getElementById('masterDropdownMenu');
    
    masterDropBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        masterDropMenu.classList.toggle("visible");
    });

    document.addEventListener("click", (e) => {
        if (masterDropMenu?.classList.contains("visible") && !masterDropMenu.contains(e.target) && !masterDropBtn.contains(e.target)) {
            masterDropMenu.classList.remove("visible");
        }
    });

    document.getElementById('masterCopyBtn')?.addEventListener("click", (e) => this.copyAll(e.currentTarget));
    document.getElementById('masterDownloadCoreBtn')?.addEventListener("click", (e) => {
        this.downloadAll(e.currentTarget);
        masterDropMenu.classList.remove("visible");
    });
    
    document.getElementById('masterCopyFusionsBtn')?.addEventListener("click", async (e) => {
        const validCustomAgents = Object.values(this.customAgents).filter(a => a.prompt && a.prompt.length > 0);
        if (validCustomAgents.length === 0) return this.toast.show("No custom agents unlocked yet.");
        const header = "JULES CUSTOM AGENT ROSTER (FUSIONS)\n\n--------------------------------------------------------------------------------\n\n";
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

    // Event Delegation for Flip Card Action Buttons
    document.addEventListener("click", (e) => {
      const actionBtn = e.target.closest('.action-main-btn');
      if (actionBtn) {
          const index = actionBtn.dataset.index;
          let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
          if (!agent) return;

          if (actionBtn.dataset.action === "copy-agent") {
              this.copyAgent(index, actionBtn);
          } else if (actionBtn.dataset.action === "download-agent") {
              DownloadUtils.downloadTextFile(agent.prompt, `${agent.name.replace(/\s+/g, '_').toLowerCase()}_protocol.md`);
              ClipboardUtils.animateButtonSuccess(actionBtn, "Downloaded!");
          }
      }
    });
  }

  filterAgents(query) {
    const search = query.toLowerCase();
    const searchModeContainer = document.getElementById("searchModeContainer");
    const searchResultsGrid = document.getElementById("searchResultsGrid");
    const categoryNav = document.getElementById("category-nav");
    
    if (query.length > 0) {
      this.elements.clearBtn?.classList.add("visible");
      searchModeContainer.classList.remove("hidden");
      if(categoryNav) categoryNav.style.display = 'none';
      
      document.querySelectorAll(CONFIG.selectors.grid).forEach(grid => {
          if(grid.id !== "searchResultsGrid") grid.style.display = "none";
      });
      document.querySelectorAll(CONFIG.selectors.sectionHeader).forEach(header => {
          if(header.id !== "search-mode-header") header.style.display = "none";
      });
    } else {
      this.elements.clearBtn?.classList.remove("visible");
      searchModeContainer.classList.add("hidden");
      if(categoryNav) categoryNav.style.display = 'flex';
      
      document.querySelectorAll(CONFIG.selectors.grid).forEach(grid => {
          if(grid.id !== "searchResultsGrid") grid.style.display = "flex";
      });
      document.querySelectorAll(CONFIG.selectors.sectionHeader).forEach(header => {
          if(header.id !== "search-mode-header") header.style.display = "block";
      });
      
      this.elements.emptyState?.classList.remove("visible");
      if (this.elements.announcer) this.elements.announcer.textContent = "";
      return;
    }

    searchResultsGrid.innerHTML = "";
    let visibleCount = 0;

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
        keys: ["agent.name", "agent.desc"],
        threshold: 0.4
    });

    const results = fuse.search(search);

    results.forEach(result => {
        const { agent, keyOrIndex } = result.item;
        const card = AgentCard.create(agent, keyOrIndex, visibleCount);
        searchResultsGrid.appendChild(card);
        visibleCount++;
    });

    if (visibleCount === 0) {
      this.elements.emptyState?.classList.add("visible");
      searchModeContainer.classList.add("hidden");
    } else {
      this.elements.emptyState?.classList.remove("visible");
    }

    if (this.elements.announcer) {
      this.elements.announcer.textContent = visibleCount === 0 ? "No protocols found." : `Found ${visibleCount} protocols.`;
    }
  }

  clearSearch() {
    if (this.elements.searchInput) {
      this.elements.searchInput.value = "";
      this.filterAgents("");
      this.elements.searchInput.focus();
    }
  }

  async copyAgent(index, btn) {
    let agent = this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
    if (!agent) return;

    const success = await ClipboardUtils.copyText(agent.prompt);
    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

  downloadCustomAgents(btn) {
    const header = "JULES CUSTOM AGENT ROSTER (FUSIONS)\n\n--------------------------------------------------------------------------------\n\n";
    const validCustomAgents = Object.values(this.customAgents).filter(a => a.prompt && a.prompt.length > 0);
    if (validCustomAgents.length === 0) {
      this.toast.show("No custom agents available to download.");
      return;
    }
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(validCustomAgents), "jules_custom_agents.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
    if(document.getElementById('masterDropdownMenu')) document.getElementById('masterDropdownMenu').classList.remove("visible");
  }

  downloadAll(btn) {
    const header = "JULES MASTER AGENT ROSTER\n\n--------------------------------------------------------------------------------\n\n";
    DownloadUtils.downloadTextFile(header + FormatUtils.formatAgentPrompts(this.agents), "jules_roster.md");
    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  async copyAll(btn) {
    const header = "JULES MASTER AGENT ROSTER\n\n--------------------------------------------------------------------------------\n\n";
    const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(this.agents));
    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, "Copied!");
    }
  }

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

  showToast(message) {
      this.toast.show(message);
  }
}
