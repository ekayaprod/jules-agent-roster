const PICKER_CLUSTERIZE_OPTIONS = {
    scrollId: 'pickerScrollArea',
    contentId: 'pickerGrid',
    no_data_text: ''
};

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
        this.currentAgent = null;
        this.focusedIndex = 0;
        this.filteredResults = [];
        this.elements = {};

        // ⚡ Bolt+: Pre-computed dictionary lookup for instant O(1) access instead of O(n) array `.find()` during hot-path selection events.
        this.agentMap = new Map();
        for (let i = 0; i < this.baseAgents.length; i++) {
            const agent = this.baseAgents[i];
            if (agent && agent.name) {
                this.agentMap.set(agent.name.toLowerCase(), agent);
            }
        }

        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.elements.agentPickerModal = document.getElementById("agentPickerModal");
        this.elements.closePickerBtn = document.getElementById("closePickerBtn");
        this.elements.pickerScrollArea = document.getElementById("pickerScrollArea");
        this.elements.pickerGrid = document.getElementById("pickerGrid");
    }

    bindEvents() {
        const modal = this.elements.agentPickerModal;
        const closeBtn = this.elements.closePickerBtn;

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

        // Ensure event delegation catches events bubbled from clusterize
        const pickerScrollArea = this.elements.pickerScrollArea;
        if (pickerScrollArea) {
            // Remove brittle custom roving tabindex logic, replacing with standard focus-trap
            pickerScrollArea.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    const target = e.target.closest(".mini-agent-card");
                    if (target) {
                        e.preventDefault();
                        const agentName = target.getAttribute("data-name");
                        // ⚡ Bolt+: Eliminated O(n) linear search on selection by utilizing the O(1) Map dictionary.
                        const agent = this.agentMap.get(agentName);
                        if (agent) this.handlePickerSelection(agent);
                    }
                }
            });

            // Global event delegation for memoized/virtualized grid items
            pickerScrollArea.addEventListener("click", (e) => {
                const target = e.target.closest(".mini-agent-card");
                if (target) {
                    const agentName = target.getAttribute("data-name");
                    // ⚡ Bolt+: Eliminated O(n) linear search on selection by utilizing the O(1) Map dictionary.
                    const agent = this.agentMap.get(agentName);
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
                <div class="mini-agent-card pop-in" style="animation-delay: ${delay}ms; display: flex;" role="option" tabindex="0" data-name="${FormatUtils.escapeHTML(agent.name.toLowerCase())}">
                    <span class="mini-icon">${FormatUtils.escapeHTML(agent.emoji)}</span>
                    <span class="mini-name">${FormatUtils.escapeHTML(agent.name)}</span>
                    <span class="mini-role">${FormatUtils.escapeHTML(agent.role)}</span>
                </div>`;
                this.cachedHtmlStrings.push({ html: htmlStr, name: agent.name.toLowerCase(), agent: agent });
            });
        }

        if (!itemsToRender) itemsToRender = this.cachedHtmlStrings;

        return itemsToRender.map((item, index) => {
            let renderedHtml = item.html;
            const isCurrent = this.currentAgent && this.currentAgent.name.toLowerCase() === item.name;

            if (isCurrent) {
                renderedHtml = renderedHtml.replace('class="mini-agent-card pop-in"', 'class="mini-agent-card pop-in selected" aria-selected="true"');
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
                ...PICKER_CLUSTERIZE_OPTIONS,
                rows: chunkedRows
            });

            // Re-calculate chunks if window resizes to ensure grid alignment
            if (typeof window !== 'undefined') {
                window.addEventListener('resize', PerformanceUtils.debounce(() => {
                    if (this.activePickerSlot) this.updateGrid();
                }, 300));
            }
        } else {
            this.pickerClusterize.update(chunkedRows);
            this.pickerClusterize.refresh(true);
        }

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

        if (!modal || !grid) {
            console.error("Picker modal or grid not found");
            return;
        }

        // 🪄 Illusionist: Add pure CSS loading skeleton to mask DOM generation latency
        grid.innerHTML = "";
        for (let i = 0; i < 12; i++) {
            const skeleton = DOMUtils.createSkeletonElement("mini-agent-card skeleton-pulse", "4rem");
            grid.appendChild(skeleton);
        }

        modal.showModal();
        modal.setAttribute("open", "");

        // 🪧 Wayfinder: Push a history state so the back button can be intercepted
        if (typeof history !== 'undefined' && history.pushState) {
            history.pushState({ modalOpen: true }, "");
        }

        // Initialize and activate focus-trap
        if (typeof focusTrap !== 'undefined') {
            this.trap = focusTrap.createFocusTrap(modal, {
                escapeDeactivates: false, // Handled by our own close logic if needed, or let focus-trap handle it
                allowOutsideClick: true,
                fallbackFocus: modal
            });
        }

        // 🪄 Illusionist: Offload actual DOM generation to avoid main-thread blocking
        requestAnimationFrame(() => {
            setTimeout(() => {
                // Ensure cache is built
                this.getMemoizedHtml(this.cachedHtmlStrings);

                this.filteredResults = this.cachedHtmlStrings;

                grid.innerHTML = "";
                this.updateGrid();

                // Activate focus trap after the grid DOM is updated
                if (this.trap) {
                    this.trap.activate();
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
        this.currentAgent = null;

        if (this.trap) {
            this.trap.deactivate();
            this.trap = null;
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
