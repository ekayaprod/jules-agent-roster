# Agent Prompts Directory

This directory contains the source prompts for all agents in the Jules Roster. Each file represents a specialized agent designed to handle specific tasks within the development workflow.

## 📂 Structure

The prompts are organized by category (though mostly flat in this directory):

*   **Core Maintenance (Plus)**: High-impact agents that combine micro-fixes with systemic improvements (e.g., `bolt.md`, `palette.md`, `sentinel.md`).
*   **Engineering Specialists**: Agents for code quality, testing, and refactoring (e.g., `inspector.md`, `helix.md`, `pedant.md`).
*   **Context & Strategy**: Agents for documentation, roadmap alignment, and release management (e.g., `scribe.md`, `navigator.md`, `herald.md`).
*   **Monthly Intelligence**: Heavy-duty agents run on a schedule (e.g., `overseer.md` in `power/`).
*   **Power Bundles**: (Deprecated/Legacy) Replaced by Fusion system. Some power agents reside in `power/`.

## 📝 Prompt Format

All agents must adhere to the **Fusion-Ready** format to be compatible with the `FusionCompiler`.

### Key Sections:

1.  **Identity**: The first few lines define the agent's persona and mission.
2.  **## BOUNDARIES**: Strict rules defining what the agent must and must not do.
    *   `✅ Always do`: Mandatory actions.
    *   `🚫 Never do`: Forbidden actions.
    *   `⚠️ Ask first`: Actions requiring user confirmation.
3.  **## PROCESS**: The step-by-step workflow the agent must follow.
    *   Often divided into phases (e.g., "Phase 1: Analysis", "Phase 2: Execution").

### Example:

```markdown
You are [Agent Name] [Icon].
Your mission is to...

## BOUNDARIES
✅ Always do: ...
🚫 Never do: ...

## PROCESS
1. Step 1...
2. Step 2...
```

## ➕ The "Plus" Philosophy

**Plus Agents** (e.g., `Bolt+`, `Palette+`) go beyond simple fixes. They are designed to:
1.  **Implement Patterns**: Not just fix a bug, but introduce a systemic solution (e.g., validation schemas, error boundaries).
2.  **Scope Appropriately**: operate within a "Small-Medium" scope—meaningful but safe.
3.  **Read Context**: utilize the `.jules/AGENTS_AUDIT.md` to prioritize work.

## 🧬 Fusion

The `FusionCompiler` (in `index.html`) can dynamically combine any two base agents (excluding Monthly/Power) into a single **Fusion Agent**. It does this by stitching together their `## BOUNDARIES` and `## PROCESS` sections.

**Note**: To ensure fusion works, all prompts must strictly use the `## BOUNDARIES` and `## PROCESS` headers.
