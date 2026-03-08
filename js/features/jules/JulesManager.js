class JulesManager {
    constructor(rosterApp) {
        this.app = rosterApp;
        this.currentRepo = null;
        this.activeSessionsInterval = null;
        this.julesPollingIntervals = {};
        this.renderedSessionIds = new Set();
        this.dismissedSessionIds = new Set();
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
    }

    // Helper for generating PR link buttons
    createPRLink(url, onClick) {
        const prLink = document.createElement("a");
        prLink.className = "pr-link-btn";
        prLink.href = url;
        prLink.target = "_blank";
        prLink.rel = "noopener noreferrer";
        prLink.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4h-4"/><path d="M12 5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2"/><polyline points="15 8 18 5 21 8"/></svg>
            View PR
        `;
        if (onClick) {
            prLink.addEventListener("click", onClick);
        }
        return prLink;
    }

    async init() {
        const apiKey = StorageUtils.getItem("jules_api_key");
        const settingsModal = this.getEl("settingsModal");
        const openBtn = this.getEl("openSettingsBtn");
        const closeBtn = this.getEl("closeSettingsBtn");
        const saveBtn = this.getEl("saveSettingsBtn");
        const keyInput = this.getEl("julesApiKeyInput");

        // Modal Toggles
        const toggleModal = (show) => {
            if (show) {
                keyInput.value = StorageUtils.getItem("jules_api_key");
                settingsModal.classList.add("visible");
            } else {
                settingsModal.classList.remove("visible");
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        // Save and Connect Logic
        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            if (!key) return this.app.toast.show("Please enter an API Key.");

            StorageUtils.setItem("jules_api_key", key);
            toggleModal(false);
            this.app.toast.show("Connecting to Jules...");

            if (window.julesService) {
                window.julesService.configure(key);
                await this.loadSources();
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

    async loadSources() {
        const picker = this.getEl("julesRepoPicker");
        if (!picker || !window.julesService) return;

        const originalText = picker.options.length > 0 ? picker.options[0].textContent : "1. Select GitHub Repository...";
        picker.innerHTML = `<option value="">Loading repositories...</option>`;
        picker.disabled = true;

        try {
            const data = await window.julesService.getSources();
            if (data.sources) {
                picker.innerHTML = `<option value="">1. Select GitHub Repository...</option>`;
                data.sources.forEach(s => {
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

    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");
        terminal.classList.add('active');

        if (this.currentRepo !== sourceName) {
            if (this.julesPollingIntervals) {
                Object.values(this.julesPollingIntervals).forEach(clearInterval);
                this.julesPollingIntervals = {};
            }
            if (this.renderedSessionIds) this.renderedSessionIds.clear();

            terminal.innerHTML = FormatUtils.createTerminalLineHTML("Fetching active sessions...", "fetchingIndicator");
            this.currentRepo = sourceName;
        }

        if (this.activeSessionsInterval) {
            clearInterval(this.activeSessionsInterval);
        }

        const fetchAndRenderSessions = async () => {
            try {
                if (!window.julesService || !window.julesService.apiKey) return;

                const data = await window.julesService.getSessions(50);
                if (!data.sessions) {
                    if (terminal.querySelector('#fetchingIndicator')) {
                        terminal.innerHTML = FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...");
                    }
                    return;
                }

                let repoSessions = data.sessions.filter(s => {
                    if (!s.sourceContext || s.sourceContext.source !== sourceName) return false;
                    if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) return false;
                    // Filter out sessions that have a merged or closed PR
                    if (s.outputs && s.outputs.some(o => o.pullRequest && (o.pullRequest.state === 'MERGED' || o.pullRequest.state === 'CLOSED'))) {
                        return false;
                    }

                    // Also filter out any sessions the user has actively dismissed
                    if (this.dismissedSessionIds && this.dismissedSessionIds.has(s.id)) {
                        return false;
                    }

                    return true;
                });

                // Sort descending (most recent first) and cap at 5
                // Assuming API returns chronological order since no timestamp is provided on the list response
                repoSessions = [...repoSessions].reverse().slice(0, 5);

                const repoPath = sourceName.replace('sources/github/', '');

                // Remove the fetching placeholder if it's there
                const fetchingIndicator = terminal.querySelector('#fetchingIndicator');
                if (fetchingIndicator) {
                    fetchingIndicator.remove();
                }

                if (repoSessions.length === 0 && terminal.children.length === 0) {
                    terminal.innerHTML = FormatUtils.createTerminalLineHTML("Awaiting Agent launch command...");
                    return;
                }

                // Keep track of rendered sessions to avoid duplicates
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

                // Render or update sessions
                for (const session of repoSessions) {
                    this._processSession(session, terminal, repoPath);
                }

                // Enforce DOM order based on sorted array (repoSessions is newest to oldest)
                // Append each item in order to the terminal so the DOM matches the array visually.
                for (const session of repoSessions) {
                    const item = document.getElementById(`session-${session.id}`);
                    if (item) {
                        terminal.appendChild(item);
                    }
                }

            } catch (err) {
                console.error("Failed to load active sessions:", err);
            }
        };

        await fetchAndRenderSessions();
        this.activeSessionsInterval = setInterval(fetchAndRenderSessions, 5000);
    }

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
                item.style.cursor = 'pointer';
                if (!item.dataset.clickListenerAttached) {
                    item.addEventListener('click', (e) => {
                        if (!e.target.closest('.pr-link-btn')) {
                            this.dismissSession(session.id);
                        }
                    });
                    item.dataset.clickListenerAttached = 'true';
                }

                if (prInfo && prInfo.url && !item.querySelector(".pr-link-btn")) {
                    const prLink = this.createPRLink(prInfo.url, () => this.dismissSession(session.id));
                    item.querySelector(".dashboard-status").appendChild(prLink);
                }
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
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.pr-link-btn')) {
                    this.dismissSession(session.id);
                }
            });
            item.dataset.clickListenerAttached = 'true';

            const prInfo = session.outputs.find(o => o.pullRequest).pullRequest;
            if (prInfo && prInfo.url) {
                const prLink = this.createPRLink(prInfo.url, () => this.dismissSession(session.id));
                item.querySelector(".dashboard-status").appendChild(prLink);
            }
        }

        terminal.insertBefore(item, terminal.firstChild);

        if (!isCompleted) {
            this.startTerminalPolling(session.id, item, repoPath);
        }
    }

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

    startTerminalPolling(sessionId, item, repoPath) {
        if (!this.julesPollingIntervals) this.julesPollingIntervals = {};
        if (this.julesPollingIntervals[sessionId]) clearInterval(this.julesPollingIntervals[sessionId]);

        const statusBadge = item.querySelector(`#status-${sessionId}`);
        const metaDiv = item.querySelector(".dashboard-meta");
        const statusContainer = item.querySelector(".dashboard-status");

        this.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const data = await window.julesService.getActivities(sessionId);
                if (!data.activities) return;

                // Sort chronologically
                const activities = data.activities.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

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

    _updatePollingState(sessionId, repoPath, state, statusBadge, metaDiv, statusContainer) {
        if (state.isCompleted) {
            statusBadge.className = "status-badge status-completed";
            statusBadge.textContent = "Completed";

            const prLink = this.createPRLink(`https://github.com/${repoPath}/pulls`, () => this.dismissSession(sessionId));
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

    cleanup() {
        if (this.activeSessionsInterval) {
            clearInterval(this.activeSessionsInterval);
            this.activeSessionsInterval = null;
        }
        if (this.julesPollingIntervals) {
            Object.values(this.julesPollingIntervals).forEach(clearInterval);
            this.julesPollingIntervals = {};
        }
        if (this.renderedSessionIds) this.renderedSessionIds.clear();
        if (this.dismissedSessionIds) this.dismissedSessionIds.clear();
        this.currentRepo = null;
    }

    // Helper for generating dashboard item nodes
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
