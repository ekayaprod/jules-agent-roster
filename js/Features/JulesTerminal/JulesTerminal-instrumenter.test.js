global.JulesModals = class { constructor() {} setupConfigModal() {} setupLaunchModal() {} };
global.TerminalPolling = class { constructor() {} };
global.DOMUtils = { createEl: jest.fn(), getEl: jest.fn(), on: jest.fn(), setButtonState: jest.fn() };
global.TOAST_TYPES = { ERROR: "error" };

const JulesTerminal = require('./JulesTerminal.js');

describe('JulesTerminal - Instrumenter', () => {
    let terminal;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="julesTerminal" class="jules-terminal">
                <div class="terminal-content"></div>
                <div class="empty-terminal-message"></div>
                <button id="julesActivateToggle"></button>
            </div>
            <select id="julesRepoPicker"></select>
        `;
        window.julesAPI = {
            configure: jest.fn(),
            getSources: jest.fn().mockResolvedValue([{ name: "test-source", full_name: "test-source" }]),
            createSession: jest.fn(),
            getSessions: jest.fn()
        };
        terminal = new JulesTerminal({ toast: { show: jest.fn() }, eventBinder: { on: jest.fn() } });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test('loadSources catch block properly dispatches telemetry on error', async () => {
        const tuMock = { dispatchEvent: jest.fn() };
        JulesTerminal.getTelemetryUtils = jest.fn().mockReturnValue(tuMock);

        window.julesAPI.getSources = jest.fn().mockRejectedValue(new Error("Source Load Failed"));

        let originalText = "Select Repository";
        const picker = document.getElementById('julesRepoPicker');
        picker.innerHTML = `<option value="">${originalText}</option>`;
        picker.disabled = true;

        await terminal.loadSources();

        expect(tuMock.dispatchEvent).toHaveBeenCalledWith("SOURCES_LOAD_FAILED", expect.any(Error));
        expect(terminal.app.toast.show).toHaveBeenCalledWith("Unable to connect to GitHub: Source Load Failed", true);
        expect(picker.disabled).toBe(false);
    });

    test('queue execution catches errors and dispatches telemetry', async () => {
        const tuMock = { dispatchEvent: jest.fn() };
        JulesTerminal.getTelemetryUtils = jest.fn().mockReturnValue(tuMock);

        terminal.sessionQueue = [
            jest.fn().mockResolvedValue(true),
            jest.fn().mockRejectedValue(new Error("Queue error"))
        ];

        await terminal._processSessionQueue();

        expect(tuMock.dispatchEvent).toHaveBeenCalledWith("QUEUE_EXECUTION_ERROR", expect.any(Error));
    });
});
