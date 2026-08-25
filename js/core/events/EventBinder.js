/**
 * Acts as the centralized domain for binding and managing all DOM event listeners for the Roster UI.
 * Isolates event handling from rendering logic to ensure architectural separation of concerns.
 * * Historical Intent: Added via c568ccb1 (Apr 2026) to extract RosterApp DOM events into an EventBinder subdomain.
 */
class EventBinder {
    static bind(app) {
        if (typeof SearchEvents !== 'undefined') SearchEvents.bind(app);
        if (typeof NavigationEvents !== 'undefined') NavigationEvents.bind(app);
        if (typeof GlobalEvents !== 'undefined') GlobalEvents.bind(app);
        if (typeof TerminalEvents !== 'undefined') TerminalEvents.bind(app);
        if (typeof ExportEvents !== 'undefined') ExportEvents.bind(app);
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBinder;
}
