class GlobalEvents {
    static bind(app) {
        const masterDropMenu = app.elements.masterDropdownMenu;
        const masterDropBtn = app.elements.masterDropdownBtn;
    // Global Click Delegation (Handles Dropdowns, Cards, etc.)
    document.addEventListener("click", (e) => {
      // Close search if clicked outside and input is empty
      const nav = app.elements["category-nav"];
      if (nav && nav.classList.contains("search-active")) {
          if (!nav.contains(e.target) && (!app.elements.searchInput || app.elements.searchInput.value.trim() === "")) {
              app.searchController?.clearSearch();
          }
      }

      if (masterDropMenu && masterDropMenu.classList.contains("visible") && !masterDropMenu.contains(e.target) && !masterDropBtn.contains(e.target)) {
          masterDropMenu.classList.remove("visible");
      }

      app.activeDropdowns.forEach(menu => {
          if (menu.id !== 'masterDropdownMenu' && !menu.contains(e.target) && !e.target.closest('[data-action="toggle-card-dropdown"]')) {
              DOMUtils.closeDropdownMenu(menu, app);
          }
      });

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
          if (!app.fusionLab._fusionCacheByAgent || app.fusionLab._lastMatrixMapRef !== compiler.fusionMatrixMap) {
              app.fusionLab._fusionCacheByAgent = {};
              app.fusionLab._lastMatrixMapRef = compiler.fusionMatrixMap;
          }
          if (!app.fusionLab._fusionCacheByAgent[agent.name]) {
              const prefix = agent.name + ',';
              const suffix = ',' + agent.name;
              app.fusionLab._fusionCacheByAgent[agent.name] = allMatrixKeys.filter(key => key.startsWith(prefix) || key.endsWith(suffix));
          }
          const potentialFusions = app.fusionLab._fusionCacheByAgent[agent.name];

          // Reset title to base agent
          const titleSpan = document.getElementById("fusionsModalAgent");
          if (titleSpan) titleSpan.textContent = "Available Fusions";
          const emojiSpan = document.getElementById("fusionsModalEmoji");
          if (emojiSpan) emojiSpan.textContent = "🧬";

          const ul = document.createElement('ul');
          ul.className = "fusion-quick-list fusion-quick-list-container";
          let hasItems = false;

          potentialFusions.forEach(key => {
              const isUnlocked = typeof unlockedKeys.has === 'function' ? unlockedKeys.has(key) : unlockedKeys.includes(key);
              if (!isUnlocked) return;
              const fusionName = app.fusionLab.compiler.fusionMatrixMap[key];
              const childAgent = AgentUtils.getCustomAgent(app.customAgents, fusionName) || app.fusionLab.compiler.customAgentsMap[fusionName];
              if (!childAgent) return;
              const safeChildName = FormatUtils.extractDisplayName(childAgent); // textContent handles escaping

              const li = document.createElement('li');
              li.className = "fusion-quick-list-item";

              const button = document.createElement('button');
              button.className = "fusion-quick-btn transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95";
              button.setAttribute("data-action", "view-fusion-card");
              button.setAttribute("data-index", key);
              button.setAttribute("aria-label", `View ${safeChildName}`);
              button.title = safeChildName;
              button.textContent = FormatUtils.extractIcon(childAgent); // textContent handles escaping

              li.appendChild(button);
              ul.appendChild(li);
              hasItems = true;
          });

          const downloadBtn = document.getElementById("downloadParentFusionsBtn");
          if (hasItems) {
              const listArea = document.getElementById("fusionsModalList");
              const cardArea = document.getElementById("fusionsModalCard");
              if (listArea) {
                  listArea.innerHTML = '';
                  listArea.appendChild(ul);
              }
              if (cardArea) {
                  cardArea.innerHTML = '';
              }
              if (downloadBtn) {
                  downloadBtn.classList.remove("d-none");
                  downloadBtn.dataset.parentName = agent.name;
              }
              modal.classList.add("visible");
          } else if (downloadBtn) {
              downloadBtn.classList.add("d-none");
          }
          return;
      }

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
              card.classList.add("m-0"); // Reset margin to fit perfectly
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
              app.searchController?.filterAgents(app.elements.searchInput.value);
          }

          if (app._domNodeCache) app._domNodeCache.delete(String(index));

          app.renderAgents();

          // Re-trigger search view if active
          const searchInput = app.elements.searchInput;
          if (searchInput && searchInput.value.trim() !== "") {
              app.searchController?.filterAgents(searchInput.value);
          }

          app.showToast(isPinned ? "Pinned" : "Unpinned");

          if (app._cardHtmlCache) {
              app._cardHtmlCache.delete(String(index));
              app._cardHtmlCache.delete(Number(index));
          }
          return;
      }

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
              const fallbackText = MESSAGES.NO_PROTOCOL_DATA;
              // 🎩 CONJURE: Inject structural CSS skeleton to instantly mask network latency
              promptArea.innerHTML = '';
              promptArea.appendChild(DOMUtils.createSkeletonElement("skeleton-pulse", "8rem"));

