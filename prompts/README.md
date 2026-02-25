# Jules Agent Prompts

This directory is the "Source Code" for the Jules Agent System. It contains the raw Markdown files that define the personality, scope, and instructions for each agent.

## 📂 Directory Structure

The structure is intentionally flat to allow for easy consumption by the frontend application.

*   **`/*.md` (Root)**: Contains the **Core Agents** (e.g., `Bolt+.md`, `Architect.md`). These are the fundamental building blocks of the roster.
*   **`/fusions/*.md`**: Contains the **Fusion Agents** (e.g., `Diplomat.md`). these are specialized, high-tier agents created by combining two core agents.

## 📝 Format Standards

These files are **NOT** Jekyll posts or Hugo content. They are raw text assets fetched by the frontend.

1.  **No Front Matter**: Do not include YAML front matter (e.g., `--- title: Bolt ---`) at the top of the file. The file should start immediately with the prompt content.
2.  **Markdown Only**: Use standard Markdown syntax.
3.  **Code Blocks**: Ensure all code blocks are properly closed with three backticks.
4.  **Escaping**: If you use template syntax like `{{ }}` inside a code block, you must escape it or wrap it in backticks to prevent GitHub Pages from trying to parse it as Liquid.

## 🤝 How to Add a New Agent

1.  **Draft the Prompt**: Create a new `.md` file in the root directory (for a Core Agent) or `fusions/` (for a Custom Fusion).
    *   *Tip: Use an existing agent as a template to ensure consistent sections (Role, Context, Instructions).*

2.  **Register the Agent**:
    *   **Core Agent**: Add an entry to `agents.json` in the project root.
    *   **Fusion Agent**: Add an entry to `custom_agents.json` in the project root, defining the parent pair (e.g., `"Medic,Wordsmith"`).

3.  **Verify**:
    *   Run the application locally.
    *   Ensure the agent appears in the grid (Core) or can be unlocked in the Fusion Lab (Fusion).
