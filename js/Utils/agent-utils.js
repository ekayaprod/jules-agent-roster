class AgentUtils {
    /**
     * Helper to retrieve a custom agent from the flat dictionary by its combination key.
     * @param {Object} customAgents - The flat dictionary of custom agents.
     * @param {string} key - The fusion combination key (e.g. "Architect,Author")
     * @returns {Object|undefined} The agent object or undefined if not found.
     */
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }
}

if (typeof window !== 'undefined') {
    window.AgentUtils = AgentUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}
