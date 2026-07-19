const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('TelemetryUtils final boundaries 2', () => {
    it('covers window attachment when module is undefined in pure browser context', () => {
        const code = fs.readFileSync(path.join(__dirname, 'telemetry-utils.js'), 'utf8');
        const sandbox = { window: {} };
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);
        expect(sandbox.window.TelemetryUtils).toBeDefined();
    });
});
