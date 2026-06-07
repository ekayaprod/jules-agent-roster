const fs = require('fs');
const path = require('path');

// Generic helper for standard lists
function formatList(arr, bullet = '* ') {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        const cleanItem = String(item).replace(/^[\*\-]\s*/, '');
        return `${bullet}${cleanItem}`;
    }).join('\n');
}

// Specialized formatter for Philosophy to aggressively strip bolded mandate labels
function formatPhilosophy(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s*/, '');
        // Universally strip the bold label (e.g. "**Label:** ") regardless of preceding emojis
        cleanItem = cleanItem.replace(/\*\*[^\*]+\*\*:\s*/, '');
        return `* ${cleanItem}`;
    }).join('\n');
}

// Resilient slot formatter: strips any existing labels/bullets and prepends the correct label
function formatSlot(rawText, label) {
    if (!rawText) return '';
    // Strip bullets
    let cleanText = String(rawText).replace(/^[\*\-]\s*/, '');
    // Strip bold labels like "**The Label:** " or "**Label:** "
    cleanText = cleanText.replace(/^\*\*[^\*]+\*\*:?\s*/, '').replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '');
    return `* **${label}:** ${cleanText}`;
}

// Specialized formatter for Target Matrix to enforce '* **Category:** ' syntax
function formatTargetMatrix(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).trim();
        // Match variations of broken bullets and asterisks before a colon
        const match = cleanItem.match(/^[\*\-\s]*(?:\*\*?)?([^\*:]+)(?:\*\*?)?:\s*(.*)/);
        if (match) {
            const category = match[1].trim();
            // Strip any hallucinated markdown bolding/bullets from the start of the description
            const description = match[2].trim().replace(/^[\*\-\s]+/, '');
            return `* **${category}:** ${description}`;
        }
        cleanItem = cleanItem.replace(/^[\*\-]\s*/, '');
        return `* ${cleanItem}`;
    }).join('\n');
}

// Specialized formatter to fix broken bolding in Heuristics
function formatHeuristics(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s*/, '');
        cleanItem = cleanItem.replace(/^\*([^\*:]+)\*\*:/, '**$1**:');
        return `* ${cleanItem}`;
    }).join('\n');
}

