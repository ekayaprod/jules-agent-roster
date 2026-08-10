/**
 * @jest-environment jsdom
 */
const TelemetryUtils = require('./telemetry-utils');

describe('TelemetryUtils edge cases', () => {
    let consoleErrorSpy;
    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('handles JSON stringification failure', () => {
        const circular = {};
        circular.self = circular;

        TelemetryUtils.dispatchEvent('TEST_EVENT', 'Test error', { circular });

        expect(consoleErrorSpy).toHaveBeenCalled();
        const callArgs = consoleErrorSpy.mock.calls[0][0];
        const parsed = JSON.parse(callArgs);
        expect(parsed.event).toBe('TEST_EVENT');
        expect(parsed.additionalContext).toBe('[Circular Reference]');
    });
});

describe('environment conditions', () => {
    it('does not assign to global/window if module is defined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/telemetry/telemetry-utils.js', 'utf8');

        let windowMock = {};
        let globalMock = {};
        let moduleMock = { exports: {} };
        new Function('module', 'window', 'global', code)(moduleMock, windowMock, globalMock);

        expect(windowMock.TelemetryUtils).toBeUndefined();
        expect(globalMock.TelemetryUtils).toBeDefined();
        expect(moduleMock.exports).toBeDefined();
    });

    it('assigns to window if module is undefined but window is defined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/telemetry/telemetry-utils.js', 'utf8');

        let windowMock = {};
        new Function('module', 'window', code)(undefined, windowMock);

        expect(windowMock.TelemetryUtils).toBeDefined();
    });
});

describe('window-only environment', () => {
    it('assigns to window if module is undefined and global is undefined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/telemetry/telemetry-utils.js', 'utf8');

        let windowMock = {};
        new Function('module', 'global', 'window', code)(undefined, undefined, windowMock);

        expect(windowMock.TelemetryUtils).toBeDefined();
    });
});

describe('no module and window environment', () => {
    it('does not crash if module and window are both undefined', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/telemetry/telemetry-utils.js', 'utf8');

        expect(() => {
            new Function('module', 'global', 'window', code)(undefined, undefined, undefined);
        }).not.toThrow();
    });
});
