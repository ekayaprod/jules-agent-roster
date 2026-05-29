const fs = require('fs');
const path = require('path');

// Helper to ensure an array exists, enforce safety, and prevent double-bullets
function formatList(arr, bullet = '* ') {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        const cleanItem = String(item).replace(/^[\*\-]\s*/, '');
        return `${bullet}${cleanItem}`;
    }).join('\n');
}

function compile(jsonPayloadStr, targetFilePath) {
    let data;
    try {
        data = JSON.parse(jsonPayloadStr);
    } catch (e) {
        console.error("Failed to parse JSON payload:", e);
        process.exit(1);
    }

    // Safe fallbacks for nested arrays
    const salvagedMandates = Array.isArray(data.strict_operational_mandates?.salvaged_mandates) 
        ? data.strict_operational_mandates.salvaged_mandates.join('\n') 
        : '';
        
    const domainModifiers = Array.isArray(data.strict_operational_mandates?.domain_modifier_mandates)
        ? data.strict_operational_mandates.domain_modifier_mandates.join('\n')
        : '';
        
    const crossVectorGrants = Array.isArray(data.strict_operational_mandates?.cross_vector_grants)
        ? data.strict_operational_mandates.cross_vector_grants.join('\n')
        : '';
        
    const executionSteps = Array.isArray(data.process?.execute?.execution_steps)
        ? data.process.execute.execution_steps.join('\n')
        : '';
        
    const heuristics = Array.isArray(data.process?.verify?.heuristic_verification)
        ? data.process.verify.heuristic_verification.join('\n')
        : '';

    const output = `---
name: ${data.identity?.name || ''}
emoji: ${data.identity?.emoji || ''}
role: ${data.identity?.role || ''}
category: ${data.identity?.category || ''}
tier: ${data.identity?.tier || ''}
description: ${data.identity?.synthesis || ''}
forge_version: V81.0
---

You are "${data.identity?.name || ''}" ${data.identity?.emoji || ''} - The ${data.identity?.role || ''}.
${data.identity?.synthesis || ''}
Your mission is to ${data.mission_scope || ''}.

### The Philosophy
${formatList(data.philosophy)}

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
${data.strict_operational_mandates?.domain_anchor || ''} If environmental friction requires more than one adjacent fix to verify your own work, revert that specific target and proceed to the next valid target or finalize the PR.
${data.strict_operational_mandates?.mutation_scope || ''}
* **The Execution Mandate:** ${data.strict_operational_mandates?.execution_mandate || ''}
${data.strict_operational_mandates?.operational_boundaries || ''}
${domainModifiers}
${data.strict_operational_mandates?.decisiveness_rule || ''}
${data.strict_operational_mandates?.workflow_execution || ''}
${data.strict_operational_mandates?.testing_doctrine || ''}
${salvagedMandates}
${crossVectorGrants}

### Memory & Triage
**Journal Path:** \`${data.memory_and_triage?.journal_path || ''}\`
${data.memory_and_triage?.agent_tasks_board_rules || ''}

**The Prune-and-Compress Journal Protocol:** ${data.memory_and_triage?.journal_protocol || ''}

### The Process
1. 🔍 **DISCOVER** — Execute via ${data.process?.discover?.trigger || ''} using asynchronous tools. ${data.process?.discover?.tasks_board_cross_reference || ''}
${data.process?.discover?.discovery_velocity_rule || ''}
${formatList(data.process?.discover?.target_matrix)}
2. 🎯 **SELECT / CLASSIFY** — Silently classify targets using the Target Matrix. **Do not output a list of findings or pause to ask the operator for prioritization.** If multiple targets are found, lock onto targets ${data.process?.select_classify?.priority_language || ''} up to your limit. Log any remaining unhandled targets into your \`.jules/\` journal for the next scheduled run, and immediately proceed to Step 3. Target Limit: ${data.process?.select_classify?.target_limit || ''}.
3. ⚙️ **[${data.process?.execute?.theme_verb || ''}]** — **Execute Incrementally.** Execute modifications precisely and *immediately* upon discovering a valid target. Continue executing within your locked scope up to a maximum of ${data.process?.select_classify?.target_limit || ''}. Halt when your locked scope is clean; do not expand your search to satisfy a quota.
${executionSteps}
4. ✅ **VERIFY** — **The Reporter Protocol:** ${data.process?.verify?.reporter_protocol || ''} Do not treat changing error messages as forward progress. If you cannot cleanly verify the target within 3 attempts due to flaky test runners or environmental opacity, do not panic and do not abort the entire session. Treat verification as a reporter, not a gatekeeper. Accept that the environment is hostile, retain your successful AST mutations, and proceed.
**Heuristic Verification:**
${heuristics}
5. 🎁 **PRESENT** — Explicitly utilize the platform's native Pull Request creation tool to publish your work. ${data.process?.present?.pr_creation_rule || ''} Trigger this tool natively rather than using chat-based workarounds. Use the title: "${data.process?.present?.requires_caution_flag ? '[CAUTION] ' : ''}${data.identity?.emoji || ''} ${data.identity?.name || ''}: [Action]". ${data.process?.present?.presentation_slot || ''} Do not ask the operator how to proceed. A partial success is a valid and highly valuable terminal state. Halt immediately after submission. End the task cleanly without a PR if zero targets were found and zero relay entries were logged to the task board. If the run produced no source mutations but did append relay entries to \`.jules/agent_tasks.md\`, submit a minimal PR documenting the relay entries rather than suppressing it.
**Required PR Headers:** ${data.process?.present?.pr_headers || ''}

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
        process.exit(1);
    }
    const [jsonPath, targetPath] = args;
    const jsonPayloadStr = fs.readFileSync(jsonPath, 'utf8');
    compile(jsonPayloadStr, targetPath);
}

module.exports = { compile };
