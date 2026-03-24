/**
 * Service for interacting with the Jules API (Alpha).
 * Handles source fetching, session creation, and activity polling.
 * Attached to the global window object for standard browser usage.
 * @see ../../docs/architecture/Services/README.md#julesapi-architecture for network resilience and data flow.
 */
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_PAGE_SIZE = 50;

class JulesService {
    /**
     * Constructs a new JulesService instance with default configurations.
     * @see ../../docs/architecture/Services/README.md#julesapi-quick-start for initialization details.
     */
    constructor() {
        /** @type {string} */
        this.apiKey = "";
        /** @type {string} */
        this.githubToken = "";
        /** @type {string} */
        this.baseUrl = "https://jules.googleapis.com/v1alpha";
    }

    /**
     * Configures the service with the user's API key.
     * @param {string} apiKey - The Jules API key.
     * @param {string} githubToken - The user's GitHub Personal Access Token.
     * @see ../../docs/architecture/Services/README.md#julesapi-quick-start for configuration workflow.
     */
    configure(apiKey, githubToken = "") {
        this.apiKey = apiKey;
        this.githubToken = githubToken;
    }

    /**
     * Internal helper for Jules API fetches implementing network resilience.
     * @param {string} endpoint - The API endpoint relative to the base URL.
     * @param {RequestInit} [options={}] - Standard fetch options.
     * @param {number} [retries=3] - Number of retries for transient errors.
     * @param {number} [backoff=300] - Initial backoff delay in ms.
     * @returns {Promise<Object|Array>} The parsed JSON response.
     * @throws {Error} If the API key is missing, the request times out (15s), or the API returns an error status.
     * @see ../../docs/architecture/Services/README.md#julesapi-architecture for details on the AbortController timeout mechanism.
     */
    async _fetch(endpoint, options = {}, retries = 3, backoff = 300) {
        if (!this.apiKey) throw new Error("Jules API Key is missing. Please configure it in Settings.");

        const url = `${this.baseUrl}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status >= 500) {
                    throw new Error(`Server returned ${response.status}`);
                }
                const errorText = await response.text();
                let errorMsg = `We encountered a server error. Please wait a moment and try again.`;
                try {
                    const errJson = JSON.parse(errorText);
                    if (errJson.error?.message) errorMsg = errJson.error.message;
                } catch(e) {
                    console.warn("Failed to parse error JSON:", e);
                }
                throw new Error(errorMsg);
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error("The request timed out. Please check your connection and try again.");
            }

            // Retry on network errors or 5xx server errors
            const isServerError = error.message && error.message.startsWith('Server returned');
            const isNetworkError = error.message === 'Network Error' || error.name === 'TypeError' || isServerError;

            if (retries > 0 && isNetworkError) {
                console.warn(`Retrying Jules API ${endpoint} (${retries} left)...`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                return this._fetch(endpoint, options, retries - 1, backoff * 2);
            }

            if (isServerError) {
                throw new Error("We encountered a server error. Please wait a moment and try again.");
            }

            throw error;
        }
    }

    /**
     * Retrieves the list of sessions for the authenticated user.
     * @param {number} [pageSize=DEFAULT_PAGE_SIZE] - The number of sessions to return.
     * @returns {Promise<Object>} The JSON response containing the sessions array.
     * @throws {Error} If the request fails or times out.
     */
    async getSessions(pageSize = DEFAULT_PAGE_SIZE) {
        return this._fetch(`sessions?pageSize=${pageSize}`);
    }

    /**
     * Retrieves the list of available GitHub sources connected to the user's Jules account.
     * @returns {Promise<Object>} The JSON response containing the sources array.
     * @throws {Error} If the request fails or times out.
     * @see ../../docs/architecture/Services/README.md#julesapi-architecture for source fetching flow.
     */
    async getSources() {
        return this._fetch('sources');
    }

    /**
     * Initiates a new Jules session.
     * @param {string} agentMarkdown - The raw markdown prompt of the selected agent.
     * @param {string} userTask - The specific task the user wants to execute.
     * @param {string} sourceName - The target repository (e.g., 'sources/github/user/repo').
     * @param {string} [title="Agent Task"] - Optional title for the session.
     * @returns {Promise<Object>} The JSON response containing the created session details.
     * @throws {Error} If the request fails or times out.
     */
    async createSession(agentMarkdown, userTask, sourceName, title = "Agent Task") {
        const prompt = `${agentMarkdown}

USER TASK TO EXECUTE:
${userTask}`;

        const body = {
            prompt: prompt,
            sourceContext: {
                source: sourceName,
                githubRepoContext: { startingBranch: "main" }
            },
            automationMode: "AUTO_CREATE_PR",
            title: title
        };

        return this._fetch('sessions', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    /**
     * Submits user input to resume a paused session that is waiting for a decision.
     * @param {string} sessionId - The active session ID.
     * @param {string} text - The input response (e.g., 'proceed', 'yes', or specific clarification).
     * @returns {Promise<Object>} The JSON response containing the updated session state.
     */
    async sendUserInput(sessionId, text) {
        return this._fetch(`sessions/${sessionId}/activities`, {
            method: 'POST',
            body: JSON.stringify({
                type: "USER_INPUT",
                message: text
            })
        });
    }

    /**
     * Submits user input to resume a paused session that is waiting for a decision. Alias for sendUserInput.
     * @param {string} sessionId - The active session ID.
     * @param {string} text - The input response.
     * @returns {Promise<Object>} The JSON response containing the updated session state.
     */
    async replyToSession(sessionId, text) {
        return this._fetch(`sessions/${sessionId}/activities`, {
            method: 'POST',
            body: JSON.stringify({
                type: "USER_INPUT",
                message: text
            })
        });
    }

    /**
     * Polls the activities of a specific session to provide a live feed.
     * @param {string} sessionId - The ID of the active session.
     * @returns {Promise<Object>} The JSON response containing the session activities.
     * @throws {Error} If the request fails or times out.
     * @see ../../docs/architecture/Services/README.md#julesapi-architecture for asynchronous polling strategy instead of synchronous streaming.
     */
    async getActivities(sessionId) {
        return this._fetch(`sessions/${sessionId}/activities?pageSize=${DEFAULT_PAGE_SIZE}`);
    }

    /**
     * Retrieves the list of open pull requests for a given repository via the GitHub API.
     * @param {string} sourceName - The target repository source name (e.g., 'sources/github/owner/repo').
     * @returns {Promise<Array>} The JSON response containing the open pull requests, or a safe fallback [] on 404.
     * @throws {Error} If the request fails, times out, or returns a non-404 error status.
     * @see ../../docs/architecture/Features/JulesManager.md#6-pull-request-rendering for the UI synchronization flow.
     */
    async getPullRequests(sourceName) {
        if (!sourceName.startsWith('sources/github/')) {
            throw new Error('Unsupported source format for pull requests');
        }

        const repoPath = sourceName.replace('sources/github/', '');
        const url = `https://api.github.com/repos/${repoPath}/pulls?state=open`;

        const options = {};
        if (this.githubToken) {
            options.headers = {
                'Authorization': `token ${this.githubToken}`
            };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                const errorText = await response.text();
                let errorMsg = `GitHub API returned ${response.status}`;
                try {
                    const errJson = JSON.parse(errorText);
                    if (errJson.message) errorMsg = errJson.message;
                } catch(e) {
                    console.warn("Failed to parse error JSON:", e);
                }
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error("Failed to fetch pull requests:", error);
                return [];
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.julesService = new JulesService();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesService;
}