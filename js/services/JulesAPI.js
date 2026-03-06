/**
 * Service for interacting with the Jules API (Alpha).
 * Handles source fetching, session creation, and activity polling.
 * Attached to the global window object for standard browser usage.
 */


/**
 * 🎛️ Polygraph: Strict Schema Validators
 * Prevents hallucinatory JSON responses or malformed data from crashing the application.
 */
class JulesSchemaValidator {
    static validateSources(data) {
        if (!data || typeof data !== 'object') throw new Error("Invalid response: Expected JSON object");
        if (!Array.isArray(data.sources)) {
            // Some endpoints might return empty if no sources, but let's strictly enforce the key or allow undefined if handled properly.
            // Wait, data.sources might be undefined if empty array in some APIs, but let's strictly enforce array if present.
            if (data.sources === undefined) data.sources = [];
            else throw new Error("Invalid schema: 'sources' must be an array");
        }

        data.sources.forEach(s => {
            if (!s.name || typeof s.name !== 'string') throw new Error("Invalid schema: Source missing 'name'");
            if (!s.githubRepo || typeof s.githubRepo !== 'object') throw new Error("Invalid schema: Source missing 'githubRepo' object");
            if (!s.githubRepo.owner || typeof s.githubRepo.owner !== 'string') throw new Error("Invalid schema: Source missing 'githubRepo.owner'");
            if (!s.githubRepo.repo || typeof s.githubRepo.repo !== 'string') throw new Error("Invalid schema: Source missing 'githubRepo.repo'");
        });
        return data;
    }

    static validateSession(data) {
        if (!data || typeof data !== 'object') throw new Error("Invalid response: Expected JSON object");
        if (!data.id || typeof data.id !== 'string') throw new Error("Invalid schema: Session missing 'id'");
        return data;
    }

    static validateActivities(data) {
        if (!data || typeof data !== 'object') throw new Error("Invalid response: Expected JSON object");
        if (data.activities !== undefined && !Array.isArray(data.activities)) {
            throw new Error("Invalid schema: 'activities' must be an array");
        }
        if (data.activities) {
            data.activities.forEach(act => {
                if (!act.id || typeof act.id !== 'string') throw new Error("Invalid schema: Activity missing 'id'");
                if (!act.createTime || typeof act.createTime !== 'string') throw new Error("Invalid schema: Activity missing 'createTime'");
            });
        }
        return data;
    }
}

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
    async _fetch(endpoint, options = {}, validator = null) {
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


            const rawJson = await response.json();
            if (validator) {
                return validator(rawJson);
            }
            return rawJson;
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
     */
    async getSources() {
        return this._fetch('sources', {}, JulesSchemaValidator.validateSources);
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
        }, JulesSchemaValidator.validateSession);
    }

    /**
     * Polls the activities of a specific session to provide a live feed.
     * @param {string} sessionId - The ID of the active session.
     */
    async getActivities(sessionId) {
        return this._fetch(`sessions/${sessionId}/activities?pageSize=50`, {}, JulesSchemaValidator.validateActivities);
    }
}

// Attach to window for global access
window.julesService = new JulesService();
