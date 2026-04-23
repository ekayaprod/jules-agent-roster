class GithubConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GithubConfigurationError';
  }
}

class GithubNetworkError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GithubNetworkError';
    this.status = status;
  }
}

/**
 * Handles interactions with the Github API.
 */
class GithubAPI {
    constructor() {
        this.apiKey = null;
        this.baseUrl = "https://api.github.com";
    }

    /**
     * @param {string} apiKey - Github Personal Access Token.
     */
    configure(apiKey) {
        if (!apiKey) {
            throw new GithubConfigurationError("Github API key is missing");
        }
        this.apiKey = apiKey;
    }

    /**
     * @private
     */
    async _fetch(path, options = {}) {
        if (!this.apiKey) {
            throw new GithubConfigurationError("Github API key not configured");
        }

        const url = new URL(`${this.baseUrl}${path}`);

        try {
            const response = await fetch(url.toString(), {
                ...options,
                headers: {
                    ...options.headers,
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Accept": "application/vnd.github.v3+json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.message || `Github API Error (${response.status})`;
                throw new GithubNetworkError(errorMsg, response.status);
            }

            return await response.json();
        } catch (error) {
            console.error(`[GithubAPI] Request to ${path} failed: `, error);
            throw error;
        }
    }

    /**
     * @param {string} repo - The repository (e.g. owner/repo).
     * @returns {Promise<Array>} List of open pull requests.
     */
    async getPullRequests(repo) {
        return this._fetch(`/repos/${repo}/pulls?state=open`);
    }

    /**
     * @param {string} repo - The repository (e.g. owner/repo).
     * @param {number} pullNumber - The PR number.
     * @returns {Promise<object>} The pull request data.
     */
    async getPullRequest(repo, pullNumber) {
        return this._fetch(`/repos/${repo}/pulls/${pullNumber}`);
    }
}

// Export strictly for modular environments (ESM/Node) or attach to window
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { GithubAPI, GithubConfigurationError, GithubNetworkError };
} else {
    window.GithubAPI = GithubAPI;
}
