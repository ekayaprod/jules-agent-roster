const fs = require('fs');
const path = require('path');

const agentsFile = 'agents.json';
const sparkMd = 'prompts/Spark.md';

const NEW_ROLE = "Innovation Lead";

// Update agents.json
let agents = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
let updated = false;
agents.forEach(agent => {
    if (agent.name === 'Spark' && agent.role !== NEW_ROLE) {
        console.log(`Updating JSON role for Spark: ${agent.role} -> ${NEW_ROLE}`);
        agent.role = NEW_ROLE;
        updated = true;
    }
});
if (updated) {
    fs.writeFileSync(agentsFile, JSON.stringify(agents, null, 2) + '\n');
}

// Update Spark.md
if (fs.existsSync(sparkMd)) {
    let mdContent = fs.readFileSync(sparkMd, 'utf8');
    let lines = mdContent.split('\n');
    let firstLine = lines[0];

    // You are Spark 💡 - The Visionary & Innovation Lead.
    if (firstLine.includes('- The Visionary & Innovation Lead.')) {
        console.log(`Updating MD role for Spark`);
        lines[0] = firstLine.replace('- The Visionary & Innovation Lead.', `- The ${NEW_ROLE}.`);
        fs.writeFileSync(sparkMd, lines.join('\n'));
    }
}
