const fs = require('fs');
const path = require('path');

// --- JULES KILLSWITCH ---
if (process.env.JULES_FORGE_MODE === 'true') {
    console.log("Jules Forge Mode active: Bypassing orphan tracking updates.");
    process.exit(0);
}
// ------------------------

const rootDir = path.resolve(__dirname, '..');
const fusionsDir = path.join(rootDir, 'prompts', 'fusions');
const orphansDir = path.join(rootDir, 'prompts', 'orphans');
const matrixPath = path.join(rootDir, 'fusion_matrix.json');
const orphansMdPath = path.join(orphansDir, 'orphans.md');
const emptySlotsMdPath = path.join(orphansDir, 'emptyslots.md');

function parseMarkdownFrontmatter(content) {
    const yamlRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = content.match(yamlRegex);
    if (!match) return { attributes: {}, body: content };

    const yamlStr = match[1];
    const attributes = {};
    yamlStr.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
            const key = line.slice(0, colonIdx).trim();
            const value = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            attributes[key] = value;
        }
    });

    return { attributes, body: content.slice(match[0].length) };
}

function extractFavoriteOptimizations(body) {
    const match = body.match(/### Favorite Optimizations([\s\S]*?)(?:## |$)/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return '';
}

async function updateOrphans() {
    // 1. Read matrix
    const matrixContent = await fs.promises.readFile(matrixPath, 'utf8');
    const matrix = JSON.parse(matrixContent);

    // 2. Identify referenced agents and empty slots
    const referencedAgents = new Set();
    const emptySlots = [];

    for (const [key, value] of Object.entries(matrix)) {
        if (value === "") {
            emptySlots.push(`- \`${key}\``);
        } else {
            referencedAgents.add(value);
        }
    }

    // Sort empty slots for deterministic output
    emptySlots.sort();

    // 3. Read fusions
    const fusions = (await fs.promises.readdir(fusionsDir)).filter(f => f.endsWith('.md') && f !== 'README.md');

    // Ensure orphans dir exists
    if (!fs.existsSync(orphansDir)) {
        await fs.promises.mkdir(orphansDir, { recursive: true });
    }

    const newlyOrphaned = (await Promise.all(
        fusions.map(async (file) => {
            const filePath = path.join(fusionsDir, file);
            const content = await fs.promises.readFile(filePath, 'utf8');
            const { attributes } = parseMarkdownFrontmatter(content);
            const name = attributes.name || file.replace('.md', '');
            if (!referencedAgents.has(name)) {
                return { file, filePath, name };
            }
            return null;
        })
    )).filter(Boolean);

    // 4. Move orphaned files
    await Promise.all(newlyOrphaned.map(async (orphan) => {
        const destPath = path.join(orphansDir, orphan.file);
        await fs.promises.rename(orphan.filePath, destPath);
        console.log(`Moved orphaned agent: ${orphan.name}`);
    }));

    // 5. Update emptyslots.md
    const emptySlotsContent = `# Empty Fusion Slots\n\nThis document tracks all fusion combinations from \`fusion_matrix.json\` that currently do not have an assigned agent (\`""\`).\n\n## How to update\n\nTo update this file, run a script that parses \`fusion_matrix.json\` for empty values and regenerates the list below. Do not edit this manually.\n\n## Missing Combinations\n\n${emptySlots.join('\n')}\n`;
    await fs.promises.writeFile(emptySlotsMdPath, emptySlotsContent);
    console.log(`Updated ${emptySlotsMdPath}`);

    // 6. Regenerate orphans.md
    const allOrphans = (await fs.promises.readdir(orphansDir)).filter(f => f.endsWith('.md') && f !== 'orphans.md' && f !== 'emptyslots.md');
    let orphansMdContent = '# Orphaned Agents\n\n';

    allOrphans.sort();

    const orphanContents = await Promise.all(allOrphans.map(async (file) => {
        const filePath = path.join(orphansDir, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const { attributes, body } = parseMarkdownFrontmatter(content);
        const name = attributes.name || file.replace('.md', '');
        const role = attributes.role || 'UNKNOWN';
        const category = attributes.category || 'UNKNOWN';
        const description = attributes.description || 'UNKNOWN';
        const optimizations = extractFavoriteOptimizations(body);

        let part = `## ${name}\n\n`;
        part += `- **Role:** ${role}\n`;
        part += `- **Category:** ${category}\n`;
        part += `- **Description:** ${description}\n\n`;

        if (optimizations) {
            part += `### Favorite Optimizations\n\n${optimizations}\n\n`;
        }
        return part;
    }));

    orphansMdContent += orphanContents.join('');

    await fs.promises.writeFile(orphansMdPath, orphansMdContent);
    console.log(`Updated ${orphansMdPath}`);
}

updateOrphans().catch(console.error);
