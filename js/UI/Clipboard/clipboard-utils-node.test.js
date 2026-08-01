/**
 * @jest-environment node
 */
const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils API fail catch block missing coverage in Node', () => {

    it('covers typeof window === "undefined" and typeof global !== "undefined"', async () => {
        global.navigator = {
            clipboard: {
                writeText: jest.fn().mockRejectedValue(new Error('api err'))
            }
        };
        global.document = {
            createElement: jest.fn().mockReturnValue({
                classList: { add: jest.fn() },
                select: jest.fn()
            }),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            execCommand: jest.fn().mockImplementation(() => { throw new Error('exec err'); })
        };
        global.TelemetryUtils = { dispatchEvent: jest.fn() };

        await ClipboardUtils.copyText('test text');

        expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledTimes(2);

        delete global.navigator;
        delete global.document;
        delete global.TelemetryUtils;
    });

    it('covers missing TelemetryUtils completely in catch blocks', async () => {
        global.navigator = {
            clipboard: {
                writeText: jest.fn().mockRejectedValue(new Error('api err'))
            }
        };
        global.document = {
            createElement: jest.fn().mockReturnValue({
                classList: { add: jest.fn() },
                select: jest.fn()
            }),
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            execCommand: jest.fn().mockImplementation(() => { throw new Error('exec err'); })
        };

        // This time no global.TelemetryUtils is set
        await ClipboardUtils.copyText('test text');

        delete global.navigator;
        delete global.document;
    });

    it('covers missing global fallback if global TelemetryUtils is null', () => {
        // Just directly test _getTelemetryUtils instead of trying to setup the world
        // Since we are in a node environment, window is undefined.
        // We can mock global.TelemetryUtils to test its branches.
        const originalGlobal = global.TelemetryUtils;

        global.TelemetryUtils = undefined;
        expect(ClipboardUtils._getTelemetryUtils()).toBe(undefined);

        global.TelemetryUtils = { test: true };
        expect(ClipboardUtils._getTelemetryUtils()).toEqual({ test: true });

        global.TelemetryUtils = originalGlobal;
    });
});
