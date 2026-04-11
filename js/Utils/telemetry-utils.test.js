const TelemetryUtils = require('./telemetry-utils');
const fs = require('fs');
const path = require('path');

describe('TelemetryUtils boundary and coverage logic', () => {
    let originalConsoleError;
    const code = fs.readFileSync(path.join(__dirname, 'telemetry-utils.js'), 'utf8');

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('formats error properly from Error object', () => {
        TelemetryUtils.dispatchEvent('TEST_EVENT', new Error('Message'), { extra: 1 });
        expect(console.error).toHaveBeenCalledWith(JSON.stringify({
            event: 'TEST_EVENT',
            error: 'Message',
            extra: 1
        }));
    });

    it('formats error properly from string', () => {
        TelemetryUtils.dispatchEvent('TEST_EVENT', 'String error', { extra: 1 });
        expect(console.error).toHaveBeenCalledWith(JSON.stringify({
            event: 'TEST_EVENT',
            error: 'String error',
            extra: 1
        }));
    });

    it('exports to module.exports and global when both available', () => {
        const mockModule = {};
        const mockGlobal = {};
        mockModule.exports = {};
        const testCode = new Function('module', 'global', 'window', code);
        testCode(mockModule, mockGlobal, undefined);
        expect(mockModule.exports).toBeDefined();
        expect(mockGlobal.TelemetryUtils).toBeDefined();
    });

    it('exports only to module.exports when global is undefined', () => {
        const mockModule = { exports: {} };
        const testCode = new Function('module', 'global', 'window', code);
        testCode(mockModule, undefined, undefined);
        expect(mockModule.exports).toBeDefined();
    });

    it('exports to window when module is undefined but window is present', () => {
        const mockWindow = {};
        const testCode = new Function('module', 'global', 'window', code);
        testCode(undefined, undefined, mockWindow);
        expect(mockWindow.TelemetryUtils).toBeDefined();
    });

    it('attaches to window when module exists but module.exports is falsy', () => {
        const mockWindow = {};
        const mockModule = { exports: false };
        const testCode = new Function('module', 'global', 'window', code);
        testCode(mockModule, undefined, mockWindow);
        expect(mockWindow.TelemetryUtils).toBeDefined();
    });

    it('handles environment where everything is missing without throwing', () => {
        const testCode = new Function('module', 'global', 'window', code);
        expect(() => {
            testCode(undefined, undefined, undefined);
        }).not.toThrow();
    });

    it('evaluates window attachment when typeof module is string', () => {
        const mockWindow = {};
        const testCode = new Function('module', 'global', 'window', code);
        // By passing a string, `typeof module !== 'undefined'` is true, but `module.exports` will be undefined.
        // This simulates a weird environment and should fall back to `window.TelemetryUtils`
        testCode("string-module", undefined, mockWindow);
        expect(mockWindow.TelemetryUtils).toBeDefined();
    });

    it('handles simulated browser context execution securely (100% coverage map)', () => {
        // 🕵️ The exact test scenario to hit the "else if (typeof window !== 'undefined')" branch
        const windowContext = { TelemetryUtils: undefined };
        // We inject module as undefined strictly via the Function constructor arguments!
        const executor = new Function('window', 'module', code);
        executor(windowContext, undefined);
        expect(windowContext.TelemetryUtils).toBeDefined();
        expect(typeof windowContext.TelemetryUtils.dispatchEvent).toBe('function');
    });
});

describe('TelemetryUtils isolated coverage', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.join(__dirname, 'telemetry-utils.js'), 'utf8');

    it('attaches to window when module does not exist', () => {
        const executor = new Function('window', code);
        const windowMock = {};
        executor(windowMock);
        expect(windowMock.TelemetryUtils).toBeDefined();
    });
});

    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/telemetry-utils.js', 'utf8');

        // Assert exports assign successfully in Node-like environment with global
        let isExported = false;
        let moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        let globalMock = {};
        expect(() => {
            new Function('module', 'global', code)(moduleMock, globalMock);
        }).not.toThrow();
        expect(isExported).toBe(true);
        expect(globalMock.TelemetryUtils).toBeDefined();

        // Assert exports assign successfully in Node-like environment without global
        isExported = false;
        moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        expect(() => {
            new Function('module', 'global', code)(moduleMock, undefined);
        }).not.toThrow();
        expect(isExported).toBe(true);

        // Assert safe bypass when module lacks exports property
        expect(() => {
            new Function('module', code)({});
        }).not.toThrow();

        // Assert safe bypass when module is strictly undefined and window is present (browser-like)
        let windowMock = {};
        expect(() => {
            new Function('module', 'window', code)(undefined, windowMock);
        }).not.toThrow();
        expect(windowMock.TelemetryUtils).toBeDefined();

        // Assert safe bypass when module is undefined and window is undefined
        expect(() => {
            new Function('module', 'window', code)(undefined, undefined);
        }).not.toThrow();
    });
