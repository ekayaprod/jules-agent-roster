class JulesConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JulesConfigurationError';
  }
}

class JulesNetworkError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'JulesNetworkError';
    this.status = status;
  }
}

class JulesTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JulesTimeoutError';
  }
}

/**
 * Handles interactions with the Jules API (jules.googleapis.com).
 * Responsible for configuration, session management, and polling activities.
 *
 * @see README.md for complete payload schemas and architectural boundary constraints.
 */
class JulesAPI {
    constructor() {
        this.apiKey = null;
        this.baseUrl = "https://jules.googleapis.com/v1alpha";
    }

    /**
     * @param {string} apiKey - Google API key authorized for the Jules API.
     */
    configure(apiKey) {
        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
            throw new JulesConfigurationError("Jules API key is missing or invalid");
        }
        if (/[\r\n]/.test(apiKey)) {
            throw new JulesConfigurationError("Jules API key contains invalid characters");
        }
        this.apiKey = apiKey;
    }

    /**
     * Wrapper around standard fetch to append the Google API key,
     * enforce timeout resilience, and structure custom errors.
     *
     * @private
     * @param {string} path - URL path appended to base URL.
     * @param {object} options - Fetch options (method, body, etc.).
     * @returns {Promise<object>} The JSON parsed response.
     */
    async _fetch(path, options = {}) {
        const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);

        if (!this.apiKey) {
             const error = new JulesConfigurationError("Jules API key not configured");
             if (tu) tu.dispatchEvent("JULES_API_CONFIG_ERROR", error, { path });
             else console.error("[JulesAPI] Request aborted. API Key is missing.", error);
             throw error;
        }

        const url = new URL(`${this.baseUrl}${path}`);
        url.searchParams.append("key", this.apiKey);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(url.toString(), {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMsg = `Jules API Error (${response.status})`;
                try {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.message) {
                        errorMsg = errorData.error.message;
                    }
                } catch (e) {
                   // Fallback if parsing fails
                   if (tu) tu.dispatchEvent("JULES_API_PARSE_ERROR", e, { path });
                   else console.error("[JulesAPI] Failed to parse error response JSON", e);
                }

                if (response.status >= 400 && response.status < 500) {
                    errorMsg = `Client Error: ${errorMsg}`;
                } else if (response.status >= 500) {
                    errorMsg = `Server Error: ${errorMsg}`;
                }

                const error = new JulesNetworkError(errorMsg, response.status);
                if (tu) tu.dispatchEvent("JULES_API_NETWORK_ERROR", error, { path, status: response.status });
                else console.error(`[JulesAPI] Request to ${path} failed: ${errorMsg}`, error);
                throw error;
            }

            const data = await response.json();
            return data;
        } catch (error) {
             if (error.name === 'AbortError') {
                 const timeoutErr = new JulesTimeoutError(`Request to ${path} timed out after 15s.`);
                 if (tu) tu.dispatchEvent("JULES_API_TIMEOUT", timeoutErr, { path });
                 else console.error("[JulesAPI] Request timeout.", timeoutErr);
                 throw timeoutErr;
             }
             throw error;
        }
    }

    /**
     * @returns {Promise<object>} Sources payload (repositories).
     */
    async getSources() {
        const data = await this._fetch("/sources");
        if (data && !data.sources) data.sources = [];
        return data;
    }

    /**
     * Fetch all sessions across all repositories for the configured key.
     * @returns {Promise<object>} The sessions payload payload.
     */
    async getSessions() {
        const data = await this._fetch("/sessions");
        if (data && !data.sessions) data.sessions = [];
        return data;
    }

    /**
     * @param {string} repo - The target repository (e.g., owner/repo).
     * @returns {Promise<object>} The sessions payload for the specific repo.
     */
    async getSessionsByRepo(repo) {
        const data = await this._fetch(`/sessions?repo=${encodeURIComponent(repo)}`);
        if (data && !data.sessions) data.sessions = [];
        return data;
    }

    /**
     * Fetch a specific session.
     * @param {string} sessionId - The session ID.
     * @returns {Promise<object>} The specific session payload.
     */
    async getSession(sessionId) {
        return this._fetch(`/sessions/${sessionId}`);
    }

    /**
     * Launch a new agent session.
     * @param {string} prompt - The raw markdown prompt for the agent.
     * @param {string} userTask - The user's task.
     * @param {string} source - Target repository source identifier.
     * @param {string} title - An optional human-readable title for the session.
     * @returns {Promise<object>} The newly created session payload.
     */
    async createSession(prompt, userTask, source, title) {
         if (!prompt || !userTask || !source || !title) {
             const error = new JulesConfigurationError("Missing required parameters for createSession");
             const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
             if (tu) tu.dispatchEvent("JULES_API_SESSION_CREATE_ERROR", error);
             else console.error("[JulesAPI] Cannot create session", error);
             throw error;
         }

         // ✍️ CHRONICLE: Strips YAML frontmatter from the prompt string.
         /**
          * Reverts previous `<system_instructions>` XML formatting and explicitly
          * removes YAML metadata to prevent frontmatter from bleeding into the
          * prompt string sent to the API.
          * * Historical Intent: Added via PR/commit 00ec12d (May 2026).
          */
         const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
         const match = prompt.match(yamlRegex);
         const cleanPrompt = match ? prompt.slice(match[0].length) : prompt;

         const payload = {
            automationMode: "AUTO_CREATE_PR",
            prompt: `${cleanPrompt.trim()}\n\n${userTask}`,
            sourceContext: {
                githubRepoContext: {
                    startingBranch: "main"
                },
                source: source
            },
            title: title
        };

        return this._fetch("/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    }

    /**
     * @param {string} sessionId - Target session ID.
     * @returns {Promise<object>} Activities payload (chat logs, outputs, etc).
     */
    async getActivities(sessionId) {
        const data = await this._fetch(`/sessions/${sessionId}/activities`);
        if (data && !data.activities) data.activities = [];
        return data;
    }

    /**
     * Send user input back to a blocked or Needs Input session.
     * @param {string} sessionId - Target session ID.
     * @param {string} text - User message text.
     * @returns {Promise<object>} The activity payload response.
     */
    async provideInput(sessionId, text) {
         if (!sessionId || !text) {
             throw new JulesConfigurationError("Missing sessionId or text for provideInput");
         }

         const payload = {
             activity: {
                type: "USER_INPUT",
                userInput: {
                    text: text
                }
             }
         };

         return this._fetch(`/sessions/${sessionId}/activities`, {
             method: "POST",
             headers: {
                "Content-Type": "application/json"
             },
             body: JSON.stringify(payload)
         });
    }
}

// Export strictly for modular environments (ESM/Node) or attach to window
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { JulesAPI, JulesConfigurationError, JulesNetworkError, JulesTimeoutError };
} else {
    window.JulesAPI = JulesAPI;
}
