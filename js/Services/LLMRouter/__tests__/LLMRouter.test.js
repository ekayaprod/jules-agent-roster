const { LLMRouter, LLMNetworkError } = require('../LLMRouter');

describe('LLMRouter - Error Fallback Shakedown', () => {
    let router;
    let originalFetch;
    let originalConsoleWarn;

    beforeEach(() => {
        router = new LLMRouter();
        router.configure('fake-openai-key', 'fake-anthropic-key');
        originalFetch = global.fetch;
        originalConsoleWarn = console.warn;
        console.warn = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        console.warn = originalConsoleWarn;
        jest.clearAllMocks();
    });

    it('should correctly propagate base network error when both json() and text() parsing fail', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => { throw new Error('JSON parsing failed'); },
            text: async () => { throw new Error('Text parsing failed'); }
        });

        const expectedErrorMsg = 'OpenAI API Error (400)';

        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow(LLMNetworkError);

        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow(expectedErrorMsg);
    });

    it('should throw an error on 500 when maxRetries is exhausted without hanging', async () => {
        let fetchCallCount = 0;
        global.fetch = jest.fn().mockImplementation(() => {
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

        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow(LLMNetworkError);

        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow('Server Internal Error');

        expect(fetchCallCount).toBe(6);
    });

    it('should attach LLMRouter to window if module is missing but window is present', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Services/LLMRouter/LLMRouter.js', 'utf8');

        const mockWindow = {};
        const testFn = new Function('module', 'window', code);

        testFn(undefined, mockWindow);

        expect(mockWindow.LLMRouter).toBeDefined();
        expect(typeof mockWindow.LLMRouter).toBe('function');
    });
});

describe('LLMRouter - chatAnthropic Shakedown', () => {
    let router;
    let originalFetch;

    beforeEach(() => {
        router = new LLMRouter();
        router.configure('fake-openai-key', 'fake-anthropic-key');
        originalFetch = global.fetch;

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ content: [{ text: "success" }] })
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('should correctly build payload for Anthropic with system messages concatenated', async () => {
        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'system', content: 'Always answer in JSON.' },
            { role: 'user', content: 'Hello!' }
        ];

        await router.chatAnthropic(messages);

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.anthropic.com/v1/messages",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "x-api-key": "fake-anthropic-key"
                }),
                body: expect.stringContaining('"system":"You are a helpful assistant.\\nAlways answer in JSON."')
            })
        );

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.anthropic.com/v1/messages",
            expect.objectContaining({
                body: expect.stringContaining('"role":"user","content":"Hello!"')
            })
        );
    });

    it('should correctly handle missing system message and map user/assistant roles', async () => {
        const messages = [
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Hello' }
        ];

        await router.chatAnthropic(messages);

        const callArgs = global.fetch.mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);

        expect(requestBody.system).toBeUndefined();
        expect(requestBody.messages).toHaveLength(2);
        expect(requestBody.messages[0]).toEqual({ role: 'user', content: 'Hi' });
        expect(requestBody.messages[1]).toEqual({ role: 'assistant', content: 'Hello' });
    });

    it('should reject invalid model argument type', async () => {
        const messages = [{ role: 'user', content: 'Test' }];

        await expect(router.chatAnthropic(messages, 123)).rejects.toThrow('Model must be a string.');
    });

    it('should reject when there are no user/assistant messages', async () => {
        const messages = [{ role: 'system', content: 'Only system' }];

        await expect(router.chatAnthropic(messages)).rejects.toThrow('Payload must contain at least one user or assistant message for Anthropic.');
    });

    it('should throw an error if anthropic key is not configured', async () => {
        const unauthRouter = new LLMRouter();

        await expect(unauthRouter.chatAnthropic([{ role: 'user', content: 'Hi' }])).rejects.toThrow('Anthropic API key is missing or invalid type.');
    });
});
