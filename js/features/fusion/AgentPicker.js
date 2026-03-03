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
        }
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

        // Populate Grid
        grid.innerHTML = "";
        // 🪄 Illusionist: Mask latency with luxurious CSS loading skeletons
        for (let i = 0; i < 20; i++) {
            const skeleton = document.createElement("div");
            skeleton.className = "mini-skeleton-card skeleton-pulse";
            skeleton.setAttribute("aria-hidden", "true");
            grid.appendChild(skeleton);
        }

        // Cancel any previous renders
        const currentRenderId = Symbol();
        this.currentRenderId = currentRenderId;

        const CHUNK_SIZE = 25;
        let agentIndex = 0;

        // 🏁 Pacesetter: Initialize Fuse immediately with the raw data so it's ready for fast typers
        const fuseData = this.baseAgents.map((agent) => ({
            name: agent.name.toLowerCase(),
            agent: agent
        }));
        this.pickerFuse = new Fuse(fuseData, {
            keys: ["name"],
            threshold: 0.4
        });

        // Map to keep track of generated elements for quick lookup during search
        this.renderedElementsMap = new Map();

        const renderChunk = () => {
            if (this.currentRenderId !== currentRenderId) return; // Cancelled

            const end = Math.min(agentIndex + CHUNK_SIZE, this.baseAgents.length);
            const fragment = document.createDocumentFragment();

            for (let i = agentIndex; i < end; i++) {
                const agent = this.baseAgents[i];
                const item = document.createElement("div");
                item.className = "mini-agent-card pop-in";
                item.style.animationDelay = `${Math.min((i % CHUNK_SIZE) * 30, 300)}ms`;

                item.setAttribute("role", "option");
                // 💎 Jeweler: Roving Tabindex - Only first item is focusable initially
                item.setAttribute("tabindex", i === 0 ? "0" : "-1");
                item.setAttribute("data-name", agent.name.toLowerCase()); // For filtering

                // Check if agent is currently selected in THIS slot
                const isCurrent = currentAgent && currentAgent.name === agent.name;
                if (isCurrent) {
                    item.classList.add("selected");
                    item.setAttribute("aria-selected", "true");
                }

                item.innerHTML = `
                    <span class="mini-icon">${agent.emoji}</span>
                    <span class="mini-name">${agent.name}</span>
                    <span class="mini-role">${agent.role}</span>
                `;

                item.addEventListener("click", () => this.handlePickerSelection(agent));
                // Keydown handled by grid container

                fragment.appendChild(item);
                this.renderedElementsMap.set(agent.name.toLowerCase(), item);
            }

            agentIndex = end;

            // Yield to main thread, append current chunk, and clear initial skeletons if this is the first chunk
            requestAnimationFrame(() => {
                if (this.currentRenderId !== currentRenderId) return;

                if (agentIndex === CHUNK_SIZE) {
                    // First chunk: remove all skeletons
                    grid.innerHTML = "";
                }

                grid.appendChild(fragment);

                if (agentIndex < this.baseAgents.length) {
                    // Schedule next chunk
                    setTimeout(renderChunk, 0);
                } else {
                    // Render finished
                    // If the user started searching during render, apply the current filter
                    if (searchInput && searchInput.value) {
                        this.filterPicker(searchInput.value);
                    }
                }
            });
        };

        // Start rendering chunks
        requestAnimationFrame(() => {
            setTimeout(renderChunk, 0);
        });

        modal.showModal();
        modal.setAttribute("open", "");

        // Focus search input on open for immediate typing
        if (searchInput) {
            // Slight delay to ensure modal transition completes before focusing
            // to avoid sudden scroll jumps on mobile
            setTimeout(() => {
                searchInput.focus();
            }, 50);
        }
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
        if (this.renderedElementsMap) {
            this.renderedElementsMap.clear();
        }

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
                // We use the renderedElementsMap to find the element
                const item = this.renderedElementsMap.get(result.item.name);
                if (item) {
                    item.style.display = "flex";
                    if (!firstVisible) firstVisible = item;
                    visibleCount++;
                }
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
