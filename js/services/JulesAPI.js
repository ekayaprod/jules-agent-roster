class JulesConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'JulesConfigurationError';
    }
}

class JulesNetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'JulesNetworkError';
        this.statusCode = statusCode;
    }
}

class JulesTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'JulesTimeoutError';
    }
}

/**
 * Service for interacting with the Jules API (Alpha).
 * Handles source fetching, session creation, and activity polling.
 * Attached to the global window object for standard browser usage.
 */
class JulesService {
    constructor() {
        this.apiKey = "";
        this.baseUrl = "https://jules.googleapis.com/v1alpha";
    }

    /**
     * Configures the service with the user's API key.
     * @param {string} apiKey - The Jules API key.
     */
    configure(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Internal helper for Jules API fetches.
     */
    async _fetch(endpoint, options = {}) {
        if (!this.apiKey) {
            console.error(JSON.stringify({
                event: 'JULES_API_MISSING_KEY',
                endpoint: endpoint,
                timestamp: new Date().toISOString()
            }));
            throw new JulesConfigurationError("Jules API Key is missing. Please configure it in Settings.");
        }

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
                } catch(e) {
                    console.error(JSON.stringify({
                        event: 'JULES_API_MALFORMED_ERROR_RESPONSE',
                        endpoint: endpoint,
                        status: response.status,
                        rawResponse: errorText.substring(0, 200),
                        timestamp: new Date().toISOString()
                    }));
                }

                console.error(JSON.stringify({
                    event: 'JULES_API_NETWORK_ERROR',
                    endpoint: endpoint,
                    status: response.status,
                    message: errorMsg,
                    timestamp: new Date().toISOString()
                }));
                throw new JulesNetworkError(errorMsg, response.status);
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error(JSON.stringify({
                    event: 'JULES_API_TIMEOUT',
                    endpoint: endpoint,
                    duration: '15000ms',
                    timestamp: new Date().toISOString()
                }));
                throw new JulesTimeoutError("Jules API Timeout: Request took longer than 15000ms.");
            }

            // Re-throw if it's already a custom error (e.g. from the block above)
            if (error instanceof JulesNetworkError || error instanceof JulesConfigurationError || error instanceof JulesTimeoutError) {
                throw error;
            }

            // Log unexpected fetch errors
            console.error(JSON.stringify({
                event: 'JULES_API_UNEXPECTED_ERROR',
                endpoint: endpoint,
                message: error.message,
                timestamp: new Date().toISOString()
            }));
            throw error;
        }
    }

    /**
     * Retrieves the list of available GitHub sources connected to the user's Jules account.
     */
    async getSources() {
        return this._fetch('sources');
    }

    /**
     * Initiates a new Jules session using the System Override wrapper to prevent file-creation traps.
     * @param {string} agentMarkdown - The raw markdown prompt of the selected agent.
     * @param {string} userTask - The specific task the user wants to execute.
     * @param {string} sourceName - The target repository (e.g., 'sources/github/user/repo').
     * @param {string} title - Optional title for the session.
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
     */
    async getActivities(sessionId) {
        return this._fetch(`sessions/${sessionId}/activities?pageSize=50`);
    }
}

// Attach to window for global access
window.julesService = new JulesService();
window.JulesConfigurationError = JulesConfigurationError;
window.JulesNetworkError = JulesNetworkError;
window.JulesTimeoutError = JulesTimeoutError;
