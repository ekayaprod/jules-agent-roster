class TerminalPolling {
    /**
     * Safe cross-environment getters encapsulated as static methods.
     */
    static getTelemetryUtils() {
        if (typeof TelemetryUtils !== 'undefined') return TelemetryUtils;
        if (typeof window !== 'undefined' && window.TelemetryUtils) return window.TelemetryUtils;
        if (typeof global !== 'undefined' && global.TelemetryUtils) return global.TelemetryUtils;
        return null;
    }

    constructor(julesTerminal) {
        this.terminal = julesTerminal;
    }

    _startSessionPolling(sourceName, terminal) {
        this.terminal._pollingActive = true;
        if (this.terminal.activeSessionsTimeout) clearTimeout(this.terminal.activeSessionsTimeout);

        const pollLoop = async () => {
            if (!this.terminal._pollingActive || this.terminal.currentRepo !== sourceName) return;

            try {
                await this.terminal._fetchAndRenderSessions(sourceName, terminal);
            } catch (error) {
                // Suppress background polling errors to prevent UI crashing during transient API degradation
                const tu = TerminalPolling.getTelemetryUtils();
                if (tu) {
                    tu.dispatchEvent("JULES_POLLING_ERROR", error);
                } else {
                    console.warn("Session polling cycle encountered an error:", error);
                }
            }

            if (this.terminal._pollingActive && this.terminal.currentRepo === sourceName) {
                this.terminal.activeSessionsTimeout = setTimeout(pollLoop, JulesTerminal.ACTIVE_SESSIONS_POLL_MS);
            }
        };

        pollLoop();
    }

    cleanup() {
        this.terminal._pollingActive = false;
        if (this.terminal.activeSessionsTimeout) {
            clearTimeout(this.terminal.activeSessionsTimeout);
            this.terminal.activeSessionsTimeout = null;
        }
        this._clearPollingAndCache();
        if (this.terminal.dismissedSessionIds) this.terminal.dismissedSessionIds.clear();
        this.terminal.currentRepo = null;
        this.terminal._flatCustomsCache = null;
    }

    _clearPollingAndCache() {
        if (this.terminal.julesPollingIntervals) {
            Object.values(this.terminal.julesPollingIntervals).forEach(clearInterval);
            this.terminal.julesPollingIntervals = {};
        }
        if (this.terminal.renderedSessionIds) this.terminal.renderedSessionIds.clear();
        this.terminal._flatCustomsCache = null;
        this.terminal._agentMapCache = null;
    }

    startTerminalPolling(sessionId, block, agentName, agentEmoji) {
        if (!this.terminal.julesPollingIntervals) {
            this.terminal.julesPollingIntervals = {};
        }
        if (this.terminal.julesPollingIntervals[sessionId]) {
            clearInterval(this.terminal.julesPollingIntervals[sessionId]);
        }

        this.terminal.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesAPI.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                const activities = activitiesResponse.activities.sort((a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0));

                const state = {
                    isCompleted: false,
                    hasError: false,
                    isWaitingForInput: false,
                    latestLog: "Processing...",
                    rawMessage: "Processing..."
                };

                // ⚡ Bolt+: The Buffer Allocation. Migrated an expensive, repetitive string concatenation loop to an allocated buffer stream, preventing transient garbage collection sweeps.
                const historyBuffer = [];

                activities.forEach(act => {
                    let text = act.title || act.description || "";

                    if (act.title) {
                        historyBuffer.push(`**${act.title}**\n\n`);
                    }
                    if (act.description) {
                        historyBuffer.push(`${act.description}\n\n`);
                    }
                    if (act.type && act.type.includes('USER_INPUT') && act.message) {
                        historyBuffer.push(`*You:* ${act.message}\n\n`);
                    }
                    if (act.error) {
                        historyBuffer.push(`**Error:** ${act.error.message}\n\n`);
                    }
                    historyBuffer.push(`---\n\n`);

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

                if (this.terminal.activeModalSessionId === sessionId) {
                    const contentEl = this.terminal.getEl("historyModalContent");
                    if (contentEl) {
                        contentEl.innerHTML = "";
                        const fullHistoryMarkdown = historyBuffer.join('');
                        const pre = DOMUtils.createMarkdownPreBlock(fullHistoryMarkdown || "No history available.");
                        contentEl.appendChild(pre);
                        contentEl.scrollTop = contentEl.scrollHeight;
                    }
                }

                this._updatePollingState(sessionId, block, state, agentName, agentEmoji);

            } catch (e) {
                const tu = JulesTerminal.getTelemetryUtils();
                if (tu) {
                    tu.dispatchEvent("JULES_POLLING_ERROR", e);
                } else {
                    console.error("Session polling cycle encountered an error:", e);
                }
            }
        }, this.terminal.constructor.TERMINAL_POLL_MS);
    }

    _updatePollingState(sessionId, block, state, agentName, agentEmoji) {
        const statusSpan = block.querySelector(`#status-${sessionId}`) || block.querySelector(`#status-mutated-${sessionId}`);
        if (!statusSpan) return;

        if (state.isCompleted) {
            statusSpan.className = "term-status status-success";
            statusSpan.innerHTML = `✅ Execution Finished`;
            this.terminal.loadPullRequestsForRepo(this.terminal.currentRepo);
            clearInterval(this.terminal.julesPollingIntervals[sessionId]);
            setTimeout(() => this.terminal.dismissSession(sessionId), this.terminal.constructor.SUCCESS_DISMISS_DELAY_MS);
            return;
        }

        if (state.hasError) {
            statusSpan.className = "term-status status-error";
            statusSpan.textContent = state.latestLog;

            const btn = document.createElement("button");
            btn.className = "term-action-btn";
            btn.setAttribute("aria-label", "Dismiss task error");
            btn.textContent = "[✕]";
            btn.onclick = () => {
                const el = document.getElementById(`session-${sessionId}`);
                if (el) el.remove();
            };

            statusSpan.appendChild(document.createTextNode(" "));
            statusSpan.appendChild(btn);
            clearInterval(this.terminal.julesPollingIntervals[sessionId]);
            return;
        }

        if (state.isWaitingForInput) {
            statusSpan.className = "term-status status-waiting";
            statusSpan.innerHTML = `⚠️ Response Needed (Click to view)`;
            statusSpan.onclick = (e) => {
                e.stopPropagation();
                this.terminal.modals._showInteractionModal(sessionId, agentEmoji, agentName, state.rawMessage);
            };
        } else {
            statusSpan.className = "term-status";
            statusSpan.onclick = null;
            statusSpan.textContent = state.latestLog;
        }
    }

}

if (typeof window !== 'undefined') {
    window.TerminalPolling = TerminalPolling;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalPolling;
}
