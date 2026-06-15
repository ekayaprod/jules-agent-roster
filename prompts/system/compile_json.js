const fs = require('fs');
const path = require('path');

/**
 * COMPILER ARCHITECTURE NOTES:
 * - Compiler consumes repository automation metadata.
 * - Compiler generates documentation artifacts.
 * - Compiler terminology is presentation-layer metadata.
 * - Compiler does not define or alter platform instructions.
 * - VALIDATION GATE: Script acts as the primary QA verifier.
 */

// Generic helper for standard lists
function formatList(arr, bullet = '* ') {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
        return `${bullet}${cleanItem}`;
    }).join('\n');
}

// Specialized formatter for Execution Steps to upgrade single asterisks
function formatExecutionSteps(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
        // Fix missing opening bold marker (e.g., "Trace the Wait State:**" -> "**Trace the Wait State:**")
        cleanItem = cleanItem.replace(/^([a-zA-Z0-9_ \-]+)(?:\*\*|:\*\*|\*\*:\s*|\*:\s*)(.*)$/, '**$1:** $2');
        // Auto-fix literal broken asterisk labels (e.g. "*Execute:**")
        cleanItem = cleanItem.replace(/^\*([^\*]+)\*\*:?\s*/, '**$1:** ');
        return `* ${cleanItem}`;
    }).join('\n');
}

// Specialized formatter for Philosophy to aggressively strip bolded rule labels

function formatPhilosophy(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
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
    // Strip artifact bleeds (e.g., leading or trailing **)
    cleanText = cleanText.replace(/^\s*\*\*\s*/, '').replace(/\*\*\s*$/, '').trim();
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
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
        // Fix broken bolding e.g., *Label**: -> **Label**:
        cleanItem = cleanItem.replace(/^\*([^\*:]+)\*\*:/, '**$1**:');
        // Fix collapsed heuristic format: "Semantic Equivalence: text" -> "**Semantic Equivalence Check:** text"
        cleanItem = cleanItem.replace(/^([a-zA-Z0-9_ \-]+):\s*(?![\*])(.*)$/, '**$1 Check:** $2');
        return `* ${cleanItem}`;
    }).join('\n');
}

// Clean nested markdown fences from raw code snippets
function cleanCodeFence(str) {
    if (!str) return '';
    return String(str)
        .replace(/^\s*```[a-zA-Z0-9]*\r?\n/gm, '')
        .replace(/\r?\n\s*```\s*$/gm, '');
}


