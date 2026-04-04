// 🚨 Paramedic: Stripped illegal Node.js require() to prevent environment bleed and fatal boot crashes.
var getTelemetryUtils = () => typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);

class TerminalPolling {
    constructor(julesManager) {
        this.manager = julesManager;
    }

    startTerminalPolling(sessionId, block, agentName, agentEmoji) {
        if (!this.manager.julesPollingIntervals) {
            this.manager.julesPollingIntervals = {};
        }
        if (this.manager.julesPollingIntervals[sessionId]) {
            clearInterval(this.manager.julesPollingIntervals[sessionId]);
        }

        this.manager.julesPollingIntervals[sessionId] = setInterval(async () => {
            try {
                const activitiesResponse = await window.julesService.getActivities(sessionId);
                if (!activitiesResponse.activities) return;

                const activities = activitiesResponse.activities.sort(this.manager.sortByCreateTime);

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

                if (this.manager.activeModalSessionId === sessionId) {
                    const contentEl = this.manager.getEl("historyModalContent");
                    if (contentEl) {
                        contentEl.innerHTML = "";
                        const pre = DOMUtils.createMarkdownPreBlock(fullHistoryMarkdown || "No history available.");
                        contentEl.appendChild(pre);
                        contentEl.scrollTop = contentEl.scrollHeight;
                    }
                }

                this._updatePollingState(sessionId, block, state, agentName, agentEmoji);

            } catch (e) {
                const tu = getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_POLLING_ERROR", e);
            }
        }, this.manager.constructor.TERMINAL_POLL_MS);
    }

    _updatePollingState(sessionId, block, state, agentName, agentEmoji) {
        const statusSpan = block.querySelector(`#status-${sessionId}`) || block.querySelector(`#status-mutated-${sessionId}`);
        if (!statusSpan) return;

        if (state.isCompleted) {
            statusSpan.className = "term-status status-success";
            statusSpan.innerHTML = `✅ Execution Finished`;
            this.manager.loadPullRequestsForRepo(this.manager.currentRepo);
            clearInterval(this.manager.julesPollingIntervals[sessionId]);
            setTimeout(() => this.manager.dismissSession(sessionId), this.manager.constructor.SUCCESS_DISMISS_DELAY_MS);
            return;
        }

        if (state.hasError) {
            statusSpan.className = "term-status status-error";
            statusSpan.innerHTML = `${FormatUtils.escapeHTML(state.latestLog)} <button class="term-action-btn" aria-label="Dismiss task error" onclick="document.getElementById('session-${sessionId}').remove()">[✕]</button>`;
            clearInterval(this.manager.julesPollingIntervals[sessionId]);
            return;
        }

        if (state.isWaitingForInput) {
            statusSpan.className = "term-status status-waiting";
            statusSpan.innerHTML = `⚠️ Response Needed (Click to view)`;
            statusSpan.onclick = () => {
                this.manager.modals._showInteractionModal(sessionId, agentEmoji, agentName, state.rawMessage);
            };
        } else {
            statusSpan.className = "term-status";
            statusSpan.onclick = null;
            statusSpan.textContent = state.latestLog;
        }
    }


}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalPolling;
}
