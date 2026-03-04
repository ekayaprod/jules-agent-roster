class AgentPicker {
    /**
     * Initializes the AgentPicker modal.
     * @param {Array} baseAgents - The base agent list to pick from.
     * @param {Function} onSelect - Callback when an agent is selected: (agent) => void
     * @param {Function} getPreMergePreviewHTML - Callback to get pre-merge preview HTML: (selectedAgent) => string|null
     */
    constructor(baseAgents, onSelect, getPreMergePreviewHTML = null) {
        this.baseAgents = baseAgents;
        this.onSelect = onSelect;
        this.getPreMergePreviewHTML = getPreMergePreviewHTML;
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
                });
            }
        }

        // 💎 Jeweler: Grid Keyboard Navigation
        const pickerGrid = document.getElementById("pickerGrid");
        if (pickerGrid) {
            pickerGrid.addEventListener("keydown", (e) => this.handleGridKeydown(e));

            // Global event delegation for memoized/virtualized grid items
            pickerGrid.addEventListener("click", (e) => {
                const target = e.target.closest(".mini-agent-card");
                if (target) {
                    const agentName = target.getAttribute("data-name");
                    const agent = this.baseAgents.find(a => a.name.toLowerCase() === agentName);
                    if (agent) {
                        this.handlePickerSelection(agent);
                    }
                }
            });
        }
    }

    /**
     * Retrieves the memoized DOM structure for the base agents.
     * Uses a single DocumentFragment to avoid unnecessary renders.
     */
    getMemoizedFragment(currentAgent) {
        if (!this.cachedElements) {
            this.cachedElements = [];
            this.baseAgents.forEach((agent, index) => {
                const item = document.createElement("div");
                item.className = "mini-agent-card pop-in";
                item.style.animationDelay = `${Math.min(index * 30, 300)}ms`;

                item.setAttribute("role", "option");
                item.setAttribute("tabindex", "-1");
                item.setAttribute("data-name", agent.name.toLowerCase()); // For filtering

                item.innerHTML = `
                    <span class="mini-icon">${agent.emoji}</span>
                    <span class="mini-name">${agent.name}</span>
                    <span class="mini-role">${agent.role}</span>
                `;
                this.cachedElements.push(item);
            });

            const data = this.cachedElements.map(item => ({
                el: item,
                name: item.getAttribute("data-name")
            }));
            this.pickerFuse = new Fuse(data, {
                keys: ["name"],
                threshold: 0.4
            });
        }

        // Return a fragment containing all cached elements.
        // Appending elements to a fragment removes them from their current parent.
        const fragment = document.createDocumentFragment();
        this.cachedElements.forEach((el, index) => {
            const isCurrent = currentAgent && currentAgent.name.toLowerCase() === el.getAttribute("data-name");
            if (isCurrent) {
                el.classList.add("selected");
                el.setAttribute("aria-selected", "true");
            } else {
                el.classList.remove("selected");
                el.removeAttribute("aria-selected");
            }

            if (index === 0 && !currentAgent) {
                el.setAttribute("tabindex", "0");
            } else if (isCurrent) {
                el.setAttribute("tabindex", "0");
            } else {
                el.setAttribute("tabindex", "-1");
            }

            // Ensure display is flex in case it was hidden by previous search
            el.style.display = "flex";

            fragment.appendChild(el);
        });

        return fragment;
    }

    /**
     * Opens the agent picker modal for a specific slot.
     * @param {string} slotKey - "slotA" or "slotB"
     * @param {Object} currentAgent - Currently selected agent in this slot
     */
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
        if (emptyState) emptyState.style.display = "none";

        // 🪄 Illusionist: Add pure CSS loading skeleton to mask DOM generation latency
        grid.innerHTML = "";
        for (let i = 0; i < 12; i++) {
            const skeleton = document.createElement("div");
            skeleton.className = "mini-agent-card skeleton-pulse";
            skeleton.style.minHeight = "4rem";
            skeleton.setAttribute("aria-hidden", "true");
            grid.appendChild(skeleton);
        }

        modal.showModal();
        modal.setAttribute("open", "");

        // 🪄 Illusionist: Offload actual DOM generation to avoid main-thread blocking
        requestAnimationFrame(() => {
            setTimeout(() => {
                const fragment = this.getMemoizedFragment(currentAgent);
                grid.innerHTML = "";
                grid.appendChild(fragment);

                // Focus search input on open for immediate typing
                if (searchInput) {
                    searchInput.focus();
                }
            }, 0);
        });
    }

    /**
     * Handles selection from the picker.
     */
    handlePickerSelection(agent) {
        if (this.activePickerSlot) {
            this.onSelect(this.activePickerSlot, agent);
            if (this.getPreMergePreviewHTML) {
                this.renderPreMergePreview(agent);
            }
        }
        this.closePicker();
    }

    /**
     * Closes the picker modal.
     */
    closePicker() {
        const slotKey = this.activePickerSlot;
        const modal = document.getElementById("agentPickerModal");
        if (modal) {
            modal.removeAttribute("open");
            setTimeout(() => modal.close(), 50); // small delay for transition
        }
        this.activePickerSlot = null;
        this.pickerFuse = null; // Free memory

        // Return focus to trigger
        if (slotKey) {
            const btn = document.getElementById(slotKey + "Card");
            // Palette+: Wrap in timeout to ensure modal teardown doesn't interfere
            setTimeout(() => {
                if (btn) btn.focus();
            }, 50);
        }
    }

    /**
     * Filters the agent grid in the picker.
     */
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
            // 🏁 Pacesetter: Use the pre-computed Fuse instance
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
            emptyState.style.display = visibleCount === 0 ? "flex" : "none";
        }
    }

    /**
     * Handles keyboard navigation within the grid (Roving Tabindex)
     */
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

    /**
     * Renders the pre-merge "Known Recipe" preview if the resulting agent is already unlocked.
     */
    renderPreMergePreview(selectedAgent) {
        const actionArea = document.querySelector("#fusionLabContent .fusion-action-area");
        if (!actionArea) return;

        let previewEl = document.getElementById("preMergePreview");

        const previewHtml = this.getPreMergePreviewHTML(selectedAgent);

        if (previewHtml) {
            if (!previewEl) {
                previewEl = document.createElement("div");
                previewEl.id = "preMergePreview";
                previewEl.className = "pre-merge-preview";
                actionArea.appendChild(previewEl);
            }
            previewEl.innerHTML = previewHtml;
            previewEl.style.display = "flex";
        } else {
            if (previewEl) previewEl.style.display = "none";
        }
    }
}

// Support CommonJS
if (typeof module !== 'undefined' && module.exports) module.exports = AgentPicker;
