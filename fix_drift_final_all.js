const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    let lines = content.split('\n');
    let inCodeBlock = false;
    let inFrontmatter = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (i === 0 && line.trim() === '---') {
            inFrontmatter = true;
            continue;
        }
        if (inFrontmatter && line.trim() === '---') {
            inFrontmatter = false;
            continue;
        }
        if (inFrontmatter) {
            continue;
        }

        if (line.trim().startsWith('~~~') || line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (!inCodeBlock) {
            // Check bullets missing space (e.g., `*Text` or `-Text`)
            // Be VERY aggressive about finding bullets at start of line
            // Prevent matching `**` or `---`
            if (/^(\s*[\*\-])([a-zA-Z0-9🌀🧩⚙️🎯✅🎁🔍♾️🛡️🔨💡🧬🎨⚡️⚖️🚀🩺🔬])/.test(line)) {
                // Check if it's NOT a `**` or `---`
                if (!line.trim().startsWith('**') && !line.trim().startsWith('---')) {
                    line = line.replace(/^(\s*[\*\-])([a-zA-Z0-9🌀🧩⚙️🎯✅🎁🔍♾️🛡️🔨💡🧬🎨⚡️⚖️🚀🩺🔬])/g, '$1 $2');
                }
            }

            // Check headers missing space
            if (/^(#{1,6})[^\s#]/.test(line)) {
                line = line.replace(/^(#{1,6})([^\s#])/g, '$1 $2');
            }

            // Check bold labels missing space (e.g., `**Label:**Value`)
            if (/\*\*[^\*]+:\*\*[^\s\n\`]/.test(line)) {
                 line = line.replace(/(\*\*[^\*]+:\*\*)([^\s\n\`])/g, '$1 $2');
            }

            lines[i] = line;
        }
    }

    content = lines.join('\n');

    // frontmatter empty lines
    let fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
        let cleanFm = fmMatch[1].split('\n').filter(line => line.trim() !== '').join('\n');
        content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${cleanFm}\n---`);
    }

    // Now let's handle the specific missing bullets for Target Matrix explicitly
    let targetMatrixMatch = content.match(/\*\*Target Matrix:\*\*\n([\s\S]*?)\n(?=2\. 🎯|\n###)/);
    if (targetMatrixMatch) {
        let replacement = targetMatrixMatch[1].split('\n').map(line => {
            // If the line starts with `**`, it means the bullet is completely missing
            if (line.match(/^\*\*[^\*]+:\*\*/)) {
                return `* ${line}`;
            }
            // If the line starts with `***`, it means the bullet is mashed against it
            if (line.match(/^\*\*\*[^\*]+:\*\*/)) {
                return line.replace(/^\*\*\*/, '* **');
            }
            return line;
        }).join('\n');
        content = content.replace(targetMatrixMatch[1], replacement);
    }

    // Check Heuristics too
    let heuristicsMatch = content.match(/\*\*Heuristic Verification:\*\*\n([\s\S]*?)\n(?=5\. 🎁|\n###)/);
    if (heuristicsMatch) {
        let replacement = heuristicsMatch[1].split('\n').map(line => {
            if (line.match(/^\*\*[^\*]+:\*\*/)) {
                return `* ${line}`;
            }
            if (line.match(/^\*\*\*[^\*]+:\*\*/)) {
                return line.replace(/^\*\*\*/, '* **');
            }
            return line;
        }).join('\n');
        content = content.replace(heuristicsMatch[1], replacement);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function processDirectory(directory) {
    let count = 0;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += processDirectory(fullPath);
        } else if (fullPath.endsWith('.md') && !fullPath.includes('Procedure') && !fullPath.includes('README')) {
            if (fullPath.startsWith('prompts/fusions') || (path.dirname(fullPath) === 'prompts')) {
                if (processFile(fullPath)) count++;
            }
        }
    }
    return count;
}

const count = processDirectory('prompts');
console.log(`Updated ${count} files`);
