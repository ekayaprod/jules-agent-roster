describe('GithubAPI window attachment', () => {
    it('attaches to window when module is undefined', () => {
        const vm = require('vm');
        const fs = require('fs');
        const path = require('path');

        const code = fs.readFileSync(path.join(__dirname, 'GithubAPI.js'), 'utf8');

        const sandbox = {
            window: {},
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            console: console,
            URL: URL
        };

        vm.createContext(sandbox);

        const wrapper = `
            var module = { exports: undefined };
            var originalModule = module;
            module = undefined;
            ${code}
            module = originalModule;
        `;

        vm.runInContext(wrapper, sandbox);

        expect(sandbox.window.GithubAPI).toBeDefined();
        expect(sandbox.window.GithubAPI.name).toBe('GithubAPI');
    });
});
