const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Architecture Standard: Test Colocation', () => {
    it('ensures all modified or new business logic files have a corresponding test suite', () => {
        let changedFiles = [];
        try {
            try {
                // Try to get changes relative to main
                const diffOutput = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf-8' });
                changedFiles = diffOutput.split('\n').filter(Boolean);
            } catch (e) {
                try {
                    // Fallback to currently staged/unstaged changes
                    const diffOutput = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });
                    const stagedOutput = execSync('git diff --name-only --cached', { encoding: 'utf-8' });
                    changedFiles = [
                        ...diffOutput.split('\n').filter(Boolean),
                        ...stagedOutput.split('\n').filter(Boolean)
                    ];
                } catch (fallbackE) {
                    // Just HEAD~1 if nothing else
                    const diffOutput = execSync('git diff --name-only HEAD~1', { encoding: 'utf-8' });
                    changedFiles = diffOutput.split('\n').filter(Boolean);
                }
            }
        } catch (e) {
            // Safely skip if not in a git repo
            return;
        }

        // Deduplicate
        changedFiles = [...new Set(changedFiles)];

        const missingTestFiles = [];
        const jsFiles = changedFiles.filter(f => f.startsWith('js/') && f.endsWith('.js'));

        for (const file of jsFiles) {
            // Skip tests
            if (file.endsWith('.test.js') || file.endsWith('.spec.js') || file.endsWith('.bench.js')) {
                continue;
            }

            // Allow root index files to not have tests in some edge cases, but let's strictly enforce unless it's a known exception
            if (file === 'js/index.js' || file.includes('constants/')) {
                 continue; // Constants and main entry point might not need direct tests
            }

            const fullPath = path.resolve(process.cwd(), file);
            if (!fs.existsSync(fullPath)) continue; // File was deleted

            // Determine expected test file name
            const parsed = path.parse(file);
            const expectedTestFile = path.join(parsed.dir, `${parsed.name}.test.js`);
            const fullExpectedTestPath = path.resolve(process.cwd(), expectedTestFile);

            if (!fs.existsSync(fullExpectedTestPath)) {
                missingTestFiles.push({ source: file, expectedTest: expectedTestFile });
            }
        }

        if (missingTestFiles.length > 0) {
            const errorMessages = missingTestFiles.map(m =>
                `[Greenlight] Missing test file for: ${m.source}. Every business logic file must have a corresponding test suite. Fix: create ${m.expectedTest} with a basic describe block.`
            );
            throw new Error(errorMessages.join('\n\n'));
        }
    });
});
