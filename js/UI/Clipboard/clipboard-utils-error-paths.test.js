const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils API fail catch block missing coverage', () => {
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

        // Try to safely mock navigator.clipboard
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

    it('covers missing TelemetryUtils completely in api fail catch block', async () => {
        const mockApiError = new Error('api error');
        global.navigator.clipboard.writeText.mockRejectedValue(mockApiError);
        document.execCommand.mockReturnValue(true);

        const result = await ClipboardUtils.copyText('test text');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("CLIPBOARD_API_FAILED", mockApiError);
        expect(result).toBe(true);
    });

    it('covers missing TelemetryUtils completely in fallback catch block', async () => {
        delete global.navigator.clipboard;
        const mockFallbackError = new Error('execCommand failed');
        document.execCommand.mockImplementation(() => { throw mockFallbackError; });

        const result = await ClipboardUtils.copyText('test text');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("CLIPBOARD_FALLBACK_FAILED", mockFallbackError);
        expect(result).toBe(false);
    });
});
