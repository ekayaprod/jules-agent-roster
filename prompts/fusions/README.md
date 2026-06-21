# Fusion Agents Prompts

## Purpose

This directory stores the specialized, high-tier Fusion Agents derived from combining two Core Agents. These Markdown files define the unique personality, strict guidelines, and execution protocols for hybrid agents within the Jules Agent System.

## Quick Start

To define a new Fusion Agent prompt, execute the following steps:

1. Create a new `.md` file in this directory (`prompts/fusions/`).
2. Format the first line of the file strictly as: `You are "[Agent Name]" [emoji] - [Tagline]`.
3. Write the prompt using standard Markdown syntax. **Ensure the file has valid YAML frontmatter containing `name`, `emoji`, `category` (set to `fusions`), and `tier`.**
4. Escape any template syntax (e.g., `{{ }}`) within code blocks to prevent unintended parsing.
5. Run `npm run build:roster` to dynamically compile the changes into `agents.generated.json`.
6. Test the Fusion Agent by unlocking the corresponding combination in the local application's Fusion Lab or verifying it loads locally via `npm start`.

## Architecture

The `prompts/fusions/` directory isolates hybrid agent definitions from the base Core Agents located in the parent `prompts/` directory.

The frontend application retrieves these files directly as static text assets during the fusion process or when a previously unlocked fusion is activated. The system maps the agent attributes derived from `agents.generated.json` directly to the corresponding `.md` file name in this directory.
