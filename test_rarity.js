const RarityEngine = require('./js/Features/Fusion/RarityEngine.js');
const fs = require('fs');

const agents = JSON.parse(fs.readFileSync('agents.json'));
const customAgents = JSON.parse(fs.readFileSync('custom_agents.json'));

console.log("agents keys:", Object.keys(agents).length);

// Let's find some agents and see if rarity works.
const agent1 = agents['1. Architect'];
const agent2 = agents['2. Pedant'];

if (agent1 && agent2) {
    console.log("Rarity of Architect + Pedant:", RarityEngine.calculateRarity(agent1, agent2));
} else {
    console.log("Agents not found in agents.json");
    console.log(Object.keys(agents).slice(0, 5));
}

// Check customAgents
const plusAgent = customAgents['1. Base Synthesis']?.['Bolt+,Palette+'];
console.log("Bolt+,Palette+:", plusAgent?.name);
