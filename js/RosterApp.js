// --- ROSTER APP ---
/**
 * Main application class for the Jules Master Agent Roster.
 * Handles fetching agent data, rendering the UI, managing state, and handling user interactions.
 */
class RosterApp {
  /**
   * Initializes the RosterApp instance.
   * Sets up initial state for agents, DOM elements, and toast notifications.
   */
  constructor() {
    this.agents = [];
    this.customAgents = {};
    this.elements = {};
    // Service & UI Components
    this.agentRepo = new AgentRepository();
    this.toast = new ToastNotification(CONFIG.selectors.toast);
    this.fusionLab = null;
  }

  // Backward compatibility for verification scripts
  get fusionCompiler() {
      return this.fusionLab ? this.fusionLab.compiler : null;
  }

  /**
   * specialized initialization sequence.
   * 1. Caches DOM elements.
   * 2. Renders skeleton loaders.
   * 3. Fetches data asynchronously.
   * 4. Clears skeletons.
   * 5. Renders agent cards.
   * 6. Binds event listeners.
   * 7. Initializes the intersection observer for navigation.
   * @returns {Promise<void>}
   */
  async init() {
    this.cacheElements();

    try {
        const { agents, customAgents } = await this.agentRepo.getAgents();
        this.agents = agents;
        this.customAgents = customAgents;

        // Initialize Fusion Lab Component
        this.fusionLab = new FusionLab();
        this.fusionLab.init(this.agents, this.customAgents);

        // Choreographer autonomously wrapped the asynchronous boundary with a smooth visual transition skeleton.
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
                <button onclick="window.location.reload()" class="mt-6">
                  Refresh Page
                </button>
              </div>
            `;
        }
    }

    this.clearSkeletons();
    this.renderAgents();
    this.bindEvents();
    this.initObserver();
  }

  /**
   * Caches DOM elements specified in `CONFIG.selectors` to `this.elements`.
   * Reduces DOM lookups during runtime.
   */
  cacheElements() {
    // Cache DOM elements based on CONFIG
    Object.keys(CONFIG.selectors).forEach((key) => {
      const selector = CONFIG.selectors[key];
      this.elements[key] = selector.startsWith("#")
        ? document.getElementById(selector.substring(1))
        : document.querySelectorAll(selector);
    });
  }

  /**
   * Clears all skeleton loaders from the category grids.
   * Called after data is successfully loaded.
   */
  clearSkeletons() {
    Object.keys(CONFIG.categories).forEach((key) => {
      const container = document.getElementById(CONFIG.categories[key]);
      if (container) container.innerHTML = "";
    });
  }

  /**
   * Renders the agent cards into their respective category grids.
   * Constructs HTML for each agent including tags and action buttons.
   * Uses DocumentFragment to minimize reflows.
   */
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
      if (!container) {
        console.error(
          `Medic: Container for category '${agent.category}' not found. Skipping agent ${agent.name}.`,
        );
        return;
      }

      // 🗿 The Sculptor: Use AgentCard component
      const card = AgentCard.create(agent, index, globalIndex);
      globalIndex++;

      // Append to fragment instead of direct DOM
      if (fragments[agent.category]) {
        fragments[agent.category].appendChild(card);
      }
    });

    // Commit fragments to DOM
    Object.keys(fragments).forEach(key => {
      if (categoryContainers[key]) {
        categoryContainers[key].appendChild(fragments[key]);
      }
    });
  }

  /**
   * Binds event listeners to static elements and sets up event delegation for dynamic elements.
   * Handles search input, button clicks, and card interactions.
   */
  bindEvents() {
    // Static events
    // ⚡ Bolt+: Debounce search input to prevent layout thrashing
    if (this.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => {
        this.filterAgents(query);
      }, 300);

      this.elements.searchInput.addEventListener("input", (e) =>
        debouncedFilter(e.target.value),
      );
    }
    this.elements.clearBtn?.addEventListener("click", () =>
      this.clearSearch(),
    );

    const clearSearchEmptyBtn = document.getElementById("clearSearchEmptyBtn");
    if (clearSearchEmptyBtn) {
      clearSearchEmptyBtn.addEventListener("click", () => this.clearSearch());
    }

    this.elements.copyAllBtn?.addEventListener("click", (e) =>
      this.copyAll(e.currentTarget),
    );
    this.elements.downloadAllBtn?.addEventListener("click", (e) =>
      this.downloadAll(e.currentTarget),
    );
    this.elements.downloadDropdownBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDownloadDropdown();
    });
    this.elements.downloadDropdownBtn?.addEventListener("keydown", (e) =>
      this.handleDropdownKeydown(e),
    );
    this.elements.downloadDropdownMenu?.addEventListener("keydown", (e) =>
      this.handleDropdownKeydown(e),
    );
    this.elements.downloadCustomBtn?.addEventListener("click", (e) =>
      this.downloadCustomAgents(e.currentTarget),
    );

    // Close dropdown on focus out (Tab or click outside)
    this.elements.downloadDropdownMenu?.addEventListener("focusout", (e) => {
      // Use setTimeout to allow activeElement to update
      setTimeout(() => {
        const menu = this.elements.downloadDropdownMenu;
        const btn = this.elements.downloadDropdownBtn;
        if (
          menu.classList.contains("visible") &&
          !menu.contains(document.activeElement) &&
          !btn.contains(document.activeElement)
        ) {
          menu.classList.remove("visible");
          btn.setAttribute("aria-expanded", "false");
        }
      }, 0);
    });

    // Global click to close dropdown
    document.addEventListener("click", (e) => {
      if (
        this.elements.downloadDropdownMenu?.classList.contains("visible") &&
        !this.elements.downloadDropdownMenu.contains(e.target) &&
        !this.elements.downloadDropdownBtn.contains(e.target)
      ) {
        this.elements.downloadDropdownMenu.classList.remove("visible");
        this.elements.downloadDropdownBtn?.setAttribute("aria-expanded", "false");
      }
    });

    // Event Delegation
    this.elements.main?.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(
        '[data-action="toggle-details"]',
      );
      if (toggleBtn) {
        this.toggleDetails(toggleBtn.dataset.index, toggleBtn);
        return;
      }

      const copyBtn = e.target.closest('[data-action="copy-agent"]');
      if (copyBtn) {
        this.copyAgent(copyBtn.dataset.index, copyBtn);
        return;
      }
    });
  }

  /**
   * Toggles the visibility of the agent details section.
   * @param {string|number} index - The index of the agent.
   * @param {HTMLElement} btn - The button element that triggered the action.
   */
  toggleDetails(index, btn) {
    const grid = document.getElementById(`details-${index}`);

    // ⚡ Bolt+: Lazy load content to reduce initial DOM size
    const content = grid.querySelector('.details-overflow');
    if (content && !content.innerHTML.trim()) {
        const agent = this.agents[index];
        content.innerHTML = AgentCard.getPromptHtml(agent);
    }

    const isExpanded = grid.classList.toggle("expanded");
    btn.closest(".card").classList.toggle("active", isExpanded);
    btn.setAttribute("aria-expanded", isExpanded);
    const span = btn.querySelector("span");
    span.innerText = isExpanded ? "Hide Prompt" : "Show Prompt";
  }

  /**
   * Filters the displayed agents based on a search query.
   * Updates visibility of cards, section headers, and empty state.
   * Announces results to screen readers.
   * Optimized to avoid layout thrashing and unnecessary re-renders.
   * @param {string} query - The search query.
   */
  filterAgents(query) {
    const search = query.toLowerCase();
    const cards = document.querySelectorAll(CONFIG.selectors.card);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let visibleCount = 0;

    if (query.length > 0) {
      this.elements.clearBtn?.classList.add("visible");
    } else {
      this.elements.clearBtn?.classList.remove("visible");
    }

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const isMatch = text.includes(search);

      // Clear any pending hide timeout
      if (card._hideTimeout) {
        clearTimeout(card._hideTimeout);
        card._hideTimeout = null;
      }

      if (isMatch) {
        // If it was fading out, stop it
        card.classList.remove("fading-out");

        if (card.style.display === "none") {
          card.style.display = "flex";
          if (!reducedMotion) {
            card.classList.remove("pop-in");
            void card.offsetWidth; // Trigger reflow
            const delay = Math.min(visibleCount * 30, 600);
            card.style.animationDelay = `${delay}ms`;
            card.classList.add("pop-in");
          }
        }
        visibleCount++;
      } else {
        // No match
        if (card.style.display !== "none") {
          if (reducedMotion) {
            card.style.display = "none";
            card.classList.remove("pop-in");
          } else {
            card.classList.add("fading-out");
            // 🗿 The Sculptor: Smooth fade out
            card._hideTimeout = setTimeout(() => {
              if (card.classList.contains("fading-out")) {
                card.style.display = "none";
                card.classList.remove("fading-out");
                card.classList.remove("pop-in");
              }
            }, 200); // Match CSS transition duration
          }
        }
      }
    });

    if (visibleCount === 0 && query.length > 0) {
      this.elements.emptyState?.classList.add("visible");
      document
        .querySelectorAll(CONFIG.selectors.sectionHeader)
        .forEach((el) => (el.style.display = "none"));
    } else {
      this.elements.emptyState?.classList.remove("visible");
      document.querySelectorAll(CONFIG.selectors.grid).forEach((grid) => {
        const hasVisibleCards = Array.from(grid.children).some(
          (card) => card.style.display !== "none",
        );
        const header = grid.previousElementSibling;
        if (header && header.classList.contains("section-header")) {
          header.style.display = hasVisibleCards ? "block" : "none";
        }
      });
    }

    if (this.elements.announcer) {
      this.elements.announcer.textContent =
        query.length === 0
          ? ""
          : visibleCount === 0
            ? "No agents found."
            : `Found ${visibleCount} agents.`;
    }
  }

  /**
   * Clears the search input and resets the filter.
   * Returns focus to the search input.
   */
  clearSearch() {
    if (this.elements.searchInput) {
      this.elements.searchInput.value = "";
      this.filterAgents("");
      this.elements.searchInput.focus();
    }
  }

  /**
   * Copies a specific agent's prompt to the clipboard.
   * @param {string|number} index - Index of the agent in `this.agents`.
   * @param {HTMLElement} btn - The button triggered.
   */
  async copyAgent(index, btn) {
    const agent = this.agents[index];
    const success = await ClipboardUtils.copyText(agent.prompt);

    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, CONFIG.copiedSuccessMessage);
    }
  }

  /**
   * Toggles the visibility of the download dropdown menu.
   */
  toggleDownloadDropdown() {
    const menu = this.elements.downloadDropdownMenu;
    const btn = this.elements.downloadDropdownBtn;

    if (menu) {
      const isVisible = menu.classList.toggle("visible");
      if (btn) btn.setAttribute("aria-expanded", isVisible);

      // Focus management when opening
      if (isVisible) {
        const firstItem = menu.querySelector('.dropdown-item');
        if (firstItem) firstItem.focus();
      }
    }
  }

  /**
   * Handles keyboard navigation for the download dropdown.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleDropdownKeydown(e) {
    const menu = this.elements.downloadDropdownMenu;
    const btn = this.elements.downloadDropdownBtn;
    const isVisible = menu.classList.contains("visible");

    if (e.key === "Escape") {
      if (isVisible) {
        e.preventDefault();
        this.toggleDownloadDropdown();
        btn.focus();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      // Explicitly handle Enter/Space to ensure toggle works reliably via keyboard
      e.preventDefault();
      this.toggleDownloadDropdown();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
      e.preventDefault();

      if (!isVisible) {
        this.toggleDownloadDropdown();
        return;
      }

      // Navigation within menu
      const items = Array.from(menu.querySelectorAll('.dropdown-item'));
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex;

      if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = items.length - 1;
      } else if (currentIndex === -1) {
        nextIndex = e.key === "ArrowDown" ? 0 : items.length - 1;
      } else if (e.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % items.length;
      } else {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }
      items[nextIndex].focus();
    }
  }

  /**
   * Generates a downloadable Markdown file containing all custom agent (fusion) prompts.
   * Creates a Blob and triggers a download.
   * @param {HTMLElement} btn - The button that triggered the download.
   */
  downloadCustomAgents(btn) {
    const header =
      "JULES CUSTOM AGENT ROSTER (FUSIONS)\n\nThis roster contains synthesized protocols from the Fusion Lab.\n\n--------------------------------------------------------------------------------\n\n";

    const validCustomAgents = Object.values(this.customAgents).filter(
      (a) => a.prompt && a.prompt.length > 0
    );

    if (validCustomAgents.length === 0) {
      this.toast.show("No custom agents available to download.");
      return;
    }

    const body = validCustomAgents
      .map(
        (a) =>
          `${a.prompt}\n\n--------------------------------------------------------------------------------`,
      )
      .join("\n\n");

    const content = header + body;
    DownloadUtils.downloadTextFile(content, "jules_custom_agents.md");

    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
    this.elements.downloadDropdownMenu?.classList.remove("visible");
  }

  /**
   * Generates a downloadable Markdown file containing all agent prompts.
   * Creates a Blob and triggers a download.
   * @param {HTMLElement} btn - The button that triggered the download.
   */
  downloadAll(btn) {
    const header =
      "JULES MASTER AGENT ROSTER\n\nThis roster integrates Core Performance/UX/Security agents with Engineering & Context specialists.\n\n--------------------------------------------------------------------------------\n\n";
    const body = this.agents
      .map(
        (a) =>
          `${a.prompt}\n\n--------------------------------------------------------------------------------`,
      )
      .join("\n\n");

    const content = header + body;
    DownloadUtils.downloadTextFile(content, "jules_roster.md");

    ClipboardUtils.animateButtonSuccess(btn, "Downloaded!");
  }

  /**
   * Copies the full roster content (headers + all prompts) to the clipboard.
   * @param {HTMLElement} btn - The button triggered.
   */
  async copyAll(btn) {
    const header =
      "JULES MASTER AGENT ROSTER\n\nThis roster integrates Core Performance/UX/Security agents with Engineering & Context specialists.\n\n--------------------------------------------------------------------------------\n\n";
    const body = this.agents
      .map(
        (a) =>
          `${a.prompt}\n\n--------------------------------------------------------------------------------`,
      )
      .join("\n\n");
    const success = await ClipboardUtils.copyText(header + body);

    if (success) {
      this.toast.show("Copied to clipboard");
      ClipboardUtils.animateButtonSuccess(btn, CONFIG.copiedSuccessMessage);
    }
  }

  /**
   * Initializes the Intersection Observer for the sticky navigation.
   * Updates the active state of navigation pills based on the currently visible section.
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
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    Object.keys(CONFIG.sectionMap).forEach((gridId) => {
      const el = document.getElementById(gridId);
      if (el) observer.observe(el);
    });
  }

  /**
   * Expose showToast method for compatibility with other components (FusionLab)
   */
  showToast(message) {
      this.toast.show(message);
  }
}
