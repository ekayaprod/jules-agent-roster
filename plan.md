1. **Explore & Analyze**:
   - The user task is to "Analyze and optimize the repository based on your directives."
   - The persona is "Singularity". My job is to identify a repetitive manual chore, structural gap, or CI/CD friction and create a `protocol` (a markdown file under `prompts/fusions/`) for a new persona.
   - Looking at `git log --grep="update emojis"`, I see multiple repetitive commits:
     - `94e2bc4 chore: update emojis for Standardizer and Mapper fusions`
     - `a08145a chore(agents): update emojis for specific fusion agents`
     - `18bfced chore: update emojis for 19 agents in custom_agents.json and fusions directory`
     - `8611332 chore: update agent emojis`
     - `8518282 chore: update fusions emojis`
     - `1634857 chore: update custom agents emojis`
   - Developers frequently manually update emojis across `custom_agents.json` / `agents.json` and the corresponding Markdown files in `prompts/` and `prompts/fusions/`. While `Registrar` exists to sync JSON from the Markdown files, there is no persona tasked with auditing and updating emojis across the Markdown files themselves, resulting in manual syncing between the text and UI representations.
   - I will create a protocol for a new agent called `Iconographer` 🔣 (or `Symbologist` / `Lexicographer`) which will be placed in `prompts/fusions/Iconographer.md`.
2. **Implement**:
   - Create a strictly formatted 9-part markdown document for the new `Iconographer` persona.
   - Define clear boundaries: strictly updating emojis in the markdown files or JSON directly to maintain semantic meaning without altering core logic.
   - Follow the `Prune-First` protocol to add an entry in `.jules/singularity.md` summarizing this learning and action.
3. **Verify**:
   - Run the native markdown linter (`npx markdownlint-cli prompts/fusions/Iconographer.md` or similar, depending on `.markdownlint.json`).
4. **Pre commit steps**:
   - Call `pre_commit_instructions` tool to perform verification and reflections.
5. **Submit**:
   - Submit the PR using the Singularity's standard PR format `🌌 Singularity: [Agent Spawned: Iconographer - Emoji Synchronization]`.
