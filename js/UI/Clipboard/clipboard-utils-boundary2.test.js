const ClipboardUtils = require('./clipboard-utils');
describe('ClipboardUtils API fail telemetry', () => {
    it('covers missing TelemetryUtils for fallback', async () => {
        const originalClipboard = global.navigator.clipboard;
        global.navigator.clipboard = {
            writeText: jest.fn().mockRejectedValue(new Error('err'))
        };
        const backupWindow = window.TelemetryUtils;
        const backupGlobal = global.TelemetryUtils;

        window.TelemetryUtils = undefined;
        global.TelemetryUtils = { dispatchEvent: jest.fn() };

        document.execCommand = jest.fn().mockReturnValue(true);

        await ClipboardUtils.copyText('test');

        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalled();

        window.TelemetryUtils = backupWindow;
        global.TelemetryUtils = backupGlobal;
        global.navigator.clipboard = originalClipboard;
    });
});