function compile(jsonPayloadStr, targetFilePath) {
    let data;
    try {
        data = JSON.parse(jsonPayloadStr);
    } catch (e) {
        throw new Error(`Failed to parse JSON payload: ${e.message}`);
    }

    // --- DETERMINISTIC COMPILER LOGIC ---
    
    const archetype = data.archetype || '';
    const category = data.identity?.category || '';
    const velocity = data.velocity || 'Contained';
    const payloadThreshold = data.payload_threshold || data.process?.select_classify?.target_limit || '1';
    const tier = data.identity?.tier || '';
    const isStructural = data.verification_layer === 'structural';
    const requiresTasksBoard = ['Pruner', 'Refactorer', 'Transformer', 'Instrumenter', 'Operator'].includes(archetype);

    // 1. Testing Doctrine
    const testingDoctrine = category.toLowerCase() === 'testing'
        ? "* **The Test Automation Mandate:** Mutate test files exclusively; treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`)."
        : "* **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.";

    // 2. Velocity & Execution Mandate
    let executionMandate = '';
    let discoveryVelocityRule = '';
    let executionPosture = '';
    let reporterProtocol = '';
    let prCreationRule = '';

    if (velocity === 'Contained') {
        executionMandate = "Your discovery posture is single-target. The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution. You are strictly forbidden from: running tests outside the immediate target file, updating adjacent scripts or configuration files not directly required by your change, performing repository-wide sweeps to find additional targets, or executing any verification step not directly caused by your specific mutation. Scope tunnel enforced: enter, execute, exit. Submit your PR the moment your single target is complete.";
        discoveryVelocityRule = "**The Discovery Short-Circuit:** The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution.";
        executionPosture = "Execute precisely and immediately upon target acquisition.";
        reporterProtocol = "Verify your mutations in batches. Complete all AST mutations within your locked scope before triggering your test runner. Do not waste tool calls testing line-by-line. You have a maximum of 3 verification attempts per target.";
        prCreationRule = "Do not burn tool calls running `git diff` or `git status` right before submission. The PR UI automatically attaches diffs. Rely purely on your working memory to draft the PR description.";
    } else if (velocity === 'Batch') {
        executionMandate = `Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly ${payloadThreshold} targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.`;
        discoveryVelocityRule = "**The Bounded Sweep:** You are authorized to scan and lock onto targets strictly until your Quota is met, at which point you must immediately abort all further scanning and proceed to execution.";
        executionPosture = "Execute in bounded sequence, tracking your mutation count against your declared quota ceiling.";
        reporterProtocol = "Verify your mutations in bounded batches. You have a maximum of 3 verification attempts per target. Halt execution upon reaching your declared quota ceiling.";
        prCreationRule = "Do not burn tool calls running `git diff` or `git status` right before submission. The PR UI automatically attaches diffs. Rely purely on your working memory to draft the PR description.";
    } else {
        executionMandate = "Your discovery posture is full-sweep. You are authorized to map all matching targets before or during execution. Your work is inherently deep and will approach or cross the host platform's ~100 tool call intervention threshold — this is expected, not a failure. Manage your execution envelope across three layers:\n1. **Proactive Touchpoints:** If a genuine blocker or decision point arises before 75 calls, surface it to the operator immediately. Never fabricate a question to bank a reset.\n2. **Wrap-Up Checkpoints:** At the end of DISCOVER and after each logical cluster of mutations, evaluate whether your current payload represents a coherent, submittable unit of work. If yes, submit now rather than risk an unproductive mid-task interruption.\n3. **Managed Interruption:** If the host platform forcibly pauses you, make it worth it. Provide a sterile, high-density summary of your staged work, state your exact next planned action, and conclude with: *'Awaiting operator clearance to resume.'* Resume instantly once cleared.";
        discoveryVelocityRule = "**The Deep Map:** You are authorized to execute extensive read-only loops to thoroughly map complex dependencies before mutating, but you strictly confine your search to the targeted module.";
        executionPosture = "Execute Incrementally.";
        reporterProtocol = "Verify your mutations incrementally. You may test sequentially due to the complexity of your domain, but you have a maximum of 3 verification attempts per target.";
        prCreationRule = "";
    }

    // Adjust reporter protocol if verification layer is purely structural
    if (isStructural) {
        reporterProtocol = reporterProtocol.replace(/triggering your test runner/g, 'executing your heuristic checks');
        reporterProtocol = reporterProtocol.replace(/testing line-by-line/g, 'running heuristics line-by-line');
        reporterProtocol = reporterProtocol.replace(/test sequentially/g, 'verify sequentially');
    }

    // 3. Journal & Tasks Board
    const journalPath = tier.toLowerCase() === 'core' ? `.jules/${data.identity?.name || 'journal'}.md` : `.jules/journal_${category.toLowerCase()}.md`;
    const agentTasksBoardRules = requiresTasksBoard ? "* **The Agent Tasks Board (`.jules/agent_tasks.md`):** Read this file (if it exists). The instructions for interacting with the board are encoded directly within the file itself." : '';
    const tasksBoardCrossReference = requiresTasksBoard ? "Read `.jules/agent_tasks.md`, then perform your discover phase." : '';

    // --- ARRAY FORMATTING ---
    const salvagedMandates = formatList(data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates);
    const domainModifiers = formatList(data.strict_operational_mandates?.domain_modifier_mandates || data.domain_modifier_mandates);
    const crossVectorGrants = formatList(data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants);
    const executionSteps = formatList(data.process?.execute?.execution_steps || data.process?.execution_steps);
    const heuristics = formatHeuristics(data.process?.verify?.heuristic_verification || data.process?.heuristic_verification);
    
    // Handle Target Limit / Payload Threshold logic cleanly
    const ignoreLimits = ['open', 'n/a', 'none', 'null', 'expansive', 'all'];
    const targetLimitClean = String(payloadThreshold).trim();
    const targetLimitInstruction = (targetLimitClean && targetLimitClean !== '1' && !ignoreLimits.includes(targetLimitClean.toLowerCase())) 
        ? `Continue executing within your locked scope up to a maximum of ${targetLimitClean}. ` 
        : '';

    const zeroTargetExitInstruction = (data.process?.present?.requires_total_replacement_override || data.requires_total_replacement_override || data.total_replacement_active)
        ? '' 
        : 'End the task cleanly without a PR if zero targets were found and zero relay entries were logged to the task board. ';

    // Clean Presentation Slot by stripping bold labels (e.g. "* **The Label:**")
    const rawPresentation = data.process?.present?.presentation_slot || data.archetype_slots?.presentation_slot || '';
    const presentationSlotClean = String(rawPresentation).replace(/^[\*\-]\s*/, '').replace(/^\*\*[^\*]+\*\*:?\s*/, '').replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '');
    
    // Strip trailing periods from Mission Scope
    const missionScopeClean = String(data.mission_scope || '').replace(/\.+$/, '');

    // Use arbitrary unless priority language is explicitly stated
    const priorityLanguage = data.process?.select_classify?.priority_language || data.priority_language || 'arbitrarily';

    // Fix grammatical clash for Discovery Trigger by omitting "via"
    const discoverTrigger = data.process?.discover?.trigger || data.process?.discover_trigger || '';

    // --- TEMPLATE INTERPOLATION ---
    const output = `---
name: ${data.identity?.name || ''}
emoji: ${data.identity?.emoji || ''}
role: ${data.identity?.role || ''}
category: ${data.identity?.category || ''}
tier: ${data.identity?.tier || ''}
description: ${data.identity?.synthesis || ''}
forge_version: ${data.identity?.forge_version || 'V82.0'}
---

You are "${data.identity?.name || ''}" ${data.identity?.emoji || ''} - The ${data.identity?.role || ''}.
${data.identity?.synthesis || ''}
Your mission is to ${missionScopeClean}.

### The Philosophy
${formatPhilosophy(data.philosophy)}

### Coding Standards
* ✅ **Good Code:**
~~~${data.coding_standards?.language || ''}
${data.coding_standards?.good_code_snippet || ''}
~~~
* ❌ **Bad Code:**
~~~${data.coding_standards?.language || ''}
${data.coding_standards?.bad_code_snippet || ''}
~~~

### Strict Operational Mandates
${formatSlot(data.archetype_slots?.domain_anchor || data.strict_operational_mandates?.domain_anchor || '', 'The Domain Anchor')} If environmental friction requires more than one adjacent fix to verify your own work, revert that specific target and proceed to the next valid target or finalize the PR.
${formatSlot(data.archetype_slots?.mutation_scope || data.strict_operational_mandates?.mutation_scope || '', 'The Scope')}
* **The Execution Mandate:** ${executionMandate}
${formatSlot(data.archetype_slots?.operational_boundaries || data.strict_operational_mandates?.operational_boundaries || '', 'The Resilience Protocol')}
${domainModifiers}
${formatSlot(data.archetype_slots?.decisiveness_rule || data.strict_operational_mandates?.decisiveness_rule || '', 'The Decisiveness')}
${formatSlot(data.archetype_slots?.workflow_execution || data.strict_operational_mandates?.workflow_execution || '', 'The Execution')}
${testingDoctrine ? formatSlot(testingDoctrine, 'The Verification Protocol') : ''}
${salvagedMandates}
${crossVectorGrants}

### Memory & Triage
**Journal Path:** \`${journalPath}\`
${agentTasksBoardRules}

${formatSlot(data.archetype_slots?.journal_protocol || data.memory_and_triage?.journal_protocol || '', 'The Journal Protocol').replace(/^\*\s/, '')}

### The Process
1. 🔍 **DISCOVER** — Execute ${discoverTrigger} using asynchronous tools. ${tasksBoardCrossReference}
${discoveryVelocityRule}
${formatTargetMatrix(data.process?.target_matrix || data.process?.discover?.target_matrix)}
2. 🎯 **SELECT / CLASSIFY** — Silently classify targets using the Target Matrix. **Do not output a list of findings or pause to ask the operator for prioritization.** If multiple targets are found, lock onto targets ${priorityLanguage} up to your limit. Log any remaining unhandled targets into your \`.jules/\` journal for the next scheduled run, and immediately proceed to Step 3. Target Limit: ${targetLimitClean}.
3. ⚙️ **[${data.process?.theme_verb || data.process?.execute?.theme_verb || ''}]** — **${executionPosture}** ${targetLimitInstruction}Halt when your locked scope is clean; do not expand your search to satisfy a quota.
${executionSteps}
4. ✅ **VERIFY** — **The Reporter Protocol:** ${reporterProtocol} Do not treat changing error messages as forward progress. If you cannot cleanly verify the target within 3 attempts due to flaky test runners or environmental opacity, do not panic and do not abort the entire session. Treat verification as a reporter, not a gatekeeper. Accept that the environment is hostile, retain your successful AST mutations, and proceed.
**Heuristic Verification:**
${heuristics}
5. 🎁 **PRESENT** — Explicitly utilize the platform's native Pull Request creation tool to publish your work. ${prCreationRule} Trigger this tool natively rather than using chat-based workarounds. Use the title: "${data.requires_caution_flag || data.process?.present?.requires_caution_flag ? '[CAUTION] ' : ''}${data.identity?.emoji || ''} ${data.identity?.name || ''}: [Action]". ${presentationSlotClean} Do not ask the operator how to proceed. A partial success is a valid and highly valuable terminal state. Halt immediately after submission. ${zeroTargetExitInstruction}If the run produced no source mutations but did append relay entries to \`.jules/agent_tasks.md\`, submit a minimal PR documenting the relay entries rather than suppressing it.
**Required PR Headers:** ${data.archetype_slots?.pr_headers || data.process?.present?.pr_headers || ''}

### Favorite Optimizations
${formatList(data.favorite_optimizations)}
`;

    // Filter out completely empty lines caused by empty variables/arrays
    const cleanedOutput = output.split('\n').filter(line => line.trim() !== '' || line === '').join('\n').replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(targetFilePath, cleanedOutput);
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error("Usage: node compile_json.js <jsonPath> <targetPath>");
        process.exit(1);
    }
    const [jsonPath, targetPath] = args;
    try {
        const jsonPayloadStr = fs.readFileSync(jsonPath, 'utf8');
        compile(jsonPayloadStr, targetPath);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}

module.exports = { compile };
