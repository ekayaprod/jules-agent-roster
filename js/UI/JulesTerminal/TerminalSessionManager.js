const hasPullRequest = o => o.pullRequest;

class TerminalSessionManager {
    constructor(julesTerminal) {
        this.terminal = julesTerminal;
    }

    async launchSession(agent, btn = null) {
        const sourceName = this.terminal.getEl("julesRepoPicker").value;
        const userTask = this.terminal.getEl("julesTaskInput").value.trim() || "Analyze and optimize the repository based on your directives.";

        if (!sourceName) {
            this.terminal.app.toast.show("Select a target repository first.", typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.ERROR : "error");
            return;
        }

        if (agent.prompt === undefined && btn) {
            btn.disabled = true;
        }

        // 🪄 CONJURE: Optimistic UI for Session Launch with CSS skeletal rendering
        const terminalEl = this.terminal.getEl("julesTerminal");
        const fetchingIndicator = terminalEl.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.style.display = 'none';

        const formatUtils = this.terminal.constructor.getFormatUtils();
        let agentEmoji = agent.emoji || "🤖";
        let safeAgentName = agent.name ? (formatUtils ? formatUtils.escapeHTML(agent.name) : agent.name) : "Agent Task";

        const optimisticBlock = this.terminal.renderer.createAndInsertSessionBlock(
            terminalEl,
            `term-session-line state-active skeleton-pulse`,
            "",
            agentEmoji,
            safeAgentName,
            "Conjuring session...",
            "",
            () => {} // cursor pointer set implicitly via callback presence
        );

        if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Launching...");

        this.terminal.sessionQueue.push(async () => {
            try {
                // ⚡ Bolt+: The Waterfall Collapse. Unblocked the primary application thread by shifting synchronous remote prompt resolution into the background execution queue.
                // ⚡ Bolt+: ACCELERATE: Resolved sequential fetch before delegating to asynchronous API call to prevent UI locking and waterfall delays.
                const [prompt] = await Promise.all([
                    agent.prompt !== undefined ? Promise.resolve(agent.prompt) : (() => {
                        const url = AgentUtils.getPromptUrl(agent);
                        return this.terminal.app.agentRepo.fetchPrompt(agent.name, url, "No protocol data available.").then(res => {
                            agent.prompt = res;
                            if (btn) btn.disabled = false;
                            return res;
                        });
                    })()
                ]);
                await window.julesAPI.createSession(prompt, userTask, sourceName, `${agent.name}`);
                this.terminal.app.toast.show(`Session launched successfully.`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.SUCCESS : "success");
            } catch (error) {
                const launchError = new Error("JulesSessionLaunchFailure: " + error.message);
                launchError.cause = error;
                const tu = this.terminal.constructor.getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_LAUNCH_SESSION_FAILED", launchError, { sourceName });
                this.terminal.app.toast.show(`Could not launch the session: ${error.message || "Unknown error"}`, typeof TOAST_TYPES !== "undefined" ? TOAST_TYPES.ERROR : "error", 20000);
                if (fetchingIndicator) fetchingIndicator.style.display = '';

                if (optimisticBlock.parentNode) optimisticBlock.remove();
                if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Launch in Jules 🚀");
                this.terminal.renderer.checkEmptyTerminal();
                return; // Hard exit out of the queue function on launch failure
            }

            // Reaching here means creation succeeded. We isolate the fetching to prevent polling timeouts from registering as a launch failure.
            try {
                await this.fetchAndRenderSessions(sourceName, terminalEl);
            } catch (pollError) {
                const tu = this.terminal.constructor.getTelemetryUtils();
                if (tu) tu.dispatchEvent("SESSION_SYNC_TIMEOUT", pollError);
            } finally {
                if (optimisticBlock.parentNode) optimisticBlock.remove();
                if (btn) DOMUtils.setButtonState(btn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Launch in Jules 🚀");
                this.terminal.renderer.checkEmptyTerminal();
            }
        });

        this.processSessionQueue();
    }

    async processSessionQueue() {
        if (this.terminal.isProcessingQueue) return;
        this.terminal.isProcessingQueue = true;

        while (this.terminal.sessionQueue.length > 0) {
            const task = this.terminal.sessionQueue.shift();
            try {
                await task();
            } catch (error) {
                const tu = this.terminal.constructor.getTelemetryUtils();
                if (tu) tu.dispatchEvent("QUEUE_EXECUTION_ERROR", error);
            }
            // Rate limit delay (1s) to prevent overwhelming the API on mass launch
            if (this.terminal.sessionQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.terminal.isProcessingQueue = false;
    }

    async fetchAndRenderSessions(sourceName, terminalEl) {
        if (!window.julesAPI || !window.julesAPI.apiKey) return;

        const sessionsResponse = await window.julesAPI.getSessions(this.terminal.constructor.PAGE_SIZE);
        if (!sessionsResponse.sessions) {
            this.terminal.renderer.checkEmptyTerminal();
            return;
        }

        // ↗️ VECTORIZE: The Single-Pass Pipeline. Bypassing filter().reverse().slice(0, 3) for a direct backward loop to eliminate multi-pass overhead.
        let repoSessions = [];
        const sessions = sessionsResponse.sessions;
        for (let i = sessions.length - 1; i >= 0; i--) {
            if (repoSessions.length >= 3) break;
            const s = sessions[i];

            if (!s.sourceContext || s.sourceContext.source !== sourceName) continue;
            if (this.terminal.dismissedSessionIds && this.terminal.dismissedSessionIds.has(s.id)) continue;

            const timeStr = s.updateTime || s.createTime || s.startTime;
            if (timeStr) {
                const ageHours = (Date.now() - new Date(timeStr).getTime()) / (1000 * 60 * 60);
                if (ageHours > 2) continue;
            } else if (!this.terminal.renderedSessionIds.has(s.id)) {
                continue;
            }

            // If a ticket reached a terminal state (done, failed, drafted PR), it is NO LONGER
            // shown in the active Jules feed. We completely rely on the GitHub PR fetch to show completions.
            const isEnded = s.state === 'COMPLETED' || s.state === 'FAILED' || s.state === 'ERROR' || s.state === 'CANCELLED' || (s.outputs && s.outputs.some(hasPullRequest));

            if (isEnded) continue;

            repoSessions.push(s);
        }

        const fetchingIndicator = terminalEl.querySelector('#fetchingIndicator');
        if (fetchingIndicator) fetchingIndicator.remove();

        if (!this.terminal.renderedSessionIds) this.terminal.renderedSessionIds = new Set();

        const currentSessionIds = new Set();
        for (let i = 0; i < repoSessions.length; i++) {
            currentSessionIds.add(repoSessions[i].id);
        }

        for (const id of this.terminal.renderedSessionIds) {
            if (!currentSessionIds.has(id)) {
                this.terminal.dismissSession(id);
            }
        }

        for (const session of repoSessions) {
            this.terminal.renderer.processSession(session, terminalEl);
        }

        this.terminal.renderer.checkEmptyTerminal();
    }
}

if (typeof window !== 'undefined') {
    window.TerminalSessionManager = TerminalSessionManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalSessionManager;
}
