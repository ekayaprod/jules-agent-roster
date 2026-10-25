# 🐾 Architectural Execution Data Flow

This document flattens the system's chronological execution chains across the `prompts/system/` architecture files into plain text ledgers.

## 1. Auto-Forge Pipeline (Unattended Maintenance Flow)
1. `Scheduled-Auto-Run.md` triggers execution in headless mode without a target override.
2. `Auto-Forge.md` sweeps `prompts/`, `prompts/fusions/`, or `prompts/micro/` and selects a single legacy `.md` target based on the Target Sorting Rule.
3. `Auto-Forge.md` reads `Master-Forge.md` Phase 1: Diagnostic Routing & Extraction and Phase 2: Legacy Intelligence & Drift Analysis to resolve domain, archetype, and classify drift.
4. `Auto-Forge.md` runs `Forge-Procedure.md` Module 6: The Domain Extrapolation Procedure (Pillar Reasoning) and Module 7: The Worker Verification Checklist to evaluate requirements and identify failing work-items against legacy text.
5. `Auto-Forge.md` mutates the target file using the template block from `Creative-Procedure.md`.
6. `Auto-Forge.md` verifies the modified file using `Forge-Procedure.md` Module 7: The Worker Verification Checklist checks.
7. `Auto-Forge.md` executes validation scripts (e.g., `npm run build:roster`) and natively triggers PR creation.

## 2. Auto-Build Pipeline (Fusion Worker Creation Flow)
1. `Auto-Build.md` selects an unassigned fusion combination from `fusion_matrix.json`
2. `Auto-Build.md` reads parent prompt logic in `prompts/`.
3. `Auto-Build.md` consults `Master-Forge.md` and `Forge-Procedure.md` Module 5: The Fusion Engine (Intuitive Synthesis) for synthesis rules.
4. `Auto-Build.md` generates the fusion logic using the structural boundaries defined in `Creative-Procedure.md`.
5. `Auto-Build.md` audits the output via `Forge-Procedure.md` Module 7: The Worker Verification Checklist and repairs any fails.
6. `Auto-Build.md` updates `fusion_matrix.json`, runs `update-orphans.js`, and compiles `roster-payload.json`.
7. `Auto-Build.md` runs dependency installation, test suites (`test`, `test:e2e`), commits, and submits a PR.

## 3. Audit-Procedure Flow (Architecture Regulator Flow)
1. `Audit-Procedure.md` reads all files in the `prompts/system/` directory.
2. `Audit-Procedure.md` sweeps for reference integrity (named modules/steps across files), version lock (`CURRENT_FORGE_VERSION`), obvious numeric mismatches, and literal duplications.
3. `Audit-Procedure.md` collapses mechanical drift by making the smallest possible patch exclusively inside the `prompts/system/` directory.
4. `Audit-Procedure.md` asserts the diff touches zero files outside the `prompts/system/` directory.
5. `Audit-Procedure.md` triggers PR creation containing a precise ledger of fixes and flagged anomalies.
