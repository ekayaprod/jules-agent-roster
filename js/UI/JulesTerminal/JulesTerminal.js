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
 * @see ../../../docs/architecture/Features/JulesTerminal.md#overview for the macro architectural scope.
 */
class JulesTerminal {
    static ACTIVE_SESSIONS_POLL_MS = 5000;
    static TERMINAL_POLL_MS = 3000;
    static MODAL_FOCUS_DELAY_MS = 50;
    static MODAL_FOCUS_QUICK_DELAY_MS = 10;
    static SUCCESS_DISMISS_DELAY_MS = 2000;
    static PAGE_SIZE = 50;

    /**
     * Safe cross-environment getters encapsulated as static methods.
     */
    static getFormatUtils() {
        if (typeof FormatUtils !== 'undefined') return FormatUtils;
        if (typeof window !== 'undefined' && window.FormatUtils) return window.FormatUtils;
        if (typeof global !== 'undefined' && global.FormatUtils) return global.FormatUtils;
        if (typeof require !== 'undefined') return require('../../../Utils/format-utils.js');
        return null;
    }

    static getTelemetryUtils() {
        if (typeof TelemetryUtils !== 'undefined') return TelemetryUtils;
        if (typeof window !== 'undefined' && window.TelemetryUtils) return window.TelemetryUtils;
        if (typeof global !== 'undefined' && global.TelemetryUtils) return global.TelemetryUtils;
        return null;
    }

