'use strict';
const fs = require('fs');

/**
 * COMPILER ARCHITECTURE NOTES:
 * - Hybrid Formatter & QA Gate execution paradigm.
 * - Validates core schema limits natively. Throws fatal exceptions on structural violations.
 * - Maps JSON payload values to {{TOKENS}} in the provided Markdown template.
 * - Relies entirely on the generator LLM for physics injection and payload sizing.
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

function formatTargetMatrix(arr, tier) {
    if (!Array.isArray(arr)) return '';
    
    const formattedList = arr.map(item => {
        let cleanItem = String(item).trim();
        const match = cleanItem.match(/^[\*\-\s]*(?:\*\*?)?([^\*:]+)(?:\*\*?)?:\s*(.*)/);
        if (match) return `* **${match[1].trim()}:** ${match[2].trim().replace(/^[\*\-\s]+/, '')}`;
        return `* ${cleanItem.replace(/^[\*\-]\s*/, '')}`;
    }).join('\n');
    
    return formattedList;
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

function compile(jsonPayloadStr, templateStr, targetFilePath) {    
    let data;
    try {
        data = JSON.parse(typeof jsonPayloadStr === 'string' ? jsonPayloadStr.trim() : '');
    } catch (e) {
        throw new Error(`[FATAL ERROR] JSON Structural Integrity Failure: ${e.message}`);
    }

    // --- STRICT PARAMETER VALIDATION (QA GATE) ---

    const diagnostic = data._diagnostic;
    if (!diagnostic || (diagnostic.linter_verdict !== 'PASS' && diagnostic.linter_verdict !== 'EFFICACY_EXEMPTION')) {
        throw new Error(`[FATAL ERROR] _diagnostic.linter_verdict must be 'PASS' or 'EFFICACY_EXEMPTION'. Cannot compile without completed diagnostic work.`);
    }

    const VALID_ARCHETYPES = ['Pruner', 'Generator', 'Refactorer', 'Transformer', 'Instrumenter', 'Operator', 'Analyzer'];
    const profileKey = data.archetype || data.identity?.archetype || "";
    if (!profileKey || !VALID_ARCHETYPES.includes(profileKey)) {
        throw new Error(`[FATAL ERROR] Archetype key '${profileKey}' is not a valid Structural Base Profile. Must be one of: ${VALID_ARCHETYPES.join(', ')}`);
    }

    const functionalBridge = data.identity?.functional_bridge || '';
    const fbWords = functionalBridge.trim().split(/\s+/).filter(Boolean);
    if (fbWords.length !== 2) {
        throw new Error(`[FATAL ERROR] Functional Bridge must be exactly 2 words. Found ${fbWords.length}: '${functionalBridge}'`);
    }
    const forbiddenArticles = ['the', 'a', 'an'];
    fbWords.forEach(word => {
        if (forbiddenArticles.includes(word.toLowerCase())) {
            throw new Error(`[FATAL ERROR] Functional Bridge contains forbidden article: '${word}'.`);
        }
    });

    const synthesis = data.identity?.synthesis || '';
    if (synthesis.length > 145) {
        throw new Error(`[FATAL ERROR] Synthesis length is ${synthesis.length} characters. Must be strictly under 145 characters.`);
    }

    const definedThemeVerb = data.process?.theme_verb || data.process?.execute?.theme_verb || '';
    const firstWordMatch = synthesis.trim().split(/\s+/)[0];
    
    if (definedThemeVerb && firstWordMatch) {
        if (firstWordMatch.replace(/[^a-zA-Z]/g, '').toUpperCase() !== definedThemeVerb.toUpperCase()) {
            throw new Error(`[FATAL ERROR] Synthesis first word '${firstWordMatch}' does not match defined Theme Verb '${definedThemeVerb}'.`);
        }
    }

    if (firstWordMatch) {
        const cleanWord = firstWordMatch.replace(/[^a-zA-Z]/g, '');
        if (cleanWord && cleanWord !== cleanWord.toUpperCase()) {
            throw new Error(`[FATAL ERROR] Synthesis first word '${firstWordMatch}' is not ALL CAPS. It must be an imperative action verb in ALL CAPS.`);
        }
    }

    const philosophyRaw = data.philosophy || [];
    philosophyRaw.forEach((item, index) => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '').replace(/\*\*[^\*]+\*\*:\s*/, '');
        if (/\*\*[^\*]+\*\*:/.test(cleanItem)) {
            throw new Error(`[FATAL ERROR] Philosophy bullet ${index + 1} contains a forbidden bold label pattern ('**Text:**') after stripping. Remove all bold labels from the philosophy values.`);
        }
    });

    // --- DETERMINISTIC COMPILER LOGIC ---

    const category = data.identity?.category || '';
    const payloadThreshold = data.payload_threshold || data.process?.select_classify?.target_limit || '1';
    const requiresTasksBoard = ['Pruner', 'Refactorer', 'Transformer', 'Instrumenter', 'Operator'].includes(profileKey);
    const isCore = String(data.identity?.tier).toLowerCase() === 'core';

    const ignoreLimits = ['open', 'n/a', 'none', 'null', 'expansive', 'all'];
    const targetLimitClean = String(payloadThreshold).trim();
    const targetLimitInstruction = (targetLimitClean && targetLimitClean !== '1' && !ignoreLimits.includes(targetLimitClean.toLowerCase())) 
        ? `Continue executing within your locked scope up to a maximum of ${targetLimitClean}. ` : '';

    const zeroTargetExitInstruction = (data.process?.present?.requires_total_replacement_override || isCore)
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
        'EXECUTION_RULE': data.process?.execute?.execution_mandate || '',
        'RESILIENCE_PROCEDURE': formatSlot(data.archetype_slots?.operational_boundaries || data.strict_operational_mandates?.operational_boundaries, "The Resilience Procedure"),
        'DOMAIN_MODIFIERS': formatList(data.strict_operational_mandates?.domain_modifier_mandates || data.domain_modifier_mandates),
        'AUTONOMOUS_SELECTION': formatSlot(data.archetype_slots?.decisiveness_rule || data.strict_operational_mandates?.decisiveness_rule, 'The Autonomous Selection'),
        'WORKFLOW_EXECUTION': formatSlot(data.archetype_slots?.workflow_execution || data.strict_operational_mandates?.workflow_execution, 'The Execution'),
        'VERIFICATION_PROCEDURE': formatSlot(data.process?.verify?.testing_doctrine || '', 'The Verification Procedure'),
        'SALVAGED_MANDATES': formatList(data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates),
        'ZERO_INTERACTION_MANDATES': formatList(data.zero_interaction_mandates),
        'SALVAGED_CUSTOM_LOGIC': formatList(data.salvaged_custom_logic),
        'CROSS_VECTOR_GRANTS': formatList(data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants),
        'JOURNAL_PATH': (data.identity?.tier || '').toLowerCase() === 'core' ? `.jules/${data.identity?.name || 'journal'}.md` : `.jules/journal_${category.toLowerCase()}.md`,
        'WORKER_TASKS_BOARD': requiresTasksBoard ? "* **The Worker Tasks Board (`.jules/worker_tasks.md`):** Read this file (if it exists). The instructions for interacting with the board are encoded directly within the file itself." : '',
        'JOURNAL_PROCEDURE': formatSlot(data.archetype_slots?.journal_procedure || data.memory_and_triage?.journal_procedure, 'The Journal Procedure').replace(/^\*\s/, ''),
        'DISCOVER_TRIGGER': String(data.process?.discover?.trigger || data.process?.discover_trigger || '').replace(/^via\s+/i, ''),
        'DISCOVERY_FALLBACK': requiresTasksBoard ? "Cross-reference `.jules/worker_tasks.md` before initiating your scan. If you fail to find a valid target in `.jules/worker_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan." : (isCore ? "If the target matrix is exhausted and nothing is found, you MUST seamlessly pivot to a full repository-wide domain sweep to locate valid targets within your foundational domain before considering the task complete." : ''),
        'DOMAIN_AUTONOMY_DECLARATION': isCore ? `**Domain Autonomy:** This target matrix represents *High-Probability Vectors*. You possess absolute autonomy to identify and resolve any anomaly falling within your foundational domain (${data.identity?.foundational_domain || 'your operating theme'}), even if unlisted.` : '',
        'DISCOVERY_VELOCITY_RULE': data.process?.discover?.discovery_velocity_rule || '',
        'TARGET_MATRIX': formatTargetMatrix(data.process?.target_matrix || data.process?.discover?.target_matrix, data.identity?.tier),
        'PRIORITY_LANGUAGE': data.process?.select_classify?.priority_language || data.priority_language || 'arbitrarily',
        'TARGET_LIMIT': targetLimitClean,
        'THEME_VERB': definedThemeVerb || 'EXECUTE',
        'EXECUTION_POSTURE': data.process?.execute?.execution_posture || '',
        'TARGET_LIMIT_INSTRUCTION': targetLimitInstruction,
        'EXECUTION_STEPS': formatExecutionSteps(data.process?.execute?.execution_steps || data.process?.execution_steps),
        'REPORTER_PROCEDURE': data.process?.verify?.reporter_procedure || '',
        'HEURISTICS': formatHeuristics(data.process?.verify?.heuristic_verification || data.process?.heuristic_verification),
        'PRESENTATION_SLOT': String(data.process?.present?.presentation_slot || data.archetype_slots?.presentation_slot || '').replace(/^[\*\-]\s*/, '').replace(/^\*\*[^\*]+\*\*:?\s*/, '').replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '').replace(/End the task cleanly without a PR if zero targets were found\.?/gi, '').trim(),
        'ZERO_TARGET_EXIT': zeroTargetExitInstruction + (requiresTasksBoard && !data.process?.present?.requires_total_replacement_override ? "If the run produced no source mutations but did append relay entries to `.jules/worker_tasks.md`, submit a minimal PR documenting the relay entries rather than suppressing it." : ""),
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
