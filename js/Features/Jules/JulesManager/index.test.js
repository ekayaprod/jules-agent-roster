describe('JulesManager Barrel File', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should export JulesManager via require when in Node context', () => {
        // In Jest/Node environment, require is defined.
        const JulesManagerIndex = require('./index');
        const JulesManagerClass = require('./JulesManager');
        expect(JulesManagerIndex).toBe(JulesManagerClass);
    });

    it('should correctly resolve to window.JulesManager when require is missing', () => {
        const fs = require('fs');
        const path = require('path');
        const barrelPath = path.join(__dirname, 'index.js');
        const barrelCode = fs.readFileSync(barrelPath, 'utf8');

        // Note: index.js defines JulesManager using const if require exists,
        // but if we evaluate it in a context where require is undefined,
        // it uses window.JulesManager.

        const mockWindow = { JulesManager: { isMock: true } };
        const mockModule = { exports: {} };

        // Wrap in a function that provides its own scope
        const wrapper = new Function('window', 'module', 'require', barrelCode + '\nreturn module.exports;');

        const result = wrapper(mockWindow, mockModule, undefined);
        expect(result).toBe(mockWindow.JulesManager);
    });
});
