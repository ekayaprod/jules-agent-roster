class JulesModals {
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

    _initPRModal() {
        const prModal = this.terminal.getEl("julesPRModal");
        const closePRModalBtn = this.terminal.getEl("cancelPRBtn");

        if (prModal && closePRModalBtn) {
            closePRModalBtn.addEventListener("click", () => {
                prModal.classList.remove("visible");
            });
        }
    }

    _initInteractionModal() {
        const modal = this.terminal.getEl("julesInteractionModal");
        const cancelBtn = this.terminal.getEl("cancelInteractionBtn");
        const submitBtn = this.terminal.getEl("submitInteractionBtn");
        const inputField = this.terminal.getEl("interactionModalInput");
        const errorSpan = this.terminal.getEl("interactionModalError");

        if (!modal) return;

        const closeModal = () => {
            modal.classList.remove("visible");
            this.terminal.activeModalSessionId = null;
            if (inputField) {
                inputField.value = "";
                inputField.classList.remove("border-error");
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
                    inputField.classList.add("border-error");
                    inputField.setAttribute("aria-invalid", "true");
                    inputField.setAttribute("aria-describedby", "interactionModalError");
                    errorSpan.textContent = "Please provide a response before transmitting.";
                    errorSpan.classList.remove("hidden");
                }
                return;
            }
            if (!this.terminal.activeModalSessionId) return;

            // 🪄 CONJURE: Optimistic UI with silent rollback for interaction modal
            const sessionId = this.terminal.activeModalSessionId;
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
        const debouncedInputClear = typeof PerformanceUtils !== 'undefined' ? PerformanceUtils.debounce(() => {
            if (inputField && errorSpan) {
                inputField.classList.remove("border-error");
                inputField.removeAttribute("aria-invalid");
                inputField.removeAttribute("aria-describedby");
                errorSpan.textContent = "";
                errorSpan.classList.add("hidden");
            }
        }, 300) : () => {
            if (inputField && errorSpan) {
                inputField.classList.remove("border-error");
                inputField.removeAttribute("aria-invalid");
                inputField.removeAttribute("aria-describedby");
                errorSpan.textContent = "";
                errorSpan.classList.add("hidden");
            }
        };
        inputField?.addEventListener("input", debouncedInputClear);

        const cancelHistoryBtn = this.terminal.getEl("cancelHistoryBtn");
        const submitHistoryBtn = this.terminal.getEl("submitHistoryBtn");
        const historyModalInput = this.terminal.getEl("historyModalInput");
        const historyErrorSpan = this.terminal.getEl("historyModalError");
        const historyModal = this.terminal.getEl("julesHistoryModal");

        const closeHistoryModal = () => {
            if (historyModal) {
                historyModal.classList.remove("visible");
                if (historyModalInput) historyModalInput.value = "";
                if (historyErrorSpan) {
                    historyErrorSpan.textContent = "";
                    historyErrorSpan.classList.add("hidden");
                }
            }
            this.terminal.activeModalSessionId = null;
        };

        const handleHistorySubmit = async () => {
            if (!this.terminal.activeModalSessionId) return;
            const text = historyModalInput?.value?.trim();
            if (!text) {
                this._showKeyError(historyModalInput, historyErrorSpan, "Please enter a response.");
                return;
            }

            const sessionId = this.terminal.activeModalSessionId;
            await this._transmitReply(sessionId, text, closeHistoryModal, null);
        };

        cancelHistoryBtn?.addEventListener("click", closeHistoryModal);
        submitHistoryBtn?.addEventListener("click", handleHistorySubmit);
        historyModalInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleHistorySubmit();
        });
        const debouncedHistoryInputClear = typeof PerformanceUtils !== 'undefined' ? PerformanceUtils.debounce(() => {
            if (historyModalInput && historyErrorSpan) {
                historyModalInput.classList.remove("border-error");
                historyModalInput.removeAttribute("aria-invalid");
                historyModalInput.removeAttribute("aria-describedby");
                historyErrorSpan.textContent = "";
                historyErrorSpan.classList.add("hidden");
            }
        }, 300) : () => {
            if (historyModalInput && historyErrorSpan) {
                historyModalInput.classList.remove("border-error");
                historyModalInput.removeAttribute("aria-invalid");
                historyModalInput.removeAttribute("aria-describedby");
                historyErrorSpan.textContent = "";
                historyErrorSpan.classList.add("hidden");
            }
        };
        historyModalInput?.addEventListener("input", debouncedHistoryInputClear);
    }

    _showInteractionModal(sessionId, agentEmoji, agentName, promptText) {
        this.terminal.activeModalSessionId = sessionId;
        const modal = this.terminal.getEl("julesInteractionModal");
        const emojiEl = this.terminal.getEl("interactionModalEmoji");
        const nameEl = this.terminal.getEl("interactionModalAgent");
        const msgEl = this.terminal.getEl("interactionModalMessage");
        const inputField = this.terminal.getEl("interactionModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.textContent = promptText;

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.terminal.constructor.MODAL_FOCUS_DELAY_MS);
    }

    _showHistoryModal(sessionId, agentEmoji, agentName) {
        this.terminal.activeModalSessionId = sessionId;
        const modal = this.terminal.getEl("julesHistoryModal");
        const emojiEl = this.terminal.getEl("historyModalEmoji");
        const nameEl = this.terminal.getEl("historyModalAgent");
        const msgEl = this.terminal.getEl("historyModalContent");
        const inputField = this.terminal.getEl("historyModalInput");

        if (!modal) return;

        if (emojiEl) emojiEl.textContent = agentEmoji;
        if (nameEl) nameEl.textContent = agentName;
        if (msgEl) msgEl.innerHTML = '<span class="term-status skeleton-pulse">Loading execution thread...</span>';

        modal.classList.add("visible");
        setTimeout(() => inputField?.focus(), this.terminal.constructor.MODAL_FOCUS_DELAY_MS);
    }

    async _transmitReply(sessionId, text, closeFn, rollbackState) {
        const statusSpan = document.getElementById(`status-${sessionId}`);

        closeFn();
        this.terminal.app.toast.show("Transmitting reply...", "info");

        if (statusSpan) {
            statusSpan.className = "term-status status-success";
            statusSpan.textContent = "Response provided";
            statusSpan.onclick = null;
        }

        try {
            await window.julesAPI.provideInput(sessionId, text);
            this.terminal.app.toast.show("Reply transmitted.", "success");
        } catch (error) {
            if (!rollbackState) {
                const tu = JulesTerminal.getTelemetryUtils();
                if (tu) tu.dispatchEvent("JULES_SEND_REPLY_FAILED", error);
            }

            this.terminal.app.toast.show("Failed to send reply.", "error");

            if (rollbackState && statusSpan) {
                statusSpan.className = rollbackState.className || "term-status status-waiting";
                statusSpan.textContent = rollbackState.textContent || `⚠️ Response Needed (Click to view)`;
                statusSpan.onclick = rollbackState.onclick;
            }
        }
    }

    _showKeyError(input, span, message) {
        if (!input || !span) return;
        input.classList.add("border-error");
        span.textContent = message;
        span.classList.remove("d-none");
    }

    _clearKeyError(input, span) {
        if (!input || !span) return;
        input.classList.remove("border-error");
        span.textContent = "";
        span.classList.add("d-none");
    }

    _showPRModal(pr) {
        const modal = this.terminal.getEl("julesPRModal");
        if (!modal) return;

        const titleEl = this.terminal.getEl("prModalTitleText");
        const linkEl = this.terminal.getEl("prModalExternalLink");
        const contentEl = this.terminal.getEl("prModalContent");
        const errorEl = this.terminal.getEl("prModalError");

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

        modal.classList.add("visible");
    }

}

if (typeof window !== 'undefined') {
    window.JulesModals = JulesModals;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesModals;
}
