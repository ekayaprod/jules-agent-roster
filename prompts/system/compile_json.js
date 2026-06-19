'use strict';
const fs = require('fs');

/**
 * COMPILER ARCHITECTURE NOTES:
 * - Dumb Formatter execution paradigm.
 * - Validation and domain mechanics are delegated entirely to the configuration generator.
 * - Strictly maps JSON payload values to {{TOKENS}} in the provided Markdown template.
 */

function formatList(arr, bullet = '* ') {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => `${bullet}${String(item).replace(/^[\*\-]\s+/, '')}`).join('\n');
}

function formatExecutionSteps(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
        cleanItem = cleanItem.replace(/^([a-zA-Z0-9_ \-]+)(?:\*\*|:\*\*|\*\*:\s*|\*:\s*)(.*)$/, '**$1:** $2');
        cleanItem = cleanItem.replace(/^\*([^\*]+)\*\*:?\s*/, '**$1:** ');
        return `* ${cleanItem}`;
    }).join('\n');
}

function formatPhilosophy(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => `* ${String(item).replace(/^[\*\-]\s+/, '').replace(/\*\*[^\*]+\*\*:\s*/, '')}`).join('\n');
}

function formatSlot(rawText, label) {
    if (!rawText) return '';
    let cleanText = String(rawText).replace(/^[\*\-]\s*/, '')
        .replace(/^\*\*[^\*]+\*\*:?\s*/, '')
        .replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '')
        .replace(/^\s*\*\*\s*/, '')
        .replace(/\*\*\s*$/, '').trim();
    return `* **${label}:** ${cleanText}`;
}

function formatTargetMatrix(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).trim();
        const match = cleanItem.match(/^[\*\-\s]*(?:\*\*?)?([^\*:]+)(?:\*\*?)?:\s*(.*)/);
        if (match) return `* **${match[1].trim()}:** ${match[2].trim().replace(/^[\*\-\s]+/, '')}`;
        return `* ${cleanItem.replace(/^[\*\-]\s*/, '')}`;
    }).join('\n');
}

function formatHeuristics(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '').replace(/^\*([^\*:]+)\*\*:/, '**$1**:');
        cleanItem = cleanItem.replace(/^([a-zA-Z0-9_ \-]+):\s*(?![\*])(.*)$/, (match, p1, p2) => {
            const label = p1.trim();
            const suffix = label.toLowerCase().endsWith('check') ? '' : ' Check';
            return `**${label}${suffix}:** ${p2.trim()}`;
        });
        return `* ${cleanItem}`;
    }).join('\n');
}

function cleanCodeFence(str) {
    if (!str) return '';
    return String(str).replace(/^\s*```[a-zA-Z0-9]*\r?\n/gm, '').replace(/\r?\n\s*```\s*$/gm, '');
}

function getExecutionVelocityRules(velocity, payloadThreshold, isStructural, category) {
    let executionMandate = '';
    let discoveryVelocityRule = '';
    let executionPosture = '';
    let reporterProcedure = '';

    if (velocity === 'Contained') {
        executionMandate = "Your discovery posture is single-target. The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution. Scope restrictions: running tests outside the immediate target file, updating adjacent scripts or configuration files not directly required by your change, performing repository-wide sweeps to find additional targets, or executing any verification step not directly caused by your specific mutation. Scope tunnel enforced: enter, execute, exit. Submit your PR the moment your single target is complete.";
        discoveryVelocityRule = "**The Discovery Short-Circuit:** The moment you identify one valid match from your Target Matrix, immediately abort all further scanning and proceed to execution.";
        executionPosture = "Execute precisely and immediately upon target acquisition.";
        reporterProcedure = "Verify your mutations in batches. Complete all AST mutations within your locked scope before triggering your test runner. Do not waste tool calls testing line-by-line. You have a maximum of 3 verification attempts per target.";
    } else if (velocity === 'Batch') {
        executionMandate = `Your discovery posture is bounded-sweep. You are authorized to traverse the repository to locate targets but must abort execution the moment you have mutated exactly ${payloadThreshold} targets. Do not exceed the declared quota. Submit your PR immediately upon reaching the mutation ceiling.`;
        discoveryVelocityRule = "**The Bounded Sweep:** You may scan and lock onto targets strictly until your Quota is met, at which point You must immediately abort all further scanning and proceed to execution.";
        executionPosture = "Execute in bounded sequence, tracking your mutation count against your declared quota ceiling.";
        reporterProcedure = "Verify your mutations in bounded batches. You have a maximum of 3 verification attempts per target. Halt execution upon reaching your declared quota ceiling.";
    } else {
        executionMandate = "Your discovery posture is full-sweep. You are authorized to map all matching targets before or during execution. Your work is inherently deep and will approach or cross the host platform's ~100 tool call intervention threshold — this is expected, not a failure. Manage your execution envelope across three layers:\n1. **Proactive Touchpoints:** If a genuine blocker or decision point arises before 75 calls, surface it to the operator immediately. Never fabricate a question to bank a reset.\n2. **Wrap-Up Checkpoints:** At the end of DISCOVER and after each logical cluster of mutations, evaluate whether your current payload represents a coherent, submittable unit of work. If yes, submit now rather than risk an unproductive mid-task interruption.\n3. **Managed Interruption:** If the host platform forcibly pauses you, make it worth it. Provide a sterile, high-density summary of your staged work, state your exact next planned action, and conclude with: *'Awaiting operator clearance to resume.'* Resume instantly once cleared.";
        discoveryVelocityRule = "**The Deep Map:** You are authorized to execute extensive read-only loops to thoroughly map complex dependencies before mutating, but you strictly confine your search to the targeted module.";
        executionPosture = "Execute Incrementally.";
        reporterProcedure = "Verify your mutations incrementally. You may test sequentially due to the complexity of your domain, but you have a maximum of 3 verification attempts per target. Do not treat changing error messages as forward progress. If you cannot cleanly verify the target within 3 attempts due to flaky test runners or environmental opacity, do not panic and do not abort the entire session. Treat verification as a reporter, not a gatekeeper. Accept that the environment is hostile, retain your successful AST mutations, and proceed.";
    }

    if (isStructural) {
        reporterProcedure = reporterProcedure.replace(/triggering your test runner/g, 'executing your heuristic checks')
            .replace(/testing line-by-line/g, 'running heuristics line-by-line')
            .replace(/test sequentially/g, 'verify sequentially');
    }

    const testingDoctrine = category.toLowerCase() === 'testing'
        ? "* **The Test Automation Rule:** Mutate test files exclusively; Treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`)."
        : "* **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.";

    return { executionMandate, discoveryVelocityRule, executionPosture, reporterProcedure, testingDoctrine };
}

