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

        it('should throw if apiKey is not a string or empty', () => {
            expect(() => api.configure(123)).toThrow(JulesConfigurationError);
            expect(() => api.configure('   ')).toThrow(JulesConfigurationError);
        });

        it('should throw if apiKey contains invalid characters like newlines', () => {
            expect(() => api.configure('my-key\n')).toThrow(JulesConfigurationError);
            expect(() => api.configure('my-\rkey')).toThrow(JulesConfigurationError);
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
             await expect(api._fetch('/test')).rejects.toThrow(JulesConfigurationError);
        });

        it('should trigger JULES_API_CONFIG_ERROR via TelemetryUtils', async () => {
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             api.apiKey = null;
             await expect(api._fetch('/test')).rejects.toThrow(JulesConfigurationError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_CONFIG_ERROR", expect.any(JulesConfigurationError), { path: '/test' });
             delete global.TelemetryUtils;
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
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) });
             await expect(api._fetch('/test')).rejects.toThrow(JulesNetworkError);
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) });
             await expect(api._fetch('/test')).rejects.toThrow('Not Found');
        });

        it('should prefix 400-level error messages with "Client Error:"', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: { message: 'Bad Request Data' } }) });
            await expect(api._fetch('/test')).rejects.toThrow('Client Error: Bad Request Data');
        });

        it('should use default error structure if json is unparseable', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => { throw new Error('Unparseable'); } });
            await expect(api._fetch('/test')).rejects.toThrow('Client Error: Jules API Error (404)');
        });

        it('should use default error message if error response json lacks error.message', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ someOtherField: true }) });
            await expect(api._fetch('/test')).rejects.toThrow('Client Error: Jules API Error (403)');
        });

        it('should trigger JULES_API_NETWORK_ERROR via TelemetryUtils', async () => {
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             global.fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) });
             await expect(api._fetch('/test')).rejects.toThrow(JulesNetworkError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_NETWORK_ERROR", expect.any(JulesNetworkError), { path: '/test', status: 404 });
             delete global.TelemetryUtils;
        });

        it('should handle malformed JSON in error response gracefully', async () => {
            const malformedError = new Error('Malformed JSON');
            global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw malformedError; } });
            await expect(api._fetch('/test')).rejects.toThrow('We encountered a server error. Please wait a moment and try again.');
            expect(console.error).toHaveBeenCalledWith("[JulesAPI] Failed to parse error response JSON", malformedError);
        });

        it('should trigger JULES_API_PARSE_ERROR via TelemetryUtils', async () => {
            global.TelemetryUtils = { dispatchEvent: jest.fn() };
            const malformedError = new Error('Malformed JSON');
            global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw malformedError; } });
            await expect(api._fetch('/test')).rejects.toThrow('We encountered a server error. Please wait a moment and try again.');
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_PARSE_ERROR", malformedError, { path: '/test' });
            delete global.TelemetryUtils;
        });

        it('should handle request timeout', async () => {
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
        });

        it('should trigger JULES_API_TIMEOUT via TelemetryUtils', async () => {
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
            expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_TIMEOUT", expect.any(JulesTimeoutError), { path: '/test' });
            delete global.TelemetryUtils;
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

         it('approvePlan throws on missing sessionId', async () => {
             jest.spyOn(console, 'error').mockImplementation(() => {});
             await expect(api.approvePlan(null)).rejects.toThrow(JulesConfigurationError);
         });

         it('approvePlan triggers JULES_API_SESSION_APPROVE_ERROR via TelemetryUtils', async () => {
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             await expect(api.approvePlan(null)).rejects.toThrow(JulesConfigurationError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_SESSION_APPROVE_ERROR", expect.any(JulesConfigurationError));
             delete global.TelemetryUtils;
         });

         it('approvePlan calls correct endpoint', async () => {
              await api.approvePlan('123');
              expect(global.fetch).toHaveBeenCalledWith('https://jules.googleapis.com/v1alpha/sessions/123:approvePlan?key=test-key', expect.objectContaining({
                  method: 'POST',
                  body: JSON.stringify({})
              }));
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

         it('createSession triggers JULES_API_SESSION_CREATE_ERROR via TelemetryUtils', async () => {
             global.TelemetryUtils = { dispatchEvent: jest.fn() };
             await expect(api.createSession(null, 'task', 'source', 'title')).rejects.toThrow(JulesConfigurationError);
             expect(global.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("JULES_API_SESSION_CREATE_ERROR", expect.any(JulesConfigurationError));
             delete global.TelemetryUtils;
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
