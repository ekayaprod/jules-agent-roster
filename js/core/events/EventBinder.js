

class EventBinder {
    static bind(app) {
    if (app.elements.searchInput) {
      const debouncedFilter = PerformanceUtils.debounce((query) => app.filterAgents(query), SEARCH_DEBOUNCE_MS);
      app.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
    }

    if (app.elements.searchTriggerBtn) app.elements.searchTriggerBtn.addEventListener("click", () => {
      const nav = app.elements["category-nav"];
      if (nav) {
        nav.classList.add("search-active");
        setTimeout(() => app.elements.searchInput?.focus(), SafeUITimings?.MODAL_FOCUS_DELAY_MS || 50);
      }
    });

    if (app.elements.clearBtn) app.elements.clearBtn.addEventListener("click", () => app.clearSearch());
    if (app.elements.clearSearchEmptyBtn) app.elements.clearSearchEmptyBtn.addEventListener("click", () => app.clearSearch());

    if (app.elements.julesRepoPicker) app.elements.julesRepoPicker.addEventListener('change', async (e) => {
        if (app._cardHtmlCache) app._cardHtmlCache.clear();
        if (app._domNodeCache) app._domNodeCache.clear();
        app.renderAgents();

        const sourceName = e.target.value;
        if (sourceName) {
            await Promise.all([
                app.julesManager.loadActiveSessionsForRepo(sourceName),
                app.julesManager.loadPullRequestsForRepo(sourceName)
            ]);
        } else {
            const terminal = app.elements.julesTerminal;
            if (terminal) {
              terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
              terminal.classList.remove('active');
            }
            app.julesManager.cleanup();
        }
    });

    // Footer Master Export Controls
    const masterDropBtn = app.elements.masterDropdownBtn;
    const masterDropMenu = app.elements.masterDropdownMenu;

    if (masterDropBtn) masterDropBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (masterDropMenu) masterDropMenu.classList.toggle("visible");
    });

    // Global Click Delegation (Handles Dropdowns, Cards, etc.)
    document.addEventListener("click", (e) => {
      // Close search if clicked outside and input is empty
      const nav = app.elements["category-nav"];
      if (nav && nav.classList.contains("search-active")) {
          if (!nav.contains(e.target) && (!app.elements.searchInput || app.elements.searchInput.value.trim() === "")) {
              app.clearSearch();
          }
      }

      // 1. Close master dropdown if clicked outside
      if (masterDropMenu && masterDropMenu.classList.contains("visible") && !masterDropMenu.contains(e.target) && !masterDropBtn.contains(e.target)) {
          masterDropMenu.classList.remove("visible");
      }

      // 2. Close specific card dropdowns if clicked outside
      app.activeDropdowns.forEach(menu => {
          if (menu.id !== 'masterDropdownMenu' && !menu.contains(e.target) && !e.target.closest('[data-action="toggle-card-dropdown"]')) {
              DOMUtils.closeDropdownMenu(menu, app);
          }
      });

      // 2.5 Open Fusions Modal
      const fusionsTarget = e.target.closest('[data-action="open-fusions-modal"]');
      if (fusionsTarget) {
          e.stopPropagation();
          e.preventDefault();

          const index = fusionsTarget.dataset.index;
          let agent = app.getAgentForUI(index);
          if (!agent) return;

          const modal = document.getElementById("fusionsModal");
          const contentArea = document.getElementById("fusionsModalContent");

          if (!modal || !contentArea || !app.fusionLab || !app.fusionLab.fusionIndex) return;

          const unlockedKeys = app.fusionLab.fusionIndex.unlockedKeys;
          let listItems = '';

          // Dynamically resolve fusions from the live matrix map
          const compiler = app.fusionLab.compiler;
          const allMatrixKeys = compiler.fusionMatrixMap ? Object.keys(compiler.fusionMatrixMap) : [];

          // Extract unique potential fusions for this agent dynamically via a memoized dictionary lookup
          // ⚡ Bolt+: Eliminated O(N) redundant iteration by memoizing the exact string-inclusion result per agent name.
          if (!compiler._fusionCacheByAgent || compiler._lastMatrixMapRef !== compiler.fusionMatrixMap) {
              compiler._fusionCacheByAgent = {};
              compiler._lastMatrixMapRef = compiler.fusionMatrixMap;
          }
          if (!compiler._fusionCacheByAgent[agent.name]) {
              const uniqueKeys = new Set(allMatrixKeys);
              const fusions = [];
              for (const key of uniqueKeys) {
                  if (key.includes(agent.name)) {
                      fusions.push(key);
                  }
              }
              compiler._fusionCacheByAgent[agent.name] = fusions;
          }
          const potentialFusions = compiler._fusionCacheByAgent[agent.name];

          // Reset title to base agent
          const titleSpan = document.getElementById("fusionsModalAgent");
          if (titleSpan) titleSpan.textContent = "Available Fusions";
          const emojiSpan = document.getElementById("fusionsModalEmoji");
          if (emojiSpan) emojiSpan.textContent = "🧬";

          for (const key of potentialFusions) {
              const isUnlocked = typeof unlockedKeys.has === 'function'
                  ? unlockedKeys.has(key)
                  : unlockedKeys.includes(key);

              if (!isUnlocked) continue;

              const fusionName = app.fusionLab.compiler.fusionMatrixMap[key];
              const childAgent = AgentUtils.getCustomAgent(app.customAgents, fusionName) || app.fusionLab.compiler.customAgentsMap[fusionName];
              if (!childAgent) continue;

              const childIcon = FormatUtils.extractIcon(childAgent);
              const safeChildName = FormatUtils.escapeHTML(FormatUtils.extractDisplayName(childAgent));
              listItems += `
                  <li style="list-style: none;">
                      <button class="fusion-quick-btn" data-action="view-fusion-card" data-index="${key}" aria-label="View ${safeChildName}" title="${safeChildName}">
                          ${childIcon}
                      </button>
                  </li>
              `;
          }

          const downloadBtn = document.getElementById("downloadParentFusionsBtn");
          if (listItems) {
              const listArea = document.getElementById("fusionsModalList");
              const cardArea = document.getElementById("fusionsModalCard");
              if (listArea) {
                  listArea.innerHTML = `<ul class="fusion-quick-list" style="padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">${listItems}</ul>`;
              }
              if (cardArea) {
                  cardArea.innerHTML = '';
              }
              if (downloadBtn) {
                  downloadBtn.style.display = "";
                  downloadBtn.dataset.parentName = agent.name;
              }
              modal.classList.add("visible");
          } else if (downloadBtn) {
              downloadBtn.style.display = "none";
          }
          return;
      }

      // 2.6 View Fusion Card from Modal
      const viewFusionTarget = e.target.closest('[data-action="view-fusion-card"]');
      if (viewFusionTarget) {
          e.stopPropagation();
          e.preventDefault();
          const index = viewFusionTarget.dataset.index;
          let agent = app.getAgentForUI(index);
          if (!agent) return;

          const cardArea = document.getElementById("fusionsModalCard");
          if (cardArea) {
              cardArea.innerHTML = '';
              const card = AgentCard.create(agent, index, 0);
              card.classList.remove("pop-in");
              card.style.margin = "0"; // Reset margin to fit perfectly
              cardArea.appendChild(card);
          }
          return;
      }

      const downloadParentFusionsBtn = e.target.closest('#downloadParentFusionsBtn');
      if (downloadParentFusionsBtn) {
          e.stopPropagation();
          e.preventDefault();
          const parentName = downloadParentFusionsBtn.dataset.parentName;
          if (parentName && app.exportController) {
              app.exportController.downloadCustomAgentsByParent(parentName, downloadParentFusionsBtn);
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
          let agent = app.getAgentForUI(index);

          if (!agent) return;

          const isPinned = app.pinnedManager.togglePin(index);

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

          const nav = app.elements["category-nav"];
          if (nav && nav.classList.contains("search-active") && app.elements.searchInput) {
              app.filterAgents(app.elements.searchInput.value);
          }

          if (app._domNodeCache) app._domNodeCache.delete(String(index));

          app.renderAgents();

          // Re-trigger search view if active
          const searchInput = app.elements.searchInput;
          if (searchInput && searchInput.value.trim() !== "") {
              app.filterAgents(searchInput.value);
          }

          app.showToast(isPinned ? "Pinned" : "Unpinned");

          if (app._cardHtmlCache) {
              app._cardHtmlCache.delete(String(index));
              app._cardHtmlCache.delete(Number(index));
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

          if (!promptArea || promptArea.innerHTML.trim()) {
              card.classList.add('flipped');
              return;
          }

          let agent = app.getAgentForUI(index);
          if (!agent) {
              card.classList.add('flipped');
              return;
          }

          if (agent.prompt === undefined) {
              const fallbackText = "No protocol data available.";
              // Temporarily render a loading spinner
              promptArea.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%;"><div class="loading-spinner" style="width:1.5rem; height:1.5rem; margin:0;"></div></div>';

              const url = AgentUtils.getPromptUrl(agent);

              app.agentRepo.fetchPrompt(agent.name, url, fallbackText).then((fetchedPrompt) => {
                  agent.prompt = fetchedPrompt;
                  promptArea.innerHTML = '';
                  promptArea.appendChild(AgentCard.getPromptNode(agent));
              });
          } else {
              promptArea.innerHTML = '';
              promptArea.appendChild(AgentCard.getPromptNode(agent));
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
          app.activeDropdowns.forEach(menu => {
              if (menu !== dropdown) {
                  DOMUtils.closeDropdownMenu(menu, app);
              }
          });

          if (!dropdown) return;
          const isVisible = dropdown.classList.toggle('visible');
          if (isVisible) {
              app.activeDropdowns.add(dropdown);
          } else {
              app.activeDropdowns.delete(dropdown);
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
              if (parentName && app.exportController) {
                  app.exportController.downloadCustomAgentsByParent(parentName, actionBtn);
              }
              DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
              return;
          }

          const index = actionBtn.dataset.index;
          let agent = app.getAgentForUI(index);
          if (!agent) return;

          if (action === "copy-agent") {
              app.copyAgent(index, actionBtn);
              DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
              return;
          }
          if (action === "download-agent") {
              app.downloadAgent(index, actionBtn);
              DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
              return;
          }
          if (action === "launch-jules") {
              app.julesManager.launchSession(agent, actionBtn);
              const modal = document.getElementById("fusionsModal");
              if (modal && modal.contains(actionBtn)) {
                  modal.classList.remove("visible");
              }
              return;
          }
      }
    });

    // Pre-fetch custom/fusion agent prompts on hover to reduce flip latency
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.flip-card');
        if (!card || card.classList.contains('flipped')) return;

        const frontTarget = card.querySelector('[data-action="flip-card"]');
        if (!frontTarget) return;

        const index = frontTarget.dataset.index;
        if (!index) return;

        let agent = app.getAgentForUI(index);
        if (!agent || !agent.isCustom || agent.prompt !== undefined) return;

        const url = AgentUtils.getPromptUrl(agent);
        app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.").then(fetched => {
            agent.prompt = fetched;
        });
    });

    // Close search and active dropdowns on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        // Priority 1: Close active dropdowns
        if (app.activeDropdowns && app.activeDropdowns.size > 0) {
            app.activeDropdowns.forEach(menu => {
                DOMUtils.closeDropdownMenu(menu, app);
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
        const nav = app.elements["category-nav"];
        if (nav && nav.classList.contains("search-active")) {
            app.clearSearch();
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
            if (!e.target.checked) {
                if (runnerInputs) runnerInputs.classList.remove("active");
                if (julesTerminal) julesTerminal.style.display = "none";
                return;
            }

            if (runnerInputs) runnerInputs.classList.add("active");
            if (julesTerminal) julesTerminal.style.display = "";
            // Load sources if not loaded already but initialized
            if (!app.julesManager || !app.julesManager.initialized) return;

            try {
                await app.julesManager.loadSources();
            } catch (err) {
                console.warn("JulesManager API failed to load sources after activation.", err);
            }
        });
    }

    // Master Export bindings
    if (app.elements.masterCopyBtn) app.elements.masterCopyBtn.addEventListener("click", (e) => app.copyAll(e.currentTarget));
    if (app.elements.masterDownloadCoreBtn) app.elements.masterDownloadCoreBtn.addEventListener("click", (e) => {
        app.downloadAll(e.currentTarget);
        if (masterDropMenu) masterDropMenu.classList.remove("visible");
    });
    if (app.elements.masterCopyFusionsBtn) app.elements.masterCopyFusionsBtn.addEventListener("click", async (e) => {
        // ↗️ VECTORIZE: The Single-Pass Pipeline. We ignore the abstracted layers and execute the calculation in one direct pass.
        const validCustomAgents = AgentUtils.getValidCustomAgents(app.customAgents);

        if (validCustomAgents.length === 0) return app.toast.show("No custom agents unlocked yet.");
        const header = FormatUtils.CUSTOM_ROSTER_HEADER;
        const success = await ClipboardUtils.copyText(header + FormatUtils.formatAgentPrompts(validCustomAgents));
        if (success) {
            app.toast.show("Fusions copied to clipboard");
            ClipboardUtils.animateButtonSuccess(e.currentTarget, "Copied!");
        }
        if (masterDropMenu) masterDropMenu.classList.remove("visible");
    });
    if (app.elements.masterDownloadFusionsBtn) app.elements.masterDownloadFusionsBtn.addEventListener("click", (e) => {
        app.downloadCustomAgents(e.currentTarget);
        if (masterDropMenu) masterDropMenu.classList.remove("visible");
    });
  }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBinder;
}
