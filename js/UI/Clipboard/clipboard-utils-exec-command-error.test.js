const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils line 44 error path', () => {
    let originalClipboard;
    let originalExecCommand;
    let originalWindowTelemetryUtils;
    let originalGlobalTelemetryUtils;

    beforeEach(() => {
        originalClipboard = global.navigator.clipboard;
        originalExecCommand = document.execCommand;
        originalWindowTelemetryUtils = window.TelemetryUtils;
        originalGlobalTelemetryUtils = global.TelemetryUtils;

        window.TelemetryUtils = { dispatchEvent: jest.fn() };
        global.TelemetryUtils = window.TelemetryUtils;

        if (!global.navigator) {
             global.navigator = {};
        }

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

    it('should catch error on line 44 if execCommand throws', async () => {
        delete global.navigator.clipboard; // Force fallback
        const mockError = new Error('execCommand line 44 error');
        document.execCommand.mockImplementation(() => {
            throw mockError;
        });
        const removeChildSpy = jest.spyOn(document.body, 'removeChild');

        const result = await ClipboardUtils.copyText('test text');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("CLIPBOARD_FALLBACK_FAILED", mockError);
        expect(result).toBe(false);
        expect(removeChildSpy).toHaveBeenCalledTimes(1);
        expect(removeChildSpy).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));

        removeChildSpy.mockRestore();
    });
});
