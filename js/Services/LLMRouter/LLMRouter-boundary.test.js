/**
 * @jest-environment jsdom
 */

const { LLMRouter, LLMNetworkError } = require('./LLMRouter');

describe('LLMRouter explicit 400/500 HTTP status assertions', () => {
    let router;
    let originalFetch;

    beforeEach(() => {
        router = new LLMRouter();
        router.configure('test-open-key', 'test-anth-key');
        // Prevent retries
        router.maxRetries = 0;
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('should explicitly assert 400 Client Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: 'Bad Request' } })
        });
        const promise = router.chatOpenAI([{ role: 'user', content: 'test' }]);
        await expect(promise).rejects.toThrow(LLMNetworkError);
        await expect(promise).rejects.toThrow('Bad Request');
    });

    it('should explicitly assert 500 Server Error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Internal Server Error' } })
        });
        const promise = router.chatOpenAI([{ role: 'user', content: 'test' }]);
        await expect(promise).rejects.toThrow(LLMNetworkError);
        await expect(promise).rejects.toThrow('Internal Server Error');
    });
});
