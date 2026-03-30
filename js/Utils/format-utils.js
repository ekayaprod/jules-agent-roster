/**
 * Utility class for formatting text and strings.
 * Centralizes duplicate formatting logic across the application.
 * @see ../../docs/architecture/Utils/README.md#formatutils-architecture
 */
class FormatUtils {
    static get MASTER_ROSTER_HEADER() {
        return "JULES MASTER AGENT ROSTER\n\n--------------------------------------------------------------------------------\n\n";
    }

    static get CUSTOM_ROSTER_HEADER() {
        return "JULES CUSTOM AGENT ROSTER (FUSIONS)\n\n--------------------------------------------------------------------------------\n\n";
    }

    /**
     * Formats an array of agents into a single string of prompts separated by a standard divider.
     * @param {Array<Object>} agents - The array of agent objects to format.
     * @returns {string} The combined and formatted prompt string.
     * @see ../../docs/architecture/Utils/README.md#formatutils-architecture
     */
    static formatAgentPrompts(agents) {
        if (!Array.isArray(agents)) return "";
        // ⚡ Bolt+: The String Builder Shift. Replaced O(N²) .reduce() string concatenation with O(N) .map().join() to prevent repetitive transient memory allocations.
        return agents.map(a => `${PromptParser.stripFrontmatter(a.prompt)}\n\n--------------------------------------------------------------------------------`).join("\n\n");
    }

    /**
     * Escapes HTML characters in a string to prevent XSS.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     * @see ../../docs/architecture/Utils/README.md#formatutils-architecture
     */
    static escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Extracts an icon from an agent, handling fallbacks for fusions.
     * @param {Object} agent - The agent object.
     * @param {string} fallback - Optional fallback icon.
     * @returns {string} The extracted icon or the fallback.
     * @see ../../docs/architecture/Utils/README.md#formatutils-architecture
     */
    static extractIcon(agent, fallback = '🤖') {
        if (!agent) return fallback;
        if (agent.emoji) return agent.emoji;

        return fallback;
    }

    /**
     * Extracts a clean display name from an agent by stripping icons.
     * @param {Object} agent - The agent object.
     * @returns {string} The display name without icons.
     * @see ../../docs/architecture/Utils/README.md#formatutils-architecture
     */
    static extractDisplayName(agent) {
        if (!agent || !agent.name) return 'Unknown Protocol';

        return agent.name.trim();
    }

    /**
     * Extracts a pure repository path from a standard source name.
     * @param {string} sourceName - The standard source string (e.g., 'sources/github/owner/repo')
     * @returns {string} The raw repository path (e.g., 'owner/repo').
     */
    static extractRepoPath(sourceName) {
        if (!sourceName) return "";
        return sourceName.replace('sources/github/', '');
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormatUtils;
}
