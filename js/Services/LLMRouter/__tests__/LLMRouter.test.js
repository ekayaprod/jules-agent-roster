const { LLMRouter, LLMNetworkError } = require('../LLMRouter');

describe('LLMRouter - Error Fallback Shakedown', () => {
    let router;
    let originalFetch;

    beforeEach(() => {
        router = new LLMRouter();
        router.configure('fake-openai-key', 'fake-anthropic-key');
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('should correctly propagate base network error when both json() and text() parsing fail', async () => {
        // Interrogate the coverage: We are targeting the `!response.ok` block in `_fetchWithRetry`,
        // specifically when both `response.json()` and `response.text()` throw errors.
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => { throw new Error('JSON parsing failed'); },
            text: async () => { throw new Error('Text parsing failed'); }
        });

        // The fallback error message is expected to be `${provider} API Error (${response.status})`
        const expectedErrorMsg = 'OpenAI API Error (400)';

        // Verify the polygraph catches the thrown LLMNetworkError cleanly without hanging
        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow(LLMNetworkError);

        await expect(
            router.chatOpenAI([{ role: 'user', content: 'test payload' }])
        ).rejects.toThrow(expectedErrorMsg);
    });
});
