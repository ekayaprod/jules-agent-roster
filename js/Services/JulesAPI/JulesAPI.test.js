const { JulesAPI, JulesConfigurationError, JulesNetworkError, JulesTimeoutError } = require('./JulesAPI');

describe('JulesAPI', () => {
    let api;
    let originalFetch;

    beforeEach(() => {
        api = new JulesAPI();
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        jest.useFakeTimers();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.useRealTimers();
    });

    describe('configure', () => {
        it('should throw if no apiKey is provided', () => {
            expect(() => api.configure(null)).toThrow(JulesConfigurationError);
        });

        it('should set apiKey successfully', () => {
            api.configure('my-key');
            expect(api.apiKey).toBe('my-key');
        });
    });

    describe('_fetch core mechanisms', () => {
        beforeEach(() => {
            api.configure('test-key');
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
             jest.restoreAllMocks();
        });

        it('should throw if apiKey is not set', async () => {
             api.apiKey = null;
             const originalTelemetryUtils = global.TelemetryUtils;
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             await expect(api._fetch('/test')).rejects.toThrow(JulesConfigurationError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_API_MISSING_KEY', expect.any(Error));
             global.TelemetryUtils = originalTelemetryUtils;
        });

        it('should append API key to URL', async () => {
             global.fetch.mockResolvedValueOnce({
                 ok: true,
                 json: async () => ({ success: true })
             });
             await api._fetch('/test');
             expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/test?key=test-key', expect.any(Object));
        });

        it('should handle network errors correctly', async () => {
             const originalTelemetryUtils = global.TelemetryUtils;
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) });
             await expect(api._fetch('/test')).rejects.toThrow(JulesNetworkError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_API_ERROR', expect.any(Error), { path: '/test', errorMsg: 'Not Found' });

             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) });
             await expect(api._fetch('/test')).rejects.toThrow('Not Found');
             global.TelemetryUtils = originalTelemetryUtils;
        });

        it('should handle malformed JSON in error response gracefully', async () => {
            const malformedError = new Error('Malformed JSON');
            global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw malformedError; } });
            const originalTelemetryUtils = global.TelemetryUtils;
            global.TelemetryUtils = { dispatchEvent: jest.fn() };

            await expect(api._fetch('/test')).rejects.toThrow('Jules API Error (500)');
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_API_PARSE_ERROR', malformedError);

            global.TelemetryUtils = originalTelemetryUtils;
        });

        it('should handle request timeout', async () => {
            const originalTelemetryUtils = global.TelemetryUtils;
            global.TelemetryUtils = { dispatchEvent: jest.fn() };

            global.fetch.mockImplementationOnce(() => new Promise((resolve, reject) => {
                 setTimeout(() => {
                    const abortErr = new Error('AbortError');
                    abortErr.name = 'AbortError';
                    reject(abortErr);
                 }, 15000);
            }));

            const fetchPromise = api._fetch('/test');
            jest.advanceTimersByTime(15000);

            await expect(fetchPromise).rejects.toThrow(JulesTimeoutError);
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('JULES_API_TIMEOUT', expect.any(Error));

            global.TelemetryUtils = originalTelemetryUtils;
        });

        it('should rethrow non-abort fetch errors', async () => {
            global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
            await expect(api._fetch('/test')).rejects.toThrow(TypeError);
        });
    });

    describe('Endpoints', () => {
         beforeEach(() => {
            api.configure('test-key');
            global.fetch.mockResolvedValue({
                 ok: true,
                 json: async () => ({ payload: true })
             });
         });

         it('getSources calls correct endpoint', async () => {
              await api.getSources();
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sources?key=test-key', expect.any(Object));
         });

         it('getSessions calls correct endpoint', async () => {
              await api.getSessions();
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions?key=test-key', expect.any(Object));
         });

         it('getSessionsByRepo calls correct endpoint with encoding', async () => {
              await api.getSessionsByRepo('owner/repo');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions?repo=owner%2Frepo&key=test-key', expect.any(Object));
         });

         it('getSession calls correct endpoint', async () => {
              await api.getSession('123');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions/123?key=test-key', expect.any(Object));
         });

         it('getActivities calls correct endpoint', async () => {
              await api.getActivities('123');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions/123/activities?key=test-key', expect.any(Object));
         });

         it('provideInput throws on missing parameters', async () => {
             await expect(api.provideInput(null, 'text')).rejects.toThrow(JulesConfigurationError);
             await expect(api.provideInput('123', null)).rejects.toThrow(JulesConfigurationError);
         });

         it('provideInput calls POST with correct payload', async () => {
              await api.provideInput('123', 'my text');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions/123/activities?key=test-key', expect.objectContaining({
                  method: 'POST',
                  body: JSON.stringify({ activity: { type: 'USER_INPUT', userInput: { text: 'my text' } } })
              }));
         });

         it('createSession throws on missing parameters', async () => {
             jest.spyOn(console, 'error').mockImplementation(() => {});
             await expect(api.createSession(null, 'task', 'source', 'title')).rejects.toThrow(JulesConfigurationError);
         });

         it('createSession calls POST with correct payload', async () => {
              const testPrompt = "---\nname: TestAgent\n---\nReal prompt content";
              await api.createSession(testPrompt, 'task', 'source', 'title');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions?key=test-key', expect.objectContaining({
                  method: 'POST',
                  body: JSON.stringify({
                      automationMode: "AUTO_CREATE_PR",
                      prompt: "Real prompt content\n\ntask",
                      sourceContext: {
                          githubRepoContext: {
                              startingBranch: 'main'
                          },
                          source: 'source'
                      },
                      title: 'title'
                  })
              }));
         });
    });
});
