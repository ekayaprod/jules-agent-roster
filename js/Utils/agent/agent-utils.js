// 🕯️ CHRONICLE: AST reasoning explains the logic; Git history explains the business intent.

/**
 * Provides static utility methods for parsing, retrieving, and constructing paths for custom agents and their combined fusion variations.
 * * Historical Intent: Added via d840cd25 (May 2026) by ekayaprod to update update-orphans.js.
 */
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
        let idx = key.indexOf(',');
        if (idx === -1) {
            return [key.trim()];
        }
        let idx2 = key.indexOf(',', idx + 1);
        if (idx2 === -1) {
             return [
                 key.substring(0, idx).trim(),
                 key.substring(idx + 1).trim()
             ];
        }

        return key.split(",").map(p => p.trim());
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
        if (!agent) {
            return "";
        }
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
