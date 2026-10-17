const fs = require('fs');

let weaver = fs.readFileSync('prompts/fusions/Weaver.md', 'utf8');

// The version bump to actual CURRENT_FORGE_VERSION string. Master-Forge.md says CURRENT_FORGE_VERSION is "V89.0"
weaver = weaver.replace(/forge_version: V86\.8/, 'forge_version: V89.0');

// No-Interaction Policy
const noInteractionPolicy = `* **No-Interaction Policy:** You are expected to operate autonomously. Unless explicit interaction is required to gather missing credentials or resolve critical ambiguities, you are FORBIDDEN from using the \`request_user_input\` tool to ask for human permission or confirmation to proceed. Trust your tests and your domain checks.`;

// Strict Operational Rules update (merge the rule)
weaver = weaver.replace(/### Strict Operational Rules\n/, `### Strict Operational Rules\n${noInteractionPolicy}\n`);

// Throughput and Velocity updates (Contained Velocity)
const containedDiscovery = `* **The Discovery Short-Circuit:** Stop scanning at the first valid Target Matrix match and execute immediately.`;
const containedPosture = `* Execute precisely and immediately upon target acquisition.`;
const containedMandate = `* Single-target posture: stop scanning at the first valid Target Matrix match and execute immediately. No testing outside the target file, no touching adjacent files, no repository-wide sweeps — enter, execute, exit. Submit PR immediately on completion.`;
const containedReporter = `* Verify in batches — complete all AST mutations before triggering the test runner rather than testing line-by-line. Max 3 verification attempts per target.`;

// Update DISCOVER - append to existing
weaver = weaver.replace(
  /1\. 🔍 \*\*DISCOVER\*\* — an exhaustive, cross-domain scan for duplicated logic containing high cyclomatic complexity \(e\.g\., nested `if\/else` ladders, deeply indented callbacks\) using repo-agnostic discovery tools \(e\.g\., `grep -rn -C 5 "if \(" \.`, `find \. -type f`\)\. Target common source extensions \(e\.g\., `\*\.js`, `\*\.ts`, `\*\.py`, `\*\.go`, `\*\.java`\)\. You must exhaust all subcategories before moving to SELECT\. The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution\./,
  `1. 🔍 **DISCOVER** — an exhaustive, cross-domain scan for duplicated logic containing high cyclomatic complexity (e.g., nested \`if/else\` ladders, deeply indented callbacks) using repo-agnostic discovery tools (e.g., \`grep -rn -C 5 "if (" .\`, \`find . -type f\`). Target common source extensions (e.g., \`*.js\`, \`*.ts\`, \`*.py\`, \`*.go\`, \`*.java\`). You must exhaust all subcategories before moving to SELECT. ${containedDiscovery}`
);

// Update WEAVE - append
weaver = weaver.replace(
  /3\. ⚙️ \*\*WEAVE\*\* — Execute precisely and immediately upon target acquisition\. Stop conditions: halt execution strictly after modifying 1 target limit, or if compilation fails on the newly generated utility file after 3 attempts\./,
  `3. ⚙️ **WEAVE** — ${containedPosture} ${containedMandate} Stop conditions: halt execution strictly after modifying 1 target limit, or if compilation fails on the newly generated utility file after 3 attempts.`
);

// Update VERIFY - append
weaver = weaver.replace(
  /4\. ✅ \*\*VERIFY\*\* — \*\*The Reporter Protocol:\*\* Verify your mutations in batches\. Complete all AST mutations within your locked scope before triggering your test runner\. Do not waste tool calls testing line-by-line\. You have a maximum of 3 verification attempts per target\./,
  `4. ✅ **VERIFY** — **The Reporter Protocol:** ${containedReporter}\n**Testing Doctrine:** * Treat test files as immutable and read-only. If a mutation breaks a test, preserve the test unaltered. Either prove the test was failing on \`main\`, or conditionally inherit the abort/proceed logic of the assigned Throughput Definition.`
);

// Update SELECT / CLASSIFY - use exact wording from Template
weaver = weaver.replace(
  /2\. 🎯 \*\*SELECT \/ CLASSIFY\*\* — Silently classify targets using the Target Matrix\. Do not output a list of findings or pause to ask the operator for prioritization\. If multiple targets are found, lock onto targets arbitrarily up to your limit\. Log any remaining unhandled targets into your \.jules\/ journal for the next scheduled run, and immediately proceed to the WEAVE step\. Target Limit: 1\./,
  `2. 🎯 **SELECT / CLASSIFY** — Matrix items are heuristics, not strict checklists. Silently match domain intent. Execute findings silently and continuously. Lock onto targets arbitrarily up to your limit. Log unhandled targets into your journal, but require a modified target to submit a PR. Journals exist exclusively to record critical architectural context for future runs, excluding execution history or non-important details. Target Limit: 1.`
);

fs.writeFileSync('prompts/fusions/Weaver.md', weaver, 'utf8');
