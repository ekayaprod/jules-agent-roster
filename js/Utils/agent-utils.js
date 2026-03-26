class AgentUtils {
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }

    static getValidCustomAgents(customAgents) {
        const validCustomAgents = [];
        for (const key in customAgents) {
            if (Object.prototype.hasOwnProperty.call(customAgents, key)) {
                const a = customAgents[key];
                if (a && a.prompt && a.prompt.length > 0) validCustomAgents.push(a);
            }
        }
        return validCustomAgents;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}