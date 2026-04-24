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
});
