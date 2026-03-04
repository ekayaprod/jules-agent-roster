# Jules Agent Roster 🤖

> **Current Version:** 0.2.0

> The complete, enhanced agent system for Jules AI, featuring the **Overseer Protocol** and **Plus-tier** specialists.

This repository hosts a curated collection of advanced agent prompts designed to work seamlessly with Jules. It moves beyond simple "chat" interactions into a robust, structured workflow where agents have specific roles, scopes, and memory.

## 🌟 The "Plus" Philosophy

Unlike standard agents which handle one-off tasks, the **Plus Agents** in this roster are designed for:

1. **Systemic Improvement:** They don't just fix a bug; they implement a pattern (e.g., Virtualization, Zod Validation) that prevents the bug from returning.

2. **Context Awareness:** They read from a central audit file (`.jules/AGENTS_AUDIT.md`) to find high-impact work instead of guessing.

3. **Strict Scoping:** They operate within a "Small-Medium" scope—large enough to be meaningful, small enough to be safe and reviewable.

## 👁️ The Overseer Protocol

The core of this system is the **Overseer** agent. This agent runs monthly to perform a deep forensic scan of your codebase.

**The Workflow:**

1. **Monthly:** Run the **Overseer** agent. It scans for churn, performance bottlenecks, and security risks.

2. **Output:** It generates a "Menu" of tasks in `.jules/AGENTS_AUDIT.md`.

3. **Daily/Weekly:** You run specialist agents (like **Bolt+**, **Palette+**, **Sentinel+**).

4. **Execution:** These agents read the audit file, pick a task, fix it, and **check it off the list**.

## 🚀 Getting Started

1. **Deploy:** This roster is a self-contained HTML file. You can deploy it to GitHub Pages or open it locally.

2. **Copy:** Click "Copy Prompt" for the agent you need.

3. **Paste:** Paste the prompt into your Jules chat window.

## 📦 The Agents

### Core Maintenance (Plus)

* **Bolt+ ⚡**: Performance Engineer. Handles virtualization, workers, and caching strategies.

* **Palette+ 🎨**: UX & Delight. Polishes interaction flows, animations, and accessibility.

* **Sentinel+ 🛡️**: Security Engineer. Implements defense layers like validation schemas and CSP.

### Engineering Specialists

* **Architect 🏗️**: Structural refactoring and code organization.

* **Scavenger 🧹**: Dead code deletion and debt removal.

* **Janitor 🧼**: Dependency updates and config hygiene.

* **Modernizer 🆙**: Upgrades legacy patterns and AI models.

* **Inspector 🕵️**: Fills test coverage gaps.

* **Paramedic 🚨**: Hardens app against crashes and brittle logic.

* **Helix 🧬**: Deduplication Specialist. Extracts shared logic into utilities or hooks.

* **Pedant 🧐**: Code Quality Enforcer. Enforces naming conventions and style guides.

* **Untangler 🧶**: Logic Simplifier. Flattens nested logic and extracts helper functions.

### Context & Strategy

* **Scribe ✍️**: Documentation. Updates docs and API references.

* **Navigator 🧭**: Strategy. Aligns Roadmap with code reality.

* **Curator 🖼️**: Assets. Audits asset library health and accessibility.

* **Herald 📣**: Release Manager. Translates git history into Changelogs.

* **Wordsmith ✏️**: UX Writer. Audits copy for brevity and clarity.

### Monthly Intelligence

* **Overseer 👁️**: The Eye. Performs deep forensic audit to identify targets.

* **Cartographer 🗺️**: Visuals. Maps system architecture into Mermaid diagrams.

* **Spark 💡**: Innovation Strategist. Reviews codebase for blindspots and suggests libraries.

### 🧬 The Fusion System

The Fusion Lab allows you to combine any two agents to create a specialized hybrid agent. Select two agents in the UI to generate a unique "Fusion Prompt" that combines their strengths.

**Featured Fusions:**

* **The Guardian ⛑️** (Paramedic + Inspector): Hardens code against crashes and locks it in place with rigorous tests.

* **The Virtuoso 🎨** (Palette+ + Wordsmith): Polishes interaction flows and microcopy in a single unified pass.

* **The Steward 🧽** (Janitor + Scavenger): Bumps dependencies and surgically purges the legacy polyfills they replace.

* **The Catalyst ⚡** (Bolt+ + Modernizer): Upgrades legacy syntax and instantly extracts native performance gains.

* **The Historian ⏳** (Herald + Scribe): Documents a release in the Changelog and the codebase JSDoc simultaneously.

## 🤝 Contributing

This roster is designed to evolve. If you find a new pattern or a better way to structure an agent's "Philosophy," feel free to open a PR!

*Built for the Jules Community.*
