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
        if (!this.apiKey) throw new Error("Jules API Key is missing. Please configure it in Settings.");

        const url = `${this.baseUrl}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
        };

        const response = await fetch(url, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

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
