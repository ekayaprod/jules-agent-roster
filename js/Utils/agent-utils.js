class AgentUtils {
    /**
     * Centralized helper to retrieve custom agents from flat or nested dictionaries.
     * @param {Object} customAgents - The dictionary of custom agents.
     * @param {string} key - The key of the custom agent to retrieve.
     * @returns {Object|undefined} The custom agent object, or undefined if not found.
     */
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}