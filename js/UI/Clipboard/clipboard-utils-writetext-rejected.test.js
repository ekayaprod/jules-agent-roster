const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalExecCommand;
    let originalWindowTelemetryUtils;
    let originalGlobalTelemetryUtils;

    beforeEach(() => {
        if (!global.navigator) {
             global.navigator = {};
        }
        originalClipboard = global.navigator.clipboard;
        originalExecCommand = document.execCommand;
        originalWindowTelemetryUtils = window.TelemetryUtils;
        originalGlobalTelemetryUtils = global.TelemetryUtils;

        window.TelemetryUtils = { dispatchEvent: jest.fn() };
        global.TelemetryUtils = window.TelemetryUtils;

        global.navigator.clipboard = {
            writeText: jest.fn()
        };
        document.execCommand = jest.fn();
    });

    afterEach(() => {
        if(originalClipboard) {
            global.navigator.clipboard = originalClipboard;
        } else {
            delete global.navigator.clipboard;
        }

        document.execCommand = originalExecCommand;
        window.TelemetryUtils = originalWindowTelemetryUtils;
        global.TelemetryUtils = originalGlobalTelemetryUtils;
        jest.clearAllMocks();
    });

    it('should catch rejected promise from clipboard writeText and fallback to execCommand', async () => {
        const mockError = new Error('Clipboard rejected');
        global.navigator.clipboard.writeText.mockRejectedValue(mockError);
        document.execCommand.mockReturnValue(true);

        const result = await ClipboardUtils.copyText('test rejected promise');

        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test rejected promise');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_API_FAILED', mockError);
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(result).toBe(true);
    });
});
