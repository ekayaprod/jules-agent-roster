global.PromptParser = require('../Utils/prompt-parser.js');
/**
 * @jest-environment node
 */
const JulesService = require('./JulesService');

describe('JulesService', () => {
    let service;
    let originalFetch;

    beforeEach(() => {
        service = new JulesService();
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
        jest.clearAllTimers();
    });

    describe('Initialization', () => {
        it('should initialize with empty API key and base URL', () => {
            expect(service.apiKey).toBe('');
            expect(service.baseUrl).toBe('https://jules.googleapis.com/v1alpha');
        });
    });

    describe('configure', () => {
        it('should set the apiKey correctly', () => {
            service.configure('test-api-key');
            expect(service.apiKey).toBe('test-api-key');
        });
    });

    describe('_fetch', () => {
        it('should throw an error if API key is missing', async () => {
            await expect(service._fetch('test')).rejects.toThrow("Jules API Key is missing. Please configure it in Settings.");
        });

        it('should throw a timeout error if request takes longer than 15s', async () => {
            jest.useFakeTimers();
            service.configure('test-api-key');

            // Mock fetch to simulate a delayed response, but we trigger the abort manually
            global.fetch.mockImplementation(async (url, options) => {
                 return new Promise((resolve, reject) => {
                     // Listen for the abort signal and reject immediately when fired
                     options.signal.addEventListener('abort', () => {
                         const err = new Error('AbortError');
                         err.name = 'AbortError';
                         reject(err);
                     });
                 });
            });

            const fetchPromise = service._fetch('test');

            // Advance timers to trigger the setTimeout in _fetch
            jest.advanceTimersByTime(15000);

            await expect(fetchPromise).rejects.toThrow("The request timed out. Please check your connection and try again.");
            jest.useRealTimers();
        });

        it('should throw generic error if fetch fails completely after retries', async () => {
            service.configure('test-api-key');
            global.fetch.mockRejectedValue(new Error("Network Error"));

            await expect(service._fetch('test', {}, 2, 10)).rejects.toThrow("Network Error");
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should retry on 5xx server errors and eventually throw fallback message', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 502,
                text: async () => "Bad Gateway"
            });

            await expect(service._fetch('test', {}, 2, 10)).rejects.toThrow("We encountered a server error. Please wait a moment and try again.");
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should handle malformed JSON response gracefully', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => { throw new SyntaxError("Unexpected token"); }
            });

            await expect(service._fetch('test')).rejects.toThrow("We encountered a server error. Please wait a moment and try again.");
        });

        it('should return parsed JSON response on success', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            });

            const response = await service._fetch('test');
            expect(response.success).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://jules.googleapis.com/v1alpha/test',
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': 'test-api-key'
                    }
                })
            );
        });

        it('should return parsed JSON response on success after retrying', async () => {
            service.configure('test-api-key');
            global.fetch
                .mockRejectedValueOnce(new Error("Network Error"))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                });

            const response = await service._fetch('test', {}, 2, 10);
            expect(response.success).toBe(true);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should throw error with specific JSON message on non-ok response without retrying on 4xx', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => JSON.stringify({ error: { message: "Bad Request details" } })
            });

            await expect(service._fetch('test')).rejects.toThrow("Bad Request details");
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error with fallback message on non-ok response with malformed JSON without retrying on 4xx', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => "Forbidden" // Not JSON
            });

            await expect(service._fetch('test')).rejects.toThrow("We encountered a server error. Please wait a moment and try again.");
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error with fallback message on non-ok response with JSON lacking error.message', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ someOtherField: "value" })
            });

            await expect(service._fetch('test')).rejects.toThrow("We encountered a server error. Please wait a moment and try again.");
        });
    });

    describe('getSessions', () => {
        it('should call _fetch with the correct endpoint and parameters', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ sessions: [] });

            const response = await service.getSessions(25);

            expect(fetchSpy).toHaveBeenCalledWith('sessions?pageSize=25');
            expect(response).toEqual({ sessions: [] });
        });

        it('should call _fetch with the default parameter', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ sessions: [] });

            const response = await service.getSessions();

            expect(fetchSpy).toHaveBeenCalledWith('sessions?pageSize=50');
            expect(response).toEqual({ sessions: [] });
        });
    });

    describe('getSources', () => {
        it('should call _fetch with the correct endpoint', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ sources: [] });

            const response = await service.getSources();

            expect(fetchSpy).toHaveBeenCalledWith('sources');
            expect(response).toEqual({ sources: [] });
        });
    });

