const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Architecture Standard: Safe JSON Parsing', () => {
    it('ensures all modified business logic files use safe JSON parsing wrappers instead of raw JSON.parse', () => {
        let changedFiles = [];
        try {
            // Get files changed in the current PR compared to main
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
            if (file.endsWith('.test.js') || file.endsWith('.spec.js') || file.endsWith('.bench.js')) {
                continue;
            }
            // Exclude the utility files that implement the safe JSON wrappers
            if (file.includes('network-utils.js') || file.includes('storage-utils.js')) {
                continue;
            }

            const fullPath = path.resolve(process.cwd(), file);
            if (!fs.existsSync(fullPath)) continue;

            const content = fs.readFileSync(fullPath, 'utf8');

            // Look for raw JSON.parse usage
            if (/\bJSON\.parse\s*\(/.test(content)) {
                violatingFiles.push(file);
            }
        }

        if (violatingFiles.length > 0) {
            throw new Error(
                `[Greenlight] Raw JSON.parse() found in: ${violatingFiles.join(', ')}. ` +
                `Every business logic file must use safe json parsing wrapper to handle exceptions natively. Fix: replace JSON.parse with a safe wrapper that catches errors and logs to telemetry.`
            );
        }
    });
});
