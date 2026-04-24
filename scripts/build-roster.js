const fs = require('fs');
const path = require('path');

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

async function processDirectory(dirPath, isCustom) {
    if (!fs.existsSync(dirPath)) return [];

    const files = await fs.promises.readdir(dirPath);
    const agentPromises = files
        .filter(file => file.endsWith('.md') && file !== 'README.md')
        .map(async (file) => {
            try {
                const content = await fs.promises.readFile(path.join(dirPath, file), 'utf-8');
                const parsed = parseMarkdownFrontmatter(content);
                if (parsed.attributes.name) {
                    const agent = {
                        ...parsed.attributes,
                        promptFile: isCustom ? `prompts/fusions/${file}` : `prompts/${file}`,
                        isCustom: isCustom
                    };
                    return agent;
                }
            } catch (error) {
                console.warn(`Failed to read or parse ${isCustom ? 'fusion' : 'core'} agent file ${file}:`, error.message);
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

    const [coreAgents, fusionAgents] = await Promise.all([
        processDirectory(promptsDir, false),
        processDirectory(fusionsDir, true)
    ]);

    const agents = [...coreAgents, ...fusionAgents];

    const outputPath = path.join(rootDir, 'roster-payload.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(agents, null, 2));
    console.log(`Successfully compiled ${agents.length} agents to roster-payload.json`);
}

buildRoster().catch(console.error);