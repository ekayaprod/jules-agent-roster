/**
 * Component responsible for rendering individual agent cards.
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
                // Fallback if XML rendering failed or returned empty
                promptHtml = `<div class="details-content">${agent.prompt}</div>`;
            }
        } else {
             // Fallback if renderer missing
            promptHtml = `<div class="details-content">${agent.prompt}</div>`;
        }
        return promptHtml;
    }

    /**
     * Creates the DOM element for an agent card.
     * @param {Object} agent - The agent data.
     * @param {number} index - The index of the agent.
     * @param {number} globalIndex - Global index for animation staggering.
     * @returns {HTMLElement} The card element.
     */
    static create(agent, index, globalIndex) {
        const card = document.createElement("div");
        card.className = "card pop-in";
        const delay = Math.min(globalIndex * 30, 600);
        card.style.animationDelay = `${delay}ms`;

        if (agent.type === "plus") card.classList.add("plus-agent");
        if (agent.type === "monthly") card.classList.add("monthly-agent");

        // Build tags
        let tags = "";
        if (agent.scope) {
            let scopeClass = "scope-medium";
            if (agent.scope.includes("Small")) scopeClass = "scope-small";
            if (agent.scope.includes("Large")) scopeClass = "scope-large";
            tags += `<span class="meta-tag ${scopeClass}">${agent.scope}</span>`;
        }

        card.innerHTML = `
              <div class="card-header">
                  <div class="title-group">
                      <h3 class="agent-title">
                          <span>${agent.icon}</span> ${agent.name}
                      </h3>
                      <div class="tag-container">${tags}</div>
                  </div>
                  <span class="role-tag">${agent.role}</span>
              </div>

              <div class="description">
                  ${agent.desc}
              </div>

              <button class="details-toggle" aria-expanded="false" aria-controls="details-${index}" data-action="toggle-details" data-index="${index}">
                  <!-- Curator: Optimized Chevron -->
                  <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  <!-- Wordsmith: Active voice -->
                  <span>Show Prompt</span>
              </button>
              <div class="details-grid" id="details-${index}">
                  <div class="details-overflow"></div>
              </div>

              <div class="card-actions">
                  <!-- Wordsmith: Accurate label, Active voice -->
                  <button class="secondary" data-action="copy-agent" data-index="${index}" aria-label="Copy this agent's prompt to clipboard">
                      <!-- Curator: Optimized Copy Icon -->
                      <svg class="copy-icon" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                      <!-- Curator: Optimized Check Icon -->
                      <svg class="check-icon" style="display: none" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span>Copy Prompt</span>
                  </button>
              </div>
          `;

        return card;
    }
}
