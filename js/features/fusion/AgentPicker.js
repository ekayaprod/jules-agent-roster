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
        this.currentAgent = null;
        this.focusedIndex = 0;
        this.filteredResults = [];
        this.elements = {};

        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.elements.agentPickerModal = document.getElementById("agentPickerModal");
        this.elements.closePickerBtn = document.getElementById("closePickerBtn");
        this.elements.pickerSearch = document.getElementById("pickerSearch");
        this.elements.pickerScrollArea = document.getElementById("pickerScrollArea");
        this.elements.pickerGrid = document.getElementById("pickerGrid");
        this.elements.pickerEmptyState = document.getElementById("pickerEmptyState");
        this.elements.clearPickerSearchEmptyBtn = document.getElementById("clearPickerSearchEmptyBtn");
        this.elements.pickerAnnouncer = document.getElementById("pickerAnnouncer");
    }

    bindEvents() {
        const modal = this.elements.agentPickerModal;
        const closeBtn = this.elements.closePickerBtn;
        const searchInput = this.elements.pickerSearch;

        if (modal) {
            // Close on backdrop click
            modal.addEventListener("click", (e) => {
                if (e.target === modal) this.closePicker();
            });
        }
        if (closeBtn) closeBtn.addEventListener("click", () => this.closePicker());

        // 🪧 Wayfinder: Handle browser back button to close modal instead of leaving page
        if (typeof window !== 'undefined') {
            window.addEventListener("popstate", (e) => {
                if (this.activePickerSlot) {
                    // The user clicked "Back" while the modal was open.
                    // We close the picker but tell it NOT to call history.back() again,
                    // because the browser has already popped the state.
                    this.closePicker(false);
                }
            });
        }
        if (searchInput) {
            // ⚡ Bolt+: Debounce picker search
            const debouncedFilter = PerformanceUtils.debounce((query) => {
                this.filterPicker(query);
            }, 300);
            searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));

            const clearPickerSearchEmptyBtn = this.elements.clearPickerSearchEmptyBtn;
            if (clearPickerSearchEmptyBtn) {
                clearPickerSearchEmptyBtn.addEventListener("click", () => {
                    searchInput.value = "";
                    this.filterPicker("");
                });
            }
        }

        // 💎 Jeweler: Grid Keyboard Navigation
        // Ensure event delegation catches events bubbled from clusterize
        const pickerScrollArea = this.elements.pickerScrollArea;
        if (pickerScrollArea) {
            pickerScrollArea.addEventListener("keydown", (e) => this.handleGridKeydown(e));

            // Global event delegation for memoized/virtualized grid items
            pickerScrollArea.addEventListener("click", (e) => {
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
     * Retrieves the memoized HTML strings for the base agents.
     * Uses Clusterize.js to virtualize DOM nodes and avoid main-thread blocking.
     */
    getMemoizedHtml(itemsToRender) {
        if (!this.cachedHtmlStrings) {
            this.cachedHtmlStrings = [];
            this.baseAgents.forEach((agent, index) => {
                const delay = Math.min(index * 30, 300);
                const htmlStr = `
                <div class="mini-agent-card pop-in" style="animation-delay: ${delay}ms; display: flex;" role="option" tabindex="-1" data-name="${agent.name.toLowerCase()}">
                    <span class="mini-icon">${agent.emoji}</span>
                    <span class="mini-name">${agent.name}</span>
                    <span class="mini-role">${agent.role}</span>
                </div>`;
                this.cachedHtmlStrings.push({ html: htmlStr, name: agent.name.toLowerCase(), agent: agent });
            });

            this.pickerFuse = new Fuse(this.cachedHtmlStrings, {
                keys: ["name"],
                threshold: 0.4
            });
        }

        if (!itemsToRender) itemsToRender = this.cachedHtmlStrings;

        return itemsToRender.map((item, index) => {
            let renderedHtml = item.html;
            const isCurrent = this.currentAgent && this.currentAgent.name.toLowerCase() === item.name;

            if (isCurrent) {
                renderedHtml = renderedHtml.replace('class="mini-agent-card pop-in"', 'class="mini-agent-card pop-in selected" aria-selected="true"');
            }

            if (index === this.focusedIndex) {
                renderedHtml = renderedHtml.replace('tabindex="-1"', 'tabindex="0"');
                // Auto-focus class is injected but actual focus depends on keyboard event handling
                renderedHtml = renderedHtml.replace('class="mini-agent-card', 'class="mini-agent-card is-focused');
            }

            return renderedHtml;
        });
    }

    /**
     * Chunk array into a 2D array representing rows, based on calculated columns.
     * This makes Clusterize.js compatible with CSS Grid layout.
     */
    getChunkedHtml(htmlResults) {
        const scrollArea = this.elements.pickerScrollArea;
        let columns = 1;

        if (scrollArea && scrollArea.clientWidth > 0) {
            // CSS Grid uses minmax(120px, 1fr) with 8px gap
            const availableWidth = scrollArea.clientWidth - 48; // account for padding (1.5rem * 2)
            columns = Math.max(1, Math.floor((availableWidth + 8) / (120 + 8)));
        } else {
            // Fallback for purely hidden modal or unit test environments
            columns = 4;
        }

        const chunked = [];
        const templateCols = `repeat(${columns}, 1fr)`;
        for (let i = 0; i < htmlResults.length; i += columns) {
            const rowChunk = htmlResults.slice(i, i + columns).join("");
            chunked.push(`<div style="display: grid; grid-template-columns: ${templateCols}; gap: 0.5rem; margin-bottom: 0.5rem;">${rowChunk}</div>`);
        }

        return chunked;
    }

    /**
     * Updates the Clusterize instance and handles DOM focus synchronization.
     */
    updateGrid() {
        const htmlResults = this.getMemoizedHtml(this.filteredResults);
        const chunkedRows = this.getChunkedHtml(htmlResults);

        if (!this.pickerClusterize) {
            this.pickerClusterize = new Clusterize({
                rows: chunkedRows,
                scrollId: 'pickerScrollArea',
                contentId: 'pickerGrid'
            });

            // Re-calculate chunks if window resizes to ensure grid alignment
            if (typeof window !== 'undefined') {
                window.addEventListener('resize', PerformanceUtils.debounce(() => {
                    if (this.activePickerSlot) this.updateGrid();
                }, 300));
            }
        } else {
            this.pickerClusterize.update(chunkedRows);
        }

        // We do NOT call el.focus() here because updateGrid is called by the search filter.
        // Stealing focus here would rip the cursor out of the search input while the user is typing.
        // Visual focus (.is-focused) is handled via getMemoizedHtml string replacement.
    }

    /**
     * Opens the agent picker modal for a specific slot.
     * @param {string} slotKey - "slotA" or "slotB"
     * @param {Object} currentAgent - Currently selected agent in this slot
     */
    openPicker(slotKey, currentAgent) {
        this.activePickerSlot = slotKey;
        this.currentAgent = currentAgent;
        const modal = this.elements.agentPickerModal;
        const grid = this.elements.pickerGrid;
        const searchInput = this.elements.pickerSearch;

        if (!modal || !grid) {
            console.error("Picker modal or grid not found");
            return;
        }

        // Reset Search
        if (searchInput) searchInput.value = "";

        // Hide empty state initially
        const emptyState = this.elements.pickerEmptyState;
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

        // 🪧 Wayfinder: Push a history state so the back button can be intercepted
        if (typeof history !== 'undefined' && history.pushState) {
            history.pushState({ modalOpen: true }, "");
        }

        // 🪄 Illusionist: Offload actual DOM generation to avoid main-thread blocking
        requestAnimationFrame(() => {
            setTimeout(() => {
                // Ensure cache is built
                this.getMemoizedHtml(this.cachedHtmlStrings);

                this.filteredResults = this.cachedHtmlStrings;

                // Establish focus index: either selected agent or 0
                this.focusedIndex = 0;
                if (this.currentAgent) {
                    const idx = this.filteredResults.findIndex(item => item.name === this.currentAgent.name.toLowerCase());
                    if (idx !== -1) this.focusedIndex = idx;
                }

                grid.innerHTML = "";
                this.updateGrid();

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
     * @param {boolean} navigateBack - Whether to call history.back() to clean up the pushed state.
     */
    closePicker(navigateBack = true) {
        const slotKey = this.activePickerSlot;
        const modal = this.elements.agentPickerModal;

        if (this.activePickerSlot && navigateBack && typeof history !== 'undefined' && history.state && history.state.modalOpen) {
            history.back();
        }

        if (modal) {
            modal.close();
            modal.removeAttribute("open");
        }
        this.activePickerSlot = null;
        this.pickerFuse = null; // Free memory
        this.currentAgent = null;

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
        let visibleCount = 0;

        if (!term) {
            this.filteredResults = this.cachedHtmlStrings;
        } else {
            // 🏁 Pacesetter: Use the pre-computed Fuse instance
            const results = this.pickerFuse ? this.pickerFuse.search(term) : [];
            this.filteredResults = results.map(result => result.item);
        }

        visibleCount = this.filteredResults.length;

        // Reset focus on search
        this.focusedIndex = 0;

        this.updateGrid();

        // 💎 Jeweler: Live Region Announcement
        const announcer = this.elements.pickerAnnouncer;
        if (announcer) {
            announcer.innerText = `${visibleCount} protocols found`;
        }

        const emptyState = this.elements.pickerEmptyState;
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? "flex" : "none";
        }
    }

    /**
     * Handles keyboard navigation within the grid (Roving Tabindex)
     */
    handleGridKeydown(e) {
        if (this.filteredResults.length === 0) return;

        let newIndex = this.focusedIndex;

        switch (e.key) {
            case "ArrowRight":
            case "ArrowDown": // Simple grid navigation: next item
                newIndex = this.focusedIndex + 1;
                if (newIndex >= this.filteredResults.length) newIndex = 0;
                e.preventDefault();
                break;
            case "ArrowLeft":
            case "ArrowUp": // Simple grid navigation: prev item
                newIndex = this.focusedIndex - 1;
                if (newIndex < 0) newIndex = this.filteredResults.length - 1;
                e.preventDefault();
                break;
            case "Home":
                newIndex = 0;
                e.preventDefault();
                break;
            case "End":
                newIndex = this.filteredResults.length - 1;
                e.preventDefault();
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                // Trigger click logic
                const focusedItem = this.filteredResults[this.focusedIndex];
                if (focusedItem) {
                    const agent = this.baseAgents.find(a => a.name.toLowerCase() === focusedItem.name);
                    if (agent) this.handlePickerSelection(agent);
                }
                return;
            default:
                return;
        }

        // Update active index and re-render the view
        if (newIndex !== this.focusedIndex) {
            this.focusedIndex = newIndex;

            // Try to find the new element in the DOM
            const newFocusedItem = this.filteredResults[newIndex];
            const el = document.querySelector(`#pickerGrid .mini-agent-card[data-name="${newFocusedItem.name}"]`);

            if (el) {
                // If it's already in the DOM, simply move focus without a full Clusterize re-render
                document.querySelectorAll('#pickerGrid .mini-agent-card.is-focused').forEach(node => {
                    node.classList.remove('is-focused');
                    node.setAttribute('tabindex', '-1');
                });
                el.classList.add('is-focused');
                el.setAttribute('tabindex', '0');
                el.focus();

                // Ensure it's scrolled into view smoothly
                el.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } else {
                // If it's off-screen and missing from DOM, trigger a full re-render
                // Clusterize will pick it up when we force scroll
                this.updateGrid();

                setTimeout(() => {
                    // Try to scroll the scrollArea to approximate position based on index height
                    const scrollArea = this.elements.pickerScrollArea;
                    if (scrollArea) {
                        // Assuming grid cards are ~80px height including gap, and say 4 columns wide
                        const cols = Math.floor(scrollArea.clientWidth / 120) || 1;
                        const row = Math.floor(newIndex / cols);
                        scrollArea.scrollTop = row * 80; // approximate
                    }

                    // After scrolling, Clusterize generates DOM, then focus it
                    setTimeout(() => {
                        const newEl = document.querySelector(`#pickerGrid .mini-agent-card[data-name="${newFocusedItem.name}"]`);
                        if (newEl) newEl.focus();
                    }, 50);
                }, 0);
            }
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
