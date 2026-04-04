const AgentUtils = typeof require !== 'undefined' ? require('./agent-utils.js') : window.AgentUtils;
const DOMUtils = typeof require !== 'undefined' ? require('./dom-utils.js') : window.DOMUtils;
const DownloadUtils =
  typeof require !== 'undefined' ? require('./download-utils.js') : window.DownloadUtils;
const FormatUtils =
  typeof require !== 'undefined' ? require('./format-utils.js') : window.FormatUtils;
const PerformanceUtils =
  typeof require !== 'undefined' ? require('./performance-utils.js') : window.PerformanceUtils;
const PromptParser =
  typeof require !== 'undefined' ? require('./prompt-parser.js') : window.PromptParser;
const StorageUtils =
  typeof require !== 'undefined' ? require('./storage-utils.js') : window.StorageUtils;
const NetworkUtils =
  typeof require !== 'undefined' ? require('./network-utils.js') : window.NetworkUtils;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AgentUtils,
    DOMUtils,
    DownloadUtils,
    FormatUtils,
    PerformanceUtils,
    PromptParser,
    StorageUtils,
    NetworkUtils,
  };
}
