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

/**
 * Manages the core operations for interacting with Jules APIs.
 * Engineered for a single-line terminal output where GitHub handles completions.
 * @see README.md#Overview for the complete high-level architecture.
 */
class JulesManager {
    /**
     * Initializes a new instance of the JulesManager.
     * @param {Object} rosterApp - The main application instance containing globally shared state (e.g., agents, customAgents, toast).
     */
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
    }

    /**
     * Retrieves and caches a DOM element by its ID.
     * @param {string} id - The HTML ID of the element to retrieve.
     * @returns {HTMLElement|null} The cached DOM element or null if not found.
     */
    getEl(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }

    /**
     * Clears a specific session from tracking, polling, and the DOM.
     * @param {string} sessionId - The unique identifier of the session to dismiss.
     */
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
     * Bootstraps the JulesManager. Initializes settings, binds modal events, and connects to the APIs if keys exist.
     * @see README.md#1-Initialization-and-Authentication
     * @returns {Promise<void>} Resolves when initialization completes.
     */
    async init() {
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
                setTimeout(() => keyInput.focus(), 10);
                this._clearKeyError(keyInput, errorSpan);
                this._clearKeyError(githubTokenInput, githubTokenErrorSpan);
            } else {
                settingsModal.classList.remove("visible");
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        keyInput?.addEventListener("blur", () => {
            if (!keyInput.value.trim()) this._showKeyError(keyInput, errorSpan, "An API Key is required to connect.");
            else this._clearKeyError(keyInput, errorSpan);
        });

        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            const githubKey = githubTokenInput ? githubTokenInput.value.trim() : "";

            if (!key) {
                this._showKeyError(keyInput, errorSpan, "An API Key is required to connect.");
                return;
            }

            try {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, "loading", "Connecting...");
                if (keyInput) keyInput.disabled = true;
                if (githubTokenInput) githubTokenInput.disabled = true;

                StorageUtils.setItem("jules_api_key", key);
                StorageUtils.setItem("github_api_key", githubKey);
                toggleModal(false);
                this.app.toast.show("Connecting to APIs...");

                if (window.julesService) {
                    window.julesService.configure(key, githubKey);
                    await this.loadSources();
                }
            } finally {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, "ready", "Save & Connect");
                if (keyInput) keyInput.disabled = false;
                if (githubTokenInput) githubTokenInput.disabled = false;
            }
        });

        this._initInteractionModal();

        if (apiKey && window.julesService) {
            window.julesService.configure(apiKey, githubToken);
            await this.loadSources();
        } else {
            toggleModal(true);
        }
    }

    /**
     * Initializes the modal used to request required human-in-the-loop interactions.
     * @private
     */
    _initInteractionModal() {
        const modal = this.getEl("julesInteractionModal");
        const cancelBtn = this.getEl("cancelInteractionBtn");
        const submitBtn = this.getEl("submitInteractionBtn");
        const inputField = this.getEl("interactionModalInput");

        if (!modal) return;

        const closeModal = () => {
            modal.classList.remove("visible");
            this.activeModalSessionId = null;
            if (inputField) inputField.value = "";
        };

        const handleSubmit = async () => {
            const text = inputField.value.trim();
            if (!text || !this.activeModalSessionId) return;

            DOMUtils.setButtonState(submitBtn, "loading", "...");
            inputField.disabled = true;

            try {
                await window.julesService.sendUserInput(this.activeModalSessionId, text);
                this.app.toast.show("Reply transmitted.", "success");
                
                const statusSpan = document.getElementById(`status-${this.activeModalSessionId}`);
                if (statusSpan) {
                    statusSpan.className = "term-status";
                    statusSpan.textContent = "Transmitting response...";
                    statusSpan.onclick = null;
                }
                closeModal();
            } catch (e) {
                this.app.toast.show("Failed to send reply.", "error");
            } finally {
                DOMUtils.setButtonState(submitBtn, "ready", "Transmit Reply");
                inputField.disabled = false;
            }
        };

        cancelBtn?.addEventListener("click", closeModal);
        submitBtn?.addEventListener("click", handleSubmit);
        inputField?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleSubmit();
        });
    }

    /**
     * Displays the interaction modal and binds the session context.
     * @param {string} sessionId - The ID of the session waiting for input.
     * @param {string} agentEmoji - The emoji representing the agent.
     * @param {string} agentName - The name of the agent.
     * @param {string} promptText - The prompt/question presented to the user.
     * @private
     */
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
        setTimeout(() => inputField?.focus(), 50);
    }

    /**
     * Displays an error message on a given input field and error span.
     * @param {HTMLElement} input - The input element to style with an error.
     * @param {HTMLElement} span - The text element to populate with the error message.
     * @param {string} message - The error message text.
     * @private
     */
    _showKeyError(input, span, message) {
        if (!input || !span) return;
        input.style.borderColor = "#ef4444";
        span.textContent = message;
        span.style.display = "block";
    }

    /**
     * Clears the error state from a given input field and error span.
     * @param {HTMLElement} input - The input element to reset.
     * @param {HTMLElement} span - The text element to hide.
     * @private
     */
    _clearKeyError(input, span) {
        if (!input || !span) return;
        input.style.borderColor = "";
        span.textContent = "";
        span.style.display = "none";
    }

    /**
     * Fetches and populates available GitHub repositories for selection.
     * @see README.md#2-Repository-Source-Selection
     * @returns {Promise<void>}
     */
    async loadSources() {
        const picker = this.getEl("julesRepoPicker");
        if (!picker || !window.julesService) return;

        const originalText = picker.options.length > 0 ? picker.options[0].textContent : "1. Select GitHub Repository...";
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
                    picker.addEventListener("change", (e) => {
                        const sourceName = e.target.value;
                        if (sourceName) {
                            this.loadPullRequestsForRepo(sourceName);
                            this.loadActiveSessionsForRepo(sourceName);
                        } else {
                            this._clearPollingAndCache();
                            this.getEl("julesTerminal").innerHTML = `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Awaiting repository connection...</div>`;
                        }
                    });
                    picker.dataset.listenerAttached = "true";
                }
            } else {
                picker.innerHTML = `<option value="">${originalText}</option>`;
            }
        } catch (err) {
            picker.innerHTML = `<option value="">${originalText}</option>`;
            this.app.toast.show("Failed to fetch Repos. Check API Key.", true);
        } finally {
            picker.disabled = false;
        }
    }

    /**
     * Initializes and starts polling for active Jules sessions associated with a specific repository.
     * @param {string} sourceName - The repository source identifier (e.g., "sources/github/...").
     * @returns {Promise<void>}
     */
    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");
        
        if (this.currentRepo !== sourceName) {
            this._clearPollingAndCache();
            const existingInd = terminal.querySelector('#fetchingIndicator');
            if (!existingInd) {
                 terminal.innerHTML += `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Checking active Jules routines...</div>`;
            }
            this.currentRepo = sourceName;
        }

        if (this.activeSessionsInterval) clearInterval(this.activeSessionsInterval);

        const boundFetch = () => this._fetchAndRenderSessions(sourceName, terminal);
        await boundFetch();
        this.activeSessionsInterval = setInterval(boundFetch, 5000);
    }

    /**
     * Fetches and renders the open pull requests associated with a specific repository.
     * @see README.md#4-Pull-Request-Rendering
     * @param {string} sourceName - The repository source identifier.
     * @returns {Promise<void>}
     */
    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesService) return;
        try {
            const pullRequests = await window.julesService.getPullRequests(sourceName);
            this._renderPullRequests(pullRequests, this.getEl("julesTerminal"));
        } catch (error) {
            console.error("Failed to load pull requests:", error);
        }
    }

    /**
     * Renders an array of pull requests as clickable lines in the provided terminal DOM container.
     * @param {Array<Object>} prs - Array of pull request objects from the GitHub API.
     * @param {HTMLElement} terminal - The DOM container to append the generated elements to.
     * @private
     */
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
                <span style="color: var(--term-success); font-weight: 600;">[PR OPEN]</span> 
                <a href="${pr.html_url}" target="_blank" rel="noopener noreferrer" class="term-pr-title" style="color: #e4e4e7; text-decoration: none;">#${pr.number} ${pr.title} ↗</a>
            `;
            terminal.insertBefore(item, terminal.firstChild);
        });
    }

    /**
     * Internal routine to pull recent sessions from the API, filter them, and route them to rendering logic.
     * @param {string} sourceName - The repository source identifier.
     * @param {HTMLElement} terminal - The DOM container to append the generated session elements to.
     * @private
     * @returns {Promise<void>}
     */
    async _fetchAndRenderSessions(sourceName, terminal) {
        try {
            if (!window.julesService || !window.julesService.apiKey) return;

            const sessionsResponse = await window.julesService.getSessions(50);
            if (!sessionsResponse.sessions) {
                this._checkEmptyTerminal();
                return;
            }

            let repoSessions = sessionsResponse.sessions.filter(s => {
                if (!s.sourceContext || s.sourceContext.source !== sourceName) return false;
                if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) return false;
                
                const timeStr = s.updateTime || s.createTime || s.startTime;
                if (timeStr) {
                    const ageHours = (Date.now() - new Date(timeStr).getTime()) / (1000 * 60 * 60);
                    if (ageHours > 2) return false; 
                } else if (!this.renderedSessionIds.has(s.id)) {
                    return false;
                }

                // If a ticket reached a terminal state (done, failed, drafted PR), it is NO LONGER 
                // shown in the active Jules feed. We completely rely on the GitHub PR fetch to show completions.
                const isEnded = s.state === 'COMPLETED' || s.state === 'FAILED' || s.state === 'ERROR' || s.state === 'CANCELLED' || (s.outputs && s.outputs.some(hasPullRequest));
                
                if (isEnded) return false; 
                
                return true;
            });

            repoSessions = [...repoSessions].reverse().slice(0, 3);
            const repoPath = sourceName.replace('sources/github/', '');

            const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
            if (fetchingIndicator) fetchingIndicator.remove();

            if (!this.renderedSessionIds) this.renderedSessionIds = new Set();
            const currentSessionIds = new Set(repoSessions.map(s => s.id));

            for (const id of this.renderedSessionIds) {
                if (!currentSessionIds.has(id)) {
                    this.dismissSession(id);
                }
            }

            for (const session of repoSessions) {
                this._processSession(session, terminal, repoPath);
            }
            
            this._checkEmptyTerminal();

        } catch (err) {
            console.error("Failed to load active sessions:", err);
        }
    }

    /**
     * Checks if the terminal DOM element has any visible children and displays an awaiting indicator if not.
     * @private
     */
    _checkEmptyTerminal() {
        const terminal = this.getEl("julesTerminal");
        if (terminal.children.length === 0 || (terminal.children.length === 1 && terminal.firstElementChild.id === 'fetchingIndicator')) {
             terminal.innerHTML = `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Ready. Awaiting execution commands...</div>`;
        }
    }

    /**
     * Creates and appends a DOM line for a given active session, then initiates granular log polling.
     * @param {Object} session - The session object from the API.
     * @param {HTMLElement} terminal - The DOM container to append the line to.
     * @param {string} repoPath - The simplified repository path string.
     * @private
     */
    _processSession(session, terminal, repoPath) {
        if (this.renderedSessionIds.has(session.id)) return;
        this.renderedSessionIds.add(session.id);
        
        const agentName = session.title || "Agent Task";
        let safeAgentName = agentName.replace(/"/g, '');
        let agentEmoji = "🤖";
        
        let matchedAgent = this.app.agents.find(a => safeAgentName.includes(a.name));
        if (!matchedAgent && this.app.customAgents) {
            const flatCustoms = [];
            for (const category in this.app.customAgents) {
                if (typeof this.app.customAgents[category] === 'object') {
                    flatCustoms.push(...Object.values(this.app.customAgents[category]));
                }
            }
            matchedAgent = flatCustoms.find(a => a.name && safeAgentName.includes(a.name));
        }

        if (matchedAgent && matchedAgent.emoji) {
            agentEmoji = matchedAgent.emoji;
        } else {
            for (const [name, emoji] of Object.entries(CORE_EMOJIS)) {
                if (safeAgentName.includes(name)) {
                    agentEmoji = emoji;
                    break;
                }
            }
        }

        const block = document.createElement("div");
        block.className = `term-session-line state-active`;
        block.id = `session-${session.id}`;

        // 1-line Minimalist layout
        block.innerHTML = `
            <span class="term-agent-name">${agentEmoji} ${safeAgentName}</span> 
            <span class="term-separator">—</span>
            <span class="term-status" id="status-${session.id}">Initializing...</span>
        `;

        const firstSession = terminal.querySelector('.term-session-line');
        if (firstSession) {
            terminal.insertBefore(block, firstSession);
        } else {
            terminal.appendChild(block);
        }

        this.startTerminalPolling(session.id, block, safeAgentName, agentEmoji);
    }

    /**
     * Dispatches a request to create a new session executing a given agent task on the selected source.
     * @param {Object} agent - The agent data object containing the prompt.
     * @param {HTMLElement|null} btn - The DOM button that triggered the launch, for loading state management.
     * @returns {Promise<void>}
     */
    async launchSession(agent, btn = null) {
        const sourceName = this.getEl("julesRepoPicker").value;
        const userTask = this.getEl("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";

        if (!sourceName) {
            this.app.toast.show("Select a target repository first.", "error");
            this.getEl("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
            return;
        }

        this.getEl("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });

        if (btn) DOMUtils.setButtonState(btn, "loading", "Launching...");

        try {
            await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name}`);
            this.app.toast.show(`Session launched successfully.`, "success");
            this._fetchAndRenderSessions(sourceName, this.getEl("julesTerminal"));
        } catch (err) {
            this.app.toast.show(`Launch failed. Check API key and permissions.`, "error");
        } finally {
            if (btn) DOMUtils.setButtonState(btn, "ready", "Launch in Jules 🚀");
        }
    }

    /**
     * Periodically queries the Jules API for activities and statuses tied to a running session.
     * @see README.md#3-Polling-and-Session-Management
     * @param {string} sessionId - The ID of the session to poll.
     * @param {HTMLElement} block - The DOM block representing the session line.
     * @param {string} agentName - The name of the agent processing the session.
     * @param {string} agentEmoji - The emoji corresponding to the agent.
     */
    startTerminalPolling(sessionId, block, agentName, agentEmoji) {
        if (!this.julesPollingIntervals) this.julesPollingIntervals = {};
        if (this.julesPollingIntervals[sessionId]) clearInterval(this.julesPollingIntervals[sessionId]);

        this.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesService.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                const activities = activitiesResponse.activities.sort(sortByCreateTime);

                const state = {
                    isCompleted: false,
                    hasError: false,
                    isWaitingForInput: false,
                    latestLog: "Processing...",
                    rawMessage: "Processing..."
                };

                // Extract only the absolute latest status string
                activities.forEach(act => {
                    let text = act.title || act.description || "";
                    if (text) {
                        state.rawMessage = act.description || act.title; // Keep full text for modal
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

                    if (act.userActionRequired || act.requiresInput || (act.type && act.type.includes('INPUT'))) state.isWaitingForInput = true;
                    if (act.sessionCompleted) state.isCompleted = true;
                });

                this._updatePollingState(sessionId, block, state, agentName, agentEmoji);

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
    }

    /**
     * Processes activity state changes, updating the DOM and routing specific states like completion and waiting for input.
     * @param {string} sessionId - The ID of the session.
     * @param {HTMLElement} block - The DOM element representing the session line.
     * @param {Object} state - Object encapsulating the calculated state from polled activities.
     * @param {string} agentName - The name of the agent processing the session.
     * @param {string} agentEmoji - The emoji corresponding to the agent.
     * @private
     */
    _updatePollingState(sessionId, block, state, agentName, agentEmoji) {
        const statusSpan = block.querySelector(`#status-${sessionId}`);
        if (!statusSpan) return;

        // If the task completes natively, force a GitHub PR fetch, then delete the Jules active line.
        if (state.isCompleted) {
            statusSpan.className = "term-status status-success";
            statusSpan.innerHTML = `✅ Execution Finished`;
            this.loadPullRequestsForRepo(this.currentRepo); 
            setTimeout(() => this.dismissSession(sessionId), 2000); // Give user 2s to see it succeeded before removing
            return;
        }

        if (state.hasError) {
            statusSpan.className = "term-status status-error";
            statusSpan.innerHTML = `${FormatUtils.escapeHTML(state.latestLog)} <button class="term-action-btn" onclick="document.getElementById('session-${sessionId}').remove()">[✕]</button>`;
            clearInterval(this.julesPollingIntervals[sessionId]);
            return;
        }

        if (state.isWaitingForInput) {
            statusSpan.className = "term-status status-waiting";
            statusSpan.innerHTML = `⚠️ Response Needed (Click to view)`;
            // Attach modal trigger with the full, un-truncated message text
            statusSpan.onclick = () => {
                this._showInteractionModal(sessionId, agentEmoji, agentName, state.rawMessage);
            };
        } else {
            statusSpan.className = "term-status";
            statusSpan.onclick = null; 
            statusSpan.textContent = state.latestLog;
        }
    }

    /**
     * Disposes of intervals, tracking sets, and current scope references. Used primarily during app teardown or resets.
     */
    cleanup() {
        if (this.activeSessionsInterval) {
            clearInterval(this.activeSessionsInterval);
            this.activeSessionsInterval = null;
        }
        this._clearPollingAndCache();
        if (this.dismissedSessionIds) this.dismissedSessionIds.clear();
        this.currentRepo = null;
    }

    /**
     * Clears activity polling intervals and the rendered session IDs cache.
     * @private
     */
    _clearPollingAndCache() {
        if (this.julesPollingIntervals) {
            Object.values(this.julesPollingIntervals).forEach(clearInterval);
            this.julesPollingIntervals = {};
        }
        if (this.renderedSessionIds) this.renderedSessionIds.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}