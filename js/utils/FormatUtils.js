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
     * Escapes special HTML characters to prevent XSS.
     * @param {string} unsafe - The unsafe string to escape.
     * @returns {string} The escaped, safe string.
     */
    static escapeHTML(unsafe) {
        if (!unsafe || typeof unsafe !== 'string') return unsafe || "";
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
