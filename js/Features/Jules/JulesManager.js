/**
 * Manages the core operations for interacting with Jules APIs.
 * This class orchestrates authentication, source repository discovery,
 * and handles the lifecycle of agent execution sessions via real-time polling.
 *
 * @see README.md#Jules-Manager-Architecture for the overarching flow.
 */
class JulesManager {
    /**
     * @param {Object} rosterApp - The main application instance.
     */
    constructor(rosterApp) {
        /** @type {Object} The main application instance */
        this.app = rosterApp;
        /** @type {string|null} The current target repository source name */
        this.currentRepo = null;
        /** @type {number|null} Interval ID for polling the active sessions list */
        this.activeSessionsInterval = null;
        /** @type {Object<string, number>} Map of session IDs to their polling interval IDs */
        this.julesPollingIntervals = {};
        /** @type {Set<string>} Track rendered session IDs to prevent duplicate DOM items */
        this.renderedSessionIds = new Set();
        /** @type {Set<string>} Track session IDs explicitly dismissed by the user */
        this.dismissedSessionIds = new Set();
        /** @type {Object<string, HTMLElement>} Cached DOM element references */
        this.elements = {};
    }

    /**
     * Retrieves and caches a DOM element by its ID.
     * @param {string} id - The DOM element ID.
     * @returns {HTMLElement|null} The cached element.
     */
    getEl(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }

