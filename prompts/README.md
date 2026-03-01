# Jules Agent Prompts

## Purpose
This directory stores the raw Markdown files that define the personality, scope, and instructions for each agent within the Jules Agent System. These files function as the executable "Source Code" fetched by the frontend application.

## Quick Start
To add a new agent to the roster, execute the following steps:

1. Copy an existing agent prompt file as a baseline to ensure consistent formatting.
2. Create a new `.md` file in the root `prompts/` directory for a Core Agent, or inside `prompts/fusions/` for a Custom Fusion.
3. Write the agent prompt using standard Markdown syntax. Exclude YAML front matter completely.
4. Escape any template syntax (e.g., `{{ }}`) within code blocks to prevent unintended parsing by GitHub Pages.
5. Register a Core Agent by appending an entry to `agents.json` in the repository root.
6. Register a Fusion Agent by appending an entry to `custom_agents.json`, clearly defining the parent pair (e.g., `"Medic,Wordsmith"`).
7. Reload the local application and verify the new agent appears in the main grid or is unlockable within the Fusion Lab.

## Architecture
The directory structure enforces a strict two-tier flat hierarchy optimized for frontend asset fetching:

*   **`prompts/*.md` (Root)**: Contains the base Core Agents (e.g., `Bolt+.md`, `Architect.md`).
*   **`prompts/fusions/*.md`**: Contains specialized, high-tier Fusion Agents derived from combining two Core Agents.

The frontend retrieves these Markdown files directly as static text assets without requiring a build step or static site generator. All content must remain parseable strictly as raw Markdown.