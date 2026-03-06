# Jules Agent Roster 🤖

**Current Version:** 0.2.0

## Purpose

This repository provides a curated collection of advanced, structured agent prompts for the Jules AI system. It transforms basic chat interactions into a robust workflow utilizing specialized, scope-limited agents to resolve specific technical domains including performance, security, and user experience.

## Quick Start

Deploy and use the agent roster locally:

1. Clone the repository and navigate into the directory:
   `git clone <repository_url> && cd <repository_directory>`
2. Open the application entry point in a web browser:
   `open index.html`
3. Select an agent from the roster UI and click "Copy Prompt".
4. Paste the copied prompt into the Jules AI interface to execute the task.

## Architecture

The system operates as a stateless, vanilla JavaScript frontend application utilizing zero build steps or bundlers.

- **Core Application (`js/RosterApp.js`):** The main controller handling UI rendering, filtering, and global event delegation.
- **Data Layer (`agents.json`):** A static JSON configuration dictating agent metadata, system roles, and raw prompt templates.
- **Fusion Lab (`js/features/fusion/FusionLab.js`):** A sub-system that programmatically combines properties of two distinct agents into a specialized hybrid prompt.
- **The Overseer Protocol:** An asynchronous workflow where an `Overseer` agent performs periodic codebase audits, generating actionable target menus in `.jules/AGENTS_AUDIT.md`.
- **Plus Agents:** Autonomous domain experts (e.g., `Bolt+`, `Palette+`) engineered to read the central audit file, execute structural changes, and enforce engineering standards.
