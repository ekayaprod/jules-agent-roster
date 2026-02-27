class FusionPicker {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.activeSlot = null;
    this.modal = document.getElementById("agentPickerModal");
    this.grid = document.getElementById("pickerGrid");
    this.searchInput = document.getElementById("pickerSearch");
    this.closeBtn = document.getElementById("closePickerBtn");
    this.announcer = document.getElementById("pickerAnnouncer");
    this.emptyState = document.getElementById("pickerEmptyState");

    this.bindEvents();
  }

  bindEvents() {
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    if (this.searchInput) {
      // ⚡ Bolt+: Debounce picker search
      const debouncedFilter = PerformanceUtils.debounce((query) => {
        this.filter(query);
      }, 300);
      this.searchInput.addEventListener("input", (e) =>
        debouncedFilter(e.target.value),
      );
    }

    if (this.grid) {
      this.grid.addEventListener("keydown", (e) => this.handleKeydown(e));
    }
  }

  open(slotKey, agents, currentAgent, otherAgent) {
    this.activeSlot = slotKey;

    if (!this.modal || !this.grid) {
      console.error("Picker modal or grid not found");
      return;
    }

    // Reset Search
    if (this.searchInput) this.searchInput.value = "";

    // Hide empty state initially
    if (this.emptyState) this.emptyState.hidden = true;

    // Populate Grid
    this.renderGrid(agents, currentAgent, otherAgent);

    this.modal.style.display = 'flex'; // Ensure flex layout for modal
    this.modal.showModal();
    // Some browsers/polyfills might need this to style ::backdrop or ensuring open state
    this.modal.setAttribute("open", "");

    // Focus search
    if (this.searchInput) this.searchInput.focus();
  }

  close() {
    const slotKey = this.activeSlot;
    if (this.modal) {
      this.modal.close();
      this.modal.style.display = ''; // Reset display style
      this.modal.removeAttribute("open"); // Clean up attribute
    }
    this.activeSlot = null;

    // Return focus to trigger
    if (slotKey) {
      const btn = document.getElementById(slotKey + "Card");
      // Palette+: Wrap in timeout to ensure modal teardown doesn't interfere
      setTimeout(() => {
        if (btn) btn.focus();
      }, 50);
    }
  }

  renderGrid(agents, currentAgent, otherAgent) {
    this.grid.innerHTML = "";
    agents.forEach((agent, index) => {
      const item = document.createElement("div");
      item.className = "mini-agent-card pop-in";
      item.style.animationDelay = `${Math.min(index * 30, 300)}ms`;

      item.setAttribute("role", "option");
      // 💎 Jeweler: Roving Tabindex - Only first item is focusable initially
      item.setAttribute("tabindex", index === 0 ? "0" : "-1");
      item.setAttribute("data-name", agent.name.toLowerCase()); // For filtering

      // Check if agent is already selected in the OTHER slot
      const isOther = otherAgent && otherAgent.name === agent.name;
      if (isOther) {
        item.classList.add("disabled");
        item.setAttribute("aria-disabled", "true");
        item.title = "Protocol already active in opposing slot.";
      }

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

      if (!isOther) {
        item.addEventListener("click", () => {
          if (this.onSelect) this.onSelect(this.activeSlot, agent);
          this.close();
        });
      }

      this.grid.appendChild(item);
    });
  }

  filter(query) {
    const term = query.toLowerCase();
    const items = this.grid.querySelectorAll(".mini-agent-card");
    let visibleCount = 0;
    let firstVisible = null;

    items.forEach((item) => {
      const name = item.getAttribute("data-name");
      const match = name.includes(term);
      if (match) {
        item.style.display = "flex";
        if (!firstVisible) firstVisible = item;
        visibleCount++;
      } else {
        item.style.display = "none";
      }
      item.setAttribute("tabindex", "-1"); // Reset all
    });

    // 💎 Jeweler: Reset Roving Tabindex to first result
    if (firstVisible) {
      firstVisible.setAttribute("tabindex", "0");
    }

    // 💎 Jeweler: Live Region Announcement
    if (this.announcer) {
      this.announcer.innerText = `${visibleCount} protocols found`;
    }

    if (this.emptyState) {
      this.emptyState.hidden = visibleCount > 0;
    }
  }

  handleKeydown(e) {
    const target = e.target;
    if (!target.classList.contains("mini-agent-card")) return;

    const items = Array.from(
      this.grid.querySelectorAll(".mini-agent-card"),
    ).filter((el) => el.style.display !== "none");
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
}
