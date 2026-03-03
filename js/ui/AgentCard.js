/**
 * Component responsible for rendering individual agent cards as 3D interactive flip-cards.
 */
class AgentCard {
    static getPromptHtml(agent) {
        const parsed = PromptParser.parsePrompt(agent.prompt || "No protocol data available.");
        let promptHtml = '';

        if (parsed.format === 'legacy') {
            promptHtml = `<div class="details-content">${agent.prompt}</div>`;
        } else if (typeof PromptRenderer !== 'undefined') {
            const structuredHtml = PromptRenderer.renderXml(parsed);
            promptHtml = `<div class="details-content">${structuredHtml || agent.prompt}</div>`;
        } else {
            promptHtml = `<div class="details-content">${agent.prompt}</div>`;
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
        const desc = FormatUtils.escapeHTML(agent.desc || agent.description || '');
        const safeDisplayName = FormatUtils.escapeHTML(displayName);

        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="emoji-hero">${icon}</div>
                    <div class="title-group">
                        <h3 class="agent-title">${safeDisplayName}</h3>
                        <span class="role-tag">${role}</span>
                    </div>
                    <div class="tag-container justify-center mt-2">${tags}</div>
                    <div class="description mt-3">${desc}</div>
                    <div class="flip-hint mt-auto text-secondary text-xs">Tap to view protocol ↺</div>
                </div>

                <div class="flip-card-back">
                    <div class="back-header">
                        <h3 class="agent-title text-sm truncate">${safeDisplayName}</h3>
                        <button class="icon-btn flip-back-btn" aria-label="Flip back">✕</button>
                    </div>
                    <div class="prompt-scroll-area" id="prompt-content-${index}"></div>
                    
                    <div class="card-actions mt-auto pt-2 flex">
                        <button class="secondary action-main-btn" data-action="copy-agent" data-index="${index}" style="border-top-right-radius: 0; border-bottom-right-radius: 0; flex-grow: 1;">
                            <span class="btn-text">Copy</span>
                        </button>
                        <button class="secondary action-toggle-btn px-2" aria-label="Toggle action" style="border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 1px solid rgba(0,0,0,0.2);">
                            ▼
                        </button>
                    </div>
                </div>
            </div>
        `;

        const front = card.querySelector('.flip-card-front');
        const backBtn = card.querySelector('.back-header');
        const toggleBtn = card.querySelector('.action-toggle-btn');
        const mainBtn = card.querySelector('.action-main-btn');
        const btnText = card.querySelector('.btn-text');

        front.addEventListener('click', () => {
            const safeIndex = CSS.escape(String(index));
            const promptArea = card.querySelector(`#prompt-content-${safeIndex}`);
            if (promptArea && !promptArea.innerHTML.trim()) {
                promptArea.innerHTML = AgentCard.getPromptHtml(agent);
            }
            card.classList.add('flipped');
        });

        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.remove('flipped');
        });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mainBtn.dataset.action === "copy-agent") {
                mainBtn.dataset.action = "download-agent";
                btnText.innerText = "Download";
            } else {
                mainBtn.dataset.action = "copy-agent";
                btnText.innerText = "Copy";
            }
        });

        return card;
    }
}
