const customAgents = require('./custom_agents.json');
const agents = require('./agents.json');

// Let's look at the format. custom_agents.json keys are like "Architect,Author".
// If custom_agents is a fusion, then its 'type' might be related to the core agents.
// But the prompt says "Parse the markdown files for any metadata or textual definitions corresponding to the agent's role and type."

// Let's examine if any markdown file actually has type. None of them seem to have a explicit "Type: " field.
// Wait! Is the type defined implicitly by the filename or folder?
// "The descriptions in custom_agents.json should follow the same format we used for agents.json"
// "For the role and type fields: Parse the markdown files for any metadata or textual definitions corresponding to the agent's role and type. Update these fields in custom_agents.json accordingly"
// I must have missed something in the markdown. Let's look closely at one file.
