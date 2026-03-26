/**
 * Component responsible for rendering individual agent cards as 3D interactive flip-cards.
 * @see ../../../docs/architecture/UI/AgentCard.md#agentcard-architecture for DOM structure and event delegation details.
 */
class AgentCard {
    static ANIMATION_DELAY_STEP_MS = 30;
    static ANIMATION_DELAY_MAX_MS = 600;

    /**
     * Lazily generates the DOM nodes for the back of the card (the prompt preview).
     * Renders the raw agent prompt as a preformatted block.
     * @param {Object} agent - The agent data object containing the prompt string.
     * @returns {HTMLElement} The HTML element representing the raw prompt.
     * @see ../../../docs/architecture/UI/AgentCard.md#agentcard-architecture for DOM structure and generation details.
     */
    static getPromptNode(agent) {
        return DOMUtils.createMarkdownPreBlock(agent.prompt || "No protocol data available.");
    }

    /**
     * Generates the complete HTML element for a 3D flip-card.
     * Does not attach inner loop event listeners; relies on parent container delegation.
     * Autonomously adjusts its primary action button depending on the global repository selection state.
     * @param {Object} agent - The complete agent data object containing core metadata (tier, scope, role, etc.).
     * @param {string|number} index - The unique identifier or array index of the agent.
     * @param {number} globalIndex - The global render index used to calculate cascading animation delays.
     * @returns {HTMLElement} The fully constructed DOM element for the card, ready for virtual insertion.
     * @see ../../../docs/architecture/UI/AgentCard.md#agentcard-architecture for DOM structure, render throttling, and event delegation patterns.
     */
    static create(agent, index, globalIndex) {
        const card = document.createElement("div");
        card.className = "card flip-card pop-in";
        card.style.animationDelay = `${Math.min(globalIndex * AgentCard.ANIMATION_DELAY_STEP_MS, AgentCard.ANIMATION_DELAY_MAX_MS)}ms`;

        if (agent.type === "plus") card.classList.add("plus-agent");
        if (agent.type === "monthly") card.classList.add("monthly-agent");
        
        let tags = "";
        if (agent.scope) {
            let scopeClass = "scope-medium";
            if (agent.scope.includes("Small")) scopeClass = "scope-small";
            if (agent.scope.includes("Large")) scopeClass = "scope-large";
            tags += `<span class="meta-tag ${scopeClass}">${agent.scope}</span>`;
        }

        if (agent.tier) {
            const lowerTier = agent.tier.toLowerCase();
            tags += `<span class="meta-tag tier-badge tier-${lowerTier}">${agent.tier}</span>`;
            card.classList.add(`tier-${lowerTier}`);
        }

        const icon = FormatUtils.extractIcon(agent);
        const displayName = FormatUtils.extractDisplayName(agent);

        const role = FormatUtils.escapeHTML(agent.role || 'Fusion Protocol');
        const desc = FormatUtils.escapeHTML(agent.short_description || agent.desc || agent.description || '');
        const safeDisplayName = FormatUtils.escapeHTML(displayName);

        const isPinned = window.rosterApp && window.rosterApp.pinnedManager && window.rosterApp.pinnedManager.isPinned(index);
        const pinClass = isPinned ? 'pinned' : '';
        const pinHtml = isNaN(index) ? `<button class="icon-btn pin-btn ${pinClass}" data-action="toggle-pin" data-index="${index}" aria-label="Toggle Pin" >📌</button>` : '';

        // Splay Out Child Fusions Logic (Refactored to Modal Trigger)
        let fusionQuickListHtml = '';
        if (!isNaN(index) && window.rosterApp && window.rosterApp.fusionLab && window.rosterApp.fusionLab.fusionIndex) {
            const unlockedKeys = window.rosterApp.fusionLab.fusionIndex.unlockedKeys;

            // ↗️ VECTORIZE: The Single-Pass Pipeline. We bypass Array.from().filter() wrapper allocations for a direct loop.
            const childKeys = [];
            for (const key of unlockedKeys) {
                if (key.includes(agent.name)) childKeys.push(key);
            }

            if (childKeys.length > 0) {
                fusionQuickListHtml = `<div class="fusions-hint" data-action="open-fusions-modal" data-index="${index}" aria-label="View Available Fusions" title="View Available Fusions" role="button" tabindex="0">▼</div>`;
            }
        }

        const repoPicker = document.getElementById("julesRepoPicker");
        const isRepoSelected = repoPicker && repoPicker.value !== "";

        const primaryAction = isRepoSelected ? "launch-jules" : "copy-agent";
        const primaryTitle = isRepoSelected ? "Launch agent via Jules API" : "Copy agent prompt";
        const primaryText = isRepoSelected ? "Launch in Jules 🚀" : "📋 Copy Prompt";

        const dropdownAction = isRepoSelected ? "copy-agent" : "launch-jules";
        const dropdownText = isRepoSelected ? "📋 Copy Prompt" : "Launch in Jules 🚀";

        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front" data-action="flip-card" data-index="${index}">
                    ${pinHtml}
                    <div class="front-content-wrapper">
                        <div class="card-top">
                            <div class="card-top-left">
                                <div class="emoji-hero">${icon}</div>
                            </div>
                            <div class="card-top-right">
                                <div class="title-group">
                                    <h3 class="agent-title">${safeDisplayName}</h3>
                                    <span class="role-tag">${role}</span>
                                </div>
                                <div class="tag-container mt-2">${tags}</div>
                            </div>
                        </div>
                        <div class="description mt-3">${desc}</div>
                    </div>
                    ${fusionQuickListHtml}
                    <div class="flip-hint" aria-label="Tap to view protocol" >↺</div>
                </div>

                <div class="flip-card-back" data-action="flip-card-back">
                    <div class="flip-hint" aria-label="Tap to view front" >↺</div>
                    <div class="prompt-scroll-area" id="prompt-content-${index}"></div>
                    
                    <div class="card-actions mt-auto pt-2 flex relative">
                        <button class="secondary action-main-btn" data-action="${primaryAction}" data-index="${index}" title="${primaryTitle}" aria-label="${primaryTitle}">
                            <span class="btn-text">${primaryText}</span>
                        </button>
                        <button class="secondary action-toggle-btn" data-action="toggle-card-dropdown" data-index="${index}" aria-label="More options" aria-haspopup="menu" aria-expanded="false" aria-controls="card-dropdown-${index}">
                            ▼
                        </button>
                        
                        <!-- Custom Agent Dropdown -->
                        <div class="dropdown-menu" id="card-dropdown-${index}" role="menu">
                            <button class="dropdown-item" data-action="${dropdownAction}" data-index="${index}" role="menuitem" aria-label="${dropdownText.replace(/[^a-zA-Z\\s]/g, '').trim()}">${dropdownText}</button>
                            <button class="dropdown-item" data-action="download-agent" data-index="${index}" role="menuitem" aria-label="Download Protocol as Markdown">💾 Download .md</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return card;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentCard;
}