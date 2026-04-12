class AgentUtils {
    static getCustomAgent(customAgents, key) {
        if (!customAgents) return undefined;
        return customAgents[key];
    }

    static getFusionKey(nameA, nameB) {
        if (!nameA || !nameB) return "";
        return [nameA.trim(), nameB.trim()].sort().join(",");
    }

    static splitFusionKey(key) {
        if (!key) return [];
        const parts = key.split(",");
        for (let i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim();
        }
        return parts;
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

    static getPromptUrl(agent) {
        if (agent.promptFile) {
            return agent.promptFile;
        }
        if (agent.isCustom) {
            return `./prompts/fusions/${agent.name}.md`;
        }
        return `./prompts/${agent.name}.md`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentUtils;
}
