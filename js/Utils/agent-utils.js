/**
 * Utility class for common agent data operations.
 * Centralizes duplicate agent state access logic across the application.
 */
class AgentUtils {
    /**
     * Helper to retrieve a custom agent from a nested or flat dictionary.
     * @param {Object} customAgents - The map of custom agents.
     * @param {string} key - The agent key to look up.
     * @returns {Object|undefined} The agent object or undefined if not found.
     */
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}
