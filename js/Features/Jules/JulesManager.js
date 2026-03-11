/**
 * Polling array callbacks hoisted to the file scope to prevent
 * continuous garbage collection overhead during setInterval ticks.
 */
const hasPullRequest = o => o.pullRequest;
const sortByCreateTime = (a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0);

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
        /** @type {Set<string>} Track open PR URLs fetched from GitHub */
        this.openPRUrls = new Set();
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
        const githubToken = StorageUtils.getItem("github_api_key");
        const settingsModal = this.getEl("settingsModal");
        const openBtn = this.getEl("openSettingsBtn");
        const closeBtn = this.getEl("closeSettingsBtn");
        const saveBtn = this.getEl("saveSettingsBtn");
        const keyInput = this.getEl("julesApiKeyInput");
        const errorSpan = this.getEl("julesApiKeyError");
        const githubTokenInput = this.getEl("githubTokenInput");
        const githubTokenErrorSpan = this.getEl("githubTokenError");

        // Modal Toggles
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
                this._clearKeyError(keyInput, errorSpan);
                this._clearKeyError(githubTokenInput, githubTokenErrorSpan);
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
                this.app.toast.show("Connecting to Jules...");

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

        // Auto-connect if key exists, otherwise prompt user
        if (apiKey && window.julesService) {
            window.julesService.configure(apiKey, githubToken);
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
            terminal.innerHTML = `<div class="session-card" id="fetchingIndicator" style="background: transparent; border: none; align-items: center; padding: 2rem;"><div style="font-family: monospace; color: var(--text-secondary);">Fetching active sessions...</div></div>`;
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
     * Fetches open pull requests for the repository via the GitHub API and renders them.
     * Stores the open PR URLs to allow filtering of completed Jules tasks.
     * @param {string} sourceName - The active repository source name.
     */
    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesService) return;
        try {
            const pullRequests = await window.julesService.getPullRequests(sourceName);
            // Cache the active PR URLs so we can cross-reference them and dismiss closed sessions
            this.openPRUrls = new Set(pullRequests.map(pr => pr.html_url || pr.url));
        } catch (error) {
            console.error("Failed to load pull requests:", error);
            this.openPRUrls = new Set();
        }
    }

    /**
     * Internal implementation to fetch active sessions and render them.
     * It cross-references GitHub's open PR list to ensure merged/closed tasks are removed.
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
                    terminal.innerHTML = `<div class="session-card" id="fetchingIndicator" style="background: transparent; border: none; align-items: center; padding: 2rem;"><div style="font-family: monospace; color: var(--text-secondary);">Awaiting Agent launch command...</div></div>`;
                }
                return;
            }

            let repoSessions = sessionsResponse.sessions.filter(s => {
                if (!s.sourceContext || s.sourceContext.source !== sourceName) return false;
                if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) return false;
                
                // Cross-Reference: If it's a completed task that generated a PR, verify the PR is still open in GitHub.
                const isCompleted = s.outputs && s.outputs.some(hasPullRequest);
                if (isCompleted && this.openPRUrls.size > 0) {
                    const pr = s.outputs.find(hasPullRequest).pullRequest;
                    const prUrl = pr.url || pr.html_url;
                    
                    let isPrStillOpen = false;
                    this.openPRUrls.forEach(openUrl => {
                        // Check for standard matching or fallback to comparing the PR number strings
                        if (openUrl === prUrl || (pr.number && openUrl.includes(`/${pr.number}`))) {
                            isPrStillOpen = true;
                        }
                    });

                    // If the PR is no longer open in GitHub, auto-dismiss this session to declutter the viewport.
                    if (!isPrStillOpen) {
                        this.dismissedSessionIds.add(s.id);
                        return false;
                    }
                }
                return true;
            });

            // Sort descending (most recent first) and cap at 10
            repoSessions = [...repoSessions].reverse().slice(0, 10);
            const repoPath = sourceName.replace('sources/github/', '');

            const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
            if (fetchingIndicator) fetchingIndicator.remove();

            if (repoSessions.length === 0 && terminal.children.length === 0) {
                terminal.innerHTML = `<div class="session-card" id="fetchingIndicator" style="background: transparent; border: none; align-items: center; padding: 2rem;"><div style="font-family: monospace; color: var(--text-secondary);">Awaiting Agent launch command...</div></div>`;
                return;
            }

            if (!this.renderedSessionIds) this.renderedSessionIds = new Set();
            const currentSessionIds = new Set(repoSessions.map(s => s.id));

            // Clean up old elements no longer returned by the API or newly filtered
            for (const id of this.renderedSessionIds) {
                if (!currentSessionIds.has(id)) {
                    const item = document.getElementById(`session-${id}`);
                    if (item) item.remove();
                    this.renderedSessionIds.delete(id);
                    if (this.julesPollingIntervals && this.julesPollingIntervals[id]) {
                        clearInterval(this.julesPollingIntervals[id]);
                        delete this.julesPollingIntervals[id];
                    }
                }
            }

            for (const session of repoSessions) {
                this._processSession(session, terminal, repoPath);
            }

            // Enforce DOM order based on sorted array
            for (const session of repoSessions) {
                const item = document.getElementById(`session-${session.id}`);
                if (item) terminal.appendChild(item);
            }

        } catch (err) {
            console.error("Failed to load active sessions:", err);
        }
    }

    /**
     * Validates an incoming session payload and constructs the full interactive Session Card.
     * @private
     * @param {Object} session - The session metadata from the API.
     * @param {HTMLElement} terminal - The terminal container element.
     * @param {string} repoPath - The visual path (e.g. 'owner/repo') of the target repo.
     */
    _processSession(session, terminal, repoPath) {
        const isCompleted = session.outputs && session.outputs.some(hasPullRequest);
        
        if (this.renderedSessionIds.has(session.id)) {
            if (!isCompleted) return;
            const statusBadge = document.getElementById(`status-${session.id}`);
            if (!statusBadge || statusBadge.textContent === "Completed") return;

            statusBadge.className = "status-badge status-completed";
            statusBadge.textContent = "Completed";
            
            const prInfo = session.outputs.find(hasPullRequest).pullRequest;
            const item = document.getElementById(`session-${session.id}`);
            
            if (item && prInfo) {
                const titleEl = item.querySelector(".session-title");
                if (titleEl) titleEl.textContent = `PR Drafted: ${prInfo.title}`;
                this._attachCompletedItemListeners(item, session.id, prInfo);
            }
            return;
        }

        this.renderedSessionIds.add(session.id);
        const item = document.createElement("div");
        item.className = "session-card";
        item.id = `session-${session.id}`;

        const agentName = session.title || "Agent Task";
        const prTitle = isCompleted ? session.outputs.find(hasPullRequest).pullRequest.title : agentName;

        let agentEmoji = "🤖";
        const matchedAgent = this.app.agents.find(a => a.name === agentName) ||
                             (this.app.customAgents && Object.values(this.app.customAgents).find(a => a.name === agentName));
        if (matchedAgent && matchedAgent.emoji) {
            agentEmoji = matchedAgent.emoji;
        }

        item.innerHTML = '';
        item.append(...this._createDashboardItemNodes(
            agentEmoji,
            isCompleted ? `PR Drafted: ${prTitle}` : agentName,
            `status-${session.id}`,
            isCompleted ? 'status-completed' : 'status-in-progress',
            isCompleted ? 'Completed' : 'Loading...'
        ));

        if (isCompleted) {
            const prInfo = session.outputs.find(hasPullRequest).pullRequest;
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

        if (btn) {
            DOMUtils.setButtonState(btn, "loading", "Launching...");
        }

        try {
            await window.julesService.createSession(agent.prompt, userTask, sourceName, `${agent.name} Execution`);
            this.app.toast.show(`Session for ${agent.name} launched successfully! Sent to Jules.`, "success");
        } catch (err) {
            this.app.toast.show(`Session launch failed. Please check your repository permissions and API key.`, "error");
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
        const logWindow = item.querySelector(".session-logs");
        const footerControls = item.querySelector(".session-footer");

        this.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesService.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                const activities = activitiesResponse.activities.sort(sortByCreateTime);

                const state = {
                    isCompleted: false,
                    hasError: false,
                    isWaitingForInput: false,
                    logsHtml: ""
                };

                activities.forEach(act => this._processActivity(act, state));

                // Batch DOM update for logs
                if (logWindow && logWindow.innerHTML !== state.logsHtml) {
                    logWindow.innerHTML = state.logsHtml;
                    logWindow.scrollTop = logWindow.scrollHeight;
                }

                this._updatePollingState(sessionId, repoPath, state, statusBadge, footerControls);

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000); // Poll every 3 seconds
    }

    /**
     * Parses a single activity object from the session logs and maps it into
     * human-readable HTML for the scrolling log window, while updating the polling flags.
     * @private
     * @param {Object} act - The individual activity record from the API.
     * @param {Object} state - The accumulator object containing current polling boolean flags and HTML.
     */
    _processActivity(act, state) {
        // Build the Log Output
        let logClass = "system";
        let logText = act.title || act.description || "Processing...";

        if (act.type && act.type.includes('USER_INPUT')) {
            logClass = "user";
            logText = act.title || act.message || "User replied.";
        }

        if (act.error) {
            logClass = "error";
            logText = "Execution failed: " + (act.error.message || "Unknown error");
        }

        state.logsHtml += `<div class="log-line ${logClass}">> ${FormatUtils.escapeHTML(logText)}</div>`;

        // Update State Flags
        if (act.userActionRequired || act.requiresInput || (act.type && act.type.includes('INPUT'))) {
            state.isWaitingForInput = true;
            return;
        }

        if (act.sessionCompleted) {
            state.isCompleted = true;
            return;
        }

        if (act.error) {
            state.hasError = true;
        }
    }

    /**
     * Mutates the session UI based on the computed final polling state, effectively
     * managing completion states, failures, and revealing the input box when required.
     * @private
     * @param {string} sessionId - The session ID.
     * @param {string} repoPath - The GitHub repository target string.
     * @param {Object} state - The finalized polling flags.
     * @param {HTMLElement} statusBadge - The badge element reflecting progress status.
     * @param {HTMLElement} footerControls - The footer containing the reply input and dismiss buttons.
     */
    _updatePollingState(sessionId, repoPath, state, statusBadge, footerControls) {
        if (state.isCompleted) {
            statusBadge.className = "status-badge status-completed";
            statusBadge.textContent = "Completed";

            // If completed, inject the PR Link into the footer and hide the input box
            footerControls.innerHTML = "";
            const prLink = DOMUtils.createPRLink(`https://github.com/${repoPath}/pulls`, () => this.dismissSession(sessionId));
            const dismissBtn = document.createElement("button");
            dismissBtn.className = "dismiss-btn";
            dismissBtn.textContent = "Dismiss";
            dismissBtn.onclick = () => this.dismissSession(sessionId);

            footerControls.appendChild(prLink);
            footerControls.appendChild(dismissBtn);

            clearInterval(this.julesPollingIntervals[sessionId]);
            delete this.julesPollingIntervals[sessionId];
            return;
        }

        if (state.hasError) {
            statusBadge.className = "status-badge status-failed";
            statusBadge.textContent = "Failed";

            footerControls.innerHTML = "";
            const dismissBtn = document.createElement("button");
            dismissBtn.className = "dismiss-btn";
            dismissBtn.textContent = "Dismiss Error";
            dismissBtn.onclick = () => this.dismissSession(sessionId);
            footerControls.appendChild(dismissBtn);

            clearInterval(this.julesPollingIntervals[sessionId]);
            delete this.julesPollingIntervals[sessionId];
            return;
        }

        if (state.isWaitingForInput) {
            statusBadge.className = "status-badge status-waiting";
            statusBadge.textContent = "Needs Input";
            
            // Only inject the reply wrapper if it doesn't already exist
            if (!footerControls.querySelector(".reply-input-wrapper")) {
                footerControls.innerHTML = `
                    <div class="reply-input-wrapper">
                        <input type="text" class="reply-input" placeholder="Type 'proceed', 'yes', or provide instructions..." />
                        <button class="reply-btn">Reply</button>
                    </div>
                `;
                
                const replyInput = footerControls.querySelector(".reply-input");
                const replyBtn = footerControls.querySelector(".reply-btn");
                
                // Bind Reply Action
                const handleReply = async () => {
                    const text = replyInput.value.trim();
                    if (!text) return;
                    
                    DOMUtils.setButtonState(replyBtn, "loading", "...");
                    replyInput.disabled = true;
                    
                    try {
                        await window.julesService.sendUserInput(sessionId, text);
                        statusBadge.className = "status-badge status-in-progress";
                        statusBadge.textContent = "Resuming...";
                        footerControls.innerHTML = `<span style="font-size: var(--text-xs); color: var(--text-secondary);">Command sent. Awaiting logs...</span>`;
                    } catch (e) {
                        this.app.toast.show("Failed to send reply to Jules.", "error");
                        DOMUtils.setButtonState(replyBtn, "ready", "Reply");
                        replyInput.disabled = false;
                    }
                };
                
                replyBtn.addEventListener("click", handleReply);
                replyInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") handleReply();
                });
            }
        } else {
            // Actively running, ensure the badge is pulsing and footer is clean
            statusBadge.className = "status-badge status-in-progress";
            statusBadge.textContent = "Running...";
            footerControls.innerHTML = `<span style="font-size: var(--text-xs); color: var(--text-secondary);">Executing routines...</span>`;
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
        // Removed global click-to-dismiss to prevent accidental closure of the entire card
        const footerControls = item.querySelector(".session-footer");
        if (footerControls && prInfo && prInfo.url && !footerControls.querySelector(".pr-link-btn")) {
            footerControls.innerHTML = "";
            const prLink = DOMUtils.createPRLink(prInfo.url, () => this.dismissSession(sessionId));
            const dismissBtn = document.createElement("button");
            dismissBtn.className = "dismiss-btn";
            dismissBtn.textContent = "Dismiss";
            dismissBtn.onclick = () => this.dismissSession(sessionId);
            
            footerControls.appendChild(prLink);
            footerControls.appendChild(dismissBtn);
        }
    }

    /**
     * Helper to consistently construct the complex internal node structure for a
     * session card within the dashboard terminal UI.
     * @private
     * @param {string} emoji - The visual emoji for the session's executing agent.
     * @param {string} title - The main name of the executing agent or session.
     * @param {string} statusId - The element ID for the generated status badge.
     * @param {string} statusClass - CSS classes to append to the status badge.
     * @param {string} statusText - The human-readable textual status.
     * @returns {Array<HTMLElement>} An array containing the generated [header, logs, footer] elements.
     */
    _createDashboardItemNodes(emoji, title, statusId, statusClass, statusText) {
        // Header
        const headerDiv = document.createElement("div");
        headerDiv.className = "session-header";

        const titleGroup = document.createElement("div");
        titleGroup.className = "session-title-group";
        
        const emojiSpan = document.createElement("span");
        emojiSpan.className = "emoji-hero";
        emojiSpan.style.fontSize = "1.25rem";
        emojiSpan.textContent = emoji;

        const titleSpan = document.createElement("span");
        titleSpan.className = "session-title";
        titleSpan.textContent = title;

        titleGroup.appendChild(emojiSpan);
        titleGroup.appendChild(titleSpan);

        const statusSpan = document.createElement("span");
        statusSpan.className = `status-badge ${statusClass}`;
        statusSpan.id = statusId;
        statusSpan.textContent = statusText;

        headerDiv.appendChild(titleGroup);
        headerDiv.appendChild(statusSpan);

        // Logs Window
        const logsDiv = document.createElement("div");
        logsDiv.className = "session-logs";
        logsDiv.innerHTML = `<div class="log-line system">> Initializing execution environment...</div>`;

        // Footer Actions
        const footerDiv = document.createElement("div");
        footerDiv.className = "session-footer";
        footerDiv.innerHTML = `<span style="font-size: var(--text-xs); color: var(--text-secondary);">Connecting to target repository...</span>`;

        return [headerDiv, logsDiv, footerDiv];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}