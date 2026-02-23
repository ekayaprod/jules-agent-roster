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
    this.elements = {};
    this.state = {
      toastTimeout: null,
    };
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
    this.renderSkeletons();
    await this.loadData();
    this.clearSkeletons();
    this.renderAgents();
    this.bindEvents();
    this.initObserver();
  }

  /**
   * Fetches a resource with exponential backoff retry logic.
   * @param {string} url - The URL to fetch.
   * @param {RequestInit} [options={}] - Fetch options.
   * @param {number} [retries=3] - Number of retries.
   * @param {number} [backoff=300] - Initial backoff delay in ms.
   * @returns {Promise<Response>} The fetch response.
   * @throws {Error} If all retries fail.
   */
  async fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying ${url} (${retries} left)...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.fetchWithRetry(
          url,
          options,
          retries - 1,
          backoff * 2,
        );
      }
      throw error;
    }
  }

  /**
   * Safely parses JSON from a fetch response, adding context to errors.
   * @param {Response} response - The fetch response object.
   * @param {string} label - A label for the resource (e.g., "agents.json").
   * @returns {Promise<any>} The parsed JSON data.
   * @throws {Error} If parsing fails, with a descriptive message.
   */
  async safeJsonParse(response, label) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse JSON for ${label}: ${error.message}`);
    }
  }

  /**
   * Validates the structure of the agents data and sanitizes optional fields.
   * Filters out agents that do not match the expected schema (name, category, promptFile).
   * Ensures optional fields like `scope`, and `usedIn` are of the correct type,
   * defaulting to safe values if invalid.
   *
   * @param {any} data - The raw JSON data to validate.
   * @returns {Array<Object>} Array of valid, sanitized agent objects.
   * @throws {Error} If the input data is not an array.
   */
  validateAgentsData(data) {
    if (!Array.isArray(data)) {
      throw new Error("Invalid format: agents data must be an array.");
    }
    return data
      .filter((agent) => {
        const isValid =
          agent &&
          typeof agent.name === "string" &&
          typeof agent.category === "string" &&
          Object.keys(CONFIG.categories).includes(agent.category);

        if (!isValid) {
          console.warn("Skipping invalid agent entry:", agent);
        }
        return isValid;
      })
      .map((agent) => {
        // Medic: Sanitize optional fields to prevent fragility
        if (agent.scope && typeof agent.scope !== "string") {
          console.warn(
            `Sanitizing agent ${agent.name}: scope must be string. Casting.`,
          );
          agent.scope = String(agent.scope);
        }

        if (agent.usedIn && typeof agent.usedIn !== "string") {
          console.warn(
            `Sanitizing agent ${agent.name}: usedIn must be string. Casting.`,
          );
          agent.usedIn = String(agent.usedIn);
        }

        return agent;
      });
  }

  /**
   * Loads agent data from `agents.json` and fetches individual prompt files.
   * Populates `this.agents` with the complete data set.
   * Handles errors by displaying a message in the main container.
   * @returns {Promise<void>}
   */
  async loadData() {
    try {
      const response = await this.fetchWithRetry("agents.json");
      const rawData = await this.safeJsonParse(response, "agents.json");
      const agentsData = this.validateAgentsData(rawData);

      // Fetch Prompts for Standard Agents
      await Promise.all(
        agentsData.map(async (agent) => {
          try {
            const promptRes = await fetch(`prompts/${agent.name}.md`);
            if (promptRes.ok) {
              agent.prompt = await promptRes.text();
            } else {
              console.warn(`Failed to load prompt for ${agent.name}`);
              agent.prompt = "Prompt missing.";
            }
          } catch (e) {
            console.warn(`Error loading prompt for ${agent.name}`, e);
            agent.prompt = "Prompt missing.";
          }
        }),
      );

      this.agents = agentsData;

      // FUSION: Load Custom Agents Data
      let customAgentsData = {};
      try {
        const customRes = await fetch("custom_agents.json");
        if (customRes.ok) {
          customAgentsData = await this.safeJsonParse(
            customRes,
            "custom_agents.json",
          );

          // Fetch Prompts for Custom Agents
          await Promise.all(
            Object.values(customAgentsData).map(async (custom) => {
              // Sanitize name for filename: Remove non-ASCII, trim, replace spaces with underscores.
              const cleanName = custom.name
                .replace(/[^\x00-\x7F]/g, "")
                .trim()
                .replace(/ /g, "_");
              const filename = `prompts/fusions/${cleanName}.md`;

              try {
                const promptRes = await fetch(filename);
                if (promptRes.ok) {
                  custom.prompt = await promptRes.text();
                } else {
                  // File not found -> Assume dynamic fusion (like "The Void")
                  custom.prompt = null;
                }
              } catch (e) {
                console.warn(
                  `Error loading custom prompt for ${custom.name}`,
                  e,
                );
                custom.prompt = null;
              }
            }),
          );
        }
      } catch (e) {
        if (e.message.includes("parse JSON")) {
          console.error(
            "CRITICAL: custom_agents.json is malformed. Fusion data may be incomplete.",
            e,
          );
        } else {
          console.warn(
            "custom_agents.json not loaded (missing or network error).",
          );
        }
      }

      // Initialize Fusion Lab Component
      this.fusionLab = new FusionLab();
      this.fusionLab.init(this.agents, customAgentsData);

    } catch (error) {
      console.error("Failed to load agents.json", error);
      if (this.elements.main) {
        const msg = error.message.includes("JSON")
          ? "Data corruption detected (JSON)"
          : "Connection failed";
        this.elements.main.innerHTML = `<div style="text-align:center; padding: 2rem; color: #f87171;">Couldn't load agents. ${msg}.</div>`;
      }
    }
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
   * Renders skeleton loading cards into each category grid.
   * Provides visual feedback while data is loading.
   * Supports reduced motion preferences via CSS.
   */
  renderSkeletons() {
    Object.keys(CONFIG.categories).forEach((key) => {
      const container = document.getElementById(CONFIG.categories[key]);
      if (!container) return;

      // Add 3 skeletons per category
      for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton-card skeleton-pulse";
        skeleton.setAttribute("aria-hidden", "true"); // Hidden from screen readers
        skeleton.innerHTML = `
                  <div class="skeleton-header">
                       <div class="skeleton-title"></div>
                       <div class="skeleton-circle"></div>
                  </div>
                  <div class="skeleton-lines">
                      <div class="skeleton-text"></div>
                      <div class="skeleton-text"></div>
                      <div class="skeleton-text short"></div>
                  </div>
                  <div class="skeleton-btn"></div>
              `;
        container.appendChild(skeleton);
      }
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
   */
  renderAgents() {
    const categoryContainers = {};
    Object.keys(CONFIG.categories).forEach((key) => {
      categoryContainers[key] = document.getElementById(
        CONFIG.categories[key],
      );
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

      const card = document.createElement("div");
      card.className = "card pop-in";
      const delay = Math.min(globalIndex * 30, 600);
      card.style.animationDelay = `${delay}ms`;
      globalIndex++;

      if (agent.type === "plus") card.classList.add("plus-agent");
      if (agent.type === "monthly") card.classList.add("monthly-agent");

      // Build tags
      let tags = "";
      if (agent.scope) {
        let scopeClass = "scope-medium";
        if (agent.scope.includes("Small")) scopeClass = "scope-small";
        if (agent.scope.includes("Large")) scopeClass = "scope-large";
        tags += `<span class="meta-tag ${scopeClass}">${agent.scope}</span>`;
      }

      // Build HTML
      const parsed = PromptParser.parsePrompt(agent.prompt);
      let promptHtml = '';

      if (parsed.format === 'legacy') {
          promptHtml = `<div class="details-content">${agent.prompt}</div>`;
      } else {
          const sections = parsed.sections.map(sec => {
              let label = '';
              if (sec.tag === 'system') label = 'System Role';
              else if (sec.tag === 'task') label = 'Mission';
              else if (sec.tag === 'step') label = `Step ${sec.id || '?'}: ${sec.name || ''}`;
              else if (sec.tag === 'output') label = 'Output Format';
              else label = sec.tag.toUpperCase();

              return `
                <div class="prompt-section prompt-section--${sec.tag}">
                    <div class="prompt-section-label">${label}</div>
                    <div class="prompt-section-body">${sec.content}</div>
                </div>
              `;
          }).join('');
          promptHtml = `<div class="details-content"><div class="prompt-structured">${sections}</div></div>`;
      }

      card.innerHTML = `
              <div class="card-header">
                  <div class="title-group">
                      <h3 class="agent-title">
                          <span>${agent.icon}</span> ${agent.name}
                      </h3>
                      <div class="tag-container">${tags}</div>
                  </div>
                  <span class="role-tag">${agent.role}</span>
              </div>

              <div class="description">
                  ${agent.desc}
              </div>

              <button class="details-toggle" aria-expanded="false" aria-controls="details-${index}" data-action="toggle-details" data-index="${index}">
                  <!-- Curator: Optimized Chevron -->
                  <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  <!-- Wordsmith: Active voice -->
                  <span>Show Prompt</span>
              </button>
              <div class="details-grid" id="details-${index}">
                  <div class="details-overflow">
                      ${promptHtml}
                  </div>
              </div>

              <div class="card-actions">
                  <!-- Wordsmith: Accurate label, Active voice -->
                  <button class="secondary" data-action="copy-agent" data-index="${index}" aria-label="Copy this agent's prompt to clipboard">
                      <!-- Curator: Optimized Copy Icon -->
                      <svg class="copy-icon" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                      <!-- Curator: Optimized Check Icon -->
                      <svg class="check-icon" style="display: none" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span>Copy Prompt</span>
                  </button>
              </div>
          `;

      container.appendChild(card);
    });
  }

  /**
   * Binds event listeners to static elements and sets up event delegation for dynamic elements.
   * Handles search input, button clicks, and card interactions.
   */
  bindEvents() {
    // Static events
    this.elements.searchInput?.addEventListener("input", (e) =>
      this.filterAgents(e.target.value),
    );
    this.elements.clearBtn?.addEventListener("click", () =>
      this.clearSearch(),
    );
    this.elements.copyAllBtn?.addEventListener("click", (e) =>
      this.copyAll(e.currentTarget),
    );
    this.elements.downloadAllBtn?.addEventListener("click", (e) =>
      this.downloadAll(e.currentTarget),
    );

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
   * @param {string} query - The search query.
   */
  filterAgents(query) {
    const search = query.toLowerCase();
    const cards = document.querySelectorAll(CONFIG.selectors.card);

    let visibleCount = 0;

    if (query.length > 0) {
      this.elements.clearBtn?.classList.add("visible");
    } else {
      this.elements.clearBtn?.classList.remove("visible");
    }

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.classList.remove("pop-in");

      if (text.includes(search)) {
        card.style.display = "flex";
        void card.offsetWidth;
        const delay = Math.min(visibleCount * 30, 600);
        card.style.animationDelay = `${delay}ms`;
        card.classList.add("pop-in");
        visibleCount++;
      } else {
        card.style.display = "none";
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
   * Displays a toast notification with a message.
   * Clears any existing toast timeout to prevent race conditions.
   * @param {string} [message="Copied to clipboard"] - The message to display.
   */
  showToast(message) {
    if (this.state.toastTimeout) {
      clearTimeout(this.state.toastTimeout);
    }
    const toast = this.elements.toast;
    if (toast) {
      toast.textContent = message || "Copied to clipboard";
      toast.classList.add("show");
      this.state.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
      }, 2000);
    }
  }

  /**
   * Copies text to the clipboard using the Clipboard API or a fallback.
   * @param {string} text - The text to copy.
   * @param {string} message - Success message for the toast.
   * @returns {Promise<boolean>} True if successful.
   */
  async copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(message);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed, attempting fallback", err);
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.showToast(message);
      return true;
    }
  }

  /**
   * Animates a button to indicate success.
   * Temporarily changes the button style and text.
   * @param {HTMLElement} btn - The button element.
   * @param {string} successMessage - The text to display during the success state.
   */
  animateButtonSuccess(btn, successMessage) {
    const span = btn.querySelector("span");
    const checkIcon = btn.querySelector(".check-icon");
    // Palette+: Dynamically find primary icon (not check icon)
    const primaryIcon = btn.querySelector("svg:not(.check-icon)");
    const originalText = span.innerText;

    btn.classList.add("success-state");
    span.innerText = successMessage;
    if (primaryIcon) primaryIcon.style.display = "none";
    if (checkIcon) {
      checkIcon.style.display = "block";
      // Palette+: Trigger pop animation
      checkIcon.classList.add("animate");
    }

    setTimeout(() => {
      btn.classList.remove("success-state");
      span.innerText = originalText;
      if (primaryIcon) primaryIcon.style.display = "block";
      if (checkIcon) {
        checkIcon.style.display = "none";
        checkIcon.classList.remove("animate");
      }
    }, 2000);
  }

  /**
   * Copies a specific agent's prompt to the clipboard.
   * @param {string|number} index - Index of the agent in `this.agents`.
   * @param {HTMLElement} btn - The button triggered.
   */
  async copyAgent(index, btn) {
    const agent = this.agents[index];
    const success = await this.copyText(
      agent.prompt,
      "Copied to clipboard",
    );
    if (success) {
      this.animateButtonSuccess(btn, "Copied!");
    }
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
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jules_roster.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.animateButtonSuccess(btn, "Downloaded!");
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
    const success = await this.copyText(
      header + body,
      "Copied to clipboard",
    );
    if (success) {
      this.animateButtonSuccess(btn, "Copied!");
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
}
