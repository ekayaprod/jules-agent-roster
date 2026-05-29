const fs = require('fs');
const path = require('path');

// --- JULES KILLSWITCH ---
if (process.env.JULES_FORGE_MODE === 'true') {
    console.log("Jules Forge Mode active: Bypassing roster-payload.json generation.");
    process.exit(0);
}
// ------------------------

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

async function processDirectory(dirPath, isCustom, targetFolder) {
    if (!fs.existsSync(dirPath)) return [];

    const files = await fs.promises.readdir(dirPath);
    const agentPromises = files
        .filter(file => file.endsWith('.md') && file !== 'README.md')
        .map(async (file) => {
            try {
                const content = await fs.promises.readFile(path.join(dirPath, file), 'utf-8');
                const parsed = parseMarkdownFrontmatter(content);
                if (parsed.attributes.name) {
                    let relativePath = `prompts/${file}`;
                    if (targetFolder === 'fusions') {
                        relativePath = `prompts/fusions/${file}`;
                    } else if (targetFolder === 'micro') {
                        relativePath = `prompts/micro/${file}`;
                    }

                    const agent = {
                        ...parsed.attributes,
                        promptFile: relativePath,
                        isCustom: isCustom
                    };
                    return agent;
                }
            } catch (error) {
                console.warn(`Failed to read or parse agent file ${file}:`, error.message);
            }
            return null;
        });

    const results = await Promise.all(agentPromises);
    return results.filter(Boolean);
}

async function buildRoster() {
    const rootDir = path.resolve(__dirname, '..');
    const promptsDir = path.join(rootDir, 'prompts');
    const fusionsDir = path.join(rootDir, 'prompts', 'fusions');
    const microDir = path.join(rootDir, 'prompts', 'micro');

    const [coreAgents, fusionAgents, microAgents] = await Promise.all([
        processDirectory(promptsDir, false, null),
        processDirectory(fusionsDir, true, 'fusions'),
        processDirectory(microDir, true, 'micro')
    ]);

    const agents = [...coreAgents, ...fusionAgents, ...microAgents];

    const outputPath = path.join(rootDir, 'roster-payload.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(agents, null, 2) + '\n');
    console.log(`Successfully compiled ${agents.length} agents to roster-payload.json`);
}

buildRoster().catch(console.error);
