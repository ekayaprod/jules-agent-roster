global.JulesModals = class { constructor() {} setupConfigModal() {} setupLaunchModal() {} };
global.TerminalPolling = class { constructor() {} };
global.DOMUtils = { createEl: jest.fn(), getEl: jest.fn(), on: jest.fn(), setButtonState: jest.fn(), getTerminalSessionHTML: jest.fn().mockReturnValue('<div></div>') };
global.TOAST_TYPES = { ERROR: "error" };
global.MESSAGES = { NO_PROTOCOL_DATA: "No protocol data" };

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

    // 🕵️ VULNERABILITY INTERROGATION: Asserting the alibi breaks when telemetry dispatch throws within the catch block
    test('should throw an unhandled rejection when telemetry dispatch fails in _processSessionQueue catch block', async () => {
        const tuMock = {
            dispatchEvent: jest.fn().mockImplementation(() => {
                throw new Error("Telemetry dispatch catastrophic failure");
            })
        };
        JulesTerminal.getTelemetryUtils = jest.fn().mockReturnValue(tuMock);

        terminal.sessionQueue = [
            jest.fn().mockRejectedValue(new Error("Queue error"))
        ];

        // Mathematically prove that the queue processing explicitly fails to catch the nested telemetry error
        await expect(terminal._processSessionQueue()).rejects.toThrow("Telemetry dispatch catastrophic failure");
    });

    test('launchSession queue dispatch handlesSESSION_SYNC_TIMEOUT properly on fetch/render failure', async () => {
        const tuMock = { dispatchEvent: jest.fn() };
        JulesTerminal.getTelemetryUtils = jest.fn().mockReturnValue(tuMock);

        const mockAgent = { name: "TestAgent", prompt: "Test prompt", emoji: "🤖" };

        let originalText = "Select Repository";
        const picker = document.getElementById('julesRepoPicker');
        picker.innerHTML = `<option value="test-source">${originalText}</option>`;
        picker.value = "test-source";

        document.body.innerHTML += '<input id="julesTaskInput" value="Test task" />';

        // Simulate createSession succeeding
        window.julesAPI.createSession = jest.fn().mockResolvedValue(true);

        const mockError = new Error("Fetch Failed");
        terminal._fetchAndRenderSessions = jest.fn().mockRejectedValue(mockError);

        await terminal.launchSession(mockAgent);

        await Promise.resolve();
        await Promise.resolve();

        expect(tuMock.dispatchEvent).toHaveBeenCalledWith("SESSION_SYNC_TIMEOUT", mockError);
    });
});
