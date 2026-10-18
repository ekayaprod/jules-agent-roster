const fs = require('fs');
const path = require('path');
const { syncMatrix } = require('./sync-matrix');

// --- JULES KILLSWITCH ---
if (process.env.JULES_FORGE_MODE === 'true') {
    process.exit(0);
}
// ------------------------

const rootDir = path.resolve(__dirname, '..');
const fusionsDir = path.join(rootDir, 'prompts', 'fusions');
const orphansDir = path.join(rootDir, 'prompts', 'orphans');
const matrixPath = path.join(rootDir, 'fusion_matrix.json');
const orphansMdPath = path.join(orphansDir, 'orphans.md');

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

    // 2. Identify referenced agents
    const referencedAgents = new Set();

    for (const value of Object.values(matrix)) {
        if (value !== "") {
            referencedAgents.add(value);
        }
    }

    // Ensure orphans dir exists
    await fs.promises.mkdir(orphansDir, { recursive: true });

    // 3. Read fusions (asynchronous iteration for improved performance and lower memory footprint)
    const newlyOrphaned = [];
    const dir = await fs.promises.readdir(fusionsDir, { withFileTypes: true });

    // Implement concurrency limit to avoid EMFILE issues while speeding up file reads
    const concurrencyLimit = 50;
    const processDirent = async (dirent) => {
        if (!dirent.isFile()) return;
        const file = dirent.name;
        if (!file.endsWith('.md') || file === 'README.md') return;

        const filePath = path.join(fusionsDir, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const { attributes } = parseMarkdownFrontmatter(content);
        const name = attributes.name || file.replace('.md', '');

        if (!referencedAgents.has(name)) {
            newlyOrphaned.push({ file, filePath, name });
        }
    };

    for (let i = 0; i < dir.length; i += concurrencyLimit) {
        const batch = dir.slice(i, i + concurrencyLimit);
        await Promise.all(batch.map(processDirent));
    }

    // 4. Move orphaned files
    await Promise.all(newlyOrphaned.map(async (orphan) => {
        const destPath = path.join(orphansDir, orphan.file);
        await fs.promises.rename(orphan.filePath, destPath);
    }));

    // 5. Regenerate orphans.md
    const allOrphans = (await fs.promises.readdir(orphansDir)).filter(f => f.endsWith('.md') && f !== 'orphans.md');
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

    // 6. Sync Core Agents Matrix
    await syncMatrix();
}

updateOrphans().catch(console.error);
