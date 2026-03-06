/**
 * Service for interacting with the Jules API (Alpha).
 * Handles source fetching, session creation, and activity polling.
 * Attached to the global window object for standard browser usage.
 * @see README.md#julesapi-architecture for network resilience and data flow.
 */
class JulesService {
    /**
     * Constructs a new JulesService instance with default configurations.
     * @see README.md#julesapi-quick-start for initialization details.
     */
    constructor() {
        /** @type {string} */
        this.apiKey = "";
        /** @type {string} */
        this.baseUrl = "https://jules.googleapis.com/v1alpha";
    }

    /**
     * Configures the service with the user's API key.
     * @param {string} apiKey - The Jules API key.
     * @see README.md#julesapi-quick-start for configuration workflow.
     */
    configure(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Internal helper for Jules API fetches implementing network resilience.
     * @param {string} endpoint - The API endpoint relative to the base URL.
     * @param {RequestInit} [options={}] - Standard fetch options.
     * @returns {Promise<any>} The parsed JSON response.
     * @throws {Error} If the API key is missing, the request times out (15s), or the API returns an error status.
     * @see README.md#julesapi-architecture for details on the AbortController timeout mechanism.
     */
    async _fetch(endpoint, options = {}) {
        if (!this.apiKey) throw new Error("Jules API Key is missing. Please configure it in Settings.");

        const url = `${this.baseUrl}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMsg = `Jules API Error ${response.status}`;
                try {
                    const errJson = JSON.parse(errorText);
                    if (errJson.error?.message) errorMsg = errJson.error.message;
                } catch(e) {}
                throw new Error(errorMsg);
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error("Jules API Timeout: Request took longer than 15000ms.");
            }
            throw error;
        }
    }

    /**
     * Retrieves the list of available GitHub sources connected to the user's Jules account.
     * @returns {Promise<Object>} The JSON response containing the sources array.
     * @throws {Error} If the request fails or times out.
     * @see README.md#julesapi-architecture for source fetching flow.
     */
    async getSources() {
        return this._fetch('sources');
    }

    /**
     * Initiates a new Jules session using the System Override wrapper to prevent file-creation traps.
     * @param {string} agentMarkdown - The raw markdown prompt of the selected agent.
     * @param {string} userTask - The specific task the user wants to execute.
     * @param {string} sourceName - The target repository (e.g., 'sources/github/user/repo').
     * @param {string} [title="Agent Task"] - Optional title for the session.
     * @returns {Promise<Object>} The JSON response containing the created session details.
     * @throws {Error} If the request fails or times out.
     * @see README.md#julesapi-architecture for details on the System Override prompt wrapper.
     */
    async createSession(agentMarkdown, userTask, sourceName, title = "Agent Task") {
        const prompt = `[SYSTEM OVERRIDE: IMMEDIATE EXECUTION]
Do NOT write the following text to a file. Do NOT save this as a prompt. 
You must immediately adopt the persona defined below and execute Step 1 of its "Daily Process" against the current repository.

${agentMarkdown}

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
     * Polls the activities of a specific session to provide a live feed.
     * @param {string} sessionId - The ID of the active session.
     * @returns {Promise<Object>} The JSON response containing the session activities.
     * @throws {Error} If the request fails or times out.
     * @see README.md#julesapi-architecture for asynchronous polling strategy instead of synchronous streaming.
     */
    async getActivities(sessionId) {
        return this._fetch(`sessions/${sessionId}/activities?pageSize=50`);
    }
}

// Attach to window for global access
window.julesService = new JulesService();
