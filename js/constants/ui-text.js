const UI_TEXT = {
    BUTTONS: {
        COPY_ALL: "Copy All Prompts",
        DOWNLOAD_ALL: "Download All Prompts",
        DOWNLOAD_CUSTOM: "Download Custom Agents",
        COPY_PROMPT: "Copy Prompt",
        SHOW_PROMPT: "Show Prompt",
        HIDE_PROMPT: "Hide Prompt",
        CLEAR_SEARCH: "Clear Search",
        IGNITE_FUSION: "Ignite Fusion Protocol",
        IGNITING_FUSION: "Igniting Protocol...",
        SELECT_AGENT_A: "Select Agent A",
        SELECT_AGENT_B: "Select Agent B"
    },
    EMPTY_STATES: {
        NO_AGENTS: "No Agents Found",
        NO_AGENTS_DESC: "We couldn't locate any agents matching your search. Try using a broader keyword or clear your filters.",
        NO_FUSIONS: "No Fusion Protocols Found",
        NO_FUSIONS_DESC: "We couldn't locate any agents matching your search. Try a broader term."
    },
    MESSAGES: {
        NO_JS: "It looks like JavaScript is disabled. Please enable it to use the Agent Roster."
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI_TEXT;
}
