/**
 * Component responsible for rendering individual agent cards as 3D interactive flip-cards.
 */
class AgentCard {
    /**
     * Lazily generates the HTML for the agent's prompt details.
     * @param {Object} agent - The agent data.
     * @returns {string} The HTML string for the prompt details.
     */
    static getPromptHtml(agent) {
        const parsed = PromptParser.parsePrompt(agent.prompt);
        let promptHtml = '';

        if (parsed.format === 'legacy') {
            promptHtml = `<div class="details-content">${agent.prompt}</div>`;
        } else if (typeof PromptRenderer !== 'undefined') {
            const structuredHtml = PromptRenderer.renderXml(parsed);
            if (structuredHtml) {
                promptHtml = `<div class="details-content">${structuredHtml}</div>`;
            } else {
                promptHtml = `<div class="details-content">${agent.prompt}</div>`;
            }
        } else {
            promptHtml = `<div class="details-content">${agent.prompt}</div>`;
        }
        return promptHtml;
    }

    /**
     * Creates the DOM element for an agent flip-card.
     * @param {Object} agent - The agent data.
     * @param {number|string} index - The index or key of the agent.
     * @param {number} globalIndex - Global index for animation staggering.
     * @returns {HTMLElement} The card element.
     */
    static create(agent, index, globalIndex) {
        const card = document.createElement("div");
        card.className = "card flip-card pop-in";
        const delay = Math.min(globalIndex * 30, 600);
        card.style.animationDelay = `${delay}ms`;

        // Apply metadata classes
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

        const icon = agent.icon || '🤖';
        const role = agent.role || 'Fusion Protocol';
        const desc = agent.desc || agent.description || '';

        // Construct the Flip Card DOM
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="emoji-hero">${icon}</div>
                    <div class="title-group">
                        <h3 class="agent-title">${agent.name}</h3>
                        <span class="role-tag">${role}</span>
                    </div>
                    <div class="tag-container justify-center mt-2">${tags}</div>
                    <div class="description mt-4">${desc}</div>
                    <div class="flip-hint mt-auto text-secondary text-xs">Tap to view prompt ↺</div>
                </div>

                <div class="flip-card-back">
                    <div class="back-header">
                        <h3 class="agent-title text-sm">${agent.name} Protocol</h3>
                        <button class="icon-btn flip-back-btn" aria-label="Flip back">✕</button>
                    </div>
                    <div class="prompt-scroll-area" id="prompt-content-${index}">
                        </div>
                    <div class="card-actions mt-auto pt-2">
                        <button class="secondary w-full" data-action="copy-agent" data-index="${index}" aria-label="Copy prompt">
                            <svg class="copy-icon mr-2" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            <svg class="check-icon hidden mr-2" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                            <span>Copy Full Prompt</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners for Flip Interaction
        const inner = card.querySelector('.flip-card-inner');
        const front = card.querySelector('.flip-card-front');
        const backBtn = card.querySelector('.flip-back-btn');

        front.addEventListener('click', () => {
            // Lazy load the prompt HTML on the first flip
            const promptArea = card.querySelector(`#prompt-content-${index}`);
            if (promptArea && !promptArea.innerHTML.trim()) {
                promptArea.innerHTML = AgentCard.getPromptHtml(agent);
            }
            card.classList.add('flipped');
        });

        backBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent re-triggering flip
            card.classList.remove('flipped');
        });

        return card;
    }
}
