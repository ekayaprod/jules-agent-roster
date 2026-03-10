const fs = require('fs');
const path = require('path');

const agents = JSON.parse(fs.readFileSync('agents.json', 'utf8'));
const promptsDir = 'prompts';

agents.forEach(agent => {
    const mdPath = path.join(promptsDir, `${agent.name}.md`);
    if (fs.existsSync(mdPath)) {
        const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
        const firstLine = lines[0];
        // Expecting: You are [AGENTNAME] [emoji] - The [ROLENAME].
        const match = firstLine.match(/- The (.*)\.$/);
        const mdRole = match ? match[1] : 'NOT FOUND';

        console.log(`Agent: ${agent.name}`);
        console.log(`  JSON Role: ${agent.role} (${agent.role.split(' ').length} words)`);
        console.log(`  MD Role  : ${mdRole} (${mdRole.split(' ').length} words)`);
        if (agent.role !== mdRole) {
            console.log(`  => MISMATCH!`);
        }
    } else {
        console.log(`Agent: ${agent.name} - MD file not found at ${mdPath}`);
    }
});
