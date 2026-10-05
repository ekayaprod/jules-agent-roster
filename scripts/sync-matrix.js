const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const matrixJsonPath = path.join(rootDir, 'fusion_matrix.json');
const coreMatrixMdPath = path.join(rootDir, 'prompts', 'system', 'Core-Agents-Matrix.md');

async function syncMatrix() {
    const dataContent = await fs.promises.readFile(matrixJsonPath, 'utf8');
    const data = JSON.parse(dataContent);

    const mdContent = await fs.promises.readFile(coreMatrixMdPath, 'utf8');
    const lines = mdContent.split('\n');

    let tableStart = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('| Agent & Description |')) {
            tableStart = i;
            break;
        }
    }

    const headers = lines[tableStart].split('|').slice(2, -1).map(h => h.trim());
    const newLines = lines.slice(0, tableStart + 2);

    const getFusion = (a, b) => {
        return data[`${a},${b}`] || data[`${b},${a}`] || "";
    };

    const emojiDict = {};
    const regex = /^(.*?)(?:\s+([^\w\s-.]+))?$/;

    for (let i = tableStart + 2; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('| **')) {
            const parts = line.split('|');
            for (let j = 1; j < parts.length; j++) {
                const val = parts[j].trim();
                // strip out markdown bold
                const match = regex.exec(val.replace(/\*\*/g, ''));
                if (match) {
                    const name = match[1].trim();
                    let emoji = "";
                    if (match[2]) {
                        emoji = match[2].trim();
                    } else {
                         const rawEmojiMatch = val.match(/(?:\s+([^\w\s-.]+))$/);
                         if (rawEmojiMatch) {
                              emoji = rawEmojiMatch[1].trim();
                         }
                    }
                    if (name && emoji) {
                        emojiDict[name] = emoji;
                    }
                }
            }
        }
    }

    for (let i = tableStart + 2; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('| **')) {
            const parts = line.split('|');
            const rowAgentCell = parts[1].trim();
            const rowAgent = rowAgentCell.split('**')[1].trim();

            const newParts = [parts[0], ` ${rowAgentCell} `];

            for (let colIdx = 0; colIdx < headers.length; colIdx++) {
                const colAgent = headers[colIdx];
                let expected = getFusion(rowAgent, colAgent);

                if (expected) {
                    const emoji = emojiDict[expected] || "";
                    if (emoji) {
                        newParts.push(` ${expected} ${emoji} `);
                    } else {
                        newParts.push(` ${expected} `);
                    }
                } else {
                    newParts.push(" ");
                }
            }
            newParts.push("");
            newLines.push(newParts.join('|'));
        } else {
            newLines.push(line);
        }
    }

    await fs.promises.writeFile(coreMatrixMdPath, newLines.join('\n'));
}

module.exports = { syncMatrix };

if (require.main === module) {
    syncMatrix().catch(console.error);
}
