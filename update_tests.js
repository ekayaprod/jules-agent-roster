const fs = require('fs');

const testFile = 'js/Features/Jules/JulesManager/JulesManager.test.js';
let content = fs.readFileSync(testFile, 'utf8');

// Replace the previous telemetry expect
content = content.replace(
    'expect(dispatchSpy).toHaveBeenCalledWith("JULES_LAUNCH_SESSION_FAILED", expect.any(Error), { sourceName: \'sources/github/a/b\' });',
    'expect(dispatchSpy).toHaveBeenCalledWith("JULES_LAUNCH_SESSION_FAILED", expect.any(Error), { sourceName: \'sources/github/a/b\' });'
);
content = content.replace(
    'expect(consoleSpy).toHaveBeenCalledWith("Failed to launch session for repository sources/github/a/b", expect.any(Error));',
    'expect(consoleSpy).toHaveBeenCalledWith("Failed to launch session for repository sources/github/a/b", expect.any(Error));\n            expect(consoleSpy.mock.calls[0][1].message).toContain("JulesSessionLaunchFailure");'
);

fs.writeFileSync(testFile, content);
console.log('Updated test');