              const url = AgentUtils.getPromptUrl(agent);

              (async () => {
                  const fetchedPrompt = await app.agentRepo.fetchPrompt(agent.name, url, fallbackText);
                  agent.prompt = fetchedPrompt;
                  promptArea.innerHTML = '';
                  promptArea.appendChild(AgentCard.getPromptNode(agent));
              })();
          } else {
              promptArea.innerHTML = '';
              promptArea.appendChild(AgentCard.getPromptNode(agent));
          }

          card.classList.add('flipped');
          return;
      }

      const backTarget = e.target.closest('[data-action="flip-card-back"]');
      if (backTarget && !e.target.closest('.prompt-scroll-area') && !e.target.closest('.card-actions')) {
          e.stopPropagation();
          const card = backTarget.closest('.flip-card');
          if (!card) return;
          card.classList.remove('flipped');
          return;
      }

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

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.dataset.action;
      if (!["copy-agent", "copy-agent-instruction", "download-agent", "launch-jules", "download-parent-fusions"].includes(action)) return;

      e.preventDefault();
      e.stopPropagation();

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
          app.exportController?.copyAgent(index, actionBtn);
          DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
          return;
      }
      if (action === "copy-agent-instruction") {
          app.exportController?.copyAgentInstruction(index, actionBtn);
          DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
          return;
      }
      if (action === "download-agent") {
          app.exportController?.downloadAgent(index, actionBtn);
          DOMUtils.closeDropdownMenu(actionBtn.closest('.dropdown-menu'), app);
          return;
      }
      if (action === "launch-jules") {
          app.julesTerminal.launchSession(agent, actionBtn);
          const modal = document.getElementById("fusionsModal");
          if (modal && modal.contains(actionBtn)) {
              modal.classList.remove("visible");
          }
          return;
      }
    });

    // Pre-fetch custom/fusion agent prompts on hover to reduce flip latency
    document.addEventListener('mouseover', async (e) => {
        const card = e.target.closest('.flip-card');
        if (!card || card.classList.contains('flipped')) return;

        const frontTarget = card.querySelector('[data-action="flip-card"]');
        if (!frontTarget) return;

        const index = frontTarget.dataset.index;
        if (!index) return;

        let agent = app.getAgentForUI(index);
        if (!agent || !agent.isCustom || agent.prompt !== undefined) return;

        const url = AgentUtils.getPromptUrl(agent);
        try {
            const fetched = await app.agentRepo.fetchPrompt(agent.name, url, typeof window !== 'undefined' && window.MESSAGES ? window.MESSAGES.NO_PROTOCOL_DATA : (typeof global !== 'undefined' && global.MESSAGES ? global.MESSAGES.NO_PROTOCOL_DATA : "No protocol data available."));
            agent.prompt = fetched;
        } catch (err) {
            const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
            if (tu) tu.dispatchEvent("PROMPT_FETCH_ERROR", err);
            else console.error("Failed to pre-fetch custom agent prompt:", err);
        }
    });

    // Close search and active dropdowns on Escape key
    document.addEventListener("keydown", (e) => {
        // ☕ CAFFEINATED: The Double-Shot Override - Global hotkeys for direct action
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchBtn = app.elements.searchTriggerBtn;
            if (searchBtn && !app.elements["category-nav"]?.classList.contains("search-active")) {
                searchBtn.click();
            } else if (app.elements.searchInput) {
                app.elements.searchInput.focus();
            }
            return;
        }

        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            if (app.elements.masterCopyBtn) app.elements.masterCopyBtn.click();
            return;
        }

        if (e.key !== "Escape") return;

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

        const nav = app.elements["category-nav"];
        if (nav && nav.classList.contains("search-active")) {
            // ☕ CAFFEINATED: Persist context. Hide search visually but retain query to prevent amnesiac loop.
            if (!app.elements.searchInput || app.elements.searchInput.value.trim() === "") {
                app.searchController?.clearSearch();
            } else {
                nav.classList.remove("search-active");
                if (app.elements.searchInput.blur) app.elements.searchInput.blur();
            }
            return;
        }

        const activeModals = document.querySelectorAll('.modal-backdrop.visible');
        if (activeModals.length > 0) {
            activeModals.forEach(modal => {
                const closeBtn = modal.querySelector('#closeSettingsBtn, #cancelInteractionBtn, #cancelHistoryBtn, #cancelPRBtn, #closeFusionsModalBtn');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    modal.classList.remove('visible');
                }
            });
            return;
        }
    });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalEvents;
}
