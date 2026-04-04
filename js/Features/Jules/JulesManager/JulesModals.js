const TelemetryUtils = typeof require !== 'undefined' ? require('../../../Utils/telemetry-utils.js') : window.TelemetryUtils;

class JulesModals {
    constructor(julesManager) {
        this.manager = julesManager;
    }

    _initPRModal() {
        const prModal = this.manager.getEl("julesPRModal");
        const closePRModalBtn = this.manager.getEl("cancelPRBtn");

        if (prModal && closePRModalBtn) {
            closePRModalBtn.addEventListener("click", () => {
                prModal.classList.remove("visible");
            });
        }
    }

    _initInteractionModal() {
        const modal = this.manager.getEl("julesInteractionModal");
        const cancelBtn = this.manager.getEl("cancelInteractionBtn");
        const submitBtn = this.manager.getEl("submitInteractionBtn");
        const inputField = this.manager.getEl("interactionModalInput");
        const errorSpan = this.manager.getEl("interactionModalError");

        if (!modal) return;

        const closeModal = () => {
            modal.classList.remove("visible");
            this.manager.activeModalSessionId = null;
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
                    inputField.style.borderColor = "#ef4444";
                    inputField.setAttribute("aria-invalid", "true");
                    inputField.setAttribute("aria-describedby", "interactionModalError");
                    errorSpan.textContent = "Please provide a response before transmitting.";
                    errorSpan.classList.remove("hidden");
                }
                return;
            }
            if (!this.manager.activeModalSessionId) return;

            // 🪄 CONJURE: Optimistic UI with silent rollback for interaction modal
            const sessionId = this.manager.activeModalSessionId;
            const statusSpan = document.getElementById(`status-${sessionId}`);
            const previousStatusText = statusSpan ? statusSpan.textContent : "";
            const previousStatusClass = statusSpan ? statusSpan.className : "";
            const previousStatusOnclick = statusSpan ? statusSpan.onclick : null;

            closeModal();
            this.manager.app.toast.show("Transmitting reply...", "info");

            if (statusSpan) {
                statusSpan.className = "term-status skeleton-pulse";
                statusSpan.textContent = "Transmitting response...";
                statusSpan.onclick = null;
            }

            try {
                await window.julesService.sendUserInput(sessionId, text);
                this.manager.app.toast.show("Reply transmitted.", "success");
            } catch {
                this.manager.app.toast.show("Failed to send reply.", "error");
                // Silent rollback on error
                if (statusSpan) {
                    statusSpan.className = previousStatusClass || "term-status status-waiting";
                    statusSpan.textContent = previousStatusText || `⚠️ Response Needed (Click to view)`;
                    statusSpan.onclick = previousStatusOnclick;
                }
            }
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

        const cancelHistoryBtn = this.manager.getEl("cancelHistoryBtn");
        const submitHistoryBtn = this.manager.getEl("submitHistoryBtn");
        const historyModalInput = this.manager.getEl("historyModalInput");
        const historyErrorSpan = this.manager.getEl("historyModalError");
        const historyModal = this.manager.getEl("julesHistoryModal");

        const closeHistoryModal = () => {
            if (historyModal) {
                historyModal.classList.remove("visible");
                if (historyModalInput) historyModalInput.value = "";
                if (historyErrorSpan) {
                    historyErrorSpan.textContent = "";
                    historyErrorSpan.classList.add("hidden");
                }
            }
            this.manager.activeModalSessionId = null;
        };

        const handleHistorySubmit = async () => {
            if (!this.manager.activeModalSessionId) return;
            const text = historyModalInput?.value?.trim();
            if (!text) {
                this._showKeyError(historyModalInput, historyErrorSpan, "Please enter a response.");
                return;
            }

            const sessionId = this.manager.activeModalSessionId;
            const statusSpan = document.getElementById(`status-${sessionId}`);

            closeHistoryModal();
            this.manager.app.toast.show("Transmitting reply...", "info");

            if (statusSpan) {
                statusSpan.className = "term-status skeleton-pulse";
                statusSpan.textContent = "Transmitting response...";
                statusSpan.onclick = null;
            }

            try {
                await window.julesService.sendUserInput(sessionId, text);
                this.manager.app.toast.show("Reply transmitted.", "success");
            } catch (err) {
                TelemetryUtils.dispatchEvent("JULES_SEND_REPLY_FAILED", err);
                this.manager.app.toast.show("Failed to send reply.", "error");
            }
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
        this.manager.activeModalSessionId = sessionId;
        const modal = this.manager.getEl("julesInteractionModal");
        const emojiEl = this.manager.getEl("interactionModalEmoji");
        const nameEl = this.manager.getEl("interactionModalAgent");
        const msgEl = this.manager.getEl("interactionModalMessage");
        const inputField = this.manager.getEl("interactionModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.textContent = promptText;

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.manager.constructor.MODAL_FOCUS_DELAY_MS);
    }

    _showHistoryModal(sessionId, agentEmoji, agentName) {
        this.manager.activeModalSessionId = sessionId;
        const modal = this.manager.getEl("julesHistoryModal");
        const emojiEl = this.manager.getEl("historyModalEmoji");
        const nameEl = this.manager.getEl("historyModalAgent");
        const msgEl = this.manager.getEl("historyModalContent");
        const inputField = this.manager.getEl("historyModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.innerHTML = '<span class="term-status skeleton-pulse">Loading execution thread...</span>';

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.manager.constructor.MODAL_FOCUS_DELAY_MS);
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


    _showPRModal(pr, sourceName) {
        const modal = this.manager.getEl("julesPRModal");
        if (!modal) return;

        const titleEl = this.manager.getEl("prModalTitleText");
        const linkEl = this.manager.getEl("prModalExternalLink");
        const contentEl = this.manager.getEl("prModalContent");
        const errorEl = this.manager.getEl("prModalError");
        const mergeBtn = this.manager.getEl("mergePRBtn");
        const closePRBtn = this.manager.getEl("closePRBtn");

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
                    await window.julesService.mergePullRequest(sourceName, pr.number);
                    this.manager.app.toast.show(`Successfully merged PR #${pr.number}`, "success");
                    modal.classList.remove("visible");
                    this.manager.loadPullRequestsForRepo(sourceName);
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
                    await window.julesService.closePullRequest(sourceName, pr.number);
                    this.manager.app.toast.show(`Successfully closed PR #${pr.number}`, "success");
                    modal.classList.remove("visible");
                    this.manager.loadPullRequestsForRepo(sourceName);
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesModals;
}
