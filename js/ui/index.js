/**
 * Barrel export for js/ui
 * Only exported for Node.js environments.
 */
if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    const AgentCard = require('./agent-card/AgentCard');
    const ClipboardUtils = require('./clipboard/ClipboardUtils');
    const ToastNotification = require('./toast/ToastNotification');

    module.exports = {
        AgentCard,
        ClipboardUtils,
        ToastNotification
    };
}
