/**
 * Barrel export for js/utils
 * Only exported for Node.js environments.
 */
if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    const DownloadUtils = require('./DownloadUtils');
    const FormatUtils = require('./FormatUtils');
    const PerformanceUtils = require('./PerformanceUtils');
    const PromptRenderer = require('./PromptRenderer');
    const StringUtils = require('./StringUtils');

    module.exports = {
        DownloadUtils,
        FormatUtils,
        PerformanceUtils,
        PromptRenderer,
        StringUtils
    };
}
