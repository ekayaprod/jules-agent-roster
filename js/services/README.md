# Agent Services

## Purpose
This directory contains the data fetching and validation layer for the Jules Roster application. The primary component, `AgentRepository.js`, abstracts the file system and network calls required to load agent definitions and prompts.

## Quick Start
To fetch all agents (standard and custom fusions) and their associated prompts:

```javascript
const repository = new AgentRepository();

async function loadData() {
    try {
        const { agents, customAgents } = await repository.getAgents();
        console.log(`Loaded ${agents.length} standard agents.`);
        console.log(`Loaded ${Object.keys(customAgents).length} custom fusions.`);
    } catch (error) {
        console.error("Failed to initialize repository:", error);
    }
}

loadData();
```

## Architecture
The `AgentRepository` acts as the single source of truth for agent data.

1. **Fetching:** It fetches `agents.json` and `custom_agents.json` via the native `fetch` API, implementing an exponential backoff retry mechanism (`fetchWithRetry`) for network resilience.
2. **Validation:** Raw JSON data is strictly validated against expected schemas. The `validateAgentsData` and `validateCustomAgent` methods sanitize optional fields and reject malformed entries to prevent downstream UI errors.
3. **Prompt Resolution:** After validating the JSON metadata, the repository dynamically fetches the corresponding Markdown files from the `prompts/` and `prompts/fusions/` directories, attaching the raw prompt text directly to the agent objects.
4. **Environment Agnostic:** The service is written in standard ES6 classes and supports CommonJS exports (`module.exports`) to allow execution in Node.js test environments without transpilation.
