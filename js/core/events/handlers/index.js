// CommonJS export for Node environments (Jest)
const SearchEvents = require('./SearchEvents');
const TerminalEvents = require('./TerminalEvents');
const ExportEvents = require('./ExportEvents');
const GlobalEvents = require('./GlobalEvents');
const NavigationEvents = require('./NavigationEvents');

module.exports = {
    SearchEvents,
    TerminalEvents,
    ExportEvents,
    GlobalEvents,
    NavigationEvents
};
