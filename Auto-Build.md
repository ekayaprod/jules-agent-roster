# Autonomously Build a Fusion Worker

**Use this prompt when initiating a new agent session to build a Fusion worker.**

I want you to autonomously build a new Fusion worker to fill an empty slot in the roster. Make all the decisions yourself.

Please complete the following steps from start to finish without pausing for input:

1. **Selection & Research:** Check `prompts/orphans/emptyslots.md` and `fusion_matrix.json` for an unassigned fusion combination. Pick one. Then, read the two corresponding parent `.md` files in the root `prompts/` directory to deeply understand their mechanics and philosophies so you can design a coherent synthesis.
2. **Author the Worker:** Read the rules in `prompts/system/Master-Forge.md` and `prompts/system/Forge-Procedure.md`. Then, use the exact `<!-- WORKER_TEMPLATE_START -->` block found inside `prompts/system/Creative-Procedure.md` to hand-author your new worker's markdown file in `prompts/fusions/`. Ensure you include the mandatory Fusion Conflict Resolution rule in the strict operational rules section.
3. **Update the Ecosystem:**
   - Update `fusion_matrix.json` to map the parent combination to your new worker's name.
   - Run `node scripts/update-orphans.js` to clear the slot from the tracking file.
   - Run `npm run build:roster` to compile the frontend `roster-payload.json` artifact.
4. **Verify and Submit:** Run `npm install` and `npx playwright install --with-deps`, then run the test suites (`npm run test` and `npm run test:e2e`). Follow standard pre-commit instructions, ensure all changes are committed, and submit the PR.
