const fs = require('fs');

global.PromptParser = { parsePrompt: () => ({ format: 'legacy' }) };
global.FormatUtils = {
    escapeHTML: (str) => str,
    extractIcon: (str) => '!',
    extractDisplayName: (str) => 'Test Agent'
};

const domWindow = {
    rosterApp: { favoritesManager: { isFavorite: () => false } }
};
global.window = domWindow;

const AgentCard = require('./js/ui/AgentCard.js');

const agentPlus = { type: 'plus', name: 'Bolt+', prompt: '' };
const agentMonthly = { type: 'monthly', name: 'Spark', prompt: '' };
const agentCore = { type: '', name: 'CoreAgent', prompt: '' };

const card1 = AgentCard.create(agentPlus, 0, 0);
console.log('Plus agent classes:', card1.className);

const card2 = AgentCard.create(agentMonthly, 1, 1);
console.log('Monthly agent classes:', card2.className);

const card3 = AgentCard.create(agentCore, 2, 2);
console.log('Core agent classes:', card3.className);