    constructor(rosterApp) {
        this.app = rosterApp;
        this.currentRepo = null;
        this.activeSessionsTimeout = null;
        this._pollingActive = false;
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
     * @see ../../../docs/architecture/Features/JulesTerminal.md#1-initialization-and-authentication
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
                setTimeout(() => keyInput.focus(), JulesTerminal.MODAL_FOCUS_QUICK_DELAY_MS);
                this._clearKeyError(keyInput, errorSpan);
                this._clearKeyError(githubTokenInput, githubTokenErrorSpan);
            } else {
                settingsModal.classList.remove("visible");
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        keyInput?.addEventListener("blur", () => {
            if (!keyInput.value.trim()) this._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
            else this._clearKeyError(keyInput, errorSpan);
        });

        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            const githubKey = githubTokenInput ? githubTokenInput.value.trim() : "";

            if (!key) {
                this._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
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

                if (window.julesAPI) {
                    window.julesAPI.configure(key, githubKey);
                    // ⚡ Bolt+: Severed the synchronous I/O waterfall to prevent freezing the UI modal thread on configuration updates.
                    this.loadSources().catch(err => console.error("Background repository fetch failed", err));
                }
            } finally {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Save & Connect");
                if (keyInput) keyInput.disabled = false;
                if (githubTokenInput) githubTokenInput.disabled = false;
            }
        });

        this._initInteractionModal();
        this._initPRModal();

        if (apiKey && window.julesAPI) {
            window.julesAPI.configure(apiKey, githubToken);
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
     * @see ../../../docs/architecture/Features/JulesTerminal.md#2-repository-source-selection
     */
    async loadSources() {
        const picker = this.getEl("julesRepoPicker");
        if (!picker || !window.julesAPI) return;

        const originalText = picker.options && picker.options.length > 0 ? picker.options[0].textContent : "1. Select GitHub Repository...";
        picker.innerHTML = `<option value="">Loading repositories...</option>`;
        picker.disabled = true;

        try {
            const sourcesResponse = await window.julesAPI.getSources();
            if (sourcesResponse.sources) {
                picker.innerHTML = `<option value="">1. Select GitHub Repository...</option>`;
                sourcesResponse.sources.forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = s.name;

                    const formatUtils = JulesTerminal.getFormatUtils();
                    opt.textContent = (s.githubRepo && s.githubRepo.owner && s.githubRepo.repo) ? `${s.githubRepo.owner}/${s.githubRepo.repo}` : (formatUtils ? formatUtils.extractRepoPath(s.name) : s.name);

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
     * Safely executes an async loop instead of setInterval to prevent connection exhaustion.
     * @param {string} sourceName - The target source/repo identifier (e.g. sources/github/owner/repo)
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#4-active-sessions-polling
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

        this._startSessionPolling(sourceName, terminal);
    }

    /**
     * Recursively polls the API for active sessions using a delayed execution loop to
     * eliminate compounding request saturation if the API degrades.
     */
    _startSessionPolling(sourceName, terminal) {
        this._pollingActive = true;
        if (this.activeSessionsTimeout) clearTimeout(this.activeSessionsTimeout);

        const pollLoop = async () => {
            if (!this._pollingActive || this.currentRepo !== sourceName) return;

            try {
                await this._fetchAndRenderSessions(sourceName, terminal);
            } catch (error) {
                // Suppress background polling errors to prevent UI crashing during transient API degradation
                console.warn("Session polling cycle encountered an error:", error);
            }

            if (this._pollingActive && this.currentRepo === sourceName) {
                this.activeSessionsTimeout = setTimeout(pollLoop, JulesTerminal.ACTIVE_SESSIONS_POLL_MS);
            }
        };

        pollLoop();
    }


    /**
     * Retrieves the latest active PRs for the repository to synchronize the UI with actual VCS state.
     * @param {string} sourceName - The targeted repository.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#6-pull-request-rendering
     */
    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesAPI) return;
        const pullRequests = await window.githubAPI.getPullRequests(sourceName);
        this._renderPullRequests(pullRequests, this.getEl("julesTerminal"));
    }

    _renderPullRequests(prs, terminal) {
        terminal.querySelectorAll('.term-pr-item').forEach(el => el.remove());
        if (!prs || prs.length === 0) return;

        const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        const formatUtils = JulesTerminal.getFormatUtils();

        // Render at top of terminal
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
                    this._showPRModal(pr, this.currentRepo);
                };
            }
            terminal.insertBefore(item, terminal.firstChild);
        });
    }


    async _fetchAndRenderSessions(sourceName, terminal) {
        if (!window.julesAPI || !window.julesAPI.apiKey) return;

        const sessionsResponse = await window.julesAPI.getSessions(JulesTerminal.PAGE_SIZE);
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

        const formatUtils = JulesTerminal.getFormatUtils();
        const agentName = session.title || "Agent Task";
        let safeAgentName = formatUtils ? formatUtils.escapeHTML(agentName) : agentName;
        let agentEmoji = "🤖";

        // ⚡ ACCELERATE: Cache the agents list into a Map to eliminate redundant O(N) traversals inside the session loop.
        if (!this._agentMapCache) {
            this._agentMapCache = new Map();
            const escapedNames = [];

            if (this.app.agents) {
                for (let i = 0; i < this.app.agents.length; i++) {
                    const a = this.app.agents[i];
                    this._agentMapCache.set(a.name, a);
                    if (a.name && formatUtils) escapedNames.push(formatUtils.escapeRegex(a.name));
                }
            }

            if (this.app.customAgents) {
                const customs = Object.values(this.app.customAgents);
                for (let i = 0; i < customs.length; i++) {
                    const a = customs[i];
                    if (a.name) {
                        this._agentMapCache.set(a.name, a);
                        if (formatUtils) escapedNames.push(formatUtils.escapeRegex(a.name));
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

        const block = this._createAndInsertSessionBlock(
            terminal,
            `term-session-line state-active`,
            `session-${session.id}`,
            agentEmoji,
            safeAgentName,
            "Initializing...",
            `status-${session.id}`,
            () => this._showHistoryModal(session.id, agentEmoji, safeAgentName)
        );

        this.startTerminalPolling(session.id, block, safeAgentName, agentEmoji);
    }

    /**
     * Helper to create and insert a terminal session block.
     * @private
     */
    _createAndInsertSessionBlock(terminal, className, id, agentEmoji, safeAgentName, statusMsg, statusId, onClickCallback) {
        const block = document.createElement("div");
        block.className = className;
        if (id) block.id = id;

        if (onClickCallback) {
            block.style.cursor = "pointer";
            block.onclick = onClickCallback;
        }

        const formatUtils = JulesTerminal.getFormatUtils();
        const escapedEmoji = formatUtils ? formatUtils.escapeHTML(agentEmoji) : agentEmoji;

        block.innerHTML = DOMUtils.getTerminalSessionHTML(escapedEmoji, safeAgentName, statusMsg, statusId);

        const firstSession = terminal.querySelector('.term-session-line:not(#fetchingIndicator)');
        if (firstSession) {
            terminal.insertBefore(block, firstSession);
        } else {
            terminal.appendChild(block);
        }

        return block;
    }

    /**
     * Orchestrates the creation of a new task session execution.
     * Implements an optimistic UI state block that handles silent rollback on API failure.
     * @param {Object} agent - The agent data representing the logic to execute.
     * @param {HTMLElement} [btn=null] - Optional launch button reference for state manipulation.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#3-session-launching
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

        const formatUtils = JulesTerminal.getFormatUtils();
        let agentEmoji = agent.emoji || "🤖";
        let safeAgentName = agent.name ? (formatUtils ? formatUtils.escapeHTML(agent.name) : agent.name) : "Agent Task";

        const optimisticBlock = this._createAndInsertSessionBlock(
            terminal,
            `term-session-line state-active skeleton-pulse`,
            "",
            agentEmoji,
            safeAgentName,
            "Conjuring session...",
            "",
            () => {} // cursor pointer set implicitly via callback presence
        );

        if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Launching...");

        this.sessionQueue.push(async () => {
            try {
                await window.julesAPI.createSession(agent.prompt, userTask, sourceName, `${agent.name}`);
                this.app.toast.show(`Session launched successfully.`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.SUCCESS : "success");
            } catch (error) {
                const launchError = new Error("JulesSessionLaunchFailure: " + error.message);
                launchError.cause = error;
                console.error(`Failed to launch session for repository ${sourceName}`, launchError);
                const tu = JulesTerminal.getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_LAUNCH_SESSION_FAILED", launchError, { sourceName });
                this.app.toast.show(`Could not launch the session: ${error.message || "Unknown error"}`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.ERROR : "error", 20000);
                if (fetchingIndicator) fetchingIndicator.style.display = '';

                if (optimisticBlock.parentNode) optimisticBlock.remove();
                if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Launch in Jules 🚀");
                this._checkEmptyTerminal();
                return; // Hard exit out of the queue function on launch failure
            }

            // Reaching here means creation succeeded. We isolate the fetching to prevent polling timeouts from registering as a launch failure.
            try {
                await this._fetchAndRenderSessions(sourceName, terminal);
            } catch (pollError) {
                console.warn("Session launched successfully, but immediate terminal synchronization timed out:", pollError);
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
     * @see ../../../docs/architecture/Features/JulesTerminal.md#5-terminal-state-updates
     */
    /**
     * Flushes all active polling timers, removes zombie callbacks, and unbinds state IDs
     * to prevent memory leaks when changing contexts.
     * @returns {void}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#7-memory-management
     */
    cleanup() {
        this._pollingActive = false;
        if (this.activeSessionsTimeout) {
            clearTimeout(this.activeSessionsTimeout);
            this.activeSessionsTimeout = null;
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

    startTerminalPolling(sessionId, block, agentName, agentEmoji) {
        if (!this.julesPollingIntervals) {
            this.julesPollingIntervals = {};
        }
        if (this.julesPollingIntervals[sessionId]) {
            clearInterval(this.julesPollingIntervals[sessionId]);
        }

        this.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesAPI.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                const activities = activitiesResponse.activities.sort(this.sortByCreateTime);

                const state = {
                    isCompleted: false,
                    hasError: false,
                    isWaitingForInput: false,
                    latestLog: "Processing...",
                    rawMessage: "Processing..."
                };

                let fullHistoryMarkdown = "";

                activities.forEach(act => {
                    let text = act.title || act.description || "";

                    if (act.title) {
                        fullHistoryMarkdown += `**${act.title}**\n\n`;
                    }
                    if (act.description) {
                        fullHistoryMarkdown += `${act.description}\n\n`;
                    }
                    if (act.type && act.type.includes('USER_INPUT') && act.message) {
                        fullHistoryMarkdown += `*You:* ${act.message}\n\n`;
                    }
                    if (act.error) {
                        fullHistoryMarkdown += `**Error:** ${act.error.message}\n\n`;
                    }
                    fullHistoryMarkdown += `---\n\n`;

                    if (text) {
                        state.rawMessage = act.description || act.title;
                        if (text.length > 70) text = text.substring(0, 70) + "...";
                        state.latestLog = text;
                    }

                    if (act.type && act.type.includes('USER_INPUT')) {
                        state.latestLog = "User input transmitted.";
                    }

                    if (act.error) {
                        state.hasError = true;
                        state.latestLog = "Exception: " + (act.error.message || "Unknown error");
                        state.rawMessage = state.latestLog;
                    }

                    if (
                        act.userActionRequired ||
                        act.requiresInput ||
                        (act.type && act.type.includes('INPUT')) ||
                        act.planGenerated ||
                        (act.title && act.title.toLowerCase().includes('waiting for'))
                    ) {
                        state.isWaitingForInput = true;
                    }
                    if (act.planApproved) state.isWaitingForInput = false;

                    if (act.sessionCompleted) state.isCompleted = true;
                });

                if (this.activeModalSessionId === sessionId) {
                    const contentEl = this.getEl("historyModalContent");
                    if (contentEl) {
                        contentEl.innerHTML = "";
                        const pre = DOMUtils.createMarkdownPreBlock(fullHistoryMarkdown || "No history available.");
                        contentEl.appendChild(pre);
                        contentEl.scrollTop = contentEl.scrollHeight;
                    }
                }

                this._updatePollingState(sessionId, block, state, agentName, agentEmoji);

            } catch (e) {
                const tu = JulesTerminal.getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_POLLING_ERROR", e);
            }
        }, this.constructor.TERMINAL_POLL_MS);
    }

    _updatePollingState(sessionId, block, state, agentName, agentEmoji) {
        const statusSpan = block.querySelector(`#status-${sessionId}`) || block.querySelector(`#status-mutated-${sessionId}`);
        if (!statusSpan) return;

        if (state.isCompleted) {
            statusSpan.className = "term-status status-success";
            statusSpan.innerHTML = `✅ Execution Finished`;
            this.loadPullRequestsForRepo(this.currentRepo);
            clearInterval(this.julesPollingIntervals[sessionId]);
            setTimeout(() => this.dismissSession(sessionId), this.constructor.SUCCESS_DISMISS_DELAY_MS);
            return;
        }

        if (state.hasError) {
            statusSpan.className = "term-status status-error";
            statusSpan.innerHTML = `${FormatUtils.escapeHTML(state.latestLog)} <button class="term-action-btn" aria-label="Dismiss task error" onclick="document.getElementById('session-${sessionId}').remove()">[✕]</button>`;
            clearInterval(this.julesPollingIntervals[sessionId]);
            return;
        }

        if (state.isWaitingForInput) {
            statusSpan.className = "term-status status-waiting";
            statusSpan.innerHTML = `⚠️ Response Needed (Click to view)`;
            statusSpan.onclick = (e) => {
                e.stopPropagation();
                this._showInteractionModal(sessionId, agentEmoji, agentName, state.rawMessage);
            };
        } else {
            statusSpan.className = "term-status";
            statusSpan.onclick = null;
            statusSpan.textContent = state.latestLog;
        }
    }



    /**
     * Safe cross-environment getters encapsulated as static methods.
     */
    static getTelemetryUtils() {
        if (typeof TelemetryUtils !== 'undefined') return TelemetryUtils;
        if (typeof window !== 'undefined' && window.TelemetryUtils) return window.TelemetryUtils;
        if (typeof global !== 'undefined' && global.TelemetryUtils) return global.TelemetryUtils;
        return null;
    }


    _initPRModal() {
        const prModal = this.getEl("julesPRModal");
        const closePRModalBtn = this.getEl("cancelPRBtn");

        if (prModal && closePRModalBtn) {
            closePRModalBtn.addEventListener("click", () => {
                prModal.classList.remove("visible");
            });
        }
    }

    _initInteractionModal() {
        const modal = this.getEl("julesInteractionModal");
        const cancelBtn = this.getEl("cancelInteractionBtn");
        const submitBtn = this.getEl("submitInteractionBtn");
        const inputField = this.getEl("interactionModalInput");
        const errorSpan = this.getEl("interactionModalError");

        if (!modal) return;

        const closeModal = () => {
            modal.classList.remove("visible");
            this.activeModalSessionId = null;
            if (inputField) {
                inputField.value = "";
                inputField.style.borderColor = "";
                inputField.removeAttribute("aria-invalid");
                inputField.removeAttribute("aria-describedby");
            }
            if (errorSpan) {
                errorSpan.textContent = "";
                errorSpan.classList.add("hidden");
            }
        };

        const handleSubmit = async () => {
            const text = inputField.value.trim();
            if (!text) {
                if (inputField && errorSpan) {
                    inputField.style.borderColor = "var(--error)";
                    inputField.setAttribute("aria-invalid", "true");
                    inputField.setAttribute("aria-describedby", "interactionModalError");
                    errorSpan.textContent = "Please provide a response before transmitting.";
                    errorSpan.classList.remove("hidden");
                }
                return;
            }
            if (!this.activeModalSessionId) return;

            // 🪄 CONJURE: Optimistic UI with silent rollback for interaction modal
            const sessionId = this.activeModalSessionId;
            const statusSpan = document.getElementById(`status-${sessionId}`);

            await this._transmitReply(sessionId, text, closeModal, {
                textContent: statusSpan ? statusSpan.textContent : "",
                className: statusSpan ? statusSpan.className : "",
                onclick: statusSpan ? statusSpan.onclick : null
            });
        };

        cancelBtn?.addEventListener("click", closeModal);
        submitBtn?.addEventListener("click", handleSubmit);
        inputField?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleSubmit();
        });
        inputField?.addEventListener("input", () => {
            if (inputField && errorSpan) {
                inputField.style.borderColor = "";
                inputField.removeAttribute("aria-invalid");
                inputField.removeAttribute("aria-describedby");
                errorSpan.textContent = "";
                errorSpan.classList.add("hidden");
            }
        });

        const cancelHistoryBtn = this.getEl("cancelHistoryBtn");
        const submitHistoryBtn = this.getEl("submitHistoryBtn");
        const historyModalInput = this.getEl("historyModalInput");
        const historyErrorSpan = this.getEl("historyModalError");
        const historyModal = this.getEl("julesHistoryModal");

        const closeHistoryModal = () => {
            if (historyModal) {
                historyModal.classList.remove("visible");
                if (historyModalInput) historyModalInput.value = "";
                if (historyErrorSpan) {
                    historyErrorSpan.textContent = "";
                    historyErrorSpan.classList.add("hidden");
                }
            }
            this.activeModalSessionId = null;
        };

        const handleHistorySubmit = async () => {
            if (!this.activeModalSessionId) return;
            const text = historyModalInput?.value?.trim();
            if (!text) {
                this._showKeyError(historyModalInput, historyErrorSpan, "Please enter a response.");
                return;
            }

            const sessionId = this.activeModalSessionId;
            await this._transmitReply(sessionId, text, closeHistoryModal, null);
        };

        cancelHistoryBtn?.addEventListener("click", closeHistoryModal);
        submitHistoryBtn?.addEventListener("click", handleHistorySubmit);
        historyModalInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleHistorySubmit();
        });
        historyModalInput?.addEventListener("input", () => {
            if (historyModalInput && historyErrorSpan) {
                historyModalInput.style.borderColor = "";
                historyModalInput.removeAttribute("aria-invalid");
                historyModalInput.removeAttribute("aria-describedby");
                historyErrorSpan.textContent = "";
                historyErrorSpan.classList.add("hidden");
            }
        });
    }

    _showInteractionModal(sessionId, agentEmoji, agentName, promptText) {
        this.activeModalSessionId = sessionId;
        const modal = this.getEl("julesInteractionModal");
        const emojiEl = this.getEl("interactionModalEmoji");
        const nameEl = this.getEl("interactionModalAgent");
        const msgEl = this.getEl("interactionModalMessage");
        const inputField = this.getEl("interactionModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.textContent = promptText;

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.constructor.MODAL_FOCUS_DELAY_MS);
    }

    _showHistoryModal(sessionId, agentEmoji, agentName) {
        this.activeModalSessionId = sessionId;
        const modal = this.getEl("julesHistoryModal");
        const emojiEl = this.getEl("historyModalEmoji");
        const nameEl = this.getEl("historyModalAgent");
        const msgEl = this.getEl("historyModalContent");
        const inputField = this.getEl("historyModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.innerHTML = '<span class="term-status skeleton-pulse">Loading execution thread...</span>';

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.constructor.MODAL_FOCUS_DELAY_MS);
    }


    async _transmitReply(sessionId, text, closeFn, rollbackState) {
        const statusSpan = document.getElementById(`status-${sessionId}`);

        closeFn();
        this.app.toast.show("Transmitting reply...", "info");

        if (statusSpan) {
            statusSpan.className = "term-status skeleton-pulse";
            statusSpan.textContent = "Transmitting response...";
            statusSpan.onclick = null;
        }

        try {
            await window.julesAPI.sendUserInput(sessionId, text);
            this.app.toast.show("Reply transmitted.", "success");
        } catch (error) {
            if (!rollbackState) {
                const tu = JulesTerminal.getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_SEND_REPLY_FAILED", error);
            }

            this.app.toast.show("Failed to send reply.", "error");

            if (rollbackState && statusSpan) {
                statusSpan.className = rollbackState.className || "term-status status-waiting";
                statusSpan.textContent = rollbackState.textContent || `⚠️ Response Needed (Click to view)`;
                statusSpan.onclick = rollbackState.onclick;
            }
        }
    }

    _showKeyError(input, span, message) {
        if (!input || !span) return;
        input.style.borderColor = "var(--error)";
        span.textContent = message;
        span.style.display = "block";
    }

    _clearKeyError(input, span) {
        if (!input || !span) return;
        input.style.borderColor = "";
        span.textContent = "";
        span.style.display = "none";
    }


    _showPRModal(pr, sourceName) {
        const modal = this.getEl("julesPRModal");
        if (!modal) return;

        const titleEl = this.getEl("prModalTitleText");
        const linkEl = this.getEl("prModalExternalLink");
        const contentEl = this.getEl("prModalContent");
        const errorEl = this.getEl("prModalError");
        const mergeBtn = this.getEl("mergePRBtn");
        const closePRBtn = this.getEl("closePRBtn");

        if (titleEl) titleEl.textContent = `#${pr.number} ${pr.title}`;
        if (linkEl) linkEl.href = pr.html_url;

        if (contentEl) {
            contentEl.innerHTML = '';
            const pre = DOMUtils.createMarkdownPreBlock(pr.body || "No description provided.");
            contentEl.appendChild(pre);
        }

        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        }

        if (mergeBtn) {
            DOMUtils.setButtonState(mergeBtn, "ready", "Merge PR");
            mergeBtn.onclick = async () => {
                DOMUtils.setButtonState(mergeBtn, "loading", "Merging...");
                if (errorEl) errorEl.classList.add('hidden');
                try {
                    await window.githubAPI.mergePullRequest(sourceName, pr.number);
                    this.app.toast.show(`Successfully merged PR #${pr.number}`, "success");
                    modal.classList.remove("visible");
                    this.loadPullRequestsForRepo(sourceName);
                } catch (err) {
                    DOMUtils.setButtonState(mergeBtn, "ready", "Merge PR");
                    if (errorEl) {
                        errorEl.textContent = "Failed to merge PR: " + err.message;
                        errorEl.classList.remove('hidden');
                    }
                }
            };
        }

        if (closePRBtn) {
            DOMUtils.setButtonState(closePRBtn, "ready", "Close PR");
            closePRBtn.onclick = async () => {
                DOMUtils.setButtonState(closePRBtn, "loading", "Closing...");
                if (errorEl) errorEl.classList.add('hidden');
                try {
                    await window.githubAPI.closePullRequest(sourceName, pr.number);
                    this.app.toast.show(`Successfully closed PR #${pr.number}`, "success");
                    modal.classList.remove("visible");
                    this.loadPullRequestsForRepo(sourceName);
                } catch (err) {
                    DOMUtils.setButtonState(closePRBtn, "ready", "Close PR");
                    if (errorEl) {
                        errorEl.textContent = "Failed to close PR: " + err.message;
                        errorEl.classList.remove('hidden');
                    }
                }
            };
        }

        modal.classList.add("visible");
    }



}

if (typeof window !== 'undefined') {
    window.JulesTerminal = JulesTerminal;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesTerminal;
}
