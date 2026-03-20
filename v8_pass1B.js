const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'prompts/fusions/');
const skippedLogPath = path.join(__dirname, 'pass1B_skipped.txt');

const verifyReplacement = `Acknowledge that the platform natively runs test suites and linters. Rely on your native Critique -> Fix loop, but you MUST strictly halt and revert all changes after 3 failed verification attempts. Provide Environment Fallback to static analysis if native tools are missing.`;

const presentReplacement = `Generate a PR. When the platform generates the PR, format the description exactly like this:
* 🎯 **What:** [Literal description of modifications]
* 📊 **Scope:** [Exact architectural boundaries affected]
* ✨ **Result:** [Thematic explanation of the value added]
* ✅ **Verification:** [How safety was proven]`;

const files = fs.readdirSync(directoryPath);

let skippedFiles = [];

files.forEach(file => {
    if (!file.endsWith('.md')) return;

    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');

    let verifyStartIndex = -1;
    let presentStartIndex = -1;

    const verifyRegex = /^(?:\d+\.\s*)?(?:✅\s*)?\**VERIFY\**:?/;
    const presentRegex = /^(?:\d+\.\s*)?(?:🎁\s*)?\**PRESENT\**:?/;
    const sectionEndRegex = /^(?:##\s+|###\s+|[A-Z\s\-]+'S\s+FAVORITE\s+OPTIMIZATIONS:)/;

    for (let i = 0; i < lines.length; i++) {
        if (verifyStartIndex === -1 && verifyRegex.test(lines[i])) {
            verifyStartIndex = i;
        }
        if (presentStartIndex === -1 && presentRegex.test(lines[i])) {
            presentStartIndex = i;
        }
    }

    if (verifyStartIndex === -1 || presentStartIndex === -1) {
        skippedFiles.push(file);
        return;
    }

    let newLines = [];
    let inVerifyBlock = false;
    let inPresentBlock = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (i === verifyStartIndex) {
            inVerifyBlock = true;
            // Extract the prefix, matching up to the end of any asterisks or colons
            let m = line.match(/^((?:\d+\.\s*)?(?:✅\s*)?\**VERIFY\**\s*:?\**)/);
            if (m) {
                // Remove trailing space from prefix if any, then append replacement
                newLines.push(`${m[1].trim()} ${verifyReplacement}`);
            } else {
                newLines.push(line);
            }
            continue;
        }

        if (inVerifyBlock) {
            if (i === presentStartIndex) {
                inVerifyBlock = false;
            } else {
                continue; // Skip lines in verify block
            }
        }

        if (i === presentStartIndex) {
            inPresentBlock = true;
            let m = line.match(/^((?:\d+\.\s*)?(?:🎁\s*)?\**PRESENT\**\s*:?\**)/);
            if (m) {
                newLines.push(`${m[1].trim()}\n${presentReplacement}`);
            } else {
                newLines.push(line);
            }
            continue;
        }

        if (inPresentBlock) {
            if (sectionEndRegex.test(line)) {
                inPresentBlock = false;
                if (newLines[newLines.length - 1] !== '') {
                    newLines.push('');
                }
                newLines.push(line);
            } else {
                continue; // Skip lines in present block
            }
        } else {
            newLines.push(line);
        }
    }

    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
});

if (skippedFiles.length > 0) {
    fs.writeFileSync(skippedLogPath, skippedFiles.join('\n') + '\n', 'utf8');
}