    /**
     * Hides a specific session from the UI and ceases its polling interval.
     * @param {string} sessionId - The ID of the session to dismiss.
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
    }

    /**
     * Initializes the manager by checking stored credentials and
     * triggering the authentication flow if required.
     * @see README.md#1-Initialization-init for the complete auth sequence.
     * @returns {Promise<void>}
     */
    async init() {
        const apiKey = StorageUtils.getItem("jules_api_key");
        const settingsModal = this.getEl("settingsModal");
        const openBtn = this.getEl("openSettingsBtn");
        const closeBtn = this.getEl("closeSettingsBtn");
        const saveBtn = this.getEl("saveSettingsBtn");
        const keyInput = this.getEl("julesApiKeyInput");
        const errorSpan = this.getEl("julesApiKeyError");

        // Modal Toggles
        const toggleModal = (show) => {
            if (show) {
                keyInput.value = StorageUtils.getItem("jules_api_key");
                settingsModal.classList.add("visible");
                setTimeout(() => keyInput.focus(), 10);
                this._clearKeyError(keyInput, errorSpan);
            } else {
                settingsModal.classList.remove("visible");
                this._clearKeyError(keyInput, errorSpan);
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        keyInput?.addEventListener("blur", () => {
            if (!keyInput.value.trim()) {
                this._showKeyError(keyInput, errorSpan, "An API Key is required to connect.");
            } else {
                this._clearKeyError(keyInput, errorSpan);
            }
        });

        // Save and Connect Logic
        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            if (!key) {
                this._showKeyError(keyInput, errorSpan, "An API Key is required to connect.");
                return;
            }

            try {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, "loading", "Connecting...");
                if (keyInput) keyInput.disabled = true;

                StorageUtils.setItem("jules_api_key", key);
                toggleModal(false);
                this.app.toast.show("Connecting to Jules...");

                if (window.julesService) {
                    window.julesService.configure(key);
                    await this.loadSources();
                }
            } finally {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, "ready", "Save & Connect");
                if (keyInput) keyInput.disabled = false;
            }
        });

        // Auto-connect if key exists, otherwise prompt user
        if (apiKey && window.julesService) {
            window.julesService.configure(apiKey);
            await this.loadSources();
        } else {
            toggleModal(true);
        }
    }

    _showKeyError(input, span, message) {
        if (!input || !span) return;
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", span.id);
        input.style.borderColor = "#ef4444";
        span.textContent = message;
        span.style.display = "block";
    }

    _clearKeyError(input, span) {
        if (!input || !span) return;
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        input.style.borderColor = "";
        span.textContent = "";
        span.style.display = "none";
    }

    /**
     * Fetches the user's available GitHub source repositories and populates
     * the repository selector UI.
     * @see README.md#2-Loading-Sources-loadSources
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
                this.app.toast.show("Jules Repositories Loaded");
            } else {
                picker.innerHTML = `<option value="">${originalText}</option>`;
            }
        } catch (err) {
            picker.innerHTML = `<option value="">${originalText}</option>`;
            this.app.toast.show("Failed to fetch Repos. Check API Key.", true);
            console.error("Jules Source Error:", err);
        } finally {
            picker.disabled = false;
        }
    }

    /**
     * Fetches and continually polls the active sessions associated with a given
     * repository source, rendering them to the Jules Terminal dashboard.
     * @see README.md#3-Session-Management-launchSession--loadActiveSessionsForRepo
     * @param {string} sourceName - The full API source name (e.g. 'sources/github/owner/repo').
     * @returns {Promise<void>}
     */
    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");
        terminal.classList.add('active');

        if (this.currentRepo !== sourceName) {
            this._clearPollingAndCache();

            terminal.innerHTML = FormatUtils.createTerminalLineHTML("Fetching active sessions...", "fetchingIndicator");
            this.currentRepo = sourceName;
        }

        if (this.activeSessionsInterval) {
            clearInterval(this.activeSessionsInterval);
        }

        const boundFetch = () => this._fetchAndRenderSessions(sourceName, terminal);
        await boundFetch();
        this.activeSessionsInterval = setInterval(boundFetch, 5000);
    }

    /**
     * Internal implementation to fetch active sessions and render them.
     * @private
     * @param {string} sourceName - The active repository source name.
     * @param {HTMLElement} terminal - The terminal UI container.
     */
    async _fetchAndRenderSessions(sourceName, terminal) {
        try {
            if (!window.julesService || !window.julesService.apiKey) return;

            const sessionsResponse = await window.julesService.getSessions(50);
            if (!sessionsResponse.sessions) {
                if (terminal.querySelector('#fetchingIndicator')) {
                    terminal.innerHTML = FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...");
                }
                return;
            }

            let repoSessions = sessionsResponse.sessions.filter(s => {
                if (!s.sourceContext || s.sourceContext.source !== sourceName) return false;
                if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) return false;
                // Filter out sessions that have a merged or closed PR
                if (s.outputs && s.outputs.some(o => o.pullRequest && (o.pullRequest.state === 'MERGED' || o.pullRequest.state === 'CLOSED'))) return false;

                return true;
            });

            // Sort descending (most recent first) and cap at 5
            repoSessions = [...repoSessions].reverse().slice(0, 5);
            const repoPath = sourceName.replace('sources/github/', '');

            const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
            if (fetchingIndicator) fetchingIndicator.remove();

            if (repoSessions.length === 0 && terminal.children.length === 0) {
                terminal.innerHTML = FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...");
                return;
            }

            if (!this.renderedSessionIds) this.renderedSessionIds = new Set();
            const currentSessionIds = new Set(repoSessions.map(s => s.id));

            // Clean up removed sessions from UI and polling
            const existingItems = terminal.querySelectorAll('.dashboard-item');
            existingItems.forEach(item => {
                const id = item.id.replace('session-', '');
                if (!id.startsWith('temp-') && !currentSessionIds.has(id)) {
                    item.remove();
                    this.renderedSessionIds.delete(id);
                    if (this.julesPollingIntervals && this.julesPollingIntervals[id]) {
                        clearInterval(this.julesPollingIntervals[id]);
                        delete this.julesPollingIntervals[id];
                    }
                }
            });

            if (repoSessions.length > 0 && terminal.querySelector('.terminal-line:not(#fetchingIndicator)')) {
                const awaitingMsg = Array.from(terminal.querySelectorAll('.terminal-line')).find(el => el.textContent.includes('Awaiting Agent launch'));
                if (awaitingMsg) awaitingMsg.remove();
            }

            for (const session of repoSessions) {
                this._processSession(session, terminal, repoPath);
            }

            // Enforce DOM order based on sorted array (repoSessions is newest to oldest)
            for (const session of repoSessions) {
                const item = document.getElementById(`session-${session.id}`);
                if (item) terminal.appendChild(item);
            }

        } catch (err) {
            console.error("Failed to load active sessions:", err);
        }
    }

    /**
     * Validates an incoming session payload and determines whether it should
     * be skipped, updated, or initially rendered to the terminal.
     * @private
     * @param {Object} session - The session metadata from the API.
     * @param {HTMLElement} terminal - The terminal container element.
     * @param {string} repoPath - The visual path (e.g. 'owner/repo') of the target repo.
     */
    _processSession(session, terminal, repoPath) {
        const isCompleted = session.outputs && session.outputs.some(o => o.pullRequest);
        if (this.renderedSessionIds.has(session.id)) {
            if (!isCompleted) return;
            // ⚡ Bolt+: Replaced terminal.querySelector with document.getElementById for O(1) lookup in polling loops
            const statusBadge = document.getElementById(`status-${session.id}`);
            if (!statusBadge || statusBadge.textContent === "Completed") return;

            statusBadge.className = "status-badge status-completed";
            statusBadge.textContent = "Completed";
            const prInfo = session.outputs.find(o => o.pullRequest).pullRequest;
            const item = document.getElementById(`session-${session.id}`);
            const metaDiv = item ? item.querySelector(".dashboard-meta") : null;
            if (metaDiv && prInfo) {
                metaDiv.textContent = 'PR Drafted: ' + prInfo.title;
            }
            if (item) {
                this._attachCompletedItemListeners(item, session.id, prInfo);
            }
            return;
        }

        this.renderedSessionIds.add(session.id);
        const item = document.createElement("div");
        item.className = "dashboard-item";
        item.id = `session-${session.id}`;

        const agentName = session.title || "Agent Task";
        const prTitle = isCompleted ? session.outputs.find(o => o.pullRequest).pullRequest.title : agentName;

        let agentEmoji = "🤖";
        const matchedAgent = this.app.agents.find(a => a.name === agentName) ||
                             (this.app.customAgents && Object.values(this.app.customAgents).find(a => a.name === agentName));
        if (matchedAgent && matchedAgent.emoji) {
            agentEmoji = matchedAgent.emoji;
        }

        item.innerHTML = '';
        item.append(...this._createDashboardItemNodes(
            agentEmoji,
            agentName,
            isCompleted ? 'PR Drafted: ' + prTitle : repoPath,
            `status-${session.id}`,
            isCompleted ? 'status-completed' : 'status-in-progress',
            isCompleted ? 'Completed' : 'Loading...'
        ));

        if (isCompleted) {
            const prInfo = session.outputs.find(o => o.pullRequest).pullRequest;
            this._attachCompletedItemListeners(item, session.id, prInfo);
        }

        terminal.insertBefore(item, terminal.firstChild);

        if (!isCompleted) {
            this.startTerminalPolling(session.id, item, repoPath);
        }
    }

    /**
     * Executes a new task session on a selected repository using the provided agent's
     * instructions and user input.
     * @see README.md#3-Session-Management-launchSession--loadActiveSessionsForRepo
     * @param {Object} agent - The agent configuration object.
     * @param {HTMLElement} [btn=null] - Optional launch button to reflect loading state.
     * @returns {Promise<void>}
     */
    async launchSession(agent, btn = null) {
        const sourceName = this.getEl("julesRepoPicker").value;
        const userTask = this.getEl("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";

        if (!sourceName) {
            this.app.toast.show("Please select a target repository in the runner panel.", "error");
            this.getEl("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
            this.getEl("julesRepoPicker").focus();
            return;
        }

        this.getEl("julesRunnerPanel").scrollIntoView({ behavior: 'smooth' });
        const terminal = this.getEl("julesTerminal");
        terminal.classList.add('active');

        // Clear the "Awaiting..." placeholder if it's the first execution
        if (terminal.innerHTML.includes("Awaiting Agent launch command")) {
            terminal.innerHTML = "";
        }

        // Generate a temporary ID for the new session
        const tempId = 'temp-' + Date.now();

        const item = document.createElement("div");
        item.className = "dashboard-item";
        item.id = tempId;

        const repoPath = sourceName.replace('sources/github/', '');

        item.innerHTML = '';
        item.append(...this._createDashboardItemNodes(
            agent.emoji,
            agent.name,
            repoPath,
            `status-${tempId}`,
            'status-in-progress',
            'Launching...'
        ));
        terminal.appendChild(item);

        if (btn) {
            DOMUtils.setButtonState(btn, "loading", "Launching...");
        }

        try {
            const session = await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name} Execution`);

            // Update item with actual session ID
            item.id = `session-${session.id}`;
            // ⚡ Bolt+: Replaced terminal.querySelector with document.getElementById
            const statusBadge = document.getElementById(`status-${tempId}`);
            if (statusBadge) {
                statusBadge.id = `status-${session.id}`;
                statusBadge.textContent = "In Progress";
            }

            this.startTerminalPolling(session.id, item, repoPath);
            this.app.toast.show(`Session for ${agent.name} launched successfully!`, "success");
        } catch (err) {
            const statusBadge = document.getElementById(`status-${tempId}`);
            if (statusBadge) {
                statusBadge.className = "status-badge status-failed";
                statusBadge.textContent = "Failed";
            }

            const metaDiv = item.querySelector(".dashboard-meta");
            metaDiv.textContent = `Launch Error: ${err.message}`;
            metaDiv.style.color = "#ef4444";

            this.app.toast.show(`Failed to launch session: ${err.message}`, "error");
        } finally {
            if (btn) {
                DOMUtils.setButtonState(btn, "ready", "Launch in Jules 🚀");
            }
        }
    }

    /**
     * Begins an active 3-second polling interval to fetch deep activity logs for a specific session,
     * maintaining real-time UI states until completion, failure, or user input is requested.
     * @see README.md#4-Real-Time-Terminal-Polling-startTerminalPolling
     * @param {string} sessionId - The active session ID.
     * @param {HTMLElement} item - The dashboard DOM item representing the session.
     * @param {string} repoPath - The target repository path.
     */
    startTerminalPolling(sessionId, item, repoPath) {
        if (!this.julesPollingIntervals) this.julesPollingIntervals = {};
        if (this.julesPollingIntervals[sessionId]) clearInterval(this.julesPollingIntervals[sessionId]);

        const statusBadge = item.querySelector(`#status-${sessionId}`);
        const metaDiv = item.querySelector(".dashboard-meta");
        const statusContainer = item.querySelector(".dashboard-status");

        this.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesService.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                // Sort chronologically
                // ⚡ Bolt+: Eliminated O(N log N) Date parsing overhead during high-frequency polling by using native ISO string comparison instead of new Date().
                const activities = activitiesResponse.activities.sort((a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0));

                const state = {
                    isCompleted: false,
                    hasError: false,
                    isWaitingForInput: false,
                    lastProgressTitle: metaDiv.textContent
                };

                activities.forEach(act => this._processActivity(act, state));

                metaDiv.textContent = state.lastProgressTitle;
                this._updatePollingState(sessionId, repoPath, state, statusBadge, metaDiv, statusContainer);

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000); // Poll every 3 seconds
    }

    /**
     * Parses a single activity object from the session logs and updates the
     * aggregate polling state accumulator.
     * @private
     * @param {Object} act - The individual activity record from the API.
     * @param {Object} state - The accumulator object containing current polling boolean flags.
     */
    _processActivity(act, state) {
        if (act.progressUpdated) {
            state.lastProgressTitle = act.progressUpdated.title;
            return;
        }

        if (act.userActionRequired || act.requiresInput || (act.type && act.type.includes('INPUT'))) {
            state.isWaitingForInput = true;
            state.lastProgressTitle = act.title || "Waiting for Input...";
            return;
        }

        if (act.sessionCompleted) {
            state.isCompleted = true;
            if (act.artifacts && act.artifacts[0]?.changeSet?.gitPatch?.suggestedCommitMessage) {
                const prTitle = act.artifacts[0].changeSet.gitPatch.suggestedCommitMessage.split('\n')[0];
                state.lastProgressTitle = `PR Drafted: ${prTitle}`;
            } else {
                state.lastProgressTitle = "Session Completed Successfully.";
            }
            return;
        }

        if (act.error) {
            state.hasError = true;
            state.lastProgressTitle = "Session Failed.";
        }
    }

    /**
     * Mutates the session UI based on the computed final polling state, effectively
     * managing completion states, failures, and required inputs.
     * @private
     * @param {string} sessionId - The session ID.
     * @param {string} repoPath - The GitHub repository target string.
     * @param {Object} state - The finalized polling flags computed via _processActivity.
     * @param {HTMLElement} statusBadge - The badge element reflecting progress status.
     * @param {HTMLElement} metaDiv - The sub-text element beneath the session title.
     * @param {HTMLElement} statusContainer - The container holding the status badge.
     */
    _updatePollingState(sessionId, repoPath, state, statusBadge, metaDiv, statusContainer) {
        if (state.isCompleted) {
            statusBadge.className = "status-badge status-completed";
            statusBadge.textContent = "Completed";

            const prLink = DOMUtils.createPRLink(`https://github.com/${repoPath}/pulls`, () => this.dismissSession(sessionId));
            statusContainer.appendChild(prLink);

            clearInterval(this.julesPollingIntervals[sessionId]);
            delete this.julesPollingIntervals[sessionId];
            return;
        }

        if (state.hasError) {
            statusBadge.className = "status-badge status-failed";
            statusBadge.textContent = "Failed";
            metaDiv.style.color = "#ef4444";

            clearInterval(this.julesPollingIntervals[sessionId]);
            delete this.julesPollingIntervals[sessionId];
            return;
        }

        if (state.isWaitingForInput) {
            statusBadge.className = "status-badge status-failed";
            statusBadge.textContent = "Needs Input";
            statusBadge.style.background = "rgba(245, 158, 11, 0.1)";
            statusBadge.style.color = "#f59e0b";
            statusBadge.style.borderColor = "rgba(245, 158, 11, 0.2)";
        }
    }

    /**
     * Tears down all active intervals and resets UI state caches
     * to prevent memory leaks when navigating or changing scopes.
     * @see README.md#5-Cleanup-cleanup
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

    _clearPollingAndCache() {
        if (this.julesPollingIntervals) {
            Object.values(this.julesPollingIntervals).forEach(clearInterval);
            this.julesPollingIntervals = {};
        }
        if (this.renderedSessionIds) this.renderedSessionIds.clear();
    }

    _attachCompletedItemListeners(item, sessionId, prInfo) {
        item.style.cursor = 'pointer';
        if (!item.dataset.clickListenerAttached) {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.pr-link-btn')) {
                    this.dismissSession(sessionId);
                }
            });
            item.dataset.clickListenerAttached = 'true';
        }

        if (prInfo && prInfo.url && !item.querySelector(".pr-link-btn")) {
            const prLink = DOMUtils.createPRLink(prInfo.url, () => this.dismissSession(sessionId));
            item.querySelector(".dashboard-status").appendChild(prLink);
        }
    }

    /**
     * Helper to consistently construct the complex internal node structure for a
     * session card within the dashboard terminal UI.
     * @private
     * @param {string} emoji - The visual emoji for the session's executing agent.
     * @param {string} title - The main name of the executing agent or session.
     * @param {string} meta - Secondary sub-text or repository path.
     * @param {string} statusId - The element ID for the generated status badge.
     * @param {string} statusClass - CSS classes to append to the status badge.
     * @param {string} statusText - The human-readable textual status.
     * @returns {Array<HTMLElement>} An array containing the generated [infoDiv, statusDiv] elements.
     */
    _createDashboardItemNodes(emoji, title, meta, statusId, statusClass, statusText) {
        const infoDiv = document.createElement("div");
        infoDiv.className = "dashboard-info";

        const emojiSpan = document.createElement("span");
        emojiSpan.className = "emoji-hero";
        emojiSpan.style.fontSize = "1.5rem";
        emojiSpan.style.marginRight = "0.5rem";
        emojiSpan.textContent = emoji;

        const textDiv = document.createElement("div");
        textDiv.className = "dashboard-text";

        const titleDiv = document.createElement("div");
        titleDiv.className = "dashboard-title";
        titleDiv.textContent = title;

        const metaDiv = document.createElement("div");
        metaDiv.className = "dashboard-meta";
        metaDiv.textContent = meta;

        textDiv.appendChild(titleDiv);
        textDiv.appendChild(metaDiv);

        infoDiv.appendChild(emojiSpan);
        infoDiv.appendChild(textDiv);

        const statusDiv = document.createElement("div");
        statusDiv.className = "dashboard-status";

        const statusSpan = document.createElement("span");
        statusSpan.className = `status-badge ${statusClass}`;
        statusSpan.id = statusId;
        statusSpan.textContent = statusText;

        statusDiv.appendChild(statusSpan);

        return [infoDiv, statusDiv];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}