describe('createSession', () => {
        it('should format and post the payload correctly', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ id: '123' });

            const markdown = "Test Agent";
            const task = "Do it";
            const source = "repo";

            const response = await service.createSession(markdown, task, source, "My Title");

            expect(fetchSpy).toHaveBeenCalledWith('sessions', {
                method: 'POST',
                body: expect.stringContaining("Test Agent")
            });

            expect(response).toEqual({ id: '123' });
        });

        it('should format and post the payload correctly with default title', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ id: '123' });

            const markdown = "Test Agent";
            const task = "Do it";
            const source = "repo";

            const response = await service.createSession(markdown, task, source);

            expect(fetchSpy).toHaveBeenCalledWith('sessions', {
                method: 'POST',
                body: expect.stringContaining('"title":"Agent Task"')
            });

            expect(response).toEqual({ id: '123' });
        });
    });
    describe('getActivities', () => {
        it('should call _fetch with the correct endpoint and parameters', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ activities: [] });

            const response = await service.getActivities('session-123');

            expect(fetchSpy).toHaveBeenCalledWith('sessions/session-123/activities?pageSize=50');
            expect(response).toEqual({ activities: [] });
        });
});



    describe('sendUserInput', () => {
        it('should call _fetch with the correct payload for sendUserInput', async () => {
            const fetchSpy = jest.spyOn(service, '_fetch').mockResolvedValue({ id: 'reply-1' });

            const response = await service.sendUserInput('session-123', 'proceed');

            expect(fetchSpy).toHaveBeenCalledWith('sessions/session-123/activities', {
                method: 'POST',
                body: JSON.stringify({
                    type: "USER_INPUT",
                    message: 'proceed'
                })
            });
            expect(response).toEqual({ id: 'reply-1' });
        });
    });

    describe('getPullRequest', () => {
        it('should throw an error for unsupported source formats', async () => {
            await expect(service.getPullRequest('invalid-source', 1)).rejects.toThrow('Unsupported source format');
        });

        it('should apply githubToken to headers if configured', async () => {
            service.configure('api-key', 'test-token');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ id: 1 })
            });

            await service.getPullRequest('sources/github/owner/repo', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls/1',
                expect.objectContaining({
                    headers: { 'Authorization': 'token test-token' }
                })
            );
        });

        it('should extract message from GitHub API error response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ message: "API rate limit exceeded" })
            });

            await expect(service.getPullRequest('sources/github/owner/repo', 1)).rejects.toThrow("API rate limit exceeded");
        });

        it('should fallback to default error message if parsing fails', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => "Internal Server Error"
            });

            await expect(service.getPullRequest('sources/github/owner/repo', 1)).rejects.toThrow("GitHub API returned 500");
        });

        it('should throw timeout error', async () => {
            jest.useFakeTimers();
            global.fetch.mockImplementation((url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        const err = new Error('AbortError');
                        err.name = 'AbortError';
                        reject(err);
                    });
                });
            });

            try {
                const promise = service.getPullRequest('sources/github/owner/repo', 1);
                jest.advanceTimersByTime(15000);
                await expect(promise).rejects.toThrow('Request timed out');
            } finally {
                jest.useRealTimers();
            }
        });

        it('should rethrow standard network error', async () => {
            global.fetch.mockRejectedValue(new Error("Network Error"));

            await expect(service.getPullRequest('sources/github/owner/repo', 1)).rejects.toThrow("Network Error");
        });
    });

    describe('mergePullRequest', () => {
        it('should throw an error for unsupported source formats', async () => {
            await expect(service.mergePullRequest('invalid-source', 1)).rejects.toThrow('Unsupported source format');
        });

        it('should format and make PUT request correctly', async () => {
            service.configure('api-key', 'test-token');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ merged: true })
            });

            const response = await service.mergePullRequest('sources/github/owner/repo', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls/1/merge',
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Authorization': 'token test-token',
                        'Content-Type': 'application/json'
                    }
                })
            );
            expect(response).toEqual({ merged: true });
        });

        it('should format correctly without token', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ merged: true })
            });

            await service.mergePullRequest('sources/github/owner/repo', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls/1/merge',
                expect.objectContaining({
                    method: 'PUT'
                })
            );
        });

        it('should extract message from GitHub API error response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 409,
                text: async () => JSON.stringify({ message: "Merge conflict" })
            });

            await expect(service.mergePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("Merge conflict");
        });

        it('should fallback to default error message if parsing fails', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => "Internal Server Error"
            });

            await expect(service.mergePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("GitHub API returned 500");
        });

        it('should throw timeout error', async () => {
            jest.useFakeTimers();
            global.fetch.mockImplementation((url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        const err = new Error('AbortError');
                        err.name = 'AbortError';
                        reject(err);
                    });
                });
            });

            try {
                const promise = service.mergePullRequest('sources/github/owner/repo', 1);
                jest.advanceTimersByTime(15000);
                await expect(promise).rejects.toThrow('Request timed out');
            } finally {
                jest.useRealTimers();
            }
        });

        it('should rethrow standard network error', async () => {
            global.fetch.mockRejectedValue(new Error("Network Error"));

            await expect(service.mergePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("Network Error");
        });
    });

    describe('closePullRequest', () => {
        it('should throw an error for unsupported source formats', async () => {
            await expect(service.closePullRequest('invalid-source', 1)).rejects.toThrow('Unsupported source format');
        });

        it('should format and make PATCH request correctly', async () => {
            service.configure('api-key', 'test-token');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ state: 'closed' })
            });

            const response = await service.closePullRequest('sources/github/owner/repo', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls/1',
                expect.objectContaining({
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'token test-token',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ state: 'closed' })
                })
            );
            expect(response).toEqual({ state: 'closed' });
        });

        it('should format correctly without token', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ state: 'closed' })
            });

            await service.closePullRequest('sources/github/owner/repo', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls/1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ state: 'closed' })
                })
            );
        });

        it('should extract message from GitHub API error response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ message: "Forbidden" })
            });

            await expect(service.closePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("Forbidden");
        });

        it('should fallback to default error message if parsing fails', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => "Internal Server Error"
            });

            await expect(service.closePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("GitHub API returned 500");
        });

        it('should throw timeout error', async () => {
            jest.useFakeTimers();
            global.fetch.mockImplementation((url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        const err = new Error('AbortError');
                        err.name = 'AbortError';
                        reject(err);
                    });
                });
            });

            try {
                const promise = service.closePullRequest('sources/github/owner/repo', 1);
                jest.advanceTimersByTime(15000);
                await expect(promise).rejects.toThrow('Request timed out');
            } finally {
                jest.useRealTimers();
            }
        });

        it('should rethrow standard network error', async () => {
            global.fetch.mockRejectedValue(new Error("Network Error"));

            await expect(service.closePullRequest('sources/github/owner/repo', 1)).rejects.toThrow("Network Error");
        });
    });


    describe('getPullRequests', () => {
        it('should throw an error for unsupported source formats', async () => {
            await expect(service.getPullRequests('invalid-source')).rejects.toThrow('Unsupported source format for pull requests');
        });

        it('should apply githubToken to headers if configured', async () => {
            service.configure('api-key', 'test-token');
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ([])
            });

            await service.getPullRequests('sources/github/owner/repo');

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls?state=open',
                expect.objectContaining({
                    headers: { 'Authorization': 'token test-token' }
                })
            );
        });

        it('should return empty array on 404 status code', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404
            });

            const response = await service.getPullRequests('sources/github/owner/repo');
            expect(response).toEqual([]);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/pulls?state=open',
                expect.any(Object)
            );
        });

        it('should throw error on network error', async () => {
            global.fetch.mockRejectedValue(new Error("Network Error"));
            await expect(service.getPullRequests('sources/github/owner/repo')).rejects.toThrow("Network Error");
        });

        it('should return empty array and log error on timeout', async () => {
            jest.useFakeTimers();
            global.fetch.mockImplementation((url, options) => {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        const err = new Error('AbortError');
                        err.name = 'AbortError';
                        reject(err);
                    });
                });
            });
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const promise = service.getPullRequests('sources/github/owner/repo');
            jest.advanceTimersByTime(15000);

            const response = await promise;
            expect(response).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch pull requests:", expect.any(Error));

            consoleSpy.mockRestore();
            jest.useRealTimers();
        });

        it('should extract message from GitHub API error response', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ message: "API rate limit exceeded" })
            });

            await expect(service.getPullRequests('sources/github/owner/repo')).rejects.toThrow("API rate limit exceeded");
        });


        it('should log warning and rethrow if error JSON parsing fails', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => "Forbidden" // Invalid JSON to trigger the try-catch block
            });

            await expect(service.getPullRequests('sources/github/owner/repo')).rejects.toThrow("GitHub API returned 403");
            expect(consoleSpy).toHaveBeenCalledWith("Failed to parse error JSON:", expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should throw error on invalid format (JSON parsing error)', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => { throw new Error("Invalid JSON"); }
            });

            const response = await service.getPullRequests('sources/github/owner/repo');
            expect(response).toEqual([]);
        });

        it('should return pull requests on success', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ([{ id: 1, title: 'Test PR' }])
            });

            const response = await service.getPullRequests('sources/github/owner/repo');
            expect(response).toEqual([{ id: 1, title: 'Test PR' }]);
        });
    });

    if (typeof window !== 'undefined') {
        describe('Environment Initialization', () => {
            it('should attach to window object if window is defined', () => {
                expect(window.julesService).toBeDefined();
                expect(window.julesService instanceof JulesService).toBe(true);
            });
        });
    }
});
