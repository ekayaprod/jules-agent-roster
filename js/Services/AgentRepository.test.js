const AgentRepository = require('./AgentRepository');

global.CONFIG = { categories: { 'architect': 'Architect', 'developer': 'Developer' } };

describe('AgentRepository', () => {
    let repo;
    let originalFetch;
    let originalConsoleWarn;
    let originalConsoleError;

    beforeEach(() => {
        repo = new AgentRepository();
        originalFetch = global.fetch;
        global.fetch = jest.fn();

        originalConsoleWarn = console.warn;
        originalConsoleError = console.error;
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        jest.clearAllMocks();
    });

    describe('fetchWithRetry', () => {
        it('aborts and throws error if fetch takes longer than 10 seconds', async () => {
            jest.useFakeTimers();

            global.fetch.mockImplementation(async (url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        const err = new Error('AbortError');
                        err.name = 'AbortError';
                        reject(err);
                    });
                });
            });

            const fetchPromise = repo.fetchWithRetry('http://example.com', {}, 0); // 0 retries to prevent recursive looping for this test

            // Advance timers by exactly 10s to trigger the abort controller
            jest.advanceTimersByTime(10000);

            await expect(fetchPromise).rejects.toThrow("AbortError");

            jest.useRealTimers();
        });

        it('returns response immediately on successful fetch', async () => {
            const mockResponse = { ok: true, json: async () => ({}) };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await repo.fetchWithRetry('http://example.com');
            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('does not retry and returns response directly on 404', async () => {
            const mockResponse = { ok: false, status: 404 };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const result = await repo.fetchWithRetry('http://example.com');
            expect(result).toBe(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(console.warn).not.toHaveBeenCalled();
        });

        it('retries on non-404 failure and eventually succeeds', async () => {
            const mockFail = { ok: false, status: 500 };
            const mockSuccess = { ok: true };

            global.fetch
                .mockResolvedValueOnce(mockFail)
                .mockResolvedValueOnce(mockFail)
                .mockResolvedValueOnce(mockSuccess);

            // Mock setTimeout directly since fakeTimers + await can be tricky to synchronize in tests
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((cb) => cb());

            const promise = repo.fetchWithRetry('http://example.com', {}, 3, 10);
            const result = await promise;

            expect(result).toBe(mockSuccess);
            expect(global.fetch).toHaveBeenCalledTimes(3);
            expect(console.warn).toHaveBeenCalledTimes(2);

            global.setTimeout = originalSetTimeout;
        });

        it('exhausts retries and throws error', async () => {
            global.fetch.mockRejectedValue(new Error("Network Failure"));

            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((cb) => cb());

            const promise = repo.fetchWithRetry('http://example.com', {}, 2, 10);

            await expect(promise).rejects.toThrow("Network Failure");
            expect(global.fetch).toHaveBeenCalledTimes(3);

            global.setTimeout = originalSetTimeout;
        });

        it('exhausts retries and throws custom server error on non-ok', async () => {
            global.fetch.mockResolvedValue({ ok: false, status: 502 });

            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((cb) => cb());

            const promise = repo.fetchWithRetry('http://example.com', {}, 1, 10);

            await expect(promise).rejects.toThrow("We couldn't reach the server");
            expect(global.fetch).toHaveBeenCalledTimes(2);

            global.setTimeout = originalSetTimeout;
        });
    });

    describe('safeJsonParse', () => {
        it('parses valid json successfully', async () => {
            const mockResponse = { json: async () => ({ key: 'value' }) };
            const result = await repo.safeJsonParse(mockResponse, 'test.json');
            expect(result).toEqual({ key: 'value' });
        });

        it('catches invalid json and throws formatted error', async () => {
            const mockResponse = { json: async () => { throw new Error('Unexpected token'); } };

            await expect(repo.safeJsonParse(mockResponse, 'test.json')).rejects.toThrow("Check your configuration file formatting and try again.");
            expect(console.error).toHaveBeenCalledTimes(1);

            const logArgs = JSON.parse(console.error.mock.calls[0][0]);
            expect(logArgs).toEqual({
                event: 'JSON_PARSE_FAILED',
                resource: 'test.json',
                error: 'Unexpected token'
            });
        });
    });

    describe('fetchPrompt', () => {
        it('returns parsed text on success', async () => {
            repo.fetchWithRetry = jest.fn().mockResolvedValue({
                ok: true,
                text: async () => 'prompt text'
            });

            const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
            expect(res).toBe('prompt text');
        });

        it('returns fallback and warns on non-ok standard prompt', async () => {
            repo.fetchWithRetry = jest.fn().mockResolvedValue({
                ok: false
            });

            const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
            expect(res).toBe('fallback');
            expect(console.warn).toHaveBeenCalledWith('Failed to load prompt for AgentName');
        });

        it('returns fallback and avoids warn on non-ok custom prompt', async () => {
            repo.fetchWithRetry = jest.fn().mockResolvedValue({
                ok: false
            });

            const res = await repo.fetchPrompt('AgentName', 'http://example.com/fusions/prompt.md', 'fallback');
            expect(res).toBe('fallback');
            expect(console.warn).not.toHaveBeenCalledWith('Failed to load prompt for AgentName');
        });

        it('catches throw and returns fallback for standard prompt', async () => {
            const err = new Error('Network');
            repo.fetchWithRetry = jest.fn().mockRejectedValue(err);

            const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
            expect(res).toBe('fallback');
            expect(console.warn).toHaveBeenCalledWith('Error loading prompt for AgentName', err);
        });

        it('catches throw and returns fallback for custom prompt', async () => {
            const err = new Error('Network');
            repo.fetchWithRetry = jest.fn().mockRejectedValue(err);

            const res = await repo.fetchPrompt('AgentName', 'http://example.com/fusions/prompt.md', 'fallback');
            expect(res).toBe('fallback');
            expect(console.warn).toHaveBeenCalledWith('Error loading custom prompt for AgentName', err);
        });
    });

    describe('validateAgentsData', () => {
        it('throws if data is not an array', () => {
            expect(() => repo.validateAgentsData(null)).toThrow("Provide a valid list of agents in the expected format.");
            expect(() => repo.validateAgentsData({})).toThrow("Provide a valid list of agents in the expected format.");
        });

        it('filters invalid agents and warns', () => {
            const invalidAgents = [
                null,
                { name: 123 },
                { name: 'valid', category: 123 },
                { name: 'valid', category: 'unknown_cat' }
            ];

            const res = repo.validateAgentsData(invalidAgents);
            expect(res).toEqual([]);
            expect(console.warn).toHaveBeenCalledTimes(4);
        });

        it('sanitizes valid agents', () => {
            const validAgents = [
                { name: '  Trimmer  ', category: 'architect', scope: 123 },
                { name: 'Fine', category: 'developer' }
            ];

            const res = repo.validateAgentsData(validAgents);

            expect(res).toHaveLength(2);
            expect(res[0].name).toBe('Trimmer');
            expect(res[0].scope).toBe('123'); // Cast to string
            expect(console.warn).toHaveBeenCalledWith('Sanitizing agent Trimmer: scope must be string. Casting.');

            expect(res[1].name).toBe('Fine');
            expect(res[1].scope).toBeUndefined();
        });
    });

    describe('validateCustomAgent', () => {
        it('invalidates non-objects', () => {
            expect(repo.validateCustomAgent('key', null)).toEqual({ valid: false, reason: "Entry is not an object" });
            expect(repo.validateCustomAgent('key', "string")).toEqual({ valid: false, reason: "Entry is not an object" });
        });

        it('invalidates missing or empty names', () => {
            expect(repo.validateCustomAgent('key', {})).toEqual({ valid: false, reason: "Missing or invalid 'name' field" });
            expect(repo.validateCustomAgent('key', { name: "   " })).toEqual({ valid: false, reason: "Missing or invalid 'name' field" });
            expect(repo.validateCustomAgent('key', { name: 123 })).toEqual({ valid: false, reason: "Missing or invalid 'name' field" });
        });

        it('sanitizes description fields to strings', () => {
            const mockAgentPayload = { name: "Valid", desc: 123, description: 456, short_description: 789 };
            const res = repo.validateCustomAgent('key', mockAgentPayload);

            expect(res.valid).toBe(true);
            expect(res.sanitized.short_description).toBe("789");
        });

        it('normalizes desc to short_description', () => {
            const mockAgentPayload = { name: "Valid", desc: "My Desc" };
            const res = repo.validateCustomAgent('key', mockAgentPayload);
            expect(res.valid).toBe(true);
            expect(res.sanitized.short_description).toBe("My Desc");
            expect(res.sanitized.desc).toBeUndefined();
        });

        it('normalizes description to short_description', () => {
            const mockAgentPayload = { name: "Valid", description: "My Full Desc" };
            const res = repo.validateCustomAgent('key', mockAgentPayload);
            expect(res.valid).toBe(true);
            expect(res.sanitized.short_description).toBe("My Full Desc");
            expect(res.sanitized.description).toBeUndefined();
        });

        it('rejects malicious patterns (XSS)', () => {
            const maliciousData = [
                { name: "<script>alert(1)</script>" },
                { name: "Safe", short_description: "<img src=x onerror=alert(1)>" },
                { name: "Safe", desc: "javascript:alert(1)" },
                { name: "Safe", description: "Click <button>Me</button>" },
                { name: "<iframe src='bad.com'></iframe>" }
            ];

            maliciousData.forEach(mockAgentPayload => {
                const res = repo.validateCustomAgent('key', mockAgentPayload);
                expect(res.valid).toBe(false);
                expect(res.reason).toBe("Potential malicious content detected");
            });
        });

        it('uses default fallback emoji if no emoji found in JSON payload', () => {
            const res = repo.validateCustomAgent('key', { name: "Plain Agent" });

            expect(res.valid).toBe(true);
            expect(res.sanitized.emoji).toBe("🤖");
            expect(res.sanitized.name).toBe("Plain Agent");
        });
    });

    describe('fetchAgents and private loaders', () => {
        let originalFetchPrompt;

        beforeEach(() => {
            originalFetchPrompt = repo.fetchPrompt;
            repo.fetchPrompt = jest.fn().mockResolvedValue("Fetched Prompt");

            global.document = {
                getElementById: jest.fn().mockReturnValue({ textContent: '' })
            };
        });

        afterEach(() => {
            repo.fetchPrompt = originalFetchPrompt;
            delete global.document;
        });

        it('fetchAgents executes concurrently and returns combined object', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => [{ name: "Standard", category: "architect", promptFile: "std.md" }]
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        "custom1": { name: "Custom", category: "developer" }
                    })
                });

            const results = await repo.fetchAgents();

            expect(results.agents).toHaveLength(1);
            expect(results.agents[0].name).toBe("Standard");

            expect(Object.keys(results.customAgents)).toHaveLength(1);
            expect(results.customAgents.custom1.name).toBe("Custom");

            expect(repo.fetchWithRetry).toHaveBeenCalledTimes(2);
        });

        it('fetchAgents throws on top-level network failure', async () => {
            repo.fetchWithRetry = jest.fn().mockRejectedValue(new Error("Network Error"));
            await expect(repo.fetchAgents()).rejects.toThrow("Network Error");
        });

        it('filters invalid custom agent gracefully via fetchAgents', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Empty standard
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        "invalid1": { name: null }, // Invalid
                        "valid1": { name: "Custom 🔥", category: "developer" } // Valid
                    })
                });

            const results = await repo.fetchAgents();
            expect(Object.keys(results.customAgents)).toHaveLength(1);
            expect(results.customAgents.valid1.name).toBe("Custom 🔥");
        });

        it('handles processCustomAgent error throwing when fetchPrompt throws internally', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Empty std
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ "err1": { name: "Error Agent" } })
                });

            repo.fetchPrompt.mockRejectedValue(new Error("File error"));

            const results = await repo.fetchAgents();

            // It swallows the error and returns null, which filters out the custom agent
            expect(Object.keys(results.customAgents)).toHaveLength(0);
        });

        it('handles safeJsonParse throwing errors gracefully for standard agents', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({ ok: true, json: async () => { throw new Error('Bad json'); } })
                .mockResolvedValueOnce({ ok: true, json: async () => ({}) });


            try {
                await repo.fetchAgents();
            } catch (e) {
                // If it resolves, it handles failure gracefully inside fetchAgents (which actually just logs error and returns {})
            }
            expect(console.error).toHaveBeenCalled();

        });

        it('handles safeJsonParse throwing errors gracefully for custom agents', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({ ok: true, json: async () => [] })
                .mockResolvedValueOnce({ ok: true, json: async () => { throw new Error('Bad json'); } });


            try {
                await repo.fetchAgents();
            } catch (e) {
                // If it resolves, it handles failure gracefully inside fetchAgents (which actually just logs error and returns {})
            }
            expect(console.error).toHaveBeenCalled();

        });

        it('catches missing properties in validateCustomAgent (first responder missing desc logic)', async () => {
            repo.fetchWithRetry = jest.fn()
                .mockResolvedValueOnce({ ok: true, json: async () => [] })
                .mockResolvedValueOnce({ ok: true, json: async () => ({
                    "no_desc": { name: "Agent" }
                })});

            const results = await repo.fetchAgents();
            expect(results.customAgents.no_desc.name).toBe("Agent");
        });
    });
});
