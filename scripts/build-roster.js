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

function buildRoster() {
    const rootDir = path.resolve(__dirname, '..');
    const promptsDir = path.join(rootDir, 'prompts');
    const fusionsDir = path.join(rootDir, 'prompts', 'fusions');

    const agents = [];

    // Process core agents
    if (fs.existsSync(promptsDir)) {
        const files = fs.readdirSync(promptsDir);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.endsWith('.md') && file !== 'README.md') {
                try {
                    const content = fs.readFileSync(path.join(promptsDir, file), 'utf-8');
                    const parsed = parseMarkdownFrontmatter(content);
                    if (parsed.attributes.name) {
                        const agent = {
                            ...parsed.attributes,
                            promptFile: `prompts/${file}`,
                            isCustom: false
                        };
                        if (!agent.name) agent.name = file.replace('.md', '');
                        agents.push(agent);
                    }
                } catch (error) {
                    console.warn(`Failed to read or parse core agent file ${file}:`, error.message);
                }
            }
        }
    }

    // Process fusion agents
    if (fs.existsSync(fusionsDir)) {
        const files = fs.readdirSync(fusionsDir);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.endsWith('.md') && file !== 'README.md') {
                try {
                    const content = fs.readFileSync(path.join(fusionsDir, file), 'utf-8');
                    const parsed = parseMarkdownFrontmatter(content);
                    const name = parsed.attributes.name;
                    if (name) {
                        const agent = {
                            ...parsed.attributes,
                            promptFile: `prompts/fusions/${file}`,
                            isCustom: true
                        };
                        agents.push(agent);
                    }
                } catch (error) {
                    console.warn(`Failed to read or parse fusion agent file ${file}:`, error.message);
                }
            }
        }
    }

    const outputPath = path.join(rootDir, 'roster-payload.json');
    fs.writeFileSync(outputPath, JSON.stringify(agents, null, 2));
    console.log(`Successfully compiled ${agents.length} agents to roster-payload.json`);
}

buildRoster();