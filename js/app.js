const CONFIG = {
  selectors: {
      searchInput: '#searchInput',
      clearBtn: '#clearBtn',
      copyAllBtn: '#copyAllBtn',
      toast: '#toast',
      announcer: '#search-announcer',
      emptyState: '#emptyState',
      categoryNav: '#category-nav',
      main: '#main',
      navPills: '.nav-pill',
      sectionHeader: '.section-header',
      grid: '.grid',
      card: '.card'
  },
  categories: {
      core: 'coreGrid',
      eng: 'engGrid',
      context: 'contextGrid',
      monthly: 'monthlyGrid',
      power: 'powerGrid'
  },
  sectionMap: {
      'coreGrid': 'core-maintenance',
      'engGrid': 'engineering-specialists',
      'contextGrid': 'context-strategy',
      'monthlyGrid': 'monthly-intelligence',
      'powerGrid': 'bundled-tasks'
  }
};

// --- ROSTER APP ---
class RosterApp {
  constructor() {
      this.agents = [];
      this.elements = {};
      this.state = {
          toastTimeout: null
      };
  }

  async init() {
      this.cacheElements();
      await this.loadData();
      this.renderAgents();
      this.bindEvents();
      this.initObserver();
  }

  async loadData() {
      try {
          const response = await fetch('agents.json');
          const agentsData = await response.json();

          // Parallel fetch for all prompts
          this.agents = await Promise.all(agentsData.map(async (agent) => {
              if (agent.promptFile) {
                  try {
                      const promptRes = await fetch(agent.promptFile);
                      agent.prompt = await promptRes.text();
                  } catch (e) {
                      console.error(`Failed to load prompt for ${agent.name}`, e);
                      agent.prompt = "Error loading prompt.";
                  }
              }
              return agent;
          }));
      } catch (error) {
          console.error("Failed to load agents.json", error);
          if (this.elements.main) {
              this.elements.main.innerHTML = `<div style="text-align:center; padding: 2rem; color: #f87171;">Failed to load roster data. Please ensure you are running on a local server.</div>`;
          }
      }
  }

  cacheElements() {
      // Cache DOM elements based on CONFIG
      Object.keys(CONFIG.selectors).forEach(key => {
          const selector = CONFIG.selectors[key];
          this.elements[key] = selector.startsWith('#')
              ? document.getElementById(selector.substring(1))
              : document.querySelectorAll(selector);
      });
  }

