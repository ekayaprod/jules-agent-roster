// 🕯️ CHRONICLE: AST reasoning explains the logic; Git history explains the business intent.

/**
 * Acts as the centralized export registry for all utility modules, bridging CommonJS and browser environments.
 * * Historical Intent: Added via d840cd25 (May 2026) by ekayaprod to update update-orphans.js.
 */
const AgentUtils = typeof module !== 'undefined' && module.exports ? require('./agent-utils.js') : window.AgentUtils;
const DOMUtils = typeof module !== 'undefined' && module.exports ? require('./dom-utils.js') : window.DOMUtils;
const DownloadUtils = typeof module !== 'undefined' && module.exports ? require('./download-utils.js') : window.DownloadUtils;
const FormatUtils = typeof module !== 'undefined' && module.exports ? require('./format-utils.js') : window.FormatUtils;
const NetworkUtils = typeof module !== 'undefined' && module.exports ? require('./network-utils.js') : window.NetworkUtils;
const PerformanceUtils = typeof module !== 'undefined' && module.exports ? require('./performance-utils.js') : window.PerformanceUtils;
const PromptParser = typeof module !== 'undefined' && module.exports ? require('./prompt-parser.js') : window.PromptParser;
const StorageUtils = typeof module !== 'undefined' && module.exports ? require('./storage-utils.js') : window.StorageUtils;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AgentUtils,
        DOMUtils,
        DownloadUtils,
        FormatUtils,
        PerformanceUtils,
        PromptParser,
        StorageUtils,
        NetworkUtils
    };
}
