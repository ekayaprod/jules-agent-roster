/**
 * Utility class for formatting text and strings.
 * Centralizes duplicate formatting logic across the application.
 */
class FormatUtils {
    /**
     * Formats an array of agents into a single string of prompts separated by a standard divider.
     * @param {Array<Object>} agents - The array of agent objects to format.
     * @returns {string} The combined and formatted prompt string.
     */
    static formatAgentPrompts(agents) {
        if (!Array.isArray(agents)) return "";
        return agents
            .map(
                (a) =>
                    `${a.prompt}\n\n--------------------------------------------------------------------------------`,
            )
            .join("\n\n");
    }

    /**
     * Escapes HTML special characters in a string to prevent XSS.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     */
    static escapeHTML(str) {
        if (!str || typeof str !== "string") return "";
        return str
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
     */
    static extractIcon(agent, fallback = '🤖') {
        if (!agent) return fallback;
        if (agent.icon) return agent.icon;

        const name = (agent.name || '').trim();
        if (!name) return fallback;

        const parts = name.split(" ");

        // 1. Check for emoji at the end (Custom Fusions)
        const lastPart = parts[parts.length - 1];
        if (lastPart && !/^[A-Za-z0-9\-\.]+$/.test(lastPart)) {
            return lastPart;
        }

        // 2. Check for emoji at the start (Standard Fusions like "⚡🧬 Bolt-Helix Fusion")
        const firstPart = parts[0];
        if (firstPart && !/^[A-Za-z0-9\-\.]+$/.test(firstPart)) {
            return firstPart;
        }

        return fallback;
    }

    /**
     * Extracts a clean display name from an agent by stripping icons.
     * @param {Object} agent - The agent object.
     * @returns {string} The display name without icons.
     */
    static extractDisplayName(agent) {
        if (!agent || !agent.name) return 'Unknown Protocol';

        const name = agent.name.trim();
        const parts = name.split(" ");
        if (parts.length <= 1) return name;

        // 1. Strip emoji from the end
        const lastPart = parts[parts.length - 1];
        if (lastPart && !/^[A-Za-z0-9\-\.]+$/.test(lastPart)) {
            return parts.slice(0, -1).join(" ").trim();
        }

        // 2. Strip emoji from the start
        const firstPart = parts[0];
        if (firstPart && !/^[A-Za-z0-9\-\.]+$/.test(firstPart)) {
            return parts.slice(1).join(" ").trim();
        }

        return name;
    }
}
