const CORE_EMOJIS = {
    "Architect": "🏗️", "Navigator": "🧭", "Helix": "🧬", "Modernizer": "🚀", "Untangler": "🧶",
    "Scavenger": "🗑️", "Superintendent": "🧽", "Pedant": "🧐", "Paramedic": "🚑", "Cortex": "🧠",
    "Author": "✍️", "Scribe": "🖋️", "Herald": "📣", "Wordsmith": "🔤", "Curator": "🖼️", "Inspector": "🕵️",
    "Bolt+": "⚡", "Palette+": "🎨", "Sentinel+": "🛡️"
};
const CORE_EMOJIS_MAP = new Map(Object.entries(CORE_EMOJIS));
const CORE_EMOJIS_REGEX = new RegExp(`(${Object.keys(CORE_EMOJIS).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);

class TerminalRenderer {
    constructor(julesTerminal) {
        this.terminal = julesTerminal;
    }

    renderPullRequests(prs, terminalEl) {
        terminalEl.querySelectorAll('.term-pr-item').forEach(el => el.remove());
        if (!prs || prs.length === 0) return;

        const fetchingIndicator = terminalEl.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        const formatUtils = this.terminal.constructor.getFormatUtils();

        // Render at top of terminal
        const fragment = document.createDocumentFragment();
        prs.forEach(pr => {
            const item = document.createElement("div");
            item.className = "term-pr-item";

            const escapedTitle = formatUtils ? formatUtils.escapeHTML(pr.title) : pr.title;

            item.innerHTML = `
                <span style="color: var(--term-success); font-weight: 600; flex-shrink: 0;">[PR OPEN]</span>
                <a href="#" class="term-pr-title term-link pr-modal-trigger" data-pr-number="${pr.number}">#${pr.number} ${escapedTitle}</a>
            `;
            const link = item.querySelector('.pr-modal-trigger');
            if (link) {
                link.onclick = (e) => {
                    e.preventDefault();
                    this.terminal.modals._showPRModal(pr, this.terminal.currentRepo);
                };
            }
            fragment.insertBefore(item, fragment.firstChild);
        });
        terminalEl.insertBefore(fragment, terminalEl.firstChild);
    }

    checkEmptyTerminal() {
        const terminalEl = this.terminal.getEl("julesTerminal");
        if (terminalEl && (terminalEl.children.length === 0 || (terminalEl.children.length === 1 && terminalEl.firstElementChild.id === 'fetchingIndicator'))) {
             terminalEl.innerHTML = DOMUtils.getTerminalIndicatorHTML("Ready. Awaiting execution commands...");
        }
    }

    processSession(session, terminalEl) {
        if (this.terminal.renderedSessionIds.has(session.id)) return;
        this.terminal.renderedSessionIds.add(session.id);

        const formatUtils = this.terminal.constructor.getFormatUtils();
        const agentName = session.title || "Agent Task";
        let safeAgentName = formatUtils ? formatUtils.escapeHTML(agentName) : agentName;
        let agentEmoji = "🤖";

        // ⚡ ACCELERATE: Cache the agents list into a Map to eliminate redundant O(N) traversals inside the session loop.
        if (!this.terminal._agentMapCache) {
            this.terminal._agentMapCache = new Map();
            const escapedNames = [];

            if (this.terminal.app.agents) {
                for (let i = 0; i < this.terminal.app.agents.length; i++) {
                    const a = this.terminal.app.agents[i];
                    this.terminal._agentMapCache.set(a.name, a);
                    if (a.name && formatUtils) escapedNames.push(formatUtils.escapeRegex(a.name));
                }
            }

            if (this.terminal.app.customAgents) {
                const customs = Object.values(this.terminal.app.customAgents);
                for (let i = 0; i < customs.length; i++) {
                    const a = customs[i];
                    if (a.name) {
                        this.terminal._agentMapCache.set(a.name, a);
                        if (formatUtils) escapedNames.push(formatUtils.escapeRegex(a.name));
                    }
                }
            }

            if (escapedNames.length > 0) {
                escapedNames.sort((a, b) => b.length - a.length);
                this.terminal._agentRegexCache = new RegExp(`(${escapedNames.join("|")})`);
            }
        }

        // Fast O(1) direct lookup, with a fallback for loose regex matches
        let matchedAgent = this.terminal._agentMapCache.get(safeAgentName);
        if (!matchedAgent && this.terminal._agentRegexCache) {
            const match = safeAgentName.match(this.terminal._agentRegexCache);
            if (match) {
                matchedAgent = this.terminal._agentMapCache.get(match[0]);
            }
        }

        if (matchedAgent && matchedAgent.emoji) {
            agentEmoji = matchedAgent.emoji;
        } else {
            let emoji = CORE_EMOJIS_MAP.get(safeAgentName);
            if (!emoji && safeAgentName) {
                const match = safeAgentName.match(CORE_EMOJIS_REGEX);
                if (match) emoji = CORE_EMOJIS_MAP.get(match[0]);
            }
            if (emoji) agentEmoji = emoji;
        }

        const block = this.createAndInsertSessionBlock(
            terminalEl,
            `term-session-line state-active`,
            `session-${session.id}`,
            agentEmoji,
            safeAgentName,
            "Initializing...",
            `status-${session.id}`,
            () => this.terminal.modals._showHistoryModal(session.id, agentEmoji, safeAgentName)
        );

        this.terminal.polling.startTerminalPolling(session.id, block, safeAgentName, agentEmoji);
    }

    createAndInsertSessionBlock(terminalEl, className, id, agentEmoji, safeAgentName, statusMsg, statusId, onClickCallback) {
        const block = document.createElement("div");
        block.className = className;
        if (id) block.id = id;

        if (onClickCallback) {
            block.style.cursor = "pointer";
            block.onclick = onClickCallback;
        }

        const formatUtils = this.terminal.constructor.getFormatUtils();
        const escapedEmoji = formatUtils ? formatUtils.escapeHTML(agentEmoji) : agentEmoji;

        block.innerHTML = DOMUtils.getTerminalSessionHTML(escapedEmoji, safeAgentName, statusMsg, statusId);

        const firstSession = terminalEl.querySelector('.term-session-line:not(#fetchingIndicator)');
        if (firstSession) {
            terminalEl.insertBefore(block, firstSession);
        } else {
            terminalEl.appendChild(block);
        }

        return block;
    }
}

if (typeof window !== 'undefined') {
    window.TerminalRenderer = TerminalRenderer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalRenderer;
}
