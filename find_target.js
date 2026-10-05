const fs = require('fs');
const path = require('path');

const dirs = ['prompts/', 'prompts/fusions/', 'prompts/micro/'];
let oldestFile = null;
let oldestVersion = null; // null represents missing (oldest), else we compare semver-like strings

function parseVersion(v) {
    if (!v) return [0, 0];
    const match = v.match(/V?(\d+)\.(\d+)/);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2])];
    }
    return [0, 0];
}

function compareVersions(v1, v2) {
    // v1 and v2 are raw version strings or null
    if (v1 === null && v2 !== null) return -1;
    if (v2 === null && v1 !== null) return 1;
    if (v1 === null && v2 === null) return 0;

    const [maj1, min1] = parseVersion(v1);
    const [maj2, min2] = parseVersion(v2);
    if (maj1 !== maj2) return maj1 - maj2;
    return min1 - min2;
}

const currentVersion = "V88.4";

for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
        // Skip READMEs and system prompts if any are in these dirs
        if (file === 'README.md') continue;

        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^forge_version:\s*(.+)$/m);
        let version = null;
        if (match) {
            version = match[1].trim();
            // Remove quotes if present
            version = version.replace(/^["'](.*)["']$/, '$1');
        }

        if (compareVersions(version, currentVersion) < 0) {
            if (oldestFile === null || compareVersions(version, oldestVersion) < 0) {
                oldestFile = filePath;
                oldestVersion = version;
            }
        }
    }
}

console.log("Oldest File:", oldestFile);
console.log("Oldest Version:", oldestVersion);
