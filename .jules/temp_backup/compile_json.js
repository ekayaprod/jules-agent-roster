'use strict';
const fs = require('fs');

/**
 * COMPILER ARCHITECTURE NOTES:
 * - Hybrid Formatter & QA Gate execution paradigm.
 * - Validates core schema limits natively. Throws fatal exceptions on structural violations.
 * - Maps JSON payload values to {{TOKENS}} in the provided Markdown template.
 * - Relies entirely on the generator LLM for physics injection and payload sizing.
 */

function formatList(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.map((item) => String(item).trim()).join('\n');
}

function trimText(rawText) {
  if (!rawText) return '';
  return String(rawText).trim();
}

function formatTargetMatrix(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.map((item) => String(item).trim()).join('\n');
}

function cleanCodeFence(str) {
  if (!str) return '';
  return String(str)
    .replace(/^\s*```[a-zA-Z0-9]*\r?\n/gm, '')
    .replace(/\r?\n\s*```\s*$/gm, '');
}

function compile(jsonPayloadStr, templateStr, targetFilePath) {
  const startMarker = '<!-- WORKER_TEMPLATE_START -->';
  const endMarker = '<!-- WORKER_TEMPLATE_END -->';
  let extractedTemplate = templateStr;
  if (templateStr.includes(startMarker) && templateStr.includes(endMarker)) {
    extractedTemplate = templateStr.split(startMarker)[1].split(endMarker)[0].trim();
  }

  let data;
  try {
    data = JSON.parse(typeof jsonPayloadStr === 'string' ? jsonPayloadStr.trim() : '');
  } catch (e) {
    throw new Error(`[FATAL ERROR] JSON Structural Integrity Failure: ${e.message}`);
  }

  // --- STRICT PARAMETER VALIDATION (QA GATE) ---

  const diagnostic = data._diagnostic;
  if (
    !diagnostic ||
    (diagnostic.linter_verdict !== 'PASS' && diagnostic.linter_verdict !== 'EFFICACY_EXEMPTION')
  ) {
    throw new Error(
      `[FATAL ERROR] _diagnostic.linter_verdict must be 'PASS' or 'EFFICACY_EXEMPTION'. Cannot compile without completed diagnostic work.`,
    );
  }

  const VALID_ARCHETYPES = [
    'Pruner',
    'Generator',
    'Refactorer',
    'Transformer',
    'Instrumenter',
    'Operator',
    'Analyzer',
  ];

  const profileKey = data.archetype || data.identity?.archetype;
  if (!profileKey || !VALID_ARCHETYPES.includes(profileKey)) {
    throw new Error(
      `[FATAL ERROR] Archetype key '${profileKey}' is not a valid Structural Base Profile. Must be one of: ${VALID_ARCHETYPES.join(', ')}`,
    );
  }

  const roleStr = data.identity?.role || '';
  const roleWords = roleStr.trim().split(/\s+/).filter(Boolean);
  if (roleWords.length !== 2) {
    throw new Error(
      `[FATAL ERROR] Role must be exactly 2 words. Found ${roleWords.length}: '${roleStr}'`,
    );
  }

  const functionalBridge = data.identity?.functional_bridge || '';
  const fbWords = functionalBridge.trim().split(/\s+/).filter(Boolean);
  if (fbWords.length !== 2) {
    throw new Error(
      `[FATAL ERROR] Functional Bridge must be exactly 2 words. Found ${fbWords.length}: '${functionalBridge}'`,
    );
  }
  const forbiddenArticles = ['the', 'a', 'an'];
  fbWords.forEach((word) => {
    if (forbiddenArticles.includes(word.toLowerCase())) {
      throw new Error(`[FATAL ERROR] Functional Bridge contains forbidden article: '${word}'.`);
    }
  });

  const synthesis = data.identity?.synthesis || '';
  if (synthesis.length > 145) {
    console.warn(
      `[WARNING] Synthesis length is ${synthesis.length} characters. Recommended maximum is 145 characters.`,
    );
  }

  const definedThemeVerb = data.process?.execute?.theme_verb || data.process?.theme_verb || '';
  const firstWordMatch = synthesis.trim().split(/\s+/)[0];

  if (definedThemeVerb && firstWordMatch) {
    if (firstWordMatch.replace(/[^a-zA-Z]/g, '').toUpperCase() !== definedThemeVerb.toUpperCase()) {
      throw new Error(
        `[FATAL ERROR] Synthesis first word '${firstWordMatch}' does not match defined Theme Verb '${definedThemeVerb}'.`,
      );
    }
  }

  if (firstWordMatch) {
    const cleanWord = firstWordMatch.replace(/[^a-zA-Z]/g, '');
    if (cleanWord && cleanWord !== cleanWord.toUpperCase()) {
      throw new Error(
        `[FATAL ERROR] Synthesis first word '${firstWordMatch}' is not ALL CAPS. It must be an imperative action verb in ALL CAPS.`,
      );
    }
  }

  const philosophyRaw = data.philosophy || [];
  if (philosophyRaw.length !== 5) {
    throw new Error(`[FATAL ERROR] Philosophy must contain exactly 5 bullets. Found ${philosophyRaw.length}.`);
  }
  philosophyRaw.forEach((item, index) => {
    let cleanItem = String(item)
      .replace(/^[\*\-]\s+/, '');
    if (/\*\*[^\*:]+:\*\*|\*\*[^\*]+\*\*:/.test(cleanItem)) {
      throw new Error(
        `[FATAL ERROR] Philosophy bullet ${index + 1} contains a forbidden bold label pattern ('**Text:**'). Remove all bold labels from the philosophy values.`,
      );
    }
  });

  const optimizationsRaw = data.favorite_optimizations || [];
  if (optimizationsRaw.length !== 6) {
    throw new Error(`[FATAL ERROR] Favorite Optimizations must contain exactly 6 entries. Found ${optimizationsRaw.length}.`);
  }

  const forgeVersion = data.identity?.forge_version || data.forge_version || '';
  if (!forgeVersion || String(forgeVersion).trim() === '') {
    throw new Error(
      `[FATAL ERROR] The 'forge_version' key is missing or empty. You must inject the CURRENT_FORGE_VERSION into data.identity.forge_version to prevent infinite Autorun loops.`
    );
  }

  // --- BASELINE RESTATEMENT GATE ---
  // Prose rules in Master-Forge (Universal Baseline Exemption, Internal Duplication Check) instruct
  // the generator LLM not to restate baseline-owned mechanics inside custom free-text fields. This
  // block enforces that mechanically: it does not trust the generator to have followed the rule.
  const BASELINE_RESTATEMENT_PATTERNS = [
    { label: 'Artifact Lockbox', pattern: /artifact lockbox/i },
    { label: 'Native Tool Lock', pattern: /native tool lock/i },
    { label: 'Unconditional Cleanup', pattern: /unconditional cleanup/i },
    { label: 'No-Interaction Policy', pattern: /no-interaction policy/i },
    { label: 'Strict Tool Ban', pattern: /strict tool ban|ask_human|request_user_info/i },
    { label: 'git clean baseline command', pattern: /git clean -fd/i },
    { label: 'temp_backup baseline path', pattern: /\.jules\/temp_backup/i },
    { label: 'SEARCH/REPLACE tool-lock block syntax', pattern: /<{3,}\s*SEARCH/i },
    { label: 'Test Immunity Doctrine restatement', pattern: /test immunity doctrine/i },
    { label: 'Canonical testing doctrine phrase', pattern: /treat all test files as immutable and read-only/i },
    { label: 'Canonical testing doctrine failure clause', pattern: /prove (?:the test|it) was already failing on the main branch/i },
  ];

  const freeTextFieldsToScan = {
    salvaged_custom_logic: data.salvaged_custom_logic,
    salvaged_mandates: data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates,
    zero_interaction_mandates: data.zero_interaction_mandates,
    cross_vector_grants: data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants,
  };

  for (const [fieldName, fieldArr] of Object.entries(freeTextFieldsToScan)) {
    if (!Array.isArray(fieldArr)) continue;
    fieldArr.forEach((item, index) => {
      const itemText = String(item);
      for (const { label, pattern } of BASELINE_RESTATEMENT_PATTERNS) {
        if (pattern.test(itemText)) {
          throw new Error(
            `[FATAL ERROR] Baseline Restatement Detected: '${fieldName}[${index}]' appears to restate '${label}', which is supplied natively by the Base Profile or the testing_doctrine slot. Per Master-Forge's Universal Baseline Exemption, strip this content from custom fields rather than re-authoring it under a new label. Offending text: "${itemText.slice(0, 120)}${itemText.length > 120 ? '...' : ''}"`,
          );
        }
      }
    });
  }

  // --- DETERMINISTIC COMPILER LOGIC ---

  const category = data.identity?.category || '';
  const isCore = String(data.identity?.tier).toLowerCase() === 'core';
  const targetLimitClean = String(data.process?.select_classify?.target_limit || data.payload_threshold || '1').trim();

  const finalExecutionRule = data.process?.execute?.execution_mandate || '';

  const map = {
    NAME: data.identity?.name || '',
    EMOJI: data.identity?.emoji || '',
    ROLE: data.identity?.role || '',
    CATEGORY: category,
    TIER: data.identity?.tier || '',
    SYNTHESIS: data.identity?.synthesis || '',
    FORGE_VERSION: forgeVersion,
    MISSION_SCOPE: String(data.mission_scope || '').replace(/\.+$/, ''),
    PHILOSOPHY: formatList(data.philosophy),
    LANGUAGE: data.coding_standards?.language || '',
    GOOD_CODE: cleanCodeFence(data.coding_standards?.good_code_snippet),
    BAD_CODE: cleanCodeFence(data.coding_standards?.bad_code_snippet),
    PRIMARY_RESPONSIBILITY: trimText(data.archetype_slots?.domain_anchor || data.strict_operational_mandates?.domain_anchor),
    THE_SCOPE: trimText(data.archetype_slots?.mutation_scope || data.strict_operational_mandates?.mutation_scope),
    EXECUTION_RULE: trimText(finalExecutionRule),
    RESILIENCE_PROCEDURE: trimText(data.archetype_slots?.operational_boundaries || data.strict_operational_mandates?.operational_boundaries),
    DOMAIN_MODIFIERS: formatList(data.strict_operational_mandates?.domain_modifier_mandates || data.domain_modifier_mandates),
    AUTONOMOUS_SELECTION: trimText(data.archetype_slots?.decisiveness_rule || data.strict_operational_mandates?.decisiveness_rule),
    WORKFLOW_EXECUTION: trimText(data.archetype_slots?.workflow_execution || data.strict_operational_mandates?.workflow_execution),
    VERIFICATION_PROCEDURE: trimText(data.process?.verify?.testing_doctrine),
    SALVAGED_MANDATES: formatList(data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates),
    ZERO_INTERACTION_MANDATES: formatList(data.zero_interaction_mandates),
    SALVAGED_CUSTOM_LOGIC: formatList(data.salvaged_custom_logic),
    CROSS_VECTOR_GRANTS: formatList(data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants),
    JOURNAL_PATH: isCore ? `.jules/${data.identity?.name || 'journal'}.md` : `.jules/journal_${category.toLowerCase()}.md`,
    WORKER_TASKS_BOARD: trimText(data.memory_and_triage?.agent_tasks_board),
    JOURNAL_PROCEDURE: trimText(data.archetype_slots?.journal_procedure || data.memory_and_triage?.journal_procedure),
    DISCOVER_TRIGGER: String(data.process?.discover?.trigger || '').replace(/^via\s+/i, ''),
    DISCOVERY_FALLBACK: trimText(data.process?.discover?.discovery_fallback),
    DOMAIN_AUTONOMY_DECLARATION: trimText(data.process?.discover?.domain_autonomy_declaration),
    DISCOVERY_VELOCITY_RULE: trimText(data.process?.discover?.discovery_velocity_rule),
    TARGET_MATRIX: formatTargetMatrix(data.process?.target_matrix || data.process?.discover?.target_matrix),
    PRIORITY_LANGUAGE: data.process?.select_classify?.priority_language || data.priority_language || 'arbitrarily',
    TARGET_LIMIT: targetLimitClean,
    THEME_VERB: definedThemeVerb || 'EXECUTE',
    EXECUTION_POSTURE: trimText(data.process?.execute?.execution_posture),
    TARGET_LIMIT_INSTRUCTION: trimText(data.process?.execute?.target_limit_instruction),
    EXECUTION_STEPS: formatList(data.process?.execute?.execution_steps || data.process?.execution_steps),
    REPORTER_PROCEDURE: trimText(data.process?.verify?.reporter_procedure),
    HEURISTICS: formatList(data.process?.verify?.heuristic_verification || data.process?.heuristic_verification),
    PRESENTATION_SLOT: String(data.process?.present?.presentation_slot || data.archetype_slots?.presentation_slot || '').trim(),
    ZERO_TARGET_EXIT: data.process?.present?.requires_total_replacement_override ? '' : trimText(data.process?.present?.zero_target_exit),
    PR_HEADERS: data.archetype_slots?.pr_headers || data.process?.present?.pr_headers || '',
    FAVORITE_OPTIMIZATIONS: formatList(data.favorite_optimizations),
  };

  let output = extractedTemplate;
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const value = map[key];
      const regex = new RegExp(`{{${key}}}\n?`, 'g');
      if (value && value.trim() !== '') {
        output = output.replace(new RegExp(`{{${key}}}`, 'g'), value);
      } else {
        // Safely swallow trailing newlines if the token is empty to prevent large whitespace gaps
        output = output.replace(regex, '');
      }
    }
  }

  // Final structural cleanup for trailing carriage returns
  const cleanedOutput = output.replace(/\n{3,}/g, '\n\n').trim();

  if (targetFilePath && targetFilePath.trim() !== '') {
    fs.writeFileSync(targetFilePath, cleanedOutput);
  } else {
    console.log(cleanedOutput);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node compile_json.js <jsonPath|-|/dev/stdin> <templatePath> [targetPath]');
    process.exit(1);
  }

  const source = args[0];
  const templatePath = args[1];
  const targetPath = args[2] || '';

  try {
    const jsonPayloadStr = source === '-' || source === '/dev/stdin' ? fs.readFileSync(0, 'utf-8') : fs.readFileSync(source, 'utf8');
    const templateStr = fs.readFileSync(templatePath, 'utf8');
    compile(jsonPayloadStr, templateStr, targetPath);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

module.exports = { compile };
