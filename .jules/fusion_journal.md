## Vector — The Absolute Trajectory
**Learning:** Chained array methods (`.filter().map()`) cause excessive garbage collection and redundant iterations.
**Action:** FUSE the abstractions into a Single-Pass Pipeline utilizing a direct `for` loop to prevent overhead.

## Canvas — The Unified Surface
**Learning:** `RosterApp.js` uses `IntersectionObserver` and virtualized clusters (`Clusterize.js`) for seamless intra-page navigation.
**Action:** Avoid artificially refactoring robust SPA shells that already natively support context-retention without disjointed routing.

## Prompt Engineer — The Persona & Tone
**Learning:** The dynamic template in `FusionCompiler.js` lacked strict output rules and conflict resolution mechanisms, relying on vague ("obey strict boundaries") instructions that invite AI hallucinations when fusing conflicting personas.
**Action:** Enforce strict negative constraints ("CRITICAL: You must output ONLY a valid, parsable JSON object... Any markdown formatting, apologies, or additional text will cause a fatal system failure.") and explicit conflict resolution ("default to the most restrictive, non-destructive safety constraint") to tightly bind the LLM's payload execution.
