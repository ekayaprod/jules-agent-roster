const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils API fail catch block missing coverage', () => {
    it('covers missing TelemetryUtils completely in catch blocks', async () => {
        const originalClipboard = global.navigator.clipboard;
        global.navigator.clipboard = {
            writeText: jest.fn().mockRejectedValue(new Error('api err'))
        };
        const originalExecCommand = document.execCommand;
        document.execCommand = jest.fn().mockImplementation(() => {
            throw new Error('exec err');
        });

        // Set TelemetryUtils to null globally to hit the `if (tu)` false branch
        // The spy will mock the internal method to return null, simulating the env without TelemetryUtils
        const getTelemetrySpy = jest.spyOn(ClipboardUtils, '_getTelemetryUtils').mockReturnValue(null);

        await ClipboardUtils.copyText('test');

        expect(getTelemetrySpy).toHaveBeenCalledTimes(2);

        global.navigator.clipboard = originalClipboard;
        document.execCommand = originalExecCommand;
        getTelemetrySpy.mockRestore();
    });
});
