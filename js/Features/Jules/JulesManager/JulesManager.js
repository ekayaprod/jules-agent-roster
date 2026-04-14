// Safe cross-environment getters
const getFormatUtils = () => (typeof window !== 'undefined' && window.FormatUtils) ? window.FormatUtils : ((typeof global !== 'undefined' && global.FormatUtils) ? global.FormatUtils : (typeof require !== 'undefined' ? require('../../../Utils/format-utils.js') : null));
// Safe cross-environment getters
var getTelemetryUtils = () => typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);

/**
 * Polling array callbacks hoisted to the file scope.
 */
const hasPullRequest = o => o.pullRequest;
const sortByCreateTime = (a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0);

// Hardcoded fallback for missing core metadata
const CORE_EMOJIS = {
    "Architect": "🏗️", "Navigator": "🧭", "Helix": "🧬", "Modernizer": "🚀", "Untangler": "🧶",
    "Scavenger": "🗑️", "Superintendent": "🧽", "Pedant": "🧐", "Paramedic": "🚑", "Cortex": "🧠",
    "Author": "✍️", "Scribe": "🖋️", "Herald": "📣", "Wordsmith": "🔤", "Curator": "🖼️", "Inspector": "🕵️",
    "Bolt+": "⚡", "Palette+": "🎨", "Sentinel+": "🛡️"
};

