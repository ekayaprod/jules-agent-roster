/**
 * @jest-environment jsdom
 */

const JulesModals = require('./JulesModals');
const TerminalPolling = require('./TerminalPolling');
const JulesTerminal = require('./JulesTerminal');
const FormatUtils = require('../../Utils/format/format-utils.js');
const { BUTTON_STATES, TOAST_TYPES } = require('../../constants/ui');

global.JulesModals = JulesModals;
global.TerminalPolling = TerminalPolling;
global.JulesTerminal = JulesTerminal;
global.FormatUtils = FormatUtils;
global.BUTTON_STATES = BUTTON_STATES;
global.TOAST_TYPES = TOAST_TYPES;

global.TelemetryUtils = {
    dispatchEvent: jest.fn()
};

describe('JulesTerminal', () => {
    let manager;
    let mockApp;

    beforeEach(() => {
        mockApp = {
            toast: { show: jest.fn() },
            agents: [],
            customAgents: {}
        };

        document.body.innerHTML = `
            <select id="julesRepoPicker">
                <option value="">Original Text</option>
            </select>
            <div id="julesTerminal"></div>
            <input id="julesTaskInput" />
            <div id="julesRunnerPanel"></div>
        `;

        global.window.julesAPI = {
            getSources: jest.fn(),
            getSessions: jest.fn(),
            createSession: jest.fn(),
        };

        jest.clearAllMocks();

        manager = new JulesTerminal(mockApp);
    });

    it('should exist', () => {
        expect(manager).toBeDefined();
    });

    it('handles error in loadSources', async () => {
        const picker = document.getElementById("julesRepoPicker");
        const originalText = picker.options[0].textContent;
        const mockError = new Error("Test connection error");
        global.window.julesAPI.getSources.mockRejectedValueOnce(mockError);

        await manager.loadSources();

        expect(picker.innerHTML).toBe(`<option value="">${originalText}</option>`);
        expect(picker.disabled).toBe(false);
        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("SOURCES_LOAD_FAILED", mockError);
        expect(mockApp.toast.show).toHaveBeenCalledWith("Unable to connect to GitHub: Test connection error", true);
    });
});
