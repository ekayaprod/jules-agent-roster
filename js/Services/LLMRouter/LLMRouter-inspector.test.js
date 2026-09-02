const { LLMRouter, LLMConfigurationError, LLMNetworkError, LLMTimeoutError, LLMValidationError } = require('./LLMRouter.js');

describe('LLMRouter Validation Interrogation', () => {
    let router;

    beforeEach(() => {
        router = new LLMRouter();
        router.configure('sk-test', 'sk-test');
        router.maxRetries = 0;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('OpenAI route mathematically fails and throws LLMValidationError when Zod parsing fails on null boundaries', async () => {
        // Alibi Setup: Constructing a mock response that technically succeeds over HTTP but violates the Zod schema.
        // The schema expects specific structures. Returning malformed data will force the catch block at line 190.
        const mockResponse = {
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                id: null, // Should be a string
                object: null,
                created: null,
                model: "gpt-test",
                choices: [{
                    index: 0,
                    message: null, // Should be an object
                    finish_reason: "stop"
                }],
                usage: null
            })
        };
        global.fetch.mockResolvedValue(mockResponse);

        const messages = [{ role: 'user', content: "Interrogate the boundary." }];

        // Assert: The alibi breaks precisely when Zod parser encounters the null values and the catch block catches the error and throws LLMValidationError.
        await expect(router.chatOpenAI(messages)).rejects.toThrow(LLMValidationError);
        await expect(router.chatOpenAI(messages)).rejects.toThrow(/OpenAI response failed schema validation:/);
    });

    test('Anthropic route mathematically fails and throws LLMValidationError when Zod parsing fails on null boundaries', async () => {

        const mockResponse = {
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                id: null,
                type: null,
                role: null,
                content: [{
                    type: null,
                    text: null
                }],
                model: "claude-test",
                stop_reason: "end_turn",
                stop_sequence: null,
                usage: null
            })
        };
        global.fetch.mockResolvedValue(mockResponse);

        const messages = [{ role: 'user', content: "Interrogate the boundary." }];

        await expect(router.chatAnthropic(messages)).rejects.toThrow(LLMValidationError);
        await expect(router.chatAnthropic(messages)).rejects.toThrow(/Anthropic response failed schema validation:/);
    });
});
