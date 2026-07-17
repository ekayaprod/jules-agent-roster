const { LLMRouter, LLMConfigurationError, LLMNetworkError, LLMTimeoutError, LLMValidationError } = require('./LLMRouter');

describe('LLMRouter', () => {
    let router;
    let originalFetch;
    let originalEnv;

    beforeEach(() => {
        router = new LLMRouter();
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        originalEnv = process.env;
        process.env = { ...originalEnv };
        jest.useFakeTimers();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        process.env = originalEnv;
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe('configure & validation', () => {
        it('should throw LLMConfigurationError if OpenAI key is missing', async () => {
            await expect(router.chatOpenAI([{role: 'user', content: 'hi'}])).rejects.toThrow(LLMConfigurationError);
        });

        it('should throw LLMConfigurationError if Anthropic key is missing', async () => {
            await expect(router.chatAnthropic([{role: 'user', content: 'hi'}])).rejects.toThrow(LLMConfigurationError);
        });

        it('should throw LLMConfigurationError if API key contains newline characters', async () => {
            router.configure('key-with\n-newline', 'anthropic-key');
            await expect(router.chatOpenAI([{role: 'user', content: 'hi'}])).rejects.toThrow(LLMConfigurationError);
        });

        it('should throw LLMValidationError if messages array is empty', async () => {
            router.configure('open-key', 'anthropic-key');
            await expect(router.chatOpenAI([])).rejects.toThrow(LLMValidationError);
        });

        it('should throw LLMValidationError if messages are malformed', async () => {
            router.configure('open-key', 'anthropic-key');
            await expect(router.chatOpenAI([{role: 'user'}])).rejects.toThrow(LLMValidationError);
        });
    });

    describe('chatOpenAI', () => {
        beforeEach(() => {
            router.configure('test-open-key', 'test-anthropic-key');
            jest.spyOn(console, 'warn').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should throw LLMValidationError if model is not a string', async () => {
            await expect(router.chatOpenAI([{role: 'user', content: 'hi'}], 123)).rejects.toThrow(LLMValidationError);
        });

        it('should call OpenAI API correctly', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ choices: [{ message: { content: 'hello' } }] })
            });

            await router.chatOpenAI([{role: 'user', content: 'hi'}], 'gpt-4o');

            expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-open-key'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{role: 'user', content: 'hi'}],
                    temperature: 0.7
                })
            }));
        });

        it('should handle non-JSON error response fallback to text', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => { throw new Error('Invalid JSON'); },
                text: async () => 'Bad Request Text'
            });

            const promise = router.chatOpenAI([{role: 'user', content: 'hi'}]);
            await expect(promise).rejects.toThrow(LLMNetworkError);
            await expect(promise).rejects.toThrow('Bad Request Text');
        });

        it('should correctly propagate base network error when both json() and text() parsing fail', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => { throw new Error('JSON parsing failed'); },
                text: async () => { throw new Error('Text parsing failed'); }
            });

            const expectedErrorMsg = 'OpenAI API Error (400)';

            const promise = router.chatOpenAI([{ role: 'user', content: 'test payload' }]);
            await expect(promise).rejects.toThrow(LLMNetworkError);
            await expect(promise).rejects.toThrow(expectedErrorMsg);
        });

        it('should handle non-retriable network error directly (e.g. 401)', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ error: { message: 'Unauthorized' } })
            });

            const promise = router.chatOpenAI([{role: 'user', content: 'hi'}]);
            await expect(promise).rejects.toThrow(LLMNetworkError);
            await expect(promise).rejects.toThrow('Unauthorized');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw an error on 500 when maxRetries is exhausted without hanging', async () => {
            let fetchCallCount = 0;
            global.fetch.mockImplementation(() => {
                fetchCallCount++;
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: async () => ({ error: { message: 'Server Internal Error' } }),
                    text: async () => 'Server Internal Error'
                });
            });

            router.maxRetries = 2;
            router.baseBackoffMs = 1;

            const fetchPromise = router.chatOpenAI([{ role: 'user', content: 'test payload' }]);

            // Attempt 1 -> fails -> backoff 1ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(1);
            // Attempt 2 -> fails -> backoff 2ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(2);
            // Attempt 3 -> fails -> backoff 4ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(4);
            // Attempt 4 -> fails -> exhausted

            await expect(fetchPromise).rejects.toThrow(LLMNetworkError);
            expect(fetchCallCount).toBe(3); // 1 initial + 2 retries
        });

        it('should handle fetch TypeError and retry', async () => {
            let attemptCount = 0;
            global.fetch.mockImplementation(() => new Promise((resolve, reject) => {
                attemptCount++;
                if (attemptCount === 1) {
                    const typeErr = new TypeError('Failed to fetch');
                    reject(typeErr);
                } else {
                    resolve({ ok: true, json: async () => ({ success: true }) });
                }
            }));

            const fetchPromise = router.chatOpenAI([{role: 'user', content: 'hi'}]);

            // Advance for backoff timer
            await Promise.resolve();
            await Promise.resolve();
            jest.advanceTimersByTime(1000);

            await fetchPromise;
            expect(attemptCount).toBe(2);
        });

        it('should throw after max retries exhausted', async () => {
            global.fetch.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));

            const fetchPromise = router.chatOpenAI([{role: 'user', content: 'hi'}]);

            // Attempt 1 -> fails -> backoff 1000ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(1000);
            // Attempt 2 -> fails -> backoff 2000ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(2000);
            // Attempt 3 -> fails -> backoff 4000ms
            await Promise.resolve(); await Promise.resolve(); jest.advanceTimersByTime(4000);
            // Attempt 4 -> fails -> exhausted

            await expect(fetchPromise).rejects.toThrow(TypeError);
            expect(global.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
        });

        it('should handle timeout and retry', async () => {
            let attemptCount = 0;
            global.fetch.mockImplementation(() => new Promise((resolve, reject) => {
                attemptCount++;
                if (attemptCount === 1) {
                    setTimeout(() => {
                        const abortErr = new Error('AbortError');
                        abortErr.name = 'AbortError';
                        reject(abortErr);
                    }, 15000);
                } else {
                    resolve({ ok: true, json: async () => ({ success: true }) });
                }
            }));

            const fetchPromise = router.chatOpenAI([{role: 'user', content: 'hi'}]);

            // Fast forward first timeout
            jest.advanceTimersByTime(15000);

            // Advance for backoff (microtasks need to flush before we fast forward the backoff timer)
            await Promise.resolve();
            await Promise.resolve();
            jest.advanceTimersByTime(1000);

            await fetchPromise;

            expect(attemptCount).toBe(2);
        });
    });

    describe('chatAnthropic', () => {
        beforeEach(() => {
            router.configure('test-open-key', 'test-anthropic-key');
            jest.spyOn(console, 'warn').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should throw LLMValidationError if model is not a string', async () => {
            await expect(router.chatAnthropic([{role: 'user', content: 'hi'}], 123)).rejects.toThrow(LLMValidationError);
        });

        it('should concatenate multiple system messages', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ content: [{ text: 'hello' }] })
            });

            await router.chatAnthropic([
                {role: 'system', content: 'You are an AI.'},
                {role: 'system', content: 'Be helpful.'},
                {role: 'user', content: 'hi'}
            ], 'claude-3-5-sonnet-latest');

            expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                body: expect.stringContaining('"system":"You are an AI.\\nBe helpful."')
            }));
        });

        it('should throw LLMValidationError if no user or assistant messages are present', async () => {
            await expect(router.chatAnthropic([
                {role: 'system', content: 'You are an AI.'}
            ])).rejects.toThrow(LLMValidationError);
        });

        it('should call Anthropic API correctly and map system message', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ content: [{ text: 'hello' }] })
            });

            await router.chatAnthropic([
                {role: 'system', content: 'You are an AI.'},
                {role: 'user', content: 'hi'}
            ], 'claude-3-5-sonnet-latest');

            expect(global.fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'test-anthropic-key',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-latest',
                    messages: [{role: 'user', content: 'hi'}],
                    max_tokens: 4096,
                    temperature: 0.7,
                    system: 'You are an AI.'
                })
            }));
        });

        it('should handle 500 error with backoff', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: { message: 'Server Error' } }) });
            global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

            const promise = router.chatAnthropic([{role: 'user', content: 'hi'}]);

            // Wait for microtasks so the code reaches `await delay(backoffTime);`
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            // Fast forward backoff timer
            jest.advanceTimersByTime(1000);

            await promise;

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
    describe('Module Export', () => {
        it('should assign LLMRouter to window if module is undefined', () => {
            const fs = require('fs');
            const path = require('path');
            const sourceCode = fs.readFileSync(path.join(__dirname, 'LLMRouter.js'), 'utf8');

            // Force evaluation in a global scope where module is strictly absent
            const vm = require('vm');
            const sandbox = { window: {} };
            vm.createContext(sandbox);
            vm.runInContext(sourceCode, sandbox);

            expect(sandbox.window.LLMRouter).toBeDefined();
            expect(sandbox.window.LLMRouter.name).toBe('LLMRouter');
        });

        it('should handle undefined module.exports', () => {
            const fs = require('fs');
            const path = require('path');
            const sourceCode = fs.readFileSync(path.join(__dirname, 'LLMRouter.js'), 'utf8');

            const sandbox = { window: {} };
            const script = new Function('window', 'module', `
                ${sourceCode}
            `);
            // we pass `module` as an object without `exports`
            script(sandbox.window, {});

            expect(sandbox.window.LLMRouter).toBeDefined();
            expect(sandbox.window.LLMRouter.name).toBe('LLMRouter');
        });
    });
});
