/**
 * @jest-environment jsdom
 */
const JulesService = require('./JulesAPI');

describe('JulesService', () => {
    let service;
    let originalFetch;
    let originalWindow;

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

            await expect(fetchPromise).rejects.toThrow("Jules API Timeout: Request took longer than 15000ms.");
            jest.useRealTimers();
        });

        it('should throw generic error if fetch fails completely', async () => {
            service.configure('test-api-key');
            global.fetch.mockRejectedValue(new Error("Network Error"));

            await expect(service._fetch('test')).rejects.toThrow("Network Error");
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

        it('should throw error with specific JSON message on non-ok response', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => JSON.stringify({ error: { message: "Bad Request details" } })
            });

            await expect(service._fetch('test')).rejects.toThrow("Bad Request details");
        });

        it('should throw error with fallback message on non-ok response with malformed JSON', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => "Internal Server Error Text" // Not JSON
            });

            await expect(service._fetch('test')).rejects.toThrow("Jules API Error 500");
        });

        it('should throw error with fallback message on non-ok response with JSON lacking error.message', async () => {
            service.configure('test-api-key');
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ someOtherField: "value" })
            });

            await expect(service._fetch('test')).rejects.toThrow("Jules API Error 403");
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


    describe('Environment Initialization', () => {
        it('should attach to window object if window is defined', () => {
             expect(window.julesService).toBeDefined();
             expect(window.julesService instanceof JulesService).toBe(true);
        });
    });
});