const BASE_PROFILES = {
    "Pruner": {
        domain: "Restrict your execution strictly to the identification and excision of targets. If a deletion breaks a tightly coupled dependency, you are explicitly forbidden from 'refactoring' the dependency to make the deletion work. Revert your deletion, leave the dead code in place, and proceed.",
        scope: "Limit your deletion sweep strictly to your assigned scope. Do not expand your blast radius to clean up adjacent messy logic, format files, or fix typos; your only authorized mutation is subtraction.",
        operational: "Treat the environment as an immutable house of cards. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. Deleting legacy code is highly volatile. If a target excision results in 3 successive test-runner failures that you cannot resolve via simple AST cleanup, execute a Graceful Abort on that specific file. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Generator": {
        domain: "Restrict your execution exclusively to scaffolding net-new architecture for the assigned target. If your scaffolding requires modifying pre-existing core logic to compile, you have breached the greenfield boundary. Revert, document the blocker, and proceed.",
        scope: "Confine write operations strictly to newly generated files and their immediate integration entry points. You are explicitly forbidden from refactoring adjacent pre-existing logic to accommodate your new feature.",
        operational: "Build strictly within the project's current ecosystem. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. If a scaffold fails to compile natively within 3 attempts, execute a Graceful Abort. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all modifications to existing entry-points exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Refactorer": {
        domain: "Restrict execution strictly to modifying, optimizing, or parallelizing assigned execution logic. If a refactor requires cascading changes across multiple decoupled modules to compile, revert your changes, document the tight-coupling, and proceed.",
        scope: "Limit mutations strictly to the targeted logic block. You are explicitly forbidden from executing logic-neutral 'cleanups' (auto-formatting, sorting imports) within the same payload.",
        operational: "Treat existing logic as highly volatile. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If a refactor fails native tests 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Transformer": {
        domain: "Restrict execution strictly to behavior-preserving structural modifications (formatting, renaming, JSDoc). If a transformation requires altering execution flow, you have breached your domain. Revert and proceed.",
        scope: "Limit mutations strictly to syntax, metadata, and structural organization. Modifying return values, control flow, or business logic is forbidden.",
        operational: "Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If your structural change breaks the AST parser 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Instrumenter": {
        domain: "Restrict execution exclusively to injecting boundaries, type-guards, validations, or test coverage. If pre-existing logic is fundamentally untestable, you are explicitly forbidden from refactoring the business logic. Revert, document, and proceed.",
        scope: "Limit mutations strictly to defensive wrappers, schema definitions, telemetry, or test files. Do not alter core behavioral logic.",
        operational: "Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If instrumentation causes a compiler/runner panic 3 times, Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Operator": {
        domain: "Restrict execution strictly to config files, CI/CD pipelines, package manifests, or containerization logic. Modifying application core source code to force a deployment is a domain breach.",
        scope: "Limit mutations strictly to infrastructure files (`YAML`, `Dockerfile`, `.env.example`). Application logic is out of bounds.",
        operational: "Treat build environments as volatile. Artifact Lockbox: Backup active files to .jules/temp_backup/ before execution. If changes fail a dry-run/syntax validation 3 times, execute a Graceful Abort. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort. Native Tool Lock: Execute all file modifications exclusively through native API code-editing tools (standard `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` block logic). The creation or execution of any `.diff`, `.sh`, or `.js` script to mutate source files is a catastrophic boundary violation."
    },
    "Analyzer": {
        domain: "Restrict execution exclusively to static analysis and architectural mapping. You are explicitly forbidden from mutating application logic, configs, or source code.",
        scope: "Confine write operations strictly to external output files (`README.md`, `.json` intelligence reports). AST write permissions are out of bounds.",
        operational: "Treat the repository as a strictly read-only filesystem. The `SEARCH/REPLACE` API is explicitly disabled for all source code files. If obfuscated files break the parser, Graceful Abort that file. Operate strictly within the existing native environment stack. Installing OS-level packages (`apt-get`, `.deb`) is a hard boundary violation. If a required binary is missing from the host environment, execute a Graceful Abort immediately. Unconditional Cleanup: Run `git clean -fd -e .jules/` before PR or Abort to wipe data dumps. Native Tool Lock (Read-Only Override): Write operations are confined strictly to your designated output files."
    }
};

const CONTEXT_EXTENSIONS = {
    "Security Perimeter Modifier": [
        "* **The Secret Sterilization Rule:** You must never write plaintext secrets, API keys, or raw credentials to any source file, configuration, or log. Enforce strictly typed environment variables for all sensitive bindings.",
        "* **The Exploit-Proof Verification:** You must mathematically prove the vulnerability is closed or the boundary is secure via targeted test runs before submitting the PR."
    ],
    "Infrastructure Containment Modifier": [
        "* **The Source Code Untouchable Constraint:** Any mutation requiring `.ts`, `.py`, or `.js` execution logic changes is a catastrophic domain breach. Treat the core application layer as an immutable black box.",
        "* **The Dry-Run Build Procedure:** Validate all pipeline and dependency graph mutations through infrastructure-specific dry-runs (e.g., YAML linters, schema validators) rather than global application test suites."
    ],
    "AI/LLM Integration Modifier": [
        "* **The Live Native Schema Rule:** Authenticate platform-specific SDK parameters strictly by retrieving and verifying the AI provider's live documentation before applying them.",
        "* **The Synaptic Timeout Constraint:** Fortify all AI integration calls with strict `AbortController` timeouts, typed schema validation (e.g., Zod), and asynchronous exponential backoffs.",
        "* **The Ephemeral Key Guard:** Construct authentication headers using strictly typed environment variables. Hardcoding raw API keys into source files is strictly forbidden."
    ],
    "Total Replacement Modifier": [
        "* **The Inevitable Variation Doctrine:** A zero-target state is an impossibility. You focus on not reactive bug-fixing; it is the aggressive generation of a new architectural variation. You must arbitrarily select an existing baseline and replace it.",
        "* **The Clean Slate Procedure:** Reject the sunk-cost fallacy. Map the integration boundaries of the target, completely burn/delete the existing structural logic, and provision a pristine, mathematically optimized replacement in its exact footprint.",
        "* **The Test Obsolescence Procedure:** Because your rule is total structural replacement, legacy unit tests tied to the old architecture will inevitably fail. If old tests block your VM verification, You may isolate, disable (`.skip` / `xit`), or delete the obsolete test blocks entirely to unblock your pipeline.",
        "* **The Gambler's Autonomous Selection:** You are explicitly forbidden from declaring a zero-target state or exiting cleanly. You must arbitrarily select the most prominent, structurally complete node discovered.",
        "* **The PR Presentation Override:** Delete any default rule instructing the worker to exit cleanly without a PR when zero targets are found. A Replacement worker is prohibited exit empty-handed; submit the PR natively with the newly generated variation."
    ],
    "Iterative Execution Context Modifier": [
        '* **The Positive Polarity Rule:** All scope constraints authored or maintained by this worker must be expressed as positive behavioral anchors ("always execute X", "return Y in all cases") rather than prohibitive constraints ("never do Z", "avoid Y"). In iterative execution contexts, negative constraints cause the consuming model to actively re-suppress the prohibited behavior on each loop iteration. Express what the loop must do, not what it must not do.',
        "* **The Stateless Execution Requirement:** Treat each iteration of the consuming execution loop as stateless unless an explicit memory or context-passing mechanism is declared and verified in the system architecture. Do not author directives that assume prior loop state is accessible or reliable across turns."
    ]
};

function compile(jsonPayloadStr, targetFilePath) {
    let data;
    try {
        data = JSON.parse(jsonPayloadStr);
    } catch (e) {
        console.error(`[FATAL ERROR] Failed to parse JSON payload: ${e.message}`);
        process.exit(1);
    }

    // --- STRICT PARAMETER VALIDATION (QA GATE) ---
    
    const diagnostic = data._diagnostic;
    if (!diagnostic || diagnostic.linter_verdict !== 'PASS') {
        console.error(`[FATAL ERROR] _diagnostic.linter_verdict must be 'PASS'. Cannot compile without completed diagnostic work.`);
        process.exit(1);
    }

    let philosophyRaw = data.philosophy || [];
    if (philosophyRaw.length !== 5) {
        console.warn(`[WARNING] Philosophy count is ${philosophyRaw.length}. Adjusting to 5 bullets.`);
        if (philosophyRaw.length > 5) philosophyRaw = philosophyRaw.slice(0, 5);
        else while (philosophyRaw.length < 5) philosophyRaw.push("Placeholder bullet.");
        data.philosophy = philosophyRaw;
    }

    let optimizationsRaw = data.favorite_optimizations || [];
    if (optimizationsRaw.length !== 6) {
        console.warn(`[WARNING] Favorite Optimizations count is ${optimizationsRaw.length}. Adjusting to 6 bullets.`);
        if (optimizationsRaw.length > 6) optimizationsRaw = optimizationsRaw.slice(0, 6);
        else while (optimizationsRaw.length < 6) optimizationsRaw.push("Placeholder optimization.");
        data.favorite_optimizations = optimizationsRaw;
    }

    const RESERVED_EMOJIS = ['🔍', '🎯', '⚙️', '✅', '🎁'];
    const leadEmoji = data.identity?.emoji || '';
    const allThematicItems = [...philosophyRaw, ...optimizationsRaw];

    allThematicItems.forEach((item, index) => {
        const isPhilosophy = index < philosophyRaw.length;
        const positionLabel = isPhilosophy ? `Philosophy bullet ${index + 1}` : `Optimization bullet ${index - philosophyRaw.length + 1}`;

        RESERVED_EMOJIS.forEach(reserved => {
            if (item.includes(reserved)) {
                console.warn(`[WARNING] Reserved emoji ${reserved} found in ${positionLabel}. Replacing with a generic emoji.`);
                if (isPhilosophy) data.philosophy[index] = String(data.philosophy[index]).replace(reserved, "🔹");
                else data.favorite_optimizations[index - philosophyRaw.length] = String(data.favorite_optimizations[index - philosophyRaw.length]).replace(reserved, "🔹");
            }
        });

        if (leadEmoji && item.includes(leadEmoji)) {
            console.warn(`[WARNING] Persona Lead emoji ${leadEmoji} found in ${positionLabel}. Replacing with a generic emoji.`);
            if (isPhilosophy) data.philosophy[index] = String(data.philosophy[index]).replace(leadEmoji, "🔸");
            else data.favorite_optimizations[index - philosophyRaw.length] = String(data.favorite_optimizations[index - philosophyRaw.length]).replace(leadEmoji, "🔸");
        }
    });

    const synthesis = data.identity?.synthesis || '';
    if (synthesis.length > 145) {
        console.error(`[FATAL ERROR] Synthesis length is ${synthesis.length} characters. Must be strictly under 145 characters.`);
        process.exit(1);
    }

    const firstWordMatch = synthesis.trim().split(/\s+/)[0];
    if (firstWordMatch) {
        const cleanWord = firstWordMatch.replace(/[^a-zA-Z]/g, '');
        if (cleanWord && cleanWord !== cleanWord.toUpperCase()) {
            console.error(`[FATAL ERROR] Synthesis first word '${firstWordMatch}' is not ALL CAPS. It must be an imperative action verb in ALL CAPS.`);
            process.exit(1);
        }
    }

    // Belt-and-suspenders validation for Philosophy bold stripping
    philosophyRaw.forEach((item, index) => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '').replace(/\*\*[^\*]+\*\*:\s*/, '');
        if (/\*\*[^\*]+\*\*:/.test(cleanItem)) {
            console.error(`[FATAL ERROR] Philosophy bullet ${index + 1} contains a forbidden bold label pattern ('**Text:**') after stripping. Remove all bold labels from the philosophy values.`);
            process.exit(1);
        }
    });


    // FATAL ERROR if duplicates are found in thematic arrays
    const allThematicBullets = [...(data.philosophy || []), ...(data.favorite_optimizations || [])];
    const seenEmojis = new Set();
    allThematicBullets.forEach((item, index) => {
        let cleanItem = String(item).replace(/^[\*\-]\s+/, '');
        let emojiMatch = cleanItem.match(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+/u);
        if (emojiMatch) {
            let emoji = emojiMatch[0].trim();
            if (seenEmojis.has(emoji)) {
                console.error(`[FATAL ERROR] Duplicate emoji '${emoji}' detected in thematic bullets. The Phase 3 Emoji Ledger rule strictly forbids reusing emojis across Philosophy and Optimizations.`);
                process.exit(1);
            }
            seenEmojis.add(emoji);
        }
    });

    // --- DETERMINISTIC COMPILER LOGIC ---
    
    const archetype = data['work profile'] || data.work_profile || data.archetype || '';
    const category = data.identity?.category || '';
    const velocity = data.velocity || 'Contained';
    const payloadThreshold = data.payload_threshold || data.process?.select_classify?.target_limit || '1';
    const tier = data.identity?.tier || '';
    const isStructural = data.verification_layer === 'structural';
    const requiresTasksBoard = ['Pruner', 'Refactorer', 'Transformer', 'Instrumenter', 'Operator'].includes(archetype);

    // 1. Testing Doctrine
    const testingDoctrine = category.toLowerCase() === 'testing'
        ? "* **The Test Automation Rule:** Mutate test files exclusively; Treat source code as read-only. Expose bugs via failing tests rather than enshrining failures to pass CI. Do not mock global engine primitives (e.g., Promise.all). Abort instrumentation after 2 failed approaches. Execute atomic inversions sequentially (using `;` , never `&&`)."
        : "* **The Test Immunity Doctrine:** Treat all test files as immutable and read-only. If a structural mutation causes a test failure, do not modify the test file to accommodate your change. You must either prove the test was already failing on the main branch, or execute an immediate Graceful Abort and full revert.";

    // 2. Velocity & Execution Rule
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
        discoveryVelocityRule = "**The Bounded Sweep:** You may scan and lock onto targets strictly until your Quota is met, at which point You must immediately abort all further scanning and proceed to execution.";
        executionPosture = "Execute in bounded sequence, tracking your mutation count against your declared quota ceiling.";
        reporterProtocol = "Verify your mutations in bounded batches. You have a maximum of 3 verification attempts per target. Halt execution upon reaching your declared quota ceiling.";
        prCreationRule = "Do not burn tool calls running `git diff` or `git status` right before submission. The PR UI automatically attaches diffs. Rely purely on your working memory to draft the PR description.";
    } else {
        executionMandate = "Your discovery posture is full-sweep. You are authorized to map all matching targets before or during execution. Your work is inherently deep and will approach or cross the host platform's ~100 tool call intervention threshold — this is expected, not a failure. Manage your execution envelope across three layers:\n1. **Proactive Touchpoints:** If a genuine blocker or decision point arises before 75 calls, surface it to the operator immediately. Never fabricate a question to bank a reset.\n2. **Wrap-Up Checkpoints:** At the end of DISCOVER and after each logical cluster of mutations, evaluate whether your current payload represents a coherent, submittable unit of work. If yes, submit now rather than risk an unproductive mid-task interruption.\n3. **Managed Interruption:** If the host platform forcibly pauses you, make it worth it. Provide a sterile, high-density summary of your staged work, state your exact next planned action, and conclude with: *'Awaiting operator clearance to resume.'* Resume instantly once cleared.";
        discoveryVelocityRule = "**The Deep Map:** You are authorized to execute extensive read-only loops to thoroughly map complex dependencies before mutating, but you strictly confine your search to the targeted module.";
        executionPosture = "Execute Incrementally.";
        reporterProtocol = "Verify your mutations incrementally. You may test sequentially due to the complexity of your domain, but you have a maximum of 3 verification attempts per target. Do not treat changing error messages as forward progress. If you cannot cleanly verify the target within 3 attempts due to flaky test runners or environmental opacity, do not panic and do not abort the entire session. Treat verification as a reporter, not a gatekeeper. Accept that the environment is hostile, retain your successful AST mutations, and proceed.";
        prCreationRule = "";
    }

    if (isStructural) {
        reporterProtocol = reporterProtocol.replace(/triggering your test runner/g, 'executing your heuristic checks');
        reporterProtocol = reporterProtocol.replace(/testing line-by-line/g, 'running heuristics line-by-line');
        reporterProtocol = reporterProtocol.replace(/test sequentially/g, 'verify sequentially');
    }

    // 3. Journal & Tasks Board
    const journalPath = tier.toLowerCase() === 'core' ? `.jules/${data.identity?.name || 'journal'}.md` : `.jules/journal_${category.toLowerCase()}.md`;
    const agentTasksBoardRules = requiresTasksBoard ? "* **The Worker Tasks Board (`.jules/agent_tasks.md`):** Read this file (if it exists). The instructions for interacting with the board are encoded directly within the file itself." : '';
    const tasksBoardCrossReference = requiresTasksBoard ? "Cross-reference `.jules/agent_tasks.md` before initiating your scan. If you fail to find a valid target in `.jules/agent_tasks.md`, your job is NOT done; you MUST seamlessly transition to a repository-wide discovery scan." : '';

    // --- ARRAY FORMATTING ---
    const salvagedMandates = formatList(data.strict_operational_mandates?.salvaged_mandates || data.salvaged_mandates);
    const profileKey = data["work profile"] || data.work_profile || "";
    const baseProfile = BASE_PROFILES[profileKey] || {};
    const domainAnchorText = data.archetype_slots?.domain_anchor || data.strict_operational_mandates?.domain_anchor || baseProfile.domain || "";
    const scopeText = data.archetype_slots?.mutation_scope || data.strict_operational_mandates?.mutation_scope || baseProfile.scope || "";
    const operationalBoundariesText = data.archetype_slots?.operational_boundaries || data.strict_operational_mandates?.operational_boundaries || baseProfile.operational || "";
    const combinedModifiers = data.strict_operational_mandates?.domain_modifier_mandates || data.domain_modifier_mandates || [];
    const activeModifiers = data.active_modifiers || data._diagnostic?.sculptor_manifest?.active_modifiers || [];
    activeModifiers.forEach(modifier => {
        if (CONTEXT_EXTENSIONS[modifier]) {
            combinedModifiers.push(...CONTEXT_EXTENSIONS[modifier]);
        }
    });
    const domainModifiers = formatList(combinedModifiers);
    const crossVectorGrants = formatList(data.strict_operational_mandates?.cross_vector_grants || data.cross_vector_grants);
    const executionSteps = formatExecutionSteps(data.process?.execute?.execution_steps || data.process?.execution_steps);
    const heuristics = formatHeuristics(data.process?.verify?.heuristic_verification || data.process?.heuristic_verification);
    
    // Handle Target Limit / Payload Threshold logic cleanly
    const ignoreLimits = ['open', 'n/a', 'none', 'null', 'expansive', 'all'];
    const targetLimitClean = String(payloadThreshold).trim();
    const targetLimitInstruction = (targetLimitClean && targetLimitClean !== '1' && !ignoreLimits.includes(targetLimitClean.toLowerCase())) 
        ? `Continue executing within your locked scope up to a maximum of ${targetLimitClean}. ` 
        : '';

    const zeroTargetExitInstruction = (data.process?.present?.requires_total_replacement_override || data.requires_total_replacement_override || data.total_replacement_active)
        ? '' 
        : requiresTasksBoard ? 'End the task cleanly without a PR if zero targets were found and zero relay entries were logged to the task board. ' : 'End the task cleanly without a PR if zero targets were found. ';

    // Clean Presentation Slot by stripping bold labels (e.g. "* **The Label:**")
    const rawPresentation = data.process?.present?.presentation_slot || data.archetype_slots?.presentation_slot || '';
    const presentationSlotClean = String(rawPresentation).replace(/^[\*\-]\s*/, '').replace(/^\*\*[^\*]+\*\*:?\s*/, '').replace(/^\*\*[^\*:]+:?\*\*:?\s*/, '').replace(/End the task cleanly without a PR if zero targets were found\.?/gi, '').trim();
    
    // Strip trailing periods from Mission Scope
    const missionScopeClean = String(data.mission_scope || '').replace(/\.+$/, '').replace(/^to\s+/i, '');

    // Use arbitrary unless priority language is explicitly stated
    const validPriorities = ['arbitrarily', 'sequentially', 'by highest confidence'];
    const rawPriority = data.process?.select_classify?.priority_language || data.priority_language;
    const priorityLanguage = validPriorities.includes(rawPriority) ? rawPriority : 'arbitrarily';

    // Fix grammatical clash for Discovery Trigger by omitting "via"
    const discoverTrigger = String(data.process?.discover?.trigger || data.process?.discover_trigger || '').replace(/^via\s+/i, '');

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
${cleanCodeFence(data.coding_standards?.good_code_snippet || '')}
~~~
* ❌ **Bad Code:**
~~~${data.coding_standards?.language || ''}
${cleanCodeFence(data.coding_standards?.bad_code_snippet || '')}
~~~

### Strict Operational Rules
${formatSlot(domainAnchorText, "The Primary Responsibility")}
${formatSlot(scopeText, "The Scope")}
* **The Execution Rule:** ${executionMandate}
${formatSlot(operationalBoundariesText, "The Resilience Procedure")}
${domainModifiers}
${formatSlot(data.archetype_slots?.decisiveness_rule || data.strict_operational_mandates?.decisiveness_rule || '', 'The Autonomous Selection')}
${formatSlot(data.archetype_slots?.workflow_execution || data.strict_operational_mandates?.workflow_execution || '', 'The Execution')}
${testingDoctrine ? formatSlot(testingDoctrine, 'The Verification Procedure') : ''}
${salvagedMandates}
${formatList(data.salvaged_custom_logic)}
${crossVectorGrants}

### Memory & Triage
**Journal Path:** \`${journalPath}\`
${agentTasksBoardRules}

${formatSlot(data.archetype_slots?.journal_protocol || data.memory_and_triage?.journal_protocol || '', 'The Journal Procedure').replace(/^\*\s/, '')}

### The Process
1. 🔍 **DISCOVER** — ${discoverTrigger} ${tasksBoardCrossReference}
${discoveryVelocityRule}
${formatTargetMatrix(data.process?.target_matrix || data.process?.discover?.target_matrix)}
2. 🎯 **SELECT / CLASSIFY** — Silently classify targets using the Target Matrix. **Do not output a list of findings or pause to ask the operator for prioritization.** If multiple targets are found, lock onto targets ${priorityLanguage} up to your limit. Log any remaining unhandled targets into your \`.jules/\` journal for the next scheduled run, and immediately proceed to Step 3. Target Limit: ${targetLimitClean}.
3. ⚙️ **[${data.process?.theme_verb || data.process?.execute?.theme_verb || ''}]** — **${executionPosture}** ${targetLimitInstruction}Halt when your locked scope is clean; do not expand your search to satisfy a quota.
${executionSteps}
4. ✅ **VERIFY** — **The Reporter Procedure:** ${reporterProtocol}
**Heuristic Verification:**
${heuristics}
5. 🎁 **PRESENT** — ${presentationSlotClean} ${zeroTargetExitInstruction}${requiresTasksBoard ? "If the run produced no source mutations but did append relay entries to `.jules/agent_tasks.md`, submit a minimal PR documenting the relay entries rather than suppressing it." : ""}
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
