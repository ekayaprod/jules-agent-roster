class FusionPicker {
  constructor(compiler, onSelection) {
    this.compiler = compiler;
    this.onSelection = onSelection;
    this.activePickerSlot = null;
    this.pickerFuse = null;
    this.bindEvents();
  }

  bindEvents() {
    const modal = document.getElementById("agentPickerModal");
    const closeBtn = document.getElementById("closePickerBtn");
    const searchInput = document.getElementById("pickerSearch");

    if (modal) {
        // Close on backdrop click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) this.closePicker();
        });
    }
    if (closeBtn) closeBtn.addEventListener("click", () => this.closePicker());
    if (searchInput) {
        // ⚡ Bolt+: Debounce picker search
        const debouncedFilter = PerformanceUtils.debounce((query) => {
            this.filterPicker(query);
        }, 300);
        searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));

        const clearPickerSearchEmptyBtn = document.getElementById("clearPickerSearchEmptyBtn");
        if (clearPickerSearchEmptyBtn) {
            clearPickerSearchEmptyBtn.addEventListener("click", () => {
                searchInput.value = "";
                this.filterPicker("");
                searchInput.focus();
            });
        }
    }


    // 💎 Jeweler: Grid Keyboard Navigation
    const pickerGrid = document.getElementById("pickerGrid");
    if (pickerGrid) {
        pickerGrid.addEventListener("keydown", (e) => this.handleGridKeydown(e));
    }
  }

  openPicker(slotKey, currentAgent) {
    this.activePickerSlot = slotKey;
    const modal = document.getElementById("agentPickerModal");
    const grid = document.getElementById("pickerGrid");
    const searchInput = document.getElementById("pickerSearch");

    if (!modal || !grid) {
        console.error("Picker modal or grid not found");
        return;
    }

    // Reset Search
    if (searchInput) searchInput.value = "";

    // Hide empty state initially
    const emptyState = document.getElementById("pickerEmptyState");
    if (emptyState) emptyState.hidden = true;

    // Populate Grid
    grid.innerHTML = "";
    this.compiler.baseAgents.forEach((agent, index) => {
        const item = document.createElement("div");
        item.className = "mini-agent-card pop-in";
        item.style.animationDelay = `${Math.min(index * 30, 300)}ms`;

        item.setAttribute("role", "option");
        // 💎 Jeweler: Roving Tabindex - Only first item is focusable initially
        item.setAttribute("tabindex", index === 0 ? "0" : "-1");
        item.setAttribute("data-name", agent.name.toLowerCase()); // For filtering

        // Check if agent is currently selected in THIS slot
        const isCurrent = currentAgent && currentAgent.name === agent.name;
        if (isCurrent) {
            item.classList.add("selected");
            item.setAttribute("aria-selected", "true");
        }

        item.innerHTML = `
            <span class="mini-icon">${agent.icon}</span>
            <span class="mini-name">${agent.name}</span>
            <span class="mini-role">${agent.role}</span>
        `;

        item.addEventListener("click", () => {
             if (this.activePickerSlot && this.onSelection) {
                this.onSelection(this.activePickerSlot, agent);
             }
             this.closePicker();
        });
        // Keydown handled by grid container

        grid.appendChild(item);
    });

    // 🏁 Pacesetter: Pre-compute DOM elements and instantiate Fuse ONCE per picker open
    // This prevents re-mapping the entire DOM and re-building the index on every keystroke
    const items = grid.querySelectorAll(".mini-agent-card");
    const data = Array.from(items).map(item => ({
        el: item,
        name: item.getAttribute("data-name")
    }));
    this.pickerFuse = new Fuse(data, {
        keys: ["name"],
        threshold: 0.4
    });

    modal.showModal();
    modal.setAttribute("open", "");

    // Focus search
    if (searchInput) searchInput.focus();
  }

  closePicker() {
      const slotKey = this.activePickerSlot;
      const modal = document.getElementById("agentPickerModal");
      if (modal) {
          modal.close();
      }
      this.activePickerSlot = null;

      // Return focus to trigger
      if (slotKey) {
          const btn = document.getElementById(slotKey + "Card");
          // Palette+: Wrap in timeout to ensure modal teardown doesn't interfere
          setTimeout(() => {
              if (btn) btn.focus();
          }, 50);
      }
  }

  filterPicker(query) {
      const term = query.trim();
      const items = document.querySelectorAll(".mini-agent-card");
      let visibleCount = 0;
      let firstVisible = null;

      if (!term) {
          items.forEach(item => {
              item.style.display = "flex";
              if (!firstVisible) firstVisible = item;
              visibleCount++;
              item.setAttribute("tabindex", "-1"); // Reset all
          });
      } else {
          // 🏁 Pacesetter: Use the pre-computed Fuse instance instead of mapping DOM elements
          // and re-instantiating the search index on every single keystroke.
          const results = this.pickerFuse ? this.pickerFuse.search(term) : [];

          items.forEach(item => {
              item.style.display = "none";
              item.setAttribute("tabindex", "-1"); // Reset all
          });

          results.forEach(result => {
              const item = result.item.el;
              item.style.display = "flex";
              if (!firstVisible) firstVisible = item;
              visibleCount++;
          });
      }

      // 💎 Jeweler: Reset Roving Tabindex to first result
      if (firstVisible) {
          firstVisible.setAttribute("tabindex", "0");
      }

      // 💎 Jeweler: Live Region Announcement
      const announcer = document.getElementById("pickerAnnouncer");
      if (announcer) {
          announcer.innerText = `${visibleCount} protocols found`;
      }

      const emptyState = document.getElementById("pickerEmptyState");
      if (emptyState) {
          emptyState.hidden = visibleCount > 0;
      }
  }

  handleGridKeydown(e) {
      const target = e.target;
      if (!target.classList.contains("mini-agent-card")) return;

      const items = Array.from(document.querySelectorAll(".mini-agent-card")).filter(
          (el) => el.style.display !== "none"
      );
      const index = items.indexOf(target);

      let newIndex = index;

      switch (e.key) {
          case "ArrowRight":
          case "ArrowDown": // Simple grid navigation: next item
              newIndex = index + 1;
              if (newIndex >= items.length) newIndex = 0;
              e.preventDefault();
              break;
          case "ArrowLeft":
          case "ArrowUp": // Simple grid navigation: prev item
              newIndex = index - 1;
              if (newIndex < 0) newIndex = items.length - 1;
              e.preventDefault();
              break;
          case "Home":
              newIndex = 0;
              e.preventDefault();
              break;
          case "End":
              newIndex = items.length - 1;
              e.preventDefault();
              break;
          case "Enter":
          case " ":
              e.preventDefault();
              // Trigger click logic
              target.click();
              return;
          default:
              return;
      }

      // Apply Roving Tabindex
      if (newIndex !== index) {
          items[index].setAttribute("tabindex", "-1");
          const newFocus = items[newIndex];
          newFocus.setAttribute("tabindex", "0");
          newFocus.focus();
      }
  }

  renderSlots(state) {
    const updateSlotUI = (slotId, agent) => {
        const card = document.getElementById(slotId + "Card");
        if (!card) return;

        const content = card.querySelector(".slot-content");

        if (agent) {
            card.classList.remove("empty");
            card.classList.add("filled");
            card.setAttribute("aria-label", `Selected: ${agent.name}. Click to change.`);
            content.innerHTML = `
                <span class="slot-icon-placeholder">${agent.icon}</span>
                <span class="slot-label">${agent.name}</span>
            `;
        } else {
            card.classList.add("empty");
            card.classList.remove("filled");
            card.setAttribute("aria-label", slotId === "slotA" ? "Initiate Primary Protocol" : "Initiate Secondary Protocol");
            content.innerHTML = `
                <span class="slot-icon-placeholder">+</span>
                <span class="slot-label">${slotId === "slotA" ? "Initiate Primary Protocol" : "Initiate Secondary Protocol"}</span>
            `;
        }
    };

    updateSlotUI("slotA", state.slotA);
    updateSlotUI("slotB", state.slotB);
  }
}
