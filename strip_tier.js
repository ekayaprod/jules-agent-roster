const fs = require('fs');

const data = JSON.parse(fs.readFileSync('custom_agents.json', 'utf8'));

Object.values(data).forEach(category => {
    Object.values(category).forEach(agent => {
        delete agent.tier;
    });
});

fs.writeFileSync('custom_agents.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Tier stripped successfully.');
