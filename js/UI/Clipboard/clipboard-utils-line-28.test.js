const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils API fail catch block missing coverage line 28', () => {
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

    it('should hit the catch block at line 28 when writeText throws a synchronous error', async () => {
        const syncError = new Error('Sync error for line 28');
        global.navigator.clipboard.writeText.mockImplementation(() => {
            throw syncError;
        });
        document.execCommand.mockReturnValue(true);

        const result = await ClipboardUtils.copyText('test text');

        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("CLIPBOARD_API_FAILED", syncError);
        expect(result).toBe(true);
    });

    it('should hit the catch block at line 28 when writeText returns a rejected promise', async () => {
        const asyncError = new Error('Async error for line 28');
        global.navigator.clipboard.writeText.mockRejectedValue(asyncError);
        document.execCommand.mockReturnValue(true);

        const result = await ClipboardUtils.copyText('test text');

        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("CLIPBOARD_API_FAILED", asyncError);
        expect(result).toBe(true);
    });
});
