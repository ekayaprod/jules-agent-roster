[Output truncated for brevity]

## 2024-05-24 - 🌌 Singularity - [Strict Markdown-JSON Alignment Required]
**Learning:** The project mandates an absolute 1:1 synchronization between the dynamic agent JSON registries (`agents.json` / `custom_agents.json`) and the static `.md` source files in the `prompts/` directory. Roles extracted from markdown headers (e.g., `You are "[Name]" [emoji] - The [Role].`) must perfectly match the corresponding JSON objects.
**Action:** Spawn agents designed to autonomously scan, extract, and apply these specific markdown structures to maintain a truthful, self-healing registry without relying on heavy external schema validation tools.

## 2025-10-24 - ⬜ Minimalist - [Visual Bloat Purged: .picker-search CSS classes]
**Learning:** Found orphaned CSS classes (`.picker-search` and `.picker-search input[type="text"]`) in `js/Features/Fusion/Fusion.css`. The related HTML DOM elements had been removed or refactored previously, leaving behind dead visual weight in the stylesheet.
**Action:** Safely deleted the dead CSS rules to shrink the stylesheet. Always use tools like `purgecss` combined with manual or automated `grep` validation across the codebase to ensure the classes are genuinely unused before removing them.