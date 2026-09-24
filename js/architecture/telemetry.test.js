const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Architecture Standard: Telemetry Logging', () => {
    it('ensures all modified business logic files use TelemetryUtils instead of unstructured console.error', () => {
        let changedFiles = [];
        try {
            // Get files changed in the current PR compared to main
            // If main doesn't exist locally in a CI environment, we might need a fallback.
            // Using HEAD~1 as a fallback for local testing if origin/main fails.
            try {
                const diffOutput = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf-8' });
                changedFiles = diffOutput.split('\n').filter(Boolean);
            } catch (e) {
                // Fallback to checking uncommitted changes or just HEAD~1
                const diffOutput = execSync('git diff --name-only HEAD~1', { encoding: 'utf-8' });
                changedFiles = diffOutput.split('\n').filter(Boolean);
            }
        } catch (e) {
            // If not in a git repo or something fails, skip safely
            return;
        }

        const violatingFiles = [];
        const jsFiles = changedFiles.filter(f => f.startsWith('js/') && f.endsWith('.js'));

        for (const file of jsFiles) {
            // Skip tests
            if (file.endsWith('.test.js') || file.endsWith('.spec.js')) {
                continue;
            }
            // Skip the telemetry utility itself
            if (file.includes('telemetry-utils.js')) {
                continue;
            }

            const fullPath = path.resolve(process.cwd(), file);
            if (!fs.existsSync(fullPath)) continue;

            const content = fs.readFileSync(fullPath, 'utf8');

            // Look for console.error usage (basic regex check)
            if (/\bconsole\.error\s*\(/.test(content)) {
                violatingFiles.push(file);
            }
        }

        if (violatingFiles.length > 0) {
            throw new Error(
                `[Greenlight] Unstructured console.error() found in: ${violatingFiles.join(', ')}. ` +
                `Every business logic file must use structured logging. Fix: replace console.error with TelemetryUtils.dispatchEvent(eventName, error, additionalContext).`
            );
        }
    });
});
