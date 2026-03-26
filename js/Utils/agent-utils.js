class AgentUtils {
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}