const fs = require('fs');
const path = require('path');

const agents = JSON.parse(fs.readFileSync('agents.json', 'utf8'));
const promptsDir = 'prompts';

agents.forEach(agent => {
    const mdPath = path.join(promptsDir, `${agent.name}.md`);
    if (fs.existsSync(mdPath)) {
        const lines = fs.readFileSync(mdPath, 'utf8').split('\n');
        const firstLine = lines[0];
        // You are [AGENTNAME] [emoji] - The [ROLENAME].
        const match = firstLine.match(/- The (.*)\.$/);
        const mdRole = match ? match[1] : null;

        let jsonRoleWords = agent.role.split(' ').length;
        let mdRoleWords = mdRole ? mdRole.split(' ').length : 0;

        let needsUpdate = false;
        let bestRole = null;

        if (jsonRoleWords <= 3 && mdRoleWords <= 3 && agent.role === mdRole) {
            // Already good!
            console.log(`[SKIP] ${agent.name} - Role: ${agent.role} (Perfect match, ${jsonRoleWords} words)`);
            return;
        }

        console.log(`\n[EVALUATE] ${agent.name}:`);
        console.log(`  JSON Role: "${agent.role}" (${jsonRoleWords} words)`);
        console.log(`  MD Role  : "${mdRole}" (${mdRoleWords} words)`);
        console.log(`  Short Desc: ${agent.short_description}`);
    }
});
