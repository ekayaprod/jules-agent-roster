global.window = {};
const fs = require('fs');
const path = require('path');

// Manually evaluate the service for testing
const code = fs.readFileSync(path.join(__dirname, 'JulesAPI.js'), 'utf8');
eval(code);

describe('JulesAPI Schema Validation (Polygraph)', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        window.julesService.configure("mock-api-key");
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('getSources', () => {
        it('parses valid sources JSON successfully', async () => {
            const validData = {
                sources: [
                    { name: "test-source", githubRepo: { owner: "user", repo: "test-repo" } }
                ]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => validData
            });

            const result = await window.julesService.getSources();
            expect(result.sources).toHaveLength(1);
            expect(result.sources[0].name).toBe("test-source");
        });

        it('gracefully handles empty sources array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sources: [] })
            });
            const result = await window.julesService.getSources();
            expect(result.sources).toEqual([]);
        });

        it('throws schema error on missing sources key', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ extra_key: "hallucination" })
            });
            // According to validateSources, undefined sources is initialized to []
            const result = await window.julesService.getSources();
            expect(result.sources).toEqual([]);
        });

        it('throws schema error when sources is not an array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sources: "not-an-array" })
            });
            await expect(window.julesService.getSources()).rejects.toThrow("Invalid schema: 'sources' must be an array");
        });

        it('throws schema error on hallucinated/malformed source item (missing name)', async () => {
            const invalidData = {
                sources: [
                    { githubRepo: { owner: "user", repo: "test-repo" } }
                ]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => invalidData
            });

            await expect(window.julesService.getSources()).rejects.toThrow("Invalid schema: Source missing 'name'");
        });

        it('throws schema error on missing githubRepo fields', async () => {
            const invalidData = {
                sources: [
                    { name: "test", githubRepo: { owner: "user" } } // missing repo
                ]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => invalidData
            });

            await expect(window.julesService.getSources()).rejects.toThrow("Invalid schema: Source missing 'githubRepo.repo'");
        });
    });

    describe('createSession', () => {
        it('parses valid session JSON successfully', async () => {
            const validData = { id: "session-1234", state: "PENDING" };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => validData
            });

            const result = await window.julesService.createSession("prompt", "task", "source");
            expect(result.id).toBe("session-1234");
        });

        it('throws schema error on hallucinated session item (missing id)', async () => {
            const invalidData = { session_id: "session-1234" }; // hallucinated key
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => invalidData
            });

            await expect(window.julesService.createSession("prompt", "task", "source")).rejects.toThrow("Invalid schema: Session missing 'id'");
        });
    });

    describe('getActivities', () => {
        it('parses valid activities JSON successfully', async () => {
            const validData = {
                activities: [
                    { id: "act-1", createTime: "2023-10-27T10:00:00Z" }
                ]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => validData
            });

            const result = await window.julesService.getActivities("sess-1");
            expect(result.activities).toHaveLength(1);
        });

        it('throws schema error on hallucinated activity item (missing createTime)', async () => {
            const invalidData = {
                activities: [
                    { id: "act-1", timestamp: "2023-10-27T10:00:00Z" } // Hallucinated key
                ]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => invalidData
            });

            await expect(window.julesService.getActivities("sess-1")).rejects.toThrow("Invalid schema: Activity missing 'createTime'");
        });

        it('throws schema error when activities is not an array', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ activities: "not-an-array" })
            });
            await expect(window.julesService.getActivities("sess-1")).rejects.toThrow("Invalid schema: 'activities' must be an array");
        });
    });
});
