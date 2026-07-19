const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('TelemetryUtils final boundaries', () => {
    it('covers global missing entirely', () => {
        const code = fs.readFileSync(path.join(__dirname, 'telemetry-utils.js'), 'utf8');
        const sandbox = { module: { exports: {} } };
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);
        expect(sandbox.module.exports).toBeDefined();
    });
});
