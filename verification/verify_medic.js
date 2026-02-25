// Polyfill Jest mock
const jest = {
    fn: () => {
        const mockFn = (...args) => {
            mockFn.mock.calls.push(args);
            // Implement simple return value logic if needed, but for now just push calls
            const impl = mockFn.mock.implementations.shift();
            if (impl) return impl(...args);
            return mockFn.mock.defaultImplementation ? mockFn.mock.defaultImplementation(...args) : undefined;
        };
        mockFn.mock = { calls: [], implementations: [] };
        mockFn.mockResolvedValueOnce = (val) => {
            mockFn.mock.implementations.push(() => Promise.resolve(val));
            return mockFn;
        };
        mockFn.mockReturnValue = (val) => {
             mockFn.mock.defaultImplementation = () => val;
             return mockFn;
        };
        mockFn.mockReset = () => {
            mockFn.mock.calls = [];
            mockFn.mock.implementations = [];
            mockFn.mock.defaultImplementation = null;
        };
        return mockFn;
    }
};

const AgentRepository = require('../js/services/AgentRepository.js');

// Mock CONFIG
global.CONFIG = {
    categories: {
        core: "coreGrid",
        architecture: "archGrid"
    }
};

// Mock fetch
const fetchMock = jest.fn();
global.fetch = fetchMock;

// Mock setTimeout to be instant
const originalSetTimeout = global.setTimeout;
global.setTimeout = (fn) => fn();

async function runTests() {
    console.log("🚑 Medic Verification Protocol Initiated...");
    let passed = 0;
    let failed = 0;

    const repo = new AgentRepository();

    // Test 1: fetchWithRetry retries on 500
    try {
        console.log("\nTest 1: fetchWithRetry retries on 500");
        fetchMock.mockReset();

        // Setup sequence: 500 -> 500 -> 200 OK
        fetchMock
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

        await repo.fetchWithRetry("http://test.com/500", {}, 3, 1);

        if (fetchMock.mock.calls.length === 3) {
            console.log("✅ Passed: Retried 3 times (2 failures + 1 success)");
            passed++;
        } else {
            console.error(`❌ Failed: Expected 3 calls, got ${fetchMock.mock.calls.length}`);
            failed++;
        }
    } catch (e) {
        console.error("❌ Failed with error:", e);
        failed++;
    }

    // Test 2: fetchWithRetry DOES NOT retry on 404
    try {
        console.log("\nTest 2: fetchWithRetry DOES NOT retry on 404");
        fetchMock.mockReset();
        // Setup sequence: 404 immediately
        fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

        const res = await repo.fetchWithRetry("http://test.com/404", {}, 3, 1);

        // Should return response object, not throw
        if (fetchMock.mock.calls.length === 1 && res.status === 404) {
            console.log("✅ Passed: Stopped immediately on 404");
            passed++;
        } else {
            console.error(`❌ Failed: Expected 1 call, got ${fetchMock.mock.calls.length}`);
            failed++;
        }
    } catch (e) {
        console.error("❌ Failed with error:", e);
        failed++;
    }

    // Test 3: getAgents uses fetchWithRetry for all calls
    try {
        console.log("\nTest 3: getAgents uses fetchWithRetry for all calls");
        fetchMock.mockReset();

        // 1. agents.json
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                { name: "AgentA", category: "core" }
            ])
        });

        // 2. prompt for AgentA
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => "Prompt A"
        });

        // 3. custom_agents.json
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                "AgentA,AgentB": { name: "FusionAB", description: "Desc" }
            })
        });

        // 4. prompt for FusionAB
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => "Fusion Prompt"
        });

        await repo.getAgents();

        // Check calls
        const calls = fetchMock.mock.calls.map(c => c[0]);
        // console.log("Fetch calls:", calls);

        let p1 = passed;
        if (calls.some(c => c === "agents.json")) {
             // Good
        } else {
            console.error("❌ Failed: Missing agents.json fetch");
            failed++;
        }

        if (calls.some(c => c.includes("AgentA.md"))) {
             // Good
        } else {
             console.error("❌ Failed: Missing AgentA.md fetch");
             failed++;
        }

        if (calls.some(c => c === "custom_agents.json")) {
             // Good
        } else {
             console.error("❌ Failed: Missing custom_agents.json fetch");
             failed++;
        }

        if (calls.some(c => c.includes("FusionAB.md"))) {
             // Good
        } else {
             console.error("❌ Failed: Missing FusionAB.md fetch");
             failed++;
        }

        if (p1 === passed && failed === 0) { // No new failures
            console.log("✅ Passed: All resources fetched");
            passed++;
        }

    } catch (e) {
        console.error("❌ Failed with error:", e);
        failed++;
    }


    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests();
