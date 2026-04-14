# Agent Services

## Purpose

This directory contains the data fetching, validation, and external integration layers for the Jules Roster application. The components here abstract the file system (`AgentRepository.js`) and network calls to external LLM services (`JulesService.js`) required to load agent definitions and orchestrate live protocol sessions.

## Quick Start

### AgentRepository Quick Start

To fetch all agents (standard and custom fusions) and their associated prompts:

```javascript
const repository = new AgentRepository();

async function loadData() {
    try {
        const { agents, customAgents } = await repository.fetchAgents();
        console.log(`Loaded ${agents.length} standard agents.`);
        console.log(`Loaded ${Object.keys(customAgents).length} custom fusions.`);
    } catch (error) {
        console.error("Failed to initialize repository:", error);
    }
}

loadData();
```

### JulesService Quick Start

To configure the service and initiate an agent session:

```javascript
// 1. Configure the API Key
window.julesService.configure("your_api_key_here");

// 2. Fetch available sources
const sources = await window.julesService.getSources();
const targetSource = sources[0].name;

// 3. Initiate a session with an agent
const session = await window.julesService.createSession(
    "You are Architect...",
    "Refactor the file structure.",
    targetSource,
    "Refactor Session"
);

// 4. Poll for activities
const activities = await window.julesService.getActivities(session.name);
```

## Architecture

### AgentRepository Architecture

The `AgentRepository` acts as the single source of truth for agent data.

1. **Fetching:** It fetches `roster-payload.json` via the native `fetch` API, implementing an exponential backoff retry mechanism (`fetchWithRetry`) for network resilience.
2. **Validation:** Raw JSON data is strictly validated against expected schemas. The `validateAgentsData` and `validateCustomAgent` methods sanitize optional fields and reject malformed entries to prevent downstream UI errors.
3. **Prompt Resolution:** After validating the JSON metadata, the repository dynamically fetches the corresponding Markdown files from the `prompts/` and `prompts/fusions/` directories, attaching the raw prompt text directly to the agent objects.
4. **Environment Agnostic:** The service is written in standard ES6 classes and supports CommonJS exports (`module.exports`) to allow execution in Node.js test environments without transpilation.

### JulesService Architecture

The `JulesService` manages the network boundary with the Jules backend.

1. **Asynchronous Polling vs Streaming:** Unlike standard LLM integrations that utilize synchronous completions or SSE (`stream: true`), the Jules API is asynchronous. Generating a response requires creating a stateful Session (`createSession`) and then continuously polling its Activities (`getActivities`) until completion.
2. **Network Resilience:** All network requests in `_fetch` are aggressively wrapped in a 15-second `AbortController` timeout to prevent hanging UI states if the API becomes unresponsive.
3. **Global Attachment:** The service is instantiated and bound directly to `window.julesService` to allow universal access across the decoupled vanilla JS UI components without relying on a centralized dependency injector.
