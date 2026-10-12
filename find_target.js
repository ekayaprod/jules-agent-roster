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

async function main() {
    await Promise.all(dirs.map(async (dir) => {
        let files;
        try {
            files = await fs.promises.readdir(dir);
        } catch (err) {
            return;
        }
        files = files.filter(f => f.endsWith('.md') && f !== 'README.md');

        await Promise.all(files.map(async (file) => {
            const filePath = path.join(dir, file);
            let content;
            try {
                content = await fs.promises.readFile(filePath, 'utf8');
            } catch (err) {
                return;
            }
            const match = content.match(/^forge_version:\s*(.+)$/m);
            let version = null;
            if (match) {
                version = match[1].trim();
                // Remove quotes if present
                version = version.replace(/^["'](.*)["']$/, '$1');
            }

            if (compareVersions(version, currentVersion) < 0) {
                // Not thread-safe if truly parallel without lock/mutex,
                // but since JS is single threaded event loop, we don't have true races
                // over these variables, however we should be careful with comparison logic
                if (oldestFile === null || compareVersions(version, oldestVersion) < 0) {
                    oldestFile = filePath;
                    oldestVersion = version;
                }
            }
        }));
    }));

    console.log("Oldest File:", oldestFile);
    console.log("Oldest Version:", oldestVersion);
}

main().catch(console.error);
