# Jules Agent Roster 🤖

> **Notice:** This repository is a localized, personal utility built solely to optimize my individual daily workflow. It is *not* an officially approved, team-wide, or enterprise-level deployment.

## 1. Overview

Welcome to the **Jules Agent Roster**, a lightning-fast, Pure-Vanilla JS local web app designed to act as my personal AI prompt synthesis engine.

Instead of juggling scattered text files and wrestling with ad-hoc agent prompts, this utility provides a single, unified UI to browse, synthesize, and launch specialized AI agents directly into action. It serves as my customized mission control for deploying autonomous agents against local codebases.

### 🗺️ Repository Domain Map

To help you navigate the physical structure of the monorepo, here is the architectural domain purpose of each physical root directory:

| Directory | Structural Purpose |
| :--- | :--- |
| `css/` | Contains the global stylesheets and utility classes for the Vanilla JS interface. |
| `docs/` | Houses extended architectural diagrams and internal documentation. |
| `js/` | The core client-side Vanilla JS application, broken down into Features, UI components, and API Services. |
| `playwright/` | The End-to-End (E2E) testing suite to verify UI flows and browser interactions. |
| `prompts/` | The absolute source of truth. Contains the raw Markdown files representing individual agent personas and instructions. |
| `scripts/` | Build scripts, including the Node.js compiler that compiles raw markdown prompts into the `roster-payload.json` artifact. |

## 🚀 Quick Start
Welcome aboard! To boot the application locally:
1. `cp .env.example .env` (Populate your API keys).
2. `npm install`
3. `npm start`

Alternatively, to boot via Docker using the provided multi-stage `Dockerfile`:
1. `docker build -t jules-roster .`
2. `docker run -p 8080:8080 jules-roster`

## 2. The Operational Catalyst

Before this tool, managing AI agent prompts was a manual nightmare. The bottleneck was severe:
*   **Context Loss:** Losing hours to repetitive copy-pasting of prompt templates from various Markdown files.
*   **Data Entry Errors:** Manually attempting to fuse different agent personas (like merging a Security expert with a Performance optimizer) frequently led to malformed instructions or broken context.
*   **Execution Friction:** Launching agents required bouncing between terminal windows, text editors, and web interfaces, breaking my state of flow.

I needed a localized, single source of truth that lived strictly on my machine, entirely free from the bloated overhead of a full-stack enterprise application, and designed exclusively to eliminate my personal manual data entry errors.

## 3. Under the Hood (Technical Architecture)

This project is ruthlessly optimized for speed and simplicity, relying entirely on native web APIs.

*   **Zero-Dependency Frontend:** Built with Pure Vanilla JavaScript. There are no bundlers (Webpack/Vite) and no Virtual DOMs (React/Vue).
*   **Data Compilation (`scripts/build-roster.js`):** A lightweight Node.js script acts as a compiler, executing a single-pass extraction to convert raw Markdown agent files into a highly optimized `roster-payload.json` artifact for the frontend to consume.
*   **Fusion Logic (`js/Features/Fusion/FusionLab.js`):** The core intelligence of the UI. It handles the state management of merging distinct agent protocols into a single, cohesive payload.
*   **Asynchronous Execution (`js/UI/JulesTerminal/JulesTerminal.js`):** Orchestrates active session executions, relying heavily on native asynchronous DOM manipulation. It implements optimistic UI state blocks and manages execution queues via local caching and async polling mechanisms.

## 4. Robustness & Integrity

Because this tool is the gateway for automated code modifications, zero-touch execution integrity is paramount.

*   **Defensive Rendering (`FusionLab.js`):** Implements strict `typeof` and existence checks before instantiating DOM observers or invoking rendering routines, ensuring the application fails gracefully rather than crashing the browser tab.
*   **State Fallbacks (`JulesTerminal.js`):** The terminal actively monitors its internal DOM state. If a session is aborted or fails to launch, empty terminal state checks automatically revert the UI to a safe fallback (`"Ready. Awaiting execution commands..."`), preventing ghost states or orphaned UI elements.
*   **Single Source of Truth:** By forcing all agent logic to compile from Markdown into a static JSON payload, the architecture strictly prevents runtime prompt mutation, guaranteeing that the agent launched is exactly the agent defined in the source files.

## 5. Localized ROI (Impact)

This personal utility has fundamentally transformed how I interact with local codebases:

*   **Throughput Increase:** Condensed a multi-minute manual prompt synthesis and launch process into a 3-second, single-click operation.
*   **Zero Data Corruption:** Eliminated 100% of human copy-paste errors when generating complex, multi-persona AI instructions.
*   **Unbroken Flow State:** By centralizing discovery, synthesis, and execution into one localized dashboard, I maintain deep focus without context-switching fatigue.

## 6. Core Features & Workflow Enhancements

This project encapsulates domain-specific features designed to accelerate workflow throughput and reduce manual toil:

| Feature | Description | Workflow Impact |
| :--- | :--- | :--- |
| **Fusion Lab** 🧪 | A neural center that merges distinct agent protocols (e.g., a "Builder" with an "Optimizer") into a single cohesive entity using a strict Directed Acyclic Graph (DAG). | Condenses multi-minute manual prompt synthesis into a single-click operation, ensuring zero data corruption. |
| **Export Controller** 📤 | Aggregates truth from core, custom, and fused maps, enabling immediate one-click copy to clipboard or bulk download of payload strings. | Completely eliminates repetitive copy-pasting of markdown content, maintaining flow state. |
| **Pinned Manager** 📌 | A localized persistence layer wrapping browser `localStorage` to bookmark frequently used agents. | Reduces search friction, instantly surfacing high-priority agents on boot. |
| **Search Controller** 🔍 | Employs fuzzy matching (`Fuse.js`) offloaded to a Web Worker, paired with virtual scrolling (`Clusterize.js`). | Instantly parses massive agent datasets without locking the main thread or crashing the browser up. |
| **Singularity Architect** 🌌 | An autonomous AI Prompt Architect that sweeps your repository and writes highly specific, bespoke agents based on a user's free-text mission. | Generates tailored, ready-to-launch agents without manual prompt authoring. |