function compile(jsonPayloadStr, templateStr, targetFilePath) {
    let data;
    try {
        data = JSON.parse(typeof jsonPayloadStr === 'string' ? jsonPayloadStr.trim() : '');
    } catch (e) {
        throw new Error(`[FATAL ERROR] JSON Structural Integrity Failure: ${e.message}`);
    }

    const archetype = data.archetype || data.identity?.archetype || '';
    const category = data.identity?.category || '';
    const velocity = data.throughput || data.velocity || 'Contained';
    const payloadThreshold = data.payload_threshold || data.process?.select_classify?.target_limit || '1';
    const isStructural = data.verification_layer === 'structural';
    const requiresTasksBoard = ['Pruner', 'Refactorer', 'Transformer', 'Instrumenter', 'Operator'].includes(archetype);

    const { executionMandate, discoveryVelocityRule, executionPosture, reporterProcedure, testingDoctrine } = getExecutionVelocityRules(velocity, payloadThreshold, isStructural, category);

    const ignoreLimits = ['open', 'n/a', 'none', 'null', 'expansive', 'all'];
    const targetLimitClean = String(payloadThreshold).trim();
    const targetLimitInstruction = (targetLimitClean && targetLimitClean !== '1' && !ignoreLimits.includes(targetLimitClean.toLowerCase())) 
        ? `Continue executing within your locked scope up to a maximum of ${targetLimitClean}. ` : '';

    const zeroTargetExitInstruction = data.process?.present?.requires_total_replacement_override 
        ? '' : (requiresTasksBoard ? 'End the task cleanly without a PR if zero targets were found and zero relay entries were logged to the task board. ' : 'End the task cleanly without a PR if zero targets were found. ');

    const map = {
        'NAME': data.identity?.name || '',
        'EMOJI': data.identity?.emoji || '',
        'ROLE': data.identity?.role || '',
        'CATEGORY': category,
        'TIER': data.identity?.tier || '',
        'SYNTHESIS': data.identity?.synthesis || '',
        'FORGE_VERSION': data.identity?.forge_version || 'V82.0',
        'MISSION_SCOPE': String(data.mission_scope || '').replace(/\.+$/, '').replace(/^to\s+/i, ''),
        'PHILOSOPHY': formatPhilosophy(data.philosophy),
        'LANGUAGE': data.coding_standards?.language || '',
        'GOOD_CODE': cleanCodeFence(data.coding_standards?.good_code_snippet),
        'BAD_CODE': cleanCodeFence(data.coding_standards?.bad_code_snippet),
        'PRIMARY_RESPONSIBILITY': formatSlot(data.archetype_slots?.domain_anchor || data.strict_operational_mandates?.domain_anchor, "The Primary Responsibility"),
        'THE_SCOPE': formatSlot(data.archetype_slots?.mutation_scope || data.strict_operational_mandates?.mutation_scope, "The Scope"),
        'EXECUTION_RULE': executionMandate,
        'RESILIENCE_PROCEDURE': formatSlot(data.archetype_slots?.operational_boundaries || data.strict_operational_mandates?.operational_boundaries, "The Resilience Procedure"),
        'DOMAIN_MODIFIERS': formatList(data.strict_operational_mandates?.domain_modifier_mandates || data.domain_modifier_mandates),
        'AUTONOMOUS_SELECTION': formatSlot(data.archetype_slots?.decisiveness_rule || data.strict_operational_mandates?.decisiveness_rule, 'The Autonomous Selection'),
        'WORKFLOW_EXECUTION': formatSlot(data.archetype_slots?.workflow_execution || data.strict_operational_mandates?.workflow_execution, 'The Execution'),
        'VERIFICATION_PROCEDURE': formatSlot(testingDoctrine, 'The Verification Procedure'),
        'SALVAGED_MANDATES': formatList(data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates),
        'ZERO_INTERACTION_MANDATES': formatList(data.zero_interaction_mandates),
        'SALVAGED_CUSTOM_LOGIC': formatList(data.salvaged_custom_logic),
        'CROSS_VECTOR_GRANTS': formatList(data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants),
        'JOURNAL_PATH': (data.identity?.tier || '').toLowerCase() === 'core' ? `.jules/${data.identity?.name || 'journal'}.md` : `.jules/journal_${category.toLowerCase()}.md`,
        'WORKER_TASKS_BOARD': requiresTasksBoard ? "* **The Worker Tasks Board (`.jules/worker_tasks.md`):** Read this file (if it exists). The instructions for interacting with the board are encoded directly within the file itself." : '',
        'JOURNAL_PROCEDURE': formatSlot(data.archetype_slots?.journal_procedure || data.memory_and_triage?.journal_procedure, 'The Journal Procedure').replace(/^\*\s/, ''),
        'DISCOVER_TRIGGER': String(data.process?.discover?.trigger || data.process?.discover_trigger || '').replace(/^via\s+/i, ''),
        'TASKS_BOARD_CROSS_REFERENCE': requiresTasksBoard ? "Cross-reference `.jules/worker_tasks.md` before initiating your scan. If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan." : '',
        'DISCOVERY_VELOCITY_RULE': discoveryVelocityRule,
        'TARGET_MATRIX': formatTargetMatrix(data.process?.target_matrix || data.process?.discover?.target_matrix),
        'PRIORITY_LANGUAGE': data.process?.select_classify?.priority_language || data.priority_language || 'arbitrarily',
        'TARGET_LIMIT': targetLimitClean,
        'THEME_VERB': data.process?.theme_verb || data.process?.execute?.theme_verb || 'EXECUTE',
        'EXECUTION_POSTURE': executionPosture,
        'TARGET_LIMIT_INSTRUCTION': targetLimitInstruction,
        'EXECUTION_STEPS': formatExecutionSteps(data.process?.execute?.execution_steps || data.process?.execution_steps),
        'REPORTER_PROCEDURE': reporterProcedure,
        'HEURISTICS': formatHeuristics(data.process?.verify?.heuristic_verification || data.process?.heuristic_verification),
        'PRESENTATION_SLOT': String(data.process?.present?.presentation_slot || data.archetype_slots?.presentation_slot || '').replace(/^[\*\-]\s*/, '').replace(/^\*\*[^\*]+\*\*:?\s*/, '').replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '').replace(/End the task cleanly without a PR if zero targets were found\.?/gi, '').trim(),
        'ZERO_TARGET_EXIT': zeroTargetExitInstruction + (requiresTasksBoard ? "If the run produced no source mutations but did append relay entries to `.jules/worker_tasks.md`, submit a minimal PR documenting the relay entries rather than suppressing it." : ""),
        'PR_HEADERS': data.archetype_slots?.pr_headers || data.process?.present?.pr_headers || '',
        'FAVORITE_OPTIMIZATIONS': formatList(data.favorite_optimizations)
    };

    let output = templateStr;
    for (const [key, value] of Object.entries(map)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        output = output.replace(regex, value || '');
    }

    const cleanedOutput = output.split('\n').filter(line => line.trim() !== '' || line === '').join('\n').replace(/\n{3,}/g, '\n\n');

    if (targetFilePath && targetFilePath.trim() !== '') {
        fs.writeFileSync(targetFilePath, cleanedOutput);
    } else {
        console.log(cleanedOutput);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: node compile_json.js <jsonPath|-|/dev/stdin> <templatePath> [targetPath]");
        process.exit(1);
    }

    const source = args[0];
    const templatePath = args[1];
    const targetPath = args[2] || '';

    try {
        const jsonPayloadStr = (source === '-' || source === '/dev/stdin') ? fs.readFileSync(0, 'utf-8') : fs.readFileSync(source, 'utf8');
        const templateStr = fs.readFileSync(templatePath, 'utf8');
        compile(jsonPayloadStr, templateStr, targetPath);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}

module.exports = { compile };
