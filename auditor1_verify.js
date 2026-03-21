const fs = require('fs');
const path = require('path');

const LEDGER_PATH = '.jules/v8_migration_ledger.json';
const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));

function getSection(content, headerStr) {
    const regex = new RegExp(`^### ${headerStr}\\s*$`, 'm');
    const match = content.match(regex);
    if (!match) return null;

    const startIndex = match.index + match[0].length;
    let nextHeaderIndex = content.indexOf("\n#", startIndex);
    if (nextHeaderIndex === -1) {
        nextHeaderIndex = content.length;
    }

    return content.substring(startIndex, nextHeaderIndex);
}

let passedCount = 0;
let failedCount = 0;

for (const [filepath, data] of Object.entries(ledger)) {
    const filename = path.basename(filepath);
    if (/^[A-I]/.test(filename) && data.status === "migration_complete") {
        const content = fs.readFileSync(filepath, 'utf-8');
        const errors = [];

        const headers_intact = /^### The Philosophy\s*$/m.test(content) &&
                               /^### Coding Standards\s*$/m.test(content) &&
                               /^### Favorite Optimizations\s*$/m.test(content) &&
                               /^### Avoids\s*$/m.test(content);

        if (!headers_intact) {
            errors.push("headers_intact is false");
        }

        const optSection = getSection(content, "Favorite Optimizations");
        let optimizations_count = 0;
        if (optSection) {
            const bulletMatch = optSection.match(/^[ \t]*(?:\*|-) /gm);
            optimizations_count = bulletMatch ? bulletMatch.length : 0;
        }

        const avoidsSection = getSection(content, "Avoids");
        let avoids_format_strict = true;
        if (avoidsSection) {
            const bulletLines = avoidsSection.split('\n').filter(line => /^[ \t]*(?:\*|-) /.test(line));
            for (const line of bulletLines) {
                if (!line.includes('❌ **Scenario:**') || !line.includes('-> **Rationale:**')) {
                    avoids_format_strict = false;
                    break;
                }
            }
        } else {
            avoids_format_strict = false;
        }

        if (!avoids_format_strict) {
            errors.push("avoids_format_strict is false");
        }

        const philSection = getSection(content, "The Philosophy");
        let has_enemy = false;
        if (philSection) {
            has_enemy = /enemy/i.test(philSection);
        }

        if (!has_enemy) {
            errors.push("has_enemy is false");
        }

        const v8_audit = {
            headers_intact,
            optimizations_count,
            avoids_format_strict,
            has_enemy,
            errors
        };

        data.v8_audit = v8_audit;

        if (errors.length === 0) {
            data.status = "audit_complete";
            passedCount++;
        } else {
            data.status = "audit_failed";
            failedCount++;
        }
    }
}

fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf-8');
console.log(`Audit Summary: Passed: ${passedCount}, Failed: ${failedCount}`);