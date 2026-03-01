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
}
