# Auto-Forge (Unattended Maintenance Protocol)

> **ENVIRONMENT FENCE:** This file governs unattended maintenance and upgrades for *existing* agents. It is not for creating new agents (see `Auto-Build.md`).

This procedure is the headless execution wrapper for maintaining agents. You are tasked with upgrading an existing agent's logic to match current `Master-Forge.md` and `Forge-Procedure.md` standards without relying on an interactive conversation or an intermediary JSON compiler.

You must execute the logic shift directly via native file editing on the Markdown target.

## Step 1: Target Identification & Locking
- Sweep `prompts/`, `prompts/fusions/`, or `prompts/micro/` for `.md` files.
- Apply the Target Sorting Rule: Lock the single oldest file (check the `forge_version` frontmatter, prioritizing missing or oldest semantic versions). Lock exactly one target per session.

## Step 2: State Ingestion & Drift Analysis
- Read the locked target `.md` to load legacy logic into context.
- Identify the agent's core domain and structural Archetype.
- **Drift Audit:** Compare the legacy worker against current `Master-Forge` and `Forge-Procedure` rules (e.g., Are list lengths compliant? Does a Fusion worker include the mandatory `Fusion Conflict Resolution` rule? Is the verification heuristic solid?).

## Step 3: Direct Syntactic Upgrade
- **Identity Preservation:** Do not modify the core identity (Name, Emoji, Role, Theme, Mechanic) during upgrades unless specifically resolving a domain conflict.
- Apply the necessary upgrades (expanding targets, fortifying rules, injecting missing structural headers) directly to the Markdown file.
- Ensure the file strictly follows the section layout defined in the `<!-- WORKER_TEMPLATE_START -->` block found in `Creative-Procedure.md`.
- **Version Bump:** Update the `forge_version` frontmatter to match the `CURRENT_FORGE_VERSION` defined in `Master-Forge.md`.

## Step 4: The Efficacy Audit
- Before finalizing, execute a logical self-audit comparing your modified Markdown against the original legacy file.
- **The Generic-vs-Domain Test:** Did your update accidentally remove a highly specific, useful legacy domain safeguard (e.g., a specific `git clean` flag or syntax parsing rule)? If yes, revert your edit and manually re-inject the safeguard into your new structure.
- The updated file must result in a more capable, coherent, and domain-specific agent than the legacy variant.

## Step 5: Terminal Output
- Run necessary validation scripts (like `npm run build:roster`).
- Trigger the Pull Request creation tool natively.
- **PR Title:** `🛠️ Auto-Forge: Upgraded [Agent Name] to [Version]`
- End the task cleanly.
