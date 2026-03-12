/**
 * Polling array callbacks hoisted to the file scope.
 */
const hasPullRequest = o => o.pullRequest;
const sortByCreateTime = (a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0);

/**
 * Manages the core operations for interacting with Jules APIs.
 * Redesigned to act as a sleek, code-editor style terminal rather than a dashboard of cards.
 */
class JulesManager {
    constructor(rosterApp) {
        this.app = rosterApp;
        this.currentRepo = null;
        this.activeSessionsInterval = null;
        this.julesPollingIntervals = {};
        this.renderedSessionIds = new Set();
        this.dismissedSessionIds = new Set();
        this.openPRUrls = new Set();
        this.elements = {};
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
                this._clearKeyError(keyInput, errorSpan);
                this._clearKeyError(githubTokenInput, githubTokenErrorSpan);
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

        if (apiKey && window.julesService) {
            window.julesService.configure(apiKey, githubToken);
            await this.loadSources();
        } else {
            toggleModal(true);
        }
    }

    _showKeyError(input, span, message) {
        if (!input || !span) return;
        input.style.borderColor = "#ef4444";
        span.textContent = message;
        span.style.display = "block";
    }

    _clearKeyError(input, span) {
        if (!input || !span) return;
        input.style.borderColor = "";
        span.textContent = "";
        span.style.display = "none";
    }

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
        } finally {
            picker.disabled = false;
        }
    }

    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");
        
        if (this.currentRepo !== sourceName) {
            this._clearPollingAndCache();
            terminal.innerHTML = `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Fetching active routines for ${sourceName.replace('sources/github/', '')}...</div>`;
            this.currentRepo = sourceName;
        }

        if (this.activeSessionsInterval) clearInterval(this.activeSessionsInterval);

        const boundFetch = () => this._fetchAndRenderSessions(sourceName, terminal);
        await boundFetch();
        this.activeSessionsInterval = setInterval(boundFetch, 5000);
    }

    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesService) return;
        try {
            const pullRequests = await window.julesService.getPullRequests(sourceName);
            this.openPRUrls = new Set(pullRequests.map(pr => pr.html_url || pr.url));
            this._renderPullRequests(pullRequests, this.getEl("julesTerminal"));
        } catch (error) {
            console.error("Failed to load pull requests:", error);
            this.openPRUrls = new Set();
        }
    }

    _renderPullRequests(prs, terminal) {
        // Clear old PR renders
        terminal.querySelectorAll('.term-pr-item').forEach(el => el.remove());
        
        if (!prs || prs.length === 0) return;

        const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        // Render at top of terminal
        prs.forEach(pr => {
            const item = document.createElement("div");
            item.className = "term-pr-item";
            item.innerHTML = `
                <span style="color: var(--term-success); font-weight: 600;">[OPEN PR]</span> 
                <span class="term-pr-title">#${pr.number} ${pr.title}</span>
                <a href="${pr.html_url}" target="_blank" rel="noopener noreferrer" class="term-link">[View ↗]</a>
            `;
            terminal.insertBefore(item, terminal.firstChild);
        });
    }

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
                
                const isCompleted = s.outputs && s.outputs.some(hasPullRequest);
                
                // ONLY show sessions that are actively running, OR completed ones we JUST watched finish.
                // This permanently hides 100+ historical completed tasks from spawning infinitely.
                if (isCompleted && !this.renderedSessionIds.has(s.id)) {
                    return false;
                }
                
                return true;
            });

            // Sort newest first
            repoSessions = [...repoSessions].reverse().slice(0, 10);
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

    _checkEmptyTerminal() {
        const terminal = this.getEl("julesTerminal");
        if (terminal.children.length === 0 || (terminal.children.length === 1 && terminal.firstElementChild.id === 'fetchingIndicator')) {
             terminal.innerHTML = `<div id="fetchingIndicator" style="color: var(--term-muted);">[SYS] Awaiting execution commands...</div>`;
        }
    }

    _processSession(session, terminal, repoPath) {
        const isCompleted = session.outputs && session.outputs.some(hasPullRequest);
        
        if (this.renderedSessionIds.has(session.id)) {
            if (!isCompleted) return;
            const block = document.getElementById(`session-${session.id}`);
            if (block && !block.classList.contains("state-completed")) {
                this._markBlockCompleted(block, session);
            }
            return;
        }

        this.renderedSessionIds.add(session.id);
        
        const agentName = session.title || "Agent Task";
        let agentEmoji = "🤖";
        let safeAgentName = agentName.replace(/"/g, '');
        
        // Deep search for emoji (handles core agents AND nested custom fusion matrices)
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
        if (matchedAgent && matchedAgent.emoji) agentEmoji = matchedAgent.emoji;

        const block = document.createElement("div");
        block.className = `term-session-block ${isCompleted ? 'state-completed' : 'state-active'}`;
        block.id = `session-${session.id}`;

        const commandStr = `~ ❯ jules run <span class="term-arg">${agentEmoji} ${safeAgentName}</span>`;

        block.innerHTML = `
            <div class="term-command-line">${commandStr}</div>
            <div class="term-log-stream" id="logs-${session.id}">
                ${isCompleted ? '' : '<div class="term-log-line system">  [SYS] Initializing execution environment...</div>'}
            </div>
            <div class="term-input-container" id="input-${session.id}"></div>
        `;

        // Append to terminal (below PR items, above older sessions)
        const firstSession = terminal.querySelector('.term-session-block');
        if (firstSession) {
            terminal.insertBefore(block, firstSession);
        } else {
            terminal.appendChild(block);
        }

        if (isCompleted) {
            this._markBlockCompleted(block, session);
        } else {
            this.startTerminalPolling(session.id, block, repoPath);
        }
    }

    _markBlockCompleted(block, session) {
        block.className = "term-session-block state-completed";
        const prInfo = session.outputs.find(hasPullRequest)?.pullRequest;
        const logStream = block.querySelector('.term-log-stream');
        const inputContainer = block.querySelector('.term-input-container');
        
        if (inputContainer) inputContainer.innerHTML = '';
        
        if (prInfo && logStream) {
            logStream.innerHTML = `
                <div class="term-log-line success">  [OK] Routine complete.</div>
            `;
            
            const actionLine = document.createElement("div");
            actionLine.className = "term-log-line action";
            actionLine.innerHTML = `  [PR] <a href="${prInfo.html_url || prInfo.url}" target="_blank" class="term-link">${prInfo.title} ↗</a> `;
            
            const dismissBtn = document.createElement("button");
            dismissBtn.className = "term-action-btn";
            dismissBtn.textContent = "[Dismiss ✕]";
            dismissBtn.onclick = () => this.dismissSession(session.id);
            
            actionLine.appendChild(dismissBtn);
            logStream.appendChild(actionLine);
        }
        
        if (this.julesPollingIntervals[session.id]) {
            clearInterval(this.julesPollingIntervals[session.id]);
            delete this.julesPollingIntervals[session.id];
        }
    }

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
            // Force an immediate poll
            this._fetchAndRenderSessions(sourceName, this.getEl("julesTerminal"));
        } catch (err) {
            this.app.toast.show(`Launch failed. Check API key and permissions.`, "error");
        } finally {
            if (btn) DOMUtils.setButtonState(btn, "ready", "Launch in Jules 🚀");
        }
    }

    startTerminalPolling(sessionId, block, repoPath) {
        if (!this.julesPollingIntervals) this.julesPollingIntervals = {};
        if (this.julesPollingIntervals[sessionId]) clearInterval(this.julesPollingIntervals[sessionId]);

        const logStream = block.querySelector(`#logs-${sessionId}`);
        const inputContainer = block.querySelector(`#input-${sessionId}`);

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

                // Build HTML feed (last 5 lines to keep it sleek)
                const logLines = [];
                activities.forEach(act => {
                    let logClass = "system";
                    let prefix = "[SYS]";
                    let logText = act.title || act.description || "Processing...";
                    
                    if (act.type && act.type.includes('USER_INPUT')) { 
                        logClass = "user"; 
                        prefix = "[USR]";
                        logText = act.message || act.title || "User input received."; 
                    }
                    if (act.error) { 
                        logClass = "error"; 
                        prefix = "[ERR]";
                        logText = "Exception: " + (act.error.message || "Unknown error"); 
                    }
                    
                    logLines.push(`<div class="term-log-line ${logClass}">  ${prefix} ${FormatUtils.escapeHTML(logText)}</div>`);

                    if (act.userActionRequired || act.requiresInput || (act.type && act.type.includes('INPUT'))) state.isWaitingForInput = true;
                    if (act.sessionCompleted) state.isCompleted = true;
                    if (act.error) state.hasError = true;
                });

                // Slice to last few to prevent massive scroll blobs per session
                state.logsHtml = logLines.slice(-5).join("");

                if (logStream && logStream.innerHTML !== state.logsHtml) {
                    logStream.innerHTML = state.logsHtml;
                }

                this._updatePollingState(sessionId, block, state, inputContainer);

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
    }

    _updatePollingState(sessionId, block, state, inputContainer) {
        if (state.isCompleted) {
            this._markBlockCompleted(block, { outputs: [{ pullRequest: {} }] }); // Safety fallback if array somehow empties mid-poll
            return;
        }

        if (state.hasError) {
            block.className = "term-session-block state-error";
            if (inputContainer) {
                inputContainer.innerHTML = '';
                const dismissBtn = document.createElement("button");
                dismissBtn.className = "term-action-btn";
                dismissBtn.style.marginTop = "0.5rem";
                dismissBtn.style.padding = "0";
                dismissBtn.textContent = "[Dismiss Error ✕]";
                dismissBtn.onclick = () => this.dismissSession(sessionId);
                inputContainer.appendChild(dismissBtn);
            }
            clearInterval(this.julesPollingIntervals[sessionId]);
            return;
        }

        if (state.isWaitingForInput) {
            block.className = "term-session-block state-waiting";
            
            if (!inputContainer.querySelector(".term-input-group")) {
                inputContainer.innerHTML = `
                    <div class="term-input-group">
                        <span class="term-prompt-symbol">❯</span>
                        <input type="text" class="term-input" placeholder="Awaiting instruction (e.g. 'proceed')..." />
                    </div>
                `;
                
                const replyInput = inputContainer.querySelector(".term-input");
                
                const handleReply = async () => {
                    const text = replyInput.value.trim();
                    if (!text) return;
                    
                    replyInput.disabled = true;
                    inputContainer.innerHTML = `<span style="color:var(--term-muted); font-size:0.9em; margin-left: 0.35rem; padding-left: 1rem; border-left: 1px solid #27272a;">  [USR] Transmitting...</span>`;
                    
                    try {
                        await window.julesService.sendUserInput(sessionId, text);
                        block.className = "term-session-block state-active";
                    } catch (e) {
                        this.app.toast.show("Failed to send reply.", "error");
                        // Reset input if failed
                        inputContainer.innerHTML = '';
                    }
                };
                
                replyInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") handleReply();
                });
                
                setTimeout(() => replyInput.focus(), 50);
            }
        } else {
            block.className = "term-session-block state-active";
            if (inputContainer) inputContainer.innerHTML = '';
        }
    }

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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesManager;
}