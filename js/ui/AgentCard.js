/**
 * Component responsible for rendering individual agent cards as 3D interactive flip-cards.
 */
class AgentCard {
    static getPromptHtml(agent) {
        const parsed = PromptParser.parsePrompt(agent.prompt || "No protocol data available.");
        let promptHtml = '';

        if (parsed.format === 'legacy') {
            promptHtml = `<div class="details-content">${FormatUtils.escapeHTML(agent.prompt)}</div>`;
        } else if (typeof PromptRenderer !== 'undefined') {
            const structuredHtml = PromptRenderer.renderXml(parsed);
            promptHtml = `<div class="details-content">${structuredHtml || FormatUtils.escapeHTML(agent.prompt)}</div>`;
        } else {
            promptHtml = `<div class="details-content">${FormatUtils.escapeHTML(agent.prompt)}</div>`;
        }
        return promptHtml;
    }

    static create(agent, index, globalIndex) {
        const card = document.createElement("div");
        card.className = "card flip-card pop-in";
        card.style.animationDelay = `${Math.min(globalIndex * 30, 600)}ms`;

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

        // Fix Fusion Icon Bug: Use centralized utility for icon extraction
        const icon = FormatUtils.extractIcon(agent);
        const displayName = FormatUtils.extractDisplayName(agent);

        const role = FormatUtils.escapeHTML(agent.role || 'Fusion Protocol');
        const desc = FormatUtils.escapeHTML(agent.short_description || agent.desc || agent.description || '');
        const safeDisplayName = FormatUtils.escapeHTML(displayName);

        const isFav = window.rosterApp && window.rosterApp.favoritesManager && window.rosterApp.favoritesManager.isFavorite(index);
        const favIcon = isFav ? '★' : '☆';
        const favClass = isFav ? 'favorited' : '';

        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <button class="icon-btn favorite-btn ${favClass}" data-action="toggle-favorite" data-index="${index}" aria-label="Toggle Favorite" >${favIcon}</button>
                    <div class="front-content-wrapper">
                        <div class="card-top">
                            <div class="card-top-left">
                                <div class="emoji-hero">${icon}</div>
                            </div>
                            <div class="card-top-right">
                                <div class="title-group">
                                    <div class="title-wrapper">
                                        <h3 class="agent-title">${safeDisplayName}</h3>
                                    </div>
                                    <span class="role-tag">${role}</span>
                                </div>
                                <div class="tag-container">${tags}</div>
                            </div>
                        </div>
                        <div class="description">${desc}</div>
                    </div>
                    <div class="flip-hint" aria-label="Tap to view protocol" >↺</div>
                </div>

                <div class="flip-card-back">
                    <div class="back-header">
                        <h3 class="agent-title text-sm truncate">${safeDisplayName}</h3>
                        <button class="icon-btn flip-back-btn" aria-label="Flip back">✕</button>
                    </div>
                    <div class="prompt-scroll-area" id="prompt-content-${index}"></div>
                    
                    <div class="card-actions mt-auto pt-2 flex">
                        <button class="secondary action-main-btn" data-action="copy-agent" data-index="${index}" >
                            <span class="btn-text">Copy</span>
                        </button>
                        <button class="secondary action-toggle-btn px-2" aria-label="Toggle action" >
                            ▼
                        </button>
                    </div>
                </div>
            </div>
        `;

        const front = card.querySelector('.flip-card-front');
        const backBtn = card.querySelector('.back-header');
        const toggleBtn = card.querySelector('.action-toggle-btn');

        // Event delegation moved to RosterApp.js so virtualized cards still work
        // We do NOT add data-action to the front wrapper itself, or it captures everything.
        // Instead, the container just relies on the global listener checking if a click
        // landed inside it. Let's make sure it doesn't intercept the button.
        front.setAttribute('data-action', 'flip-card');
        front.setAttribute('data-index', index);

        backBtn.setAttribute('data-action', 'flip-card-back');
        toggleBtn.setAttribute('data-action', 'toggle-card-action');

        return card;
    }
}
