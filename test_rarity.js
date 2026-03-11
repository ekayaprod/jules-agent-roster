const fs = require('fs');
const RarityEngine = require('./js/Features/Fusion/RarityEngine.js');
const agents = JSON.parse(fs.readFileSync('agents.json', 'utf8'));

const a1 = agents.find(a => a.name === "Bolt+");
const a2 = agents.find(a => a.name === "Palette+");
console.log(a1.name, a2.name, RarityEngine.calculateRarity(a1, a2));

const customAgents = JSON.parse(fs.readFileSync('custom_agents.json', 'utf8'));
for (const cat of Object.values(customAgents)) {
  for (const [key, agent] of Object.entries(cat)) {
    const [name1, name2] = key.split(",");
    const a1 = agents.find(a => a.name === name1);
    const a2 = agents.find(a => a.name === name2);
    if (!a1 || !a2) console.log("Missing:", key);
  }
}
