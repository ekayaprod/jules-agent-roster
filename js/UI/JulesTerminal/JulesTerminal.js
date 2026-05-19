/**
 * Polling array callbacks hoisted to the file scope.
 */
const sortByCreateTime = (a, b) => a.createTime < b.createTime ? -1 : (a.createTime > b.createTime ? 1 : 0);

/**
 * Manages the core operations for interacting with Jules APIs.
 * Engineered for a single-line terminal output where GitHub handles completions.
 * @see ../../../docs/architecture/Features/JulesTerminal.md#overview for the macro architectural scope.
 */
class JulesTerminal {
    static ACTIVE_SESSIONS_POLL_MS = 5000;
    static TERMINAL_POLL_MS = 3000;
    static MODAL_FOCUS_DELAY_MS = 50;
    static MODAL_FOCUS_QUICK_DELAY_MS = 10;
    static SUCCESS_DISMISS_DELAY_MS = 2000;
    static PAGE_SIZE = 50;

    /**
     * Safe cross-environment getters encapsulated as static methods.
     */
    static getFormatUtils() {
        if (typeof FormatUtils !== 'undefined') return FormatUtils;
        if (typeof window !== 'undefined' && window.FormatUtils) return window.FormatUtils;
        if (typeof global !== 'undefined' && global.FormatUtils) return global.FormatUtils;
        if (typeof require !== 'undefined') return require('../../../Utils/format-utils.js');
        return null;
    }

    static getTelemetryUtils() {
        if (typeof TelemetryUtils !== 'undefined') return TelemetryUtils;
        if (typeof window !== 'undefined' && window.TelemetryUtils) return window.TelemetryUtils;
        if (typeof global !== 'undefined' && global.TelemetryUtils) return global.TelemetryUtils;
        return null;
    }

    constructor(rosterApp) {
        this.app = rosterApp;
        this.currentRepo = null;
        this.activeSessionsTimeout = null;
        this._pollingActive = false;
        this.julesPollingIntervals = {};
        this.renderedSessionIds = new Set();
        this.dismissedSessionIds = new Set();
        this.elements = {};

        // Modal State
        this.activeModalSessionId = null;

        // Queue State
        this.sessionQueue = [];
        this.isProcessingQueue = false;

        // Domain classes
        this.modals = new JulesModals(this);
        this.polling = new TerminalPolling(this);

        // Split monolith logic
        this.renderer = new TerminalRenderer(this);
        this.sessionManager = new TerminalSessionManager(this);
    }

    cleanup() {
        this.polling.cleanup();

        // Utility method exported to class level for delegates
        this.sortByCreateTime = sortByCreateTime;
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
        this.renderer.checkEmptyTerminal();
    }