  renderAgents() {
      const categoryContainers = {};
      Object.keys(CONFIG.categories).forEach(key => {
          categoryContainers[key] = document.getElementById(CONFIG.categories[key]);
      });

      this.agents.forEach((agent, index) => {
          const card = document.createElement("div");
          card.className = "card";
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

          if (agent.usedIn) {
              agent.usedIn.split(",").forEach(
                  (p) => (tags += `<span class="power-tag">🧩 Part of ${p.trim()}</span>`)
              );
          }

          // Differences List
          const diffHtml = agent.diffs
          ? `<ul class="diff-list">
              ${agent.diffs.map(diff => `
                  <li class="diff-item">
                      <span class="diff-icon ${diff.type === "plus" ? "diff-plus" : diff.type === "minus" ? "diff-minus" : "diff-change"}">
                          ${diff.type === "plus" ? "➕" : diff.type === "minus" ? "➖" : "🔄"}
                      </span>
                      <span class="diff-text">${diff.text}</span>
                  </li>`).join("")}
              </ul>`
          : "";

          // Build HTML
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
                  ${diffHtml}
              </div>

              <button class="details-toggle" aria-expanded="false" aria-controls="details-${index}" data-action="toggle-details" data-index="${index}">
                  <svg aria-hidden="true" focusable="false" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  <span>Show Details</span>
              </button>
              <div class="details-grid" id="details-${index}">
                  <div class="details-overflow">
                      <div class="details-content">${agent.prompt}</div>
                  </div>
              </div>

              <div class="card-actions">
                  <button class="secondary" data-action="copy-agent" data-index="${index}">
                      <span>Copy Prompt</span>
                  </button>
              </div>
          `;

          categoryContainers[agent.category].appendChild(card);
      });
  }

  bindEvents() {
      // Static events
      this.elements.searchInput?.addEventListener('input', (e) => this.filterAgents(e.target.value));
      this.elements.clearBtn?.addEventListener('click', () => this.clearSearch());
      this.elements.copyAllBtn?.addEventListener('click', (e) => this.copyAll(e.currentTarget));

      // Event Delegation
      this.elements.main?.addEventListener('click', (e) => {
          const toggleBtn = e.target.closest('[data-action="toggle-details"]');
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

  toggleDetails(index, btn) {
      const grid = document.getElementById(`details-${index}`);
      const isExpanded = grid.classList.toggle("expanded");
      btn.setAttribute("aria-expanded", isExpanded);
      const span = btn.querySelector("span");
      span.innerText = isExpanded ? "Hide Details" : "Show Details";

      console.debug("Toggled Agent Details", { index, expanded: isExpanded, agent: this.agents[index]?.name });
  }

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
          document.querySelectorAll(CONFIG.selectors.sectionHeader).forEach(el => el.style.display = 'none');
      } else {
          this.elements.emptyState?.classList.remove("visible");
          document.querySelectorAll(CONFIG.selectors.grid).forEach(grid => {
              const hasVisibleCards = Array.from(grid.children).some(card => card.style.display !== 'none');
              const header = grid.previousElementSibling;
              if (header && header.classList.contains('section-header')) {
                  header.style.display = hasVisibleCards ? 'block' : 'none';
              }
          });
      }

      if (this.elements.announcer) {
          this.elements.announcer.textContent = query.length === 0 ? "" :
              visibleCount === 0 ? "No agents found." : `Found ${visibleCount} agents.`;
      }
  }

  clearSearch() {
      if(this.elements.searchInput) {
          this.elements.searchInput.value = "";
          this.filterAgents("");
          this.elements.searchInput.focus();
      }
  }

  showToast(message) {
      if (this.state.toastTimeout) {
          clearTimeout(this.state.toastTimeout);
      }
      const toast = this.elements.toast;
      if(toast) {
          toast.textContent = message || "Copied to clipboard!";
          toast.classList.add("show");
          this.state.toastTimeout = setTimeout(() => {
              toast.classList.remove("show");
          }, 2000);
      }
  }

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

  async handleCopyAnimation(btn, text, message) {
      const success = await this.copyText(text, message);
      if (!success) return;

      const span = btn.querySelector("span");
      const originalText = span.innerText;

      btn.classList.add("success-state");
      span.innerText = "Copied! ✨";

      setTimeout(() => {
          btn.classList.remove("success-state");
          span.innerText = originalText;
      }, 2000);
  }

  copyAgent(index, btn) {
      const agent = this.agents[index];
      console.info("Agent Copied", { name: agent.name });
      this.handleCopyAnimation(btn, agent.prompt, `${agent.name} prompt copied!`);
  }

  copyAll(btn) {
      console.info("Full Roster Copied", { count: this.agents.length });
      const header = "JULES MASTER AGENT ROSTER\n\nThis roster integrates Core Performance/UX/Security agents with Engineering & Context specialists.\n\n--------------------------------------------------------------------------------\n\n";
      const body = this.agents.map(a => `${a.prompt}\n\n--------------------------------------------------------------------------------`).join('\n\n');
      this.handleCopyAnimation(btn, header + body, "Full Roster copied!");
  }

  initObserver() {
       const navPills = document.querySelectorAll(CONFIG.selectors.navPills);
       const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  const targetId = CONFIG.sectionMap[entry.target.id];
                  navPills.forEach((pill) => {
                       const href = pill.getAttribute("href").substring(1);
                       pill.classList.toggle("active", href === targetId);
                  });
              }
          });
       }, {
          rootMargin: "-80px 0px -60% 0px",
          threshold: 0,
       });

       Object.keys(CONFIG.sectionMap).forEach((gridId) => {
          const el = document.getElementById(gridId);
          if (el) observer.observe(el);
       });
  }
}

// Export for Node/Jest or Attach to Window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RosterApp, CONFIG };
} else {
    window.RosterApp = RosterApp;
    window.CONFIG = CONFIG;
}
