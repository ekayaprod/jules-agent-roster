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
