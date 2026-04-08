/**
 * Service for interacting with the Jules API (Alpha).
 * Handles source fetching, session creation, and activity polling.
 * Attached to the global window object for standard browser usage.
 * @see ../../docs/architecture/Services/README.md#julesapi-architecture for network resilience and data flow.
 */
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_PAGE_SIZE = 50;

if (typeof FormatUtils === 'undefined' && typeof require !== 'undefined') {
    global.FormatUtils = require('../Utils/format-utils.js');
}
if (typeof NetworkUtils === 'undefined' && typeof require !== 'undefined') {
    global.NetworkUtils = require('../Utils/network-utils.js');
}
if (typeof TelemetryUtils === 'undefined' && typeof require !== 'undefined') {
    global.TelemetryUtils = require('../Utils/telemetry-utils.js');
}

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

        try {
            const response = await NetworkUtils.fetchWithRetry(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            }, retries, backoff);

            try {
                return await response.json();
            } catch {
                throw new Error("We encountered a server error. Please wait a moment and try again.");
            }
        } catch (error) {
            if (error.message && error.message.startsWith('HTTP Error:')) {
                 throw new Error(`We encountered a server error. Please wait a moment and try again.`);
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
        const prompt = `${PromptParser.stripFrontmatter(agentMarkdown || "")}

You must output valid JSON. Expected keys: action, data.

USER TASK TO EXECUTE:
${userTask}`;

        const body = {
            prompt: prompt,
            sourceContext: {
                source: sourceName,
                githubRepoContext: { startingBranch: "main" }
            },
            response_format: { type: "json_object" },
            automationMode: "AUTO_CREATE_PR",
            title: title
        };

        const start = performance.now();
        const response = await this._fetch('sessions', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        const latency = performance.now() - start;

        const Telemetry = typeof TelemetryUtils !== 'undefined' ? TelemetryUtils : (typeof window !== 'undefined' ? window.TelemetryUtils : global.TelemetryUtils);
        if (Telemetry && Telemetry.dispatchEvent) {
            Telemetry.dispatchEvent('ai_request', 'AI Session Created', {
                latencyMs: latency,
                tokens: response.usage?.totalTokens || 0,
                model: response.model || 'jules-alpha'
            });
        }

        return response;
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
     * Internal utility to handle duplicate GitHub fetch logic, timeout management, and error parsing.
     * @param {string} sourceName - The target repository source name (e.g., 'sources/github/owner/repo').
     * @param {string} endpoint - The GitHub API endpoint relative to the repo (e.g., 'pulls/1').
     * @param {Object} options - Additional fetch options (method, body, headers).
     * @param {boolean} [allow404=false] - Whether to return an empty array on a 404 status.
     * @returns {Promise<Object|Array>} The parsed JSON response.
     */
    async _githubRequest(sourceName, endpoint, options = {}, allow404 = false) {
        if (!sourceName.startsWith('sources/github/')) {
            throw new Error(`Unsupported source format${allow404 ? ' for pull requests' : ''}`);
        }

        const repoPath = FormatUtils.extractRepoPath(sourceName);
        const url = `https://api.github.com/repos/${repoPath}/${endpoint}`;

        const fetchOptions = { ...options };
        if (this.githubToken) {
            fetchOptions.headers = {
                ...fetchOptions.headers,
                'Authorization': `token ${this.githubToken}`
            };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            if (!response.ok) {
                if (allow404 && response.status === 404) {
                    return [];
                }
                const errorText = await response.text();
                let errorMsg = `GitHub API returned ${response.status}`;
                try {
                    const errJson = JSON.parse(errorText);
                    if (errJson.message) errorMsg = errJson.message;
                } catch(e) {
                    if (allow404) console.warn("Failed to parse error JSON:", e);
                }
                throw new Error(errorMsg);
            }
            try {
                return await response.json();
            } catch (parseError) {
                if (allow404) {
                    console.warn("Failed to parse response JSON:", parseError);
                    return [];
                }
                throw new Error("Invalid response format from GitHub API");
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                if (allow404) {
                    console.error("Failed to fetch pull requests:", error);
                    return [];
                }
                throw new Error('Request timed out');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Retrieves the list of open pull requests for a given repository via the GitHub API.
     * @param {string} sourceName - The target repository source name (e.g., 'sources/github/owner/repo').
     * @returns {Promise<Array>} The JSON response containing the open pull requests, or a safe fallback [] on 404.
     * @throws {Error} If the request fails, times out, or returns a non-404 error status.
     * @see ../../docs/architecture/Features/JulesManager.md#6-pull-request-rendering for the UI synchronization flow.
     */

    /**
     * Retrieves details for a specific pull request via the GitHub API.
     * @param {string} sourceName - The target repository source name.
     * @param {number} prNumber - The PR number.
     * @returns {Promise<Object>} The pull request details.
     */
    async getPullRequest(sourceName, prNumber) {
        return this._githubRequest(sourceName, `pulls/${prNumber}`);
    }

    /**
     * Merges a pull request via the GitHub API.
     * @param {string} sourceName - The target repository source name.
     * @param {number} prNumber - The PR number.
     * @returns {Promise<Object>} The merge result.
     */
    async mergePullRequest(sourceName, prNumber) {
        return this._githubRequest(sourceName, `pulls/${prNumber}/merge`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Closes a pull request via the GitHub API.
     * @param {string} sourceName - The target repository source name.
     * @param {number} prNumber - The PR number.
     * @returns {Promise<Object>} The updated PR details.
     */
    async closePullRequest(sourceName, prNumber) {
        return this._githubRequest(sourceName, `pulls/${prNumber}`, {
            method: 'PATCH',
            body: JSON.stringify({ state: 'closed' }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async getPullRequests(sourceName) {
        return this._githubRequest(sourceName, 'pulls?state=open', {}, true);
    }
}

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.julesService = new JulesService();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesService;
}