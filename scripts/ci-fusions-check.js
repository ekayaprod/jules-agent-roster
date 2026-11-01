const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkFile(filePath) {
    let errors = [];
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. BoardClerk.md
    if (!content.includes('**Task Board Resolution:** Read `.jules/agent_tasks.md` and permanently delete genuinely completed tasks matching your domain.')) {
        errors.push("BoardClerk: Missing or malformed 'Task Board Resolution' string.");
    }

    // 2. Enforcer.md
    if (!content.includes('No-Interaction Policy') || (!content.includes('FORBIDDEN from using the `request_user_input`') && !content.includes('forbidding the `request_user_input`'))) {
        errors.push("Enforcer: Missing 'No-Interaction Policy' in Strict Operational Rules.");
    }

    // 3. TestClerk.md
    if (!content.includes('**Testing Doctrine:**')) {
        errors.push("TestClerk: Missing 'Testing Doctrine' string.");
    }

    // 4. MatrixClerk.md
    const tmMatch = content.match(/\*\*Target Matrix:\*\*\n([\s\S]*?)(?:\n\d\.|$)/);
    if (tmMatch) {
        const tmItems = tmMatch[1].trim().split('\n').filter(l => l.trim().startsWith('*'));
        tmItems.forEach(item => {
            if (item.match(/\*\*.*:\*\*/)) {
                errors.push(`MatrixClerk: Invalid Target Matrix format (colon inside bold tag): ${item}`);
            }
        });
    }

    // 5. LabelStripper.md & 6. Linter.md
    const philMatch = content.match(/### The Philosophy\n([\s\S]*?)(?:###|$)/);
    if (philMatch) {
        const bullets = philMatch[1].trim().split('\n').filter(l => l.trim().startsWith('*'));
        if (bullets.length < 3) {
            errors.push(`Linter: Philosophy section has ${bullets.length} bullets, expected at least 3.`);
        }
        bullets.forEach(b => {
            if (b.match(/\*\s+(?:[^\s]+\s+)?\*\*.*?\*\*/)) {
                errors.push(`LabelStripper: Prohibited bold label in Philosophy bullet: ${b}`);
            }
        });
    } else {
        errors.push("Linter: Missing '### The Philosophy' section.");
    }

    const optMatch = content.match(/### Favorite Optimizations\n([\s\S]*?)(?:###|$)/);
    if (optMatch) {
        const bullets = optMatch[1].trim().split('\n').filter(l => l.trim().startsWith('*'));
        if (bullets.length < 3) {
            errors.push(`Linter: Favorite Optimizations section has ${bullets.length} bullets, expected at least 3.`);
        }
        bullets.forEach(b => {
            if (b.match(/\*\s+(?:[^\s]+\s+)?\*\*.*?\*\*/)) {
                errors.push(`LabelStripper: Prohibited bold label in Favorite Optimizations bullet: ${b}`);
            }
        });
    } else {
        errors.push("Linter: Missing '### Favorite Optimizations' section.");
    }

    // 7. Echo.md
    const emojiMatch = content.match(/emoji:\s*([^\s]+)/);
    if (emojiMatch) {
        const headerEmoji = emojiMatch[1];
        if (philMatch) {
            const bullets = philMatch[1].trim().split('\n').filter(l => l.trim().startsWith('*'));
            bullets.forEach(b => {
                const bulletEmojiMatch = b.match(/\*\s+([^\s]+)/);
                if (bulletEmojiMatch && bulletEmojiMatch[1] !== headerEmoji) {
                    errors.push(`Echo: Philosophy bullet emoji '${bulletEmojiMatch[1]}' does not match header emoji '${headerEmoji}': ${b}`);
                }
            });
        }
        if (optMatch) {
            const bullets = optMatch[1].trim().split('\n').filter(l => l.trim().startsWith('*'));
            bullets.forEach(b => {
                const bulletEmojiMatch = b.match(/\*\s+([^\s]+)/);
                if (bulletEmojiMatch && bulletEmojiMatch[1] !== headerEmoji) {
                    errors.push(`Echo: Favorite Optimizations bullet emoji '${bulletEmojiMatch[1]}' does not match header emoji '${headerEmoji}': ${b}`);
                }
            });
        }
    }

    return errors;
}

function main() {
    let filesToCheck = [];
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
        // Find changed fusions in the current PR
        try {
            // Using git diff --name-only with a fallback to branch comparison
            const baseRef = process.env.GITHUB_BASE_REF || 'main';
            let diffOutput;
            try {
                diffOutput = execSync(`git diff --name-only origin/${baseRef}...HEAD`).toString();
            } catch (e) {
                // If origin/main doesn't exist, try comparing to just HEAD for the current commit
                console.log("Could not diff against origin/main, diffing HEAD~1...");
                diffOutput = execSync(`git diff --name-only HEAD~1 HEAD`).toString();
            }
            filesToCheck = diffOutput.split('\n').filter(f => f.startsWith('prompts/fusions/') && f.endsWith('.md') && fs.existsSync(f));
        } catch (e) {
            console.log('Error getting git diff:', e.message);
            filesToCheck = [];
        }
    } else if (process.env.TEST_ALL_FUSIONS === 'true') {
        const fusionsDir = path.join(__dirname, '../prompts/fusions');
        filesToCheck = fs.readdirSync(fusionsDir)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join('prompts/fusions', f));
    }

    if (filesToCheck.length === 0) {
        console.log("No fusion agents to check. Skipping.");
        process.exit(0);
    }

    let allErrors = 0;
    filesToCheck.forEach(file => {
        console.log(`Checking ${file}...`);
        const errors = checkFile(file);
        if (errors.length > 0) {
            console.error(`❌ Errors in ${file}:`);
            errors.forEach(e => console.error(`  - ${e}`));
            allErrors += errors.length;
        } else {
            console.log(`✅ ${file} passed all micro agent checks.`);
        }
    });

    if (allErrors > 0) {
        console.error(`\nTotal structural errors found: ${allErrors}`);
        process.exit(1);
    }
}

main();