    /**
     * Bootstraps the manager, loads cached API keys, and initializes the modal.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#1-initialization-and-authentication
     */
    async init() {
        this.initialized = true;
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
                setTimeout(() => keyInput.focus(), JulesTerminal.MODAL_FOCUS_QUICK_DELAY_MS);
                this.modals._clearKeyError(keyInput, errorSpan);
                this.modals._clearKeyError(githubTokenInput, githubTokenErrorSpan);
            } else {
                settingsModal.classList.remove("visible");
            }
        };

        openBtn?.addEventListener("click", () => toggleModal(true));
        closeBtn?.addEventListener("click", () => toggleModal(false));

        keyInput?.addEventListener("blur", () => {
            if (!keyInput.value.trim()) this.modals._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
            else this.modals._clearKeyError(keyInput, errorSpan);
        });

        saveBtn?.addEventListener("click", async () => {
            const key = keyInput.value.trim();
            const githubKey = githubTokenInput ? githubTokenInput.value.trim() : "";

            if (!key) {
                this.modals._showKeyError(keyInput, errorSpan, "Please enter your Jules API Key to connect.");
                return;
            }

            try {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.LOADING : "loading", "Connecting...");
                if (keyInput) keyInput.disabled = true;
                if (githubTokenInput) githubTokenInput.disabled = true;

                StorageUtils.setItem("jules_api_key", key);
                StorageUtils.setItem("github_api_key", githubKey);
                toggleModal(false);
                this.app.toast.show("Connecting to APIs...");

                if (window.julesAPI) {
                    window.julesAPI.configure(key, githubKey);
                    // ⚡ Bolt+: Severed the synchronous I/O waterfall to prevent freezing the UI modal thread on configuration updates.
                    this.loadSources().catch(err => {
                        const tu = JulesTerminal.getTelemetryUtils();
                        if (tu) tu.dispatchEvent("BACKGROUND_FETCH_FAILED", err);
                    });
                }
            } finally {
                if (saveBtn) DOMUtils.setButtonState(saveBtn, typeof BUTTON_STATES !== "undefined" ? BUTTON_STATES.READY : "ready", "Save Settings & Connect");
                if (keyInput) keyInput.disabled = false;
                if (githubTokenInput) githubTokenInput.disabled = false;
            }
        });

        this.modals._initInteractionModal();
        this.modals._initPRModal();

        if (apiKey && window.julesAPI) {
            window.julesAPI.configure(apiKey, githubToken);
            const toggle = this.getEl("julesActivateToggle");
            if (toggle && toggle.checked) {
                // ⚡ Bolt+: The Waterfall Collapse. Unblocked the primary application boot thread by shifting synchronous remote API resolution into a parallel fire-and-forget execution.
                this.loadSources().catch(err => {
                    const tu = JulesTerminal.getTelemetryUtils();
                    if (tu) tu.dispatchEvent("BACKGROUND_FETCH_FAILED", err);
                });
            }
        } else {
            // Only show modal if the toggle is explicitly active, else defer until toggled
            const toggle = this.getEl("julesActivateToggle");
            if (toggle && toggle.checked) {
                toggleModal(true);
            }
        }
    }


    /**
     * Fetches the connected source repositories and populates the source dropdown picker.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#2-repository-source-selection
     */
    async loadSources() {
        const picker = this.getEl("julesRepoPicker");
        if (!picker || !window.julesAPI) return;

        const originalText = picker.options && picker.options.length > 0 ? picker.options[0].textContent : "1. Select GitHub Repository...";
        picker.innerHTML = `<option value="">Loading repositories...</option>`;
        picker.disabled = true;

        try {
            const sourcesResponse = await window.julesAPI.getSources();
            if (sourcesResponse.sources) {
                picker.innerHTML = `<option value="">1. Select GitHub Repository...</option>`;
                sourcesResponse.sources.forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = s.name;

                    const formatUtils = JulesTerminal.getFormatUtils();
                    opt.textContent = (s.githubRepo && s.githubRepo.owner && s.githubRepo.repo) ? `${s.githubRepo.owner}/${s.githubRepo.repo}` : (formatUtils ? formatUtils.extractRepoPath(s.name) : s.name);

                    picker.appendChild(opt);
                });

                // Directly bind the dropdown change to trigger BOTH APIs
                if (!picker.dataset.listenerAttached) {
                    picker.addEventListener("change", async (e) => {
                        const sourceName = e.target.value;
                        if (sourceName) {
                            await Promise.all([
                                this.loadPullRequestsForRepo(sourceName),
                                this.loadActiveSessionsForRepo(sourceName)
                            ]);
                        } else {
                            this.polling._clearPollingAndCache();
                            this.getEl("julesTerminal").innerHTML = DOMUtils.getTerminalIndicatorHTML("Awaiting repository connection...");
                        }
                    });
                    picker.dataset.listenerAttached = "true";
                }
            } else {
                picker.innerHTML = `<option value="">${originalText}</option>`;
            }
        } catch (error) {
            picker.innerHTML = `<option value="">${originalText}</option>`;
            const tu = JulesTerminal.getTelemetryUtils();
            if (tu) tu.dispatchEvent("SOURCES_LOAD_FAILED", error);
            this.app.toast.show(`Unable to connect to GitHub: ${error.message || "Unknown error"}`, true);
        } finally {
            picker.disabled = false;
        }
    }

    /**
     * Initializes a recurring active session polling loop for a specific repository.
     * Safely executes an async loop instead of setInterval to prevent connection exhaustion.
     * @param {string} sourceName - The target source/repo identifier (e.g. sources/github/owner/repo)
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#4-active-sessions-polling
     */
    async loadActiveSessionsForRepo(sourceName) {
        const terminal = this.getEl("julesTerminal");

        if (this.currentRepo !== sourceName) {
            this.polling._clearPollingAndCache();
            const existingInd = terminal.querySelector('#fetchingIndicator');
            if (!existingInd) {
                 terminal.innerHTML += DOMUtils.getTerminalIndicatorHTML("Checking active Jules routines...");
            }
            this.currentRepo = sourceName;
        }

        this.polling._startSessionPolling(sourceName, terminal);
    }

    // Facade mappings to the extracted sessionManager for backwards compatibility during transition
    async _fetchAndRenderSessions(sourceName, terminal) {
        return this.sessionManager.fetchAndRenderSessions(sourceName, terminal);
    }

    async launchSession(agent, btn = null) {
        return this.sessionManager.launchSession(agent, btn);
    }

    /**
     * Retrieves the latest active PRs for the repository to synchronize the UI with actual VCS state.
     * @param {string} sourceName - The targeted repository.
     * @returns {Promise<void>}
     * @see ../../../docs/architecture/Features/JulesTerminal.md#6-pull-request-rendering
     */
    async loadPullRequestsForRepo(sourceName) {
        if (!window.julesAPI) return;
        const pullRequests = await window.githubAPI.getPullRequests(sourceName);
        this.renderer.renderPullRequests(pullRequests, this.getEl("julesTerminal"));
    }
}

if (typeof window !== 'undefined') {
    window.JulesTerminal = JulesTerminal;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesTerminal;
}
