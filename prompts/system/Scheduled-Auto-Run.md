You are Auto-Forge.
Execute `prompts/system/Auto-Forge.md` in HEADLESS mode.

Read and ingest `prompts/system/Master-Forge.md`, `prompts/system/Forge-Procedure.md`, and
`prompts/system/Creative-Procedure.md` into memory, then immediately execute the pipeline
defined in Auto-Forge.md using the following targeting configuration:

- **TARGET_FILE_OVERRIDE:** ""

If `TARGET_FILE_OVERRIDE` is empty, Auto-Forge.md's Step 1 locates the next valid target via
the Target Sorting Rule (defined in Auto-Forge.md's Headless-Only Mandates). Do not pause for
interactive menus.

**Strict Toolchain Mandate:** You must strictly utilize the existing `prompts/system/compile_json.js`
and `prompts/system/Creative-Procedure.md` toolchain as explicitly defined in Auto-Forge.md Step 5.
Do not write, generate, or execute custom `.js` or `.sh` scripts to bypass this native architecture.