const CORE_EMOJIS_MAP = new Map(Object.entries(CORE_EMOJIS));
const CORE_EMOJIS_REGEX = new RegExp(`(${Object.keys(CORE_EMOJIS).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);

/**
 * Manages the core operations for interacting with Jules APIs.
 * Engineered for a single-line terminal output where GitHub handles completions.
 * @see ../../../docs/architecture/Features/JulesManager.md#overview for the macro architectural scope.
 */

// Safe cross-environment getters

class JulesManager {
    static ACTIVE_SESSIONS_POLL_MS = 5000;
    static TERMINAL_POLL_MS = 3000;
    static MODAL_FOCUS_DELAY_MS = 50;
    static MODAL_FOCUS_QUICK_DELAY_MS = 10;
    static SUCCESS_DISMISS_DELAY_MS = 2000;
    static PAGE_SIZE = 50;

    constructor(rosterApp) {
        this.app = rosterApp;
        this.currentRepo = null;
        this.activeSessionsInterval = null;
        this.julesPollingIntervals = {};
        this.renderedSessionIds = new Set();
        this.dismissedSessionIds = new Set();
        this.elements = {};
        
        // Modal State
        this.activeModalSessionId = null;

        // Queue State
        this.sessionQueue = [];
        this.isProcessingQueue = false;

        // Domain classes
        this.modals = new JulesModals(this);
        this.polling = new TerminalPolling(this);

        // Utility method exported to class level for delegates
        this.sortByCreateTime = sortByCreateTime;
    }

    getEl(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }

    dismissSession(sessionId) {
        this.dismissedSessionIds.add(sessionId);
        this.renderedSessionIds.delete(sessionId);
        if (this.julesPollingIntervals && this.julesPollingIntervals[sessionId]) {
            clearInterval(this.julesPollingIntervals[sessionId]);
            delete this.julesPollingIntervals[sessionId];
        }
        const item = this.getEl("julesTerminal")?.querySelector(`#session-${sessionId}`);
        if (item) item.remove();
        this._checkEmptyTerminal();
    }

    /**
     * Bootstraps the manager, loads cached API keys, and initializes the modal.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesManager.md#1-initialization-and-authentication
     */
    async init() {
        this.initialized = true;
        const apiKey = StorageUtils.getItem("jules_api_key");
        const githubToken = StorageUtils.getItem("github_api_key");
        const settingsModal = this.getEl("settingsModal");
        const openBtn = this.getEl("openSettingsBtn");
        const closeBtn = this.getEl("closeSettingsBtn");
        const saveBtn = this.getEl("saveSettingsBtn");
        const keyInput = this.getEl("julesApiKeyInput");
        const errorSpan = this.getEl("julesApiKeyError");
        const githubTokenInput = this.getEl("githubTokenInput");
        const githubTokenErrorSpan = this.getEl("githubTokenError");

        const toggleModal = (show) => {
            if (show) {
                keyInput.value = StorageUtils.getItem("jules_api_key");
                if (githubTokenInput) githubTokenInput.value = StorageUtils.getItem("github_api_key");
                settingsModal.classList.add("visible");
                setTimeout(() => keyInput.focus(), JulesManager.MODAL_FOCUS_QUICK_DELAY_MS);
                this.modals._clearKeyError(keyInput, errorSpan);
                this.modals._clearKeyError(githubTokenInput, githubTokenErrorSpan);
            } else {
                settingsModal.classList.remove("visible");
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        keyInput?.addEventListener("blur", () => {
            if (!keyInput.value.trim()) this.modals._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
            else this.modals._clearKeyError(keyInput, errorSpan);
        });

        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            const githubKey = githubTokenInput ? githubTokenInput.value.trim() : "";

            if (!key) {
                this.modals._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
                return;
            }

            try {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Connecting...");
                if (keyInput) keyInput.disabled = true;
                if (githubTokenInput) githubTokenInput.disabled = true;

                StorageUtils.setItem("jules_api_key", key);
                StorageUtils.setItem("github_api_key", githubKey);
                toggleModal(false);
                this.app.toast.show("Connecting to APIs...");

                if (window.julesService) {
                    window.julesService.configure(key, githubKey);
                    // ⚡ Bolt+: Severed the synchronous I/O waterfall to prevent freezing the UI modal thread on configuration updates.
                    this.loadSources().catch(err => console.error("Background repository fetch failed", err));
                }
            } finally {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Save & Connect");
                if (keyInput) keyInput.disabled = false;
                if (githubTokenInput) githubTokenInput.disabled = false;
            }
        });

        this.modals._initInteractionModal();
        this.modals._initPRModal();

        if (apiKey && window.julesService) {
            window.julesService.configure(apiKey, githubToken);
            const toggle = this.getEl("julesActivateToggle");
            if (toggle && toggle.checked) {
                // ⚡ Bolt+: The Waterfall Collapse. Unblocked the primary application boot thread by shifting synchronous remote API resolution into a parallel fire-and-forget execution.
                this.loadSources().catch(err => console.error("Background repository fetch failed", err));
            }
        } else {
            // Only show modal if the toggle is explicitly active, else defer until toggled
            const toggle = this.getEl("julesActivateToggle");
            if (toggle && toggle.checked) {
                toggleModal(true);
            }
        }
    }


    /**
     * Fetches the connected source repositories and populates the source dropdown picker.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesManager.md#2-repository-source-selection
     */
    async loadSources() {
        const picker = this.getEl("julesRepoPicker");
        if (!picker || !window.julesService) return;

        const originalText = (picker.options && picker.options.length > 0) ? picker.options[0].textContent : "1. Select GitHub Repository...";
        picker.innerHTML = `<option value="">Loading repositories...</option>`;
        picker.disabled = true;

        try {
            const sourcesResponse = await window.julesService.getSources();
            if (sourcesResponse.sources) {
                picker.innerHTML = `<option value="">1. Select GitHub Repository...</option>`;
                sourcesResponse.sources.forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = s.name;
                    opt.textContent = `${s.githubRepo.owner}/${s.githubRepo.repo}`;
                    picker.appendChild(opt);
                });
                
                // Directly bind the dropdown change to trigger BOTH APIs
                if (!picker.dataset.listenerAttached) {
                    picker.addEventListener("change", async (e) => {
                        const sourceName = e.target.value;
                        if (sourceName) {
                            await Promise.all([
                                this.loadPullRequestsForRepo(sourceName),
                                this.loadActiveSessionsForRepo(sourceName)
                            ]);
                        } else {
                            this._clearPollingAndCache();
                            this.getEl("julesTerminal").innerHTML = DOMUtils.getTerminalIndicatorHTML("Awaiting repository connection...");
                        }
                    });
                    picker.dataset.listenerAttached = "true";
                }
            } else {
                picker.innerHTML = `<option value="">${originalText}</option>`;
            }
        } catch (error) {
            picker.innerHTML = `<option value="">${originalText}</option>`;
            console.error("Failed to load sources:", error);
            this.app.toast.show(`Unable to connect to GitHub: ${error.message || "Unknown error"}`, true);
        } finally {
            picker.disabled = false;
        }
    }

    /**
     * Initializes a recurring active session polling loop for a specific repository.
     * @param {string} sourceName - The target source/repo identifier (e.g. sources/github/owner/repo)
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesManager.md#4-active-sessions-polling
     */
    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");
        
        if (this.currentRepo !== sourceName) {
            this._clearPollingAndCache();
            const existingInd = terminal.querySelector('#fetchingIndicator');
            if (!existingInd) {
                 terminal.innerHTML += DOMUtils.getTerminalIndicatorHTML("Checking active Jules routines...");
            }
            this.currentRepo = sourceName;
        }

        if (this.activeSessionsInterval) clearInterval(this.activeSessionsInterval);

        const boundFetch = () => this._fetchAndRenderSessions(sourceName, terminal);
        await boundFetch();
        this.activeSessionsInterval = setInterval(boundFetch, JulesManager.ACTIVE_SESSIONS_POLL_MS);
    }

    /**
     * Retrieves the latest active PRs for the repository to synchronize the UI with actual VCS state.
     * @param {string} sourceName - The targeted repository.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesManager.md#6-pull-request-rendering
     */
    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesService) return;
        const pullRequests = await window.julesService.getPullRequests(sourceName);
        this._renderPullRequests(pullRequests, this.getEl("julesTerminal"));
    }

    _renderPullRequests(prs, terminal) {
        terminal.querySelectorAll('.term-pr-item').forEach(el => el.remove());
        if (!prs || prs.length === 0) return;

        const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        // Render at top of terminal
        prs.forEach(pr => {
            const item = document.createElement("div");
            item.className = "term-pr-item";
            item.innerHTML = `
                <span style="color: var(--term-success); font-weight: 600; flex-shrink: 0;">[PR OPEN]</span> 
                <a href="#" class="term-pr-title term-link pr-modal-trigger" data-pr-number="${pr.number}">#${pr.number} ${getFormatUtils().escapeHTML(pr.title)}</a>
            `;
            const link = item.querySelector('.pr-modal-trigger');
            if (link) {
                link.onclick = (e) => {
                    e.preventDefault();
                    this.modals._showPRModal(pr, this.currentRepo);
                };
            }
            terminal.insertBefore(item, terminal.firstChild);
        });
    }


    async _fetchAndRenderSessions(sourceName, terminal) {
        if (!window.julesService || !window.julesService.apiKey) return;

        const sessionsResponse = await window.julesService.getSessions(JulesManager.PAGE_SIZE);
        if (!sessionsResponse.sessions) {
            this._checkEmptyTerminal();
            return;
        }

        // ↗️ VECTORIZE: The Single-Pass Pipeline. Bypassing filter().reverse().slice(0, 3) for a direct backward loop to eliminate multi-pass overhead.
        let repoSessions = [];
        const sessions = sessionsResponse.sessions;
        for (let i = sessions.length - 1; i >= 0; i--) {
            if (repoSessions.length >= 3) break;
            const s = sessions[i];

            if (!s.sourceContext || s.sourceContext.source !== sourceName) continue;
            if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) continue;

            const timeStr = s.updateTime || s.createTime || s.startTime;
            if (timeStr) {
                const ageHours = (Date.now() - new Date(timeStr).getTime()) / (1000 * 60 * 60);
                if (ageHours > 2) continue;
            } else if (!this.renderedSessionIds.has(s.id)) {
                continue;
            }

            // If a ticket reached a terminal state (done, failed, drafted PR), it is NO LONGER
            // shown in the active Jules feed. We completely rely on the GitHub PR fetch to show completions.
            const isEnded = s.state === 'COMPLETED' || s.state === 'FAILED' || s.state === 'ERROR' || s.state === 'CANCELLED' || (s.outputs && s.outputs.some(hasPullRequest));

            if (isEnded) continue;

            repoSessions.push(s);
        }

        const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        if (!this.renderedSessionIds) this.renderedSessionIds = new Set();

        const currentSessionIds = new Set();
        for (let i = 0; i < repoSessions.length; i++) {
            currentSessionIds.add(repoSessions[i].id);
        }

        for (const id of this.renderedSessionIds) {
            if (!currentSessionIds.has(id)) {
                this.dismissSession(id);
            }
        }

        for (const session of repoSessions) {
            this._processSession(session, terminal);
        }

        this._checkEmptyTerminal();
    }

    _checkEmptyTerminal() {
        const terminal = this.getEl("julesTerminal");
        if (terminal && (terminal.children.length === 0 || (terminal.children.length === 1 && terminal.firstElementChild.id === 'fetchingIndicator'))) {
             terminal.innerHTML = DOMUtils.getTerminalIndicatorHTML("Ready. Awaiting execution commands...");
        }
    }

    _processSession(session, terminal) {
        if (this.renderedSessionIds.has(session.id)) return;
        this.renderedSessionIds.add(session.id);
        
        const agentName = session.title || "Agent Task";
        let safeAgentName = getFormatUtils().escapeHTML(agentName);
        let agentEmoji = "🤖";
        
        // ⚡ ACCELERATE: Cache the agents list into a Map to eliminate redundant O(N) traversals inside the session loop.
        if (!this._agentMapCache) {
            this._agentMapCache = new Map();
            const escapedNames = [];

            if (this.app.agents) {
                for (let i = 0; i < this.app.agents.length; i++) {
                    const a = this.app.agents[i];
                    this._agentMapCache.set(a.name, a);
                    if (a.name) escapedNames.push(FormatUtils.escapeRegex(a.name));
                }
            }

            if (this.app.customAgents) {
                const customs = Object.values(this.app.customAgents);
                for (let i = 0; i < customs.length; i++) {
                    const a = customs[i];
                    if (a.name) {
                        this._agentMapCache.set(a.name, a);
                        escapedNames.push(FormatUtils.escapeRegex(a.name));
                    }
                }
            }

            if (escapedNames.length > 0) {
                escapedNames.sort((a, b) => b.length - a.length);
                this._agentRegexCache = new RegExp(`(${escapedNames.join("|")})`);
            }
        }

        // Fast O(1) direct lookup, with a fallback for loose regex matches
        let matchedAgent = this._agentMapCache.get(safeAgentName);
        if (!matchedAgent && this._agentRegexCache) {
            const match = safeAgentName.match(this._agentRegexCache);
            if (match) {
                matchedAgent = this._agentMapCache.get(match[0]);
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

        const block = document.createElement("div");
        block.className = `term-session-line state-active`;
        block.id = `session-${session.id}`;

        block.style.cursor = "pointer";
        block.onclick = () => {
            this.modals._showHistoryModal(session.id, agentEmoji, safeAgentName);
        };

        // 1-line Minimalist layout
        block.innerHTML = `
            <span class="term-agent-name">${getFormatUtils().escapeHTML(agentEmoji)} ${safeAgentName}</span>
            <span class="term-separator">—</span>
            <span class="term-status" id="status-${session.id}">Initializing...</span>
        `;

        const firstSession = terminal.querySelector('.term-session-line');
        if (firstSession) {
            terminal.insertBefore(block, firstSession);
        } else {
            terminal.appendChild(block);
        }

        this.polling.startTerminalPolling(session.id, block, safeAgentName, agentEmoji);
    }

    /**
     * Orchestrates the creation of a new task session execution.
     * Implements an optimistic UI state block that handles silent rollback on API failure.
     * @param {Object} agent - The agent data representing the logic to execute.
     * @param {HTMLElement} [btn=null] - Optional launch button reference for state manipulation.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesManager.md#3-session-launching
     */
    async launchSession(agent, btn = null) {
        const sourceName = this.getEl("julesRepoPicker").value;
        const userTask = this.getEl("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";

        if (!sourceName) {
            this.app.toast.show("Select a target repository first.", typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.ERROR : "error");
            return;
        }

        if (agent.prompt === undefined) {
            if (btn) btn.disabled = true;
            const url = AgentUtils.getPromptUrl(agent);
            agent.prompt = await this.app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.");
            if (btn) btn.disabled = false;
        }

        // 🪄 CONJURE: Optimistic UI for Session Launch with CSS skeletal rendering
        const terminal = this.getEl("julesTerminal");
        const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.style.display = 'none';

        const optimisticBlock = document.createElement("div");
        optimisticBlock.className = `term-session-line state-active skeleton-pulse`;
        let agentEmoji = agent.emoji || "🤖";
        let safeAgentName = agent.name ? getFormatUtils().escapeHTML(agent.name) : "Agent Task";

        optimisticBlock.style.cursor = "pointer";

        optimisticBlock.innerHTML = `
            <span class="term-agent-name">${getFormatUtils().escapeHTML(agentEmoji)} ${safeAgentName}</span>
            <span class="term-separator">—</span>
            <span class="term-status">Conjuring session...</span>
        `;

        const firstSession = terminal.querySelector('.term-session-line:not(#fetchingIndicator)');
        if (firstSession) {
            terminal.insertBefore(optimisticBlock, firstSession);
        } else {
            terminal.appendChild(optimisticBlock);
        }

        if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Launching...");

        this.sessionQueue.push(async () => {
            try {
                await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name}`);
                this.app.toast.show(`Session launched successfully.`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.SUCCESS : "success");
                await this._fetchAndRenderSessions(sourceName, terminal);
            } catch (error) {
                const launchError = new Error("JulesSessionLaunchFailure: " + error.message);
                launchError.cause = error;
                console.error(`Failed to launch session for repository ${sourceName}`, launchError);
                const tu = getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_LAUNCH_SESSION_FAILED", launchError, { sourceName });
                this.app.toast.show(`Could not launch the session: ${error.message || "Unknown error"}`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.ERROR : "error", 20000);
                if (fetchingIndicator) fetchingIndicator.style.display = '';
            } finally {
                if (optimisticBlock.parentNode) optimisticBlock.remove();
                if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Launch in Jules 🚀");
                this._checkEmptyTerminal();
            }
        });

        this._processSessionQueue();
    }

    async _processSessionQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        while (this.sessionQueue.length > 0) {
            const task = this.sessionQueue.shift();
            try {
                await task();
            } catch (error) {
                console.error("Queue execution error:", error);
            }
            // Rate limit delay (1s) to prevent overwhelming the API on mass launch
            if (this.sessionQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Attaches an active heartbeat to a specific session execution.
     * Polls the backend every 3 seconds to gather new terminal states or block on user input requests.
     * @param {string} sessionId - The backend ID for the active execution.
     * @param {HTMLElement} block - The terminal line DOM element for updates.
     * @param {string} agentName - The agent's title.
     * @param {string} agentEmoji - The UI icon representing the agent.
     * @returns {void}
     * @see ../../../docs/architecture/Features/JulesManager.md#5-terminal-state-updates
     */
    /**
     * Flushes all active polling timers, removes zombie callbacks, and unbinds state IDs
     * to prevent memory leaks when changing contexts.
     * @returns {void}
     * @see ../../../docs/architecture/Features/JulesManager.md#7-memory-management
     */
    cleanup() {
        if (this.activeSessionsInterval) {
            clearInterval(this.activeSessionsInterval);
            this.activeSessionsInterval = null;
        }
        this._clearPollingAndCache();
        if (this.dismissedSessionIds) this.dismissedSessionIds.clear();
        this.currentRepo = null;
        this._flatCustomsCache = null;
    }

    _clearPollingAndCache() {
        if (this.julesPollingIntervals) {
            for (const key in this.julesPollingIntervals) {
                clearInterval(this.julesPollingIntervals[key]);
            }
            this.julesPollingIntervals = {};
        }
        if (this.renderedSessionIds) this.renderedSessionIds.clear();
        this._flatCustomsCache = null;
        this._agentMapCache = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}