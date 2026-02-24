// Polygraph Verification Suite
// Tests strict schema validation for Fusion Agent Outputs

const FusionSchema = require('../js/FusionSchema.js');
const FusionCompiler = require('../js/FusionCompiler.js');

// Mock global FusionSchema for FusionCompiler to use
// Since FusionCompiler calls FusionSchema.validate(), and in this script FusionSchema is a module,
// we need to make it available globally if FusionCompiler expects it globally.
global.FusionSchema = FusionSchema;

let errors = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        errors++;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

function testSchemaValidation() {
    console.log('\n--- Testing FusionSchema Validation ---');

    const validOutput = {
        phase1: { thought_process: "Thinking...", output: "Done." },
        phase2: { thought_process: "Refining...", output: "Polished." },
        pr_title: "My PR"
    };

    const result = FusionSchema.validate(validOutput);
    assert(result.valid, "Valid output should pass");

    const missingPhase1 = {
        phase2: { thought_process: "Refining...", output: "Polished." },
        pr_title: "My PR"
    };
    const resMissing = FusionSchema.validate(missingPhase1);
    assert(!resMissing.valid, "Missing phase1 should fail");
    assert(resMissing.errors.some(e => e.includes("Missing required key: 'phase1'")), "Error message check: missing phase1");

    const badType = {
        phase1: "Not an object",
        phase2: { thought_process: "Refining...", output: "Polished." },
        pr_title: "My PR"
    };
    const resType = FusionSchema.validate(badType);
    assert(!resType.valid, "Bad type for phase1 should fail");

    const extraKey = {
        phase1: { thought_process: "Thinking...", output: "Done." },
        phase2: { thought_process: "Refining...", output: "Polished." },
        pr_title: "My PR",
        hallucination: "I am extra"
    };
    const resExtra = FusionSchema.validate(extraKey);
    assert(!resExtra.valid, "Extra key should fail (Strict Mode)");
    assert(resExtra.errors.some(e => e.includes("Unexpected key found")), "Error message check: extra key");

    const malformedJson = "{ phase1: ... "; // Invalid JSON
    const resMalformed = FusionSchema.validate(malformedJson);
    assert(!resMalformed.valid, "Malformed JSON string should fail");
}

function testFusionCompiler() {
    console.log('\n--- Testing FusionCompiler Integration ---');

    // Test Validate Output Proxy
    const validOutput = {
        phase1: { thought_process: "Thinking...", output: "Done." },
        phase2: { thought_process: "Refining...", output: "Polished." },
        pr_title: "My PR"
    };
    const proxyResult = FusionCompiler.validateFusionOutput(validOutput);
    assert(proxyResult.valid, "FusionCompiler.validateFusionOutput should delegate correctly");

    // Test Prompt Generation (Schema Presence)
    const compiler = new FusionCompiler([], {});
    // Mock agents
    const agent1 = { name: "AgentA", icon: "🅰️", prompt: "## PROCESS\nDo A.\n## BOUNDARIES\nNo B." };
    const agent2 = { name: "AgentB", icon: "🅱️", prompt: "## PROCESS\nDo B.\n## BOUNDARIES\nNo A." };

    const prompt = compiler.stitch(agent1, agent2);

    // Verify critical schema instructions
    assert(prompt.includes("strict JSON object adhering to this exact schema"), "Prompt must strictly demand JSON schema");
    assert(prompt.includes("FAILURE TO COMPLY WITH THIS SCHEMA WILL CAUSE THE FUSION TO FAIL"), "Prompt must include failure warning");
    assert(prompt.includes('"phase1": {'), "Prompt must include phase1 in schema definition");
    assert(prompt.includes('"phase2": {'), "Prompt must include phase2 in schema definition");
    assert(prompt.includes('"pr_title":'), "Prompt must include pr_title in schema definition");
}

try {
    testSchemaValidation();
    testFusionCompiler();
} catch (e) {
    console.error("Critical Test Error:", e);
    errors++;
}

if (errors > 0) {
    console.error(`\n🔥 ${errors} TESTS FAILED`);
    process.exit(1);
} else {
    console.log("\n✨ ALL TESTS PASSED");
    process.exit(0);
}
