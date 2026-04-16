// Safe cross-environment getters
var getFormatUtils = () => (typeof window !== 'undefined' && window.FormatUtils) ? window.FormatUtils : ((typeof global !== 'undefined' && global.FormatUtils) ? global.FormatUtils : (typeof require !== 'undefined' ? require('../Utils/format-utils.js') : null));
var getNetworkUtils = () => (typeof window !== 'undefined' && window.NetworkUtils) ? window.NetworkUtils : ((typeof global !== 'undefined' && global.NetworkUtils) ? global.NetworkUtils : (typeof require !== 'undefined' ? require('../Utils/network-utils.js') : null));
var getTelemetryUtils = () => (typeof window !== 'undefined' && window.TelemetryUtils) ? window.TelemetryUtils : ((typeof global !== 'undefined' && global.TelemetryUtils) ? global.TelemetryUtils : (typeof require !== 'undefined' ? require('../Utils/telemetry-utils.js') : null));
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
     * Cortex Strict Schema Validator Helper
     */
    _validateSchema(data, expectedKeys, arrayKey = null) {
        if (!data || typeof data !== 'object') throw new Error("Invalid API payload: Expected JSON object.");

        // Defensive handling for APIs returning flat arrays instead of wrapped objects
        if (Array.isArray(data) && arrayKey) {
            return { [arrayKey]: data };
        }

        // 🧠 Google APIs often omit empty array fields from JSON responses.
        // We gracefully enforce the arrayKey if it exists, and safely default it if missing.
        // Added defensive fallbacks for schema shifts to 'items' or 'data' to prevent silent data loss.
        if (arrayKey && !(arrayKey in data)) {
            if ('items' in data && Array.isArray(data.items)) {
                data[arrayKey] = data.items;
            } else if ('data' in data && Array.isArray(data.data)) {
                data[arrayKey] = data.data;
            } else {
                data[arrayKey] = [];
            }
        }

        for (const key of expectedKeys) {
            if (!(key in data)) throw new Error(`Invalid API payload: Missing required field '${key}'.`);
        }
        if (arrayKey && !Array.isArray(data[arrayKey])) {
            throw new Error(`Invalid API payload: '${arrayKey}' must be an array.`);
        }
        return data;
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
        if (typeof this.apiKey !== 'string' || !this.apiKey.trim()) throw new Error("Jules API Key is missing. Please configure it in Settings.");

        const url = `${this.baseUrl}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await getNetworkUtils().fetchWithRetry(url, {
                ...options,
                headers: { ...headers, ...options.headers },
                signal: controller.signal
            }, retries, backoff);

            try {
                return await response.json();
            } catch (error) {
                throw new Error("We encountered a server error. Please wait a moment and try again.");
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('API Degradation: Request timed out.');
            }
            if (error.message && typeof error.message === 'string' && error.message.startsWith('HTTP Error:')) {
                 throw new Error(`We encountered a server error. Please wait a moment and try again.`);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Retrieves the list of sessions for the authenticated user.
     * @param {number} [pageSize=DEFAULT_PAGE_SIZE] - The number of sessions to return.
     * @returns {Promise<Object>} The JSON response containing the sessions array.
     * @throws {Error} If the request fails or times out.
     */
    async getSessions(pageSize = DEFAULT_PAGE_SIZE) {
        const res = await this._fetch(`sessions?pageSize=${pageSize}`);
        return this._validateSchema(res, ['sessions'], 'sessions');
    }

    /**
     * Retrieves the list of available GitHub sources connected to the user's Jules account.
     * @returns {Promise<Object>} The JSON response containing the sources array.
     * @throws {Error} If the request fails or times out.
     * @see ../../docs/architecture/Services/README.md#julesapi-architecture for source fetching flow.
     */
    async getSources() {
        const res = await this._fetch('sources');
        return this._validateSchema(res, ['sources'], 'sources');
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
    async createSession(agentMarkdown, userTask, sourceName, title = "Agent Task", options = {}) {
        if (typeof agentMarkdown !== 'string') agentMarkdown = "";
        if (typeof userTask !== 'string') userTask = "";
        if (typeof sourceName !== 'string' || (!sourceName.startsWith('sources/github/') && sourceName !== 'repo')) {
            throw new Error("Invalid source context.");
        }
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
            automationMode: "AUTO_CREATE_PR",
        };

        if (options && options.requirePlanApproval === true) {
            body.requirePlanApproval = true;
        }

        if (typeof title === 'string' && title.trim()) body.title = title;

        const start = performance.now();
        const response = await this._fetch('sessions', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        this._validateSchema(response, ['id']);

        const latency = performance.now() - start;

        const Telemetry = getTelemetryUtils();
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
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(sessionId)) {
            throw new Error("Invalid payload: Malformed session identifier.");
        }

        // 🧠 Cortex: JIT Endpoint Resolution. The legacy endpoint for sending user messages
        // to a session was /activities. The new endpoint according to the live documentation
        // is /:sendMessage.
        return this._fetch(`sessions/${sessionId}:sendMessage`, {
            method: 'POST',
            body: JSON.stringify({
                prompt: text
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
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(sessionId)) {
            throw new Error("Invalid payload: Malformed session identifier.");
        }
        const res = await this._fetch(`sessions/${sessionId}/activities?pageSize=${DEFAULT_PAGE_SIZE}`);
        return this._validateSchema(res, ['activities'], 'activities');
    }

    /**
     * Retrieves a single active session by ID.
     * @param {string} sessionId - The ID of the session to retrieve.
     * @returns {Promise<Object>} The JSON response containing the session details.
     * @throws {Error} If the request fails or times out.
     */
    async getSession(sessionId) {
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(sessionId)) {
            throw new Error("Invalid payload: Malformed session identifier.");
        }
        const res = await this._fetch(`sessions/${sessionId}`);
        return this._validateSchema(res, ['id']);
    }

    /**
     * Approves a generated plan for a session.
     * @param {string} sessionId - The ID of the active session.
     * @returns {Promise<Object>} The JSON response from the API.
     * @throws {Error} If the request fails or times out.
     */
    async approvePlan(sessionId) {
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(sessionId)) {
            throw new Error("Invalid payload: Malformed session identifier.");
        }
        return this._fetch(`sessions/${sessionId}:approvePlan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
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
        if (typeof sourceName !== 'string' || !sourceName.startsWith('sources/github/')) {
            throw new Error(`Unsupported source format${allow404 ? ' for pull requests' : ''}`);
        }

        const repoPath = getFormatUtils().extractRepoPath(sourceName);
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
                    const errJson = typeof errorText === 'string' ? JSON.parse(errorText) : {};
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
    async getPullRequests(sourceName) {
        return this._githubRequest(sourceName, 'pulls?state=open', {}, true);
    }

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
}

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.julesService = new JulesService();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JulesService;
}
