## 2024-05-23 - [Tech Stack Alignment]
**Learning:** Prompts MUST reflect the actual technology stack (Vanilla JS vs React) to prevent hallucinations. The `Bolt+` agent was hallucinating React/TypeScript constraints in a Vanilla JS project because the prompt contained React-specific instructions.
**Action:** Always verify the project structure (package.json, build tools) before writing or optimizing prompts. Remove framework-specific jargon if the framework isn't present.
