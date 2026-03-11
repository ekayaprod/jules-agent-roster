const RarityEngine = require('./js/Features/Fusion/RarityEngine.js');
const fs = require('fs');

const agents = JSON.parse(fs.readFileSync('agents.json'));
const customAgents = JSON.parse(fs.readFileSync('custom_agents.json'));

const agent1 = agents.find(a => a.name === "Architect");
const agent2 = agents.find(a => a.name === "Pedant");

console.log("Architect category:", agent1.category);
console.log("Pedant category:", agent2.category);

console.log("Rarity of Architect + Pedant:", RarityEngine.calculateRarity(agent1, agent2));

const sd1 = RarityEngine.getSuperDomain(agent1);
const sd2 = RarityEngine.getSuperDomain(agent2);

console.log("Architect super domain:", sd1);
console.log("Pedant super domain:", sd2);

// Let's test Epic QA Bridge
const agent3 = agents.find(a => a.name === "Inspector"); // category: testing -> Integrity
const agent4 = agents.find(a => a.name === "Wordsmith"); // category: ux -> Visible

console.log("Inspector category:", agent3.category);
console.log("Wordsmith category:", agent4.category);

console.log("Rarity of Inspector + Wordsmith:", RarityEngine.calculateRarity(agent3, agent4));